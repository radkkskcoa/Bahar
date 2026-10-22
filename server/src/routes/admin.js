import express from 'express';
import { q, withTransaction } from '../db.js';
import { requireAdmin } from '../lib/auth.js';
import { getSettings, httpError } from '../lib/pricing.js';
import { loadItems, publicOrder, updateOrderStatus } from '../lib/orders.js';

const router = express.Router();
router.use(requireAdmin);

const SETTING_KEYS = ['brand', 'contact', 'delivery', 'tax', 'currency', 'loyalty', 'payments', 'languages'];

const slugify = (value) =>
  String(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 60);

// ---------- dashboard ----------
router.get('/stats', async (_req, res, next) => {
  try {
    const [{ rows: totals }, { rows: byStatus }, { rows: bestSellers }, { rows: customers }] = await Promise.all([
      q(`SELECT count(*)::int AS orders_total,
                count(*) FILTER (WHERE created_at >= current_date)::int AS orders_today,
                COALESCE(sum(total_cents) FILTER (WHERE created_at >= current_date AND status <> 'cancelled'),0)::int AS revenue_today_cents,
                COALESCE(sum(total_cents) FILTER (WHERE status <> 'cancelled'),0)::int AS revenue_total_cents,
                COALESCE(round(avg(total_cents) FILTER (WHERE status <> 'cancelled')),0)::int AS aov_cents
           FROM "order"`),
      q(`SELECT status, count(*)::int AS count FROM "order" GROUP BY status`),
      q(`SELECT oi.name, sum(oi.quantity)::int AS quantity, sum(oi.line_total_cents)::int AS revenue_cents
           FROM order_item oi JOIN "order" o ON o.id = oi.order_id
          WHERE o.status <> 'cancelled'
          GROUP BY oi.name ORDER BY quantity DESC LIMIT 5`),
      q(`SELECT count(*)::int AS customer_count, COALESCE(sum(la.points),0)::int AS points_outstanding
           FROM app_user u LEFT JOIN loyalty_account la ON la.user_id = u.id
          WHERE u.role = 'customer'`),
    ]);

    const statusCounts = Object.fromEntries(byStatus.map((r) => [r.status, r.count]));
    res.json({
      orders_total: totals[0].orders_total,
      orders_today: totals[0].orders_today,
      revenue_today_cents: totals[0].revenue_today_cents,
      revenue_total_cents: totals[0].revenue_total_cents,
      aov_cents: totals[0].aov_cents,
      status_counts: statusCounts,
      pending_orders: (statusCounts.confirmed ?? 0) + (statusCounts.preparing ?? 0) + (statusCounts.ready ?? 0),
      best_sellers: bestSellers,
      customer_count: customers[0].customer_count,
      points_outstanding: customers[0].points_outstanding,
    });
  } catch (err) {
    next(err);
  }
});

// ---------- orders ----------
router.get('/orders', async (req, res, next) => {
  try {
    const { status, q: search } = req.query;
    const params = [];
    const where = [];
    if (status && status !== 'all') {
      params.push(status);
      where.push(`status = $${params.length}`);
    }
    if (search) {
      params.push(`%${String(search).toLowerCase()}%`, `%${String(search).toLowerCase()}%`);
      where.push(`(lower(order_number) LIKE $${params.length - 1} OR lower(customer_name) LIKE $${params.length} OR lower(email) LIKE $${params.length})`);
    }
    const { rows } = await q(
      `SELECT * FROM "order" ${where.length ? `WHERE ${where.join(' AND ')}` : ''} ORDER BY created_at DESC LIMIT 100`,
      params,
    );
    const items = await loadItems(rows.map((r) => r.id));
    res.json(rows.map((row) => publicOrder(row, items.get(row.id) ?? [])));
  } catch (err) {
    next(err);
  }
});

router.patch('/orders/:id', async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const { status, note, payment_status } = req.body ?? {};
    if (payment_status && !['pending', 'paid', 'test_paid', 'failed'].includes(payment_status)) {
      throw httpError(400, 'Unknown payment status');
    }
    if (payment_status) {
      await q(`UPDATE "order" SET payment_status = $2, updated_at = now() WHERE id = $1`, [orderId, payment_status]);
    }
    if (status) {
      const updated = await updateOrderStatus(orderId, { status, note });
      const items = await loadItems([orderId]);
      return res.json(publicOrder(updated, items.get(orderId) ?? []));
    }
    const { rows } = await q(`SELECT * FROM "order" WHERE id = $1`, [orderId]);
    if (!rows[0]) throw httpError(404, 'Order not found');
    const items = await loadItems([orderId]);
    res.json(publicOrder(rows[0], items.get(orderId) ?? []));
  } catch (err) {
    next(err);
  }
});

