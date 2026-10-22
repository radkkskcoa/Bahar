import express from 'express';
import { q, withTransaction } from '../db.js';
import { attachUser, requireStaff } from '../lib/auth.js';
import { getSettings, httpError, priceOrder } from '../lib/pricing.js';
import { loadItems, publicOrder, updateOrderStatus } from '../lib/orders.js';

const router = express.Router();
router.use(attachUser);

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

/** Places an order. Totals, options and coupon are all revalidated server-side. */
router.post('/', async (req, res, next) => {
  try {
    const {
      customer = {},
      fulfillment = 'delivery',
      address = {},
      items = [],
      coupon_code = null,
      payment_method = 'cod',
      client_token = null,
      slot = null,
    } = req.body ?? {};

    if (!['delivery', 'pickup'].includes(fulfillment)) throw httpError(400, 'Choose delivery or pickup');
    const name = String(customer.name ?? '').trim();
    const email = String(customer.email ?? '').trim();
    const phone = String(customer.phone ?? '').trim();
    if (name.length < 2) throw httpError(400, 'Please enter the name for this order');
    if (!EMAIL_RE.test(email)) throw httpError(400, 'Please enter a valid email address');
    if (phone.replace(/\D/g, '').length < 6) throw httpError(400, 'Please enter a valid phone number');
    if (fulfillment === 'delivery') {
      if (!String(address.line1 ?? '').trim()) throw httpError(400, 'Please enter the delivery street address');
      if (!String(address.city ?? '').trim()) throw httpError(400, 'Please enter the delivery city');
    }
    if (!['cod', 'card_test'].includes(payment_method)) throw httpError(400, 'Choose a payment method');

    // Idempotency: a retried submission returns the order it already created.
    if (client_token) {
      const existing = await q(`SELECT * FROM "order" WHERE client_token = $1`, [String(client_token)]);
      if (existing.rows[0]) {
        const itemsByOrder = await loadItems([existing.rows[0].id]);
        return res.status(200).json({
          order: publicOrder(existing.rows[0], itemsByOrder.get(existing.rows[0].id) ?? []),
          duplicate: true,
        });
      }
    }

    const priced = await priceOrder({ items, fulfillment, couponCode: coupon_code });
    if (!priced.minimum_ok) {
      const settings = await getSettings();
      throw httpError(
        400,
        `Minimum order for delivery is ${((priced.minimum_order_cents ?? 0) / 100).toFixed(2)} ${
          settings.currency?.code ?? ''
        }`.trim(),
      );
    }
    const settings = await getSettings();

    const created = await withTransaction(async (client) => {
      const { rows } = await client.query(
        `INSERT INTO "order" (order_number, user_id, customer_name, email, phone, fulfillment,
                              address_line1, address_line2, city, postal_code, instructions,
                              subtotal_cents, discount_cents, delivery_fee_cents, tax_cents, total_cents,
                              coupon_code, coupon_id, payment_method, payment_status, payment_mode, status, client_token)
         VALUES (concat('TMP-', gen_random_uuid()), $1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17,$18,$19,'test','confirmed',$20)
         RETURNING id`,
        [
          req.user?.id ?? null, name, email, phone, fulfillment,
          fulfillment === 'delivery' ? String(address.line1).trim() : null,
          address.line2 ? String(address.line2).trim() : null,
          fulfillment === 'delivery' ? String(address.city).trim() : null,
          address.postal_code ? String(address.postal_code).trim() : null,
          [address.instructions, slot ? `Preferred time: ${slot}` : null].filter(Boolean).join(' · ') || null,
          priced.subtotal_cents, priced.discount_cents, priced.delivery_fee_cents, priced.tax_cents, priced.total_cents,
          priced.coupon?.code ?? null, priced.coupon?.id ?? null,
          payment_method,
          payment_method === 'card_test' ? 'test_paid' : 'pending',
          client_token ? String(client_token) : null,
        ],
      );
      const orderId = rows[0].id;
      const { rows: numbered } = await client.query(
        `UPDATE "order" SET order_number = 'CH-' || (10000 + id) WHERE id = $1 RETURNING order_number`,
        [orderId],
      );

      for (const line of priced.lines) {
        await client.query(
          `INSERT INTO order_item (order_id, product_id, name, unit_price_cents, quantity, options, notes, line_total_cents)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8)`,
          [orderId, line.product_id, line.name, line.unit_price_cents, line.quantity,
            JSON.stringify(line.options), line.notes, line.line_total_cents],
        );
      }

      if (payment_method === 'card_test') {
        await client.query(
          `INSERT INTO payment_transaction (order_id, provider, amount_cents, status, mode, reference)
           VALUES ($1,'test_gateway',$2,'test_paid','test',$3)`,
          [orderId, priced.total_cents, `TEST-${numbered[0].order_number}`],
        );
      }

      if (priced.coupon?.id) {
        await client.query(`UPDATE coupon SET used_count = used_count + 1 WHERE id = $1`, [priced.coupon.id]);
      }

      if (req.user) {
        await client.query(
          `INSERT INTO notification (user_id, title, body, href) VALUES ($1,$2,$3,$4)`,
          [req.user.id, `Order ${numbered[0].order_number} confirmed`,
            'We received your order and our chefs are getting started.', `/track/${numbered[0].order_number}`],
        );
      }

      return { id: orderId, order_number: numbered[0].order_number };
    });

    const { rows } = await q(`SELECT * FROM "order" WHERE id = $1`, [created.id]);
    const itemsByOrder = await loadItems([created.id]);
    const eta = settings.delivery?.eta_minutes ?? [18, 22];
    res.status(201).json({
      order: publicOrder(rows[0], itemsByOrder.get(created.id) ?? []),
      eta_minutes: fulfillment === 'pickup' ? settings.delivery?.pickup_eta_minutes ?? eta : eta,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/mine', async (req, res, next) => {
  try {
    if (!req.user) throw httpError(401, 'Sign in to see your orders');
    const { rows } = await q(
      `SELECT * FROM "order" WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [req.user.id],
    );
    const itemsByOrder = await loadItems(rows.map((r) => r.id));
    res.json(rows.map((row) => publicOrder(row, itemsByOrder.get(row.id) ?? [])));
  } catch (err) {
    next(err);
  }
});

/** Order lookup: the owner (or staff) directly, guests with matching contact details. */
router.get('/:orderNumber', async (req, res, next) => {
  try {
    const { rows } = await q(`SELECT * FROM "order" WHERE order_number = $1`, [
      req.params.orderNumber.toUpperCase(),
    ]);
    const order = rows[0];
    if (!order) throw httpError(404, 'We could not find an order with that number');

    const isOwner = Boolean(req.user) && order.user_id === req.user.id;
    const isStaff = Boolean(req.user) && ['admin', 'staff'].includes(req.user.role);
    const proofPhone = String(req.query.phone ?? '').replace(/\D/g, '');
    const proofEmail = String(req.query.email ?? '').toLowerCase();
    const guestMatch =
      (proofPhone && proofPhone === String(order.phone).replace(/\D/g, '')) ||
      (proofEmail && proofEmail === String(order.email).toLowerCase());

    if (!isOwner && !isStaff && !guestMatch) {
      throw httpError(
        403,
        order.user_id
          ? 'Sign in with the account that placed this order, or confirm the phone number used for it.'
          : 'Enter the phone number used for this order to see its status.',
      );
    }

    const itemsByOrder = await loadItems([order.id]);
    res.json(publicOrder(order, itemsByOrder.get(order.id) ?? []));
  } catch (err) {
    next(err);
  }
});

/** Staff/admin status updates — shared rules with the admin dashboard. */
router.patch('/:id/status', requireStaff, async (req, res, next) => {
  try {
    const orderId = Number(req.params.id);
    const { status, note } = req.body ?? {};
    const updated = await updateOrderStatus(orderId, { status, note });
    const itemsByOrder = await loadItems([orderId]);
    res.json(publicOrder(updated, itemsByOrder.get(orderId) ?? []));
  } catch (err) {
    next(err);
  }
});

export default router;
