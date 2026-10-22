import express from 'express';
import { q, withTransaction } from '../db.js';
import { attachUser, requireAuth } from '../lib/auth.js';
import { httpError } from '../lib/pricing.js';

const router = express.Router();
router.use(attachUser);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

router.post('/messages', async (req, res, next) => {
  try {
    const { name, email, order_number, subject, message } = req.body ?? {};
    if (!String(name ?? '').trim()) throw httpError(400, 'Please tell us your name');
    if (!EMAIL_RE.test(String(email ?? ''))) throw httpError(400, 'Please enter a valid email address');
    if (String(message ?? '').trim().length < 10) throw httpError(400, 'Please add a few more details');

    await q(
      `INSERT INTO support_message (name, email, order_number, subject, message) VALUES ($1,$2,$3,$4,$5)`,
      [String(name).trim(), String(email).trim(), order_number ?? null, subject ?? '', String(message).trim()],
    );
    res.status(201).json({ ok: true, message: 'Thanks — our team will get back to you shortly.' });
  } catch (err) {
    next(err);
  }
});

export default router;