router.delete('/orders/:id', async (req, res, next) => {
  try {
    await q(`DELETE FROM "order" WHERE id = $1`, [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- products ----------
router.post('/products', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!String(b.name ?? '').trim()) throw httpError(400, 'Product name is required');
    if (!Number.isInteger(Number(b.price_cents)) || Number(b.price_cents) < 0) {
      throw httpError(400, 'Price must be a positive amount in cents');
    }
    const { rows } = await q(
      `INSERT INTO product (slug, name, description, category_id, price_cents, image_url, badge, available,
                            featured, spicy, vegetarian, ingredients, allergens, prep_minutes, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        b.slug ? slugify(b.slug) : slugify(b.name), String(b.name).trim(), b.description ?? '',
        Number(b.category_id), Number(b.price_cents), b.image_url ?? '', b.badge || null,
        b.available !== false, !!b.featured, !!b.spicy, !!b.vegetarian,
        b.ingredients ?? null, b.allergens ?? null, b.prep_minutes ? Number(b.prep_minutes) : null,
        Number(b.sort ?? 99),
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return next(httpError(409, 'A product with that name already exists'));
    next(err);
  }
});

router.patch('/products/:id', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const { rows } = await q(
      `UPDATE product SET
         name = COALESCE($2, name),
         description = COALESCE($3, description),
         category_id = COALESCE($4, category_id),
         price_cents = COALESCE($5, price_cents),
         image_url = COALESCE($6, image_url),
         badge = $7,
         available = COALESCE($8, available),
         featured = COALESCE($9, featured),
         spicy = COALESCE($10, spicy),
         vegetarian = COALESCE($11, vegetarian),
         ingredients = COALESCE($12, ingredients),
         allergens = COALESCE($13, allergens),
         prep_minutes = COALESCE($14, prep_minutes),
         updated_at = now()
       WHERE id = $1 RETURNING *`,
      [
        Number(req.params.id), b.name ?? null, b.description ?? null,
        b.category_id != null ? Number(b.category_id) : null,
        b.price_cents != null ? Number(b.price_cents) : null,
        b.image_url ?? null, b.badge === undefined ? null : (b.badge || null),
        b.available === undefined ? null : !!b.available,
        b.featured === undefined ? null : !!b.featured,
        b.spicy === undefined ? null : !!b.spicy,
        b.vegetarian === undefined ? null : !!b.vegetarian,
        b.ingredients ?? null, b.allergens ?? null,
        b.prep_minutes != null ? Number(b.prep_minutes) : null,
      ],
    );
    if (!rows[0]) throw httpError(404, 'Product not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

/** Archives a product; removes it entirely when no order ever referenced it. */
router.delete('/products/:id', async (req, res, next) => {
  try {
    const id = Number(req.params.id);
    const { rows } = await q(`SELECT count(*)::int AS n FROM order_item WHERE product_id = $1`, [id]);
    if (rows[0].n === 0) {
      await q(`DELETE FROM product WHERE id = $1`, [id]);
      return res.json({ deleted: true });
    }
    await q(`UPDATE product SET available = false, updated_at = now() WHERE id = $1`, [id]);
    res.json({ archived: true });
  } catch (err) {
    next(err);
  }
});

router.get('/categories', async (_req, res, next) => {
  try {
    const { rows } = await q(`SELECT * FROM category ORDER BY sort, id`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------- promotions ----------
router.get('/promotions', async (_req, res, next) => {
  try {
    const { rows } = await q(`SELECT * FROM promotion ORDER BY sort, id`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/promotions', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    if (!String(b.title ?? '').trim()) throw httpError(400, 'Campaign title is required');
    const { rows } = await q(
      `INSERT INTO promotion (slug, title, subtitle, body, image_url, cta_label, cta_href, accent,
                              coupon_code, category_id, min_order_cents, starts_at, ends_at, active, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15) RETURNING *`,
      [
        b.slug ? slugify(b.slug) : slugify(b.title), String(b.title).trim(), b.subtitle ?? '', b.body ?? '',
        b.image_url ?? '', b.cta_label || 'Order Now', b.cta_href || '/menu', b.accent || 'orange',
        b.coupon_code || null, b.category_id ? Number(b.category_id) : null, Number(b.min_order_cents ?? 0),
        b.starts_at || null, b.ends_at || null, b.active !== false, Number(b.sort ?? 99),
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return next(httpError(409, 'A campaign with that name already exists'));
    next(err);
  }
});

router.patch('/promotions/:id', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const { rows } = await q(
      `UPDATE promotion SET
         title = COALESCE($2, title),
         subtitle = COALESCE($3, subtitle),
         body = COALESCE($4, body),
         image_url = COALESCE($5, image_url),
         cta_label = COALESCE($6, cta_label),
         cta_href = COALESCE($7, cta_href),
         coupon_code = COALESCE($8, coupon_code),
         min_order_cents = COALESCE($9, min_order_cents),
         starts_at = COALESCE($10, starts_at),
         ends_at = COALESCE($11, ends_at),
         active = COALESCE($12, active)
       WHERE id = $1 RETURNING *`,
      [
        Number(req.params.id), b.title ?? null, b.subtitle ?? null, b.body ?? null, b.image_url ?? null,
        b.cta_label ?? null, b.cta_href ?? null, b.coupon_code ?? null,
        b.min_order_cents != null ? Number(b.min_order_cents) : null,
        b.starts_at ?? null, b.ends_at ?? null,
        b.active === undefined ? null : !!b.active,
      ],
    );
    if (!rows[0]) throw httpError(404, 'Campaign not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/promotions/:id', async (req, res, next) => {
  try {
    await q(`DELETE FROM promotion WHERE id = $1`, [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- coupons ----------
router.get('/coupons', async (_req, res, next) => {
  try {
    const { rows } = await q(`SELECT * FROM coupon ORDER BY created_at DESC`);
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

router.post('/coupons', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const code = String(b.code ?? '').trim().toUpperCase();
    if (!code) throw httpError(400, 'Coupon code is required');
    if (!['percent', 'fixed'].includes(b.kind)) throw httpError(400, 'Coupon type must be percent or fixed');
    const { rows } = await q(
      `INSERT INTO coupon (code, kind, value, description, min_order_cents, category_id, starts_at, ends_at, usage_limit, active)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10) RETURNING *`,
      [
        code, b.kind, Number(b.value), b.description ?? '', Number(b.min_order_cents ?? 0),
        b.category_id ? Number(b.category_id) : null, b.starts_at || null, b.ends_at || null,
        b.usage_limit ? Number(b.usage_limit) : null, b.active !== false,
      ],
    );
    res.status(201).json(rows[0]);
  } catch (err) {
    if (err.code === '23505') return next(httpError(409, 'That coupon code already exists'));
    next(err);
  }
});

router.patch('/coupons/:id', async (req, res, next) => {
  try {
    const b = req.body ?? {};
    const { rows } = await q(
      `UPDATE coupon SET
         description = COALESCE($2, description),
         value = COALESCE($3, value),
         min_order_cents = COALESCE($4, min_order_cents),
         starts_at = COALESCE($5, starts_at),
         ends_at = COALESCE($6, ends_at),
         active = COALESCE($7, active)
       WHERE id = $1 RETURNING *`,
      [
        Number(req.params.id), b.description ?? null,
        b.value != null ? Number(b.value) : null,
        b.min_order_cents != null ? Number(b.min_order_cents) : null,
        b.starts_at ?? null, b.ends_at ?? null,
        b.active === undefined ? null : !!b.active,
      ],
    );
    if (!rows[0]) throw httpError(404, 'Coupon not found');
    res.json(rows[0]);
  } catch (err) {
    next(err);
  }
});

router.delete('/coupons/:id', async (req, res, next) => {
  try {
    await q(`DELETE FROM coupon WHERE id = $1`, [Number(req.params.id)]);
    res.json({ ok: true });
  } catch (err) {
    next(err);
  }
});

// ---------- customers ----------
router.get('/customers', async (_req, res, next) => {
  try {
    const { rows } = await q(
      `SELECT u.id, u.email, u.name, u.phone, u.role, u.created_at,
              COALESCE(la.points, 0)::int AS points,
              (SELECT count(*)::int FROM "order" o WHERE o.user_id = u.id AND o.status <> 'cancelled') AS orders,
              (SELECT COALESCE(sum(o.total_cents),0)::int FROM "order" o WHERE o.user_id = u.id AND o.status <> 'cancelled') AS spend_cents
         FROM app_user u LEFT JOIN loyalty_account la ON la.user_id = u.id
        ORDER BY u.created_at DESC LIMIT 200`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

// ---------- business settings ----------
router.get('/settings', async (_req, res, next) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    next(err);
  }
});

router.patch('/settings', async (req, res, next) => {
  try {
    const body = req.body ?? {};
    const keys = Object.keys(body).filter((k) => SETTING_KEYS.includes(k));
    if (!keys.length) throw httpError(400, 'No editable settings supplied');

    await withTransaction(async (client) => {
      for (const key of keys) {
        const { rows } = await client.query(`SELECT value FROM business_setting WHERE key = $1`, [key]);
        const current = rows[0]?.value ?? {};
        const incoming = body[key];
        // Shallow merge so a partial form update never wipes sibling fields.
        const merged =
          incoming && typeof incoming === 'object' && !Array.isArray(incoming)
            ? { ...current, ...incoming }
            : incoming;
        await client.query(
          `INSERT INTO business_setting (key, value) VALUES ($1,$2)
           ON CONFLICT (key) DO UPDATE SET value = EXCLUDED.value`,
          [key, JSON.stringify(merged)],
        );
      }
    });

    res.json(await getSettings());
  } catch (err) {
    next(err);
  }
});

export default router;
