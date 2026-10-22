import express from 'express';
import bcrypt from 'bcryptjs';
import { q, withTransaction } from '../db.js';
import { attachUser, clearSessionCookie, requireAuth, setSessionCookie, signToken } from '../lib/auth.js';
import { httpError } from '../lib/pricing.js';

const router = express.Router();
router.use(attachUser);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function publicUser(user) {
  return { id: user.id, email: user.email, name: user.name, phone: user.phone, role: user.role };
}

router.post('/signup', async (req, res, next) => {
  try {
    const { name, email, password, phone } = req.body ?? {};
    if (!name || String(name).trim().length < 2) throw httpError(400, 'Please enter your name');
    if (!EMAIL_RE.test(String(email ?? ''))) throw httpError(400, 'Please enter a valid email address');
    if (String(password ?? '').length < 8) throw httpError(400, 'Password must be at least 8 characters');

    const exists = await q(`SELECT 1 FROM app_user WHERE lower(email) = lower($1)`, [email]);
    if (exists.rowCount) throw httpError(409, 'An account with that email already exists');

    const hash = await bcrypt.hash(String(password), 10);
    const user = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO app_user (email, password_hash, name, phone) VALUES (lower($1),$2,$3,$4)
         RETURNING id, email, name, phone, role`,
        [email, hash, String(name).trim(), phone ?? null],
      );
      const created = rows[0];
      const { rows: settingsRows } = await client.query(
        `SELECT value FROM business_setting WHERE key = 'loyalty'`,
      );
      const bonus = settingsRows[0]?.value?.welcome_bonus ?? 0;
      await client.query(`INSERT INTO loyalty_account (user_id, points, lifetime_points) VALUES ($1,$2,$2)`, [
        created.id, bonus,
      ]);
      if (bonus > 0) {
        await client.query(
          `INSERT INTO loyalty_transaction (user_id, points, reason, detail) VALUES ($1,$2,'welcome','Welcome bonus')`,
          [created.id, bonus],
        );
      }
      await client.query(
        `INSERT INTO notification (user_id, title, body, href) VALUES ($1,'Welcome to Crunch House','$2','/menu')`,
        [created.id, `You start with ${bonus} Crunch points.`],
      );
      return created;
    });

    setSessionCookie(res, signToken(user));
    res.status(201).json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body ?? {};
    const { rows } = await q(
      `SELECT id, email, name, phone, role, password_hash FROM app_user WHERE lower(email) = lower($1)`,
      [String(email ?? '')],
    );
    const user = rows[0];
    if (!user || !(await bcrypt.compare(String(password ?? ''), user.password_hash))) {
      throw httpError(401, 'Email or password is incorrect');
    }
    setSessionCookie(res, signToken(user));
    res.json({ user: publicUser(user) });
  } catch (err) {
    next(err);
  }
});

router.post('/logout', (req, res) => {
  clearSessionCookie(res);
  res.json({ ok: true });
});

router.get('/me', (req, res) => {
  res.json({ user: req.user ? publicUser(req.user) : null });
});

router.patch('/profile', requireAuth, async (req, res, next) => {
  try {
    const { name, phone } = req.body ?? {};
    const { rows } = await q(
      `UPDATE app_user SET name = COALESCE($2, name), phone = COALESCE($3, phone)
        WHERE id = $1 RETURNING id, email, name, phone, role`,
      [req.user.id, name ? String(name).trim() : null, phone ?? null],
    );
    res.json({ user: publicUser(rows[0]) });
  } catch (err) {
    next(err);
  }
});

// ---------- addresses ----------
router.get('/addresses', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await q(
      `SELECT * FROM address WHERE user_id = $1 ORDER BY is_default DESC, id`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/addresses', requireAuth, async (req, res, next) => {
  try {
    const { label, line1, line2, city, postal_code, instructions, is_default } = req.body ?? {};
    if (!line1 || !city) throw httpError(400, 'Street address and city are required');
    const created = await withTransaction(async (client) => {
      if (is_default) {
        await client.query(`UPDATE address SET is_default = false WHERE user_id = $1`, [req.user.id]);
      }
      const { rows } = await client.query(
        `INSERT INTO address (user_id, label, line1, line2, city, postal_code, instructions, is_default)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
        [req.user.id, label || 'Home', line1, line2 ?? null, city, postal_code ?? null, instructions ?? null, !!is_default],
      );
      return rows[0];
    });
    res.status(201).json(created);
  } catch (err) {
    next(err);
  }
});

router.delete('/addresses/:id', requireAuth, async (req, res, next) => {
  try {
    const { rowCount } = await q(`DELETE FROM address WHERE id = $1 AND user_id = $2`, [
      Number(req.params.id), req.user.id,
    ]);
    if (!rowCount) throw httpError(404, 'Address not found');
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- favorites ----------
router.post('/favorites/:productId', requireAuth, async (req, res, next) => {
  try {
    const productId = Number(req.params.productId);
    const existing = await q(`SELECT 1 FROM favorite WHERE user_id = $1 AND product_id = $2`, [req.user.id, productId]);
    if (existing.rowCount) {
      await q(`DELETE FROM favorite WHERE user_id = $1 AND product_id = $2`, [req.user.id, productId]);
      return res.json({ favorite: false });
    }
    await q(
      `INSERT INTO favorite (user_id, product_id) SELECT $1, id FROM product WHERE id = $2 ON CONFLICT DO NOTHING`,
      [req.user.id, productId],
    );
    res.json({ favorite: true });
  } catch (err) {
    next(err);
  }
});

// ---------- notifications ----------
router.get('/notifications', requireAuth, async (req, res, next) => {
  try {
    const { rows } = await q(
      `SELECT * FROM notification WHERE user_id = $1 ORDER BY created_at DESC LIMIT 30`,
      [req.user.id],
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/notifications/read', requireAuth, async (req, res, next) => {
  try {
    await q(`UPDATE notification SET read_at = now() WHERE user_id = $1 AND read_at IS NULL`, [req.user.id]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

export default router;
