/**
 * Shared order helpers used by both the customer API and the admin API,
 * so status rules and loyalty awards can never drift apart.
 */
import { q, withTransaction } from '../db.js';
import { getSettings, httpError } from './pricing.js';

export const TRANSITIONS = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['on_the_way', 'delivered', 'cancelled'],
  on_the_way: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const STATUS_TIMESTAMP = {
  preparing: 'preparing_at',
  ready: 'ready_at',
  on_the_way: 'on_the_way_at',
  delivered: 'delivered_at',
  cancelled: 'cancelled_at',
};

export function publicOrder(order, items = []) {
  return {
    id: order.id,
    order_number: order.order_number,
    status: order.status,
    fulfillment: order.fulfillment,
    customer_name: order.customer_name,
    email: order.email,
    phone: order.phone,
    address_line1: order.address_line1,
    address_line2: order.address_line2,
    city: order.city,
    postal_code: order.postal_code,
    instructions: order.instructions,
    subtotal_cents: order.subtotal_cents,
    discount_cents: order.discount_cents,
    delivery_fee_cents: order.delivery_fee_cents,
    tax_cents: order.tax_cents,
    total_cents: order.total_cents,
    coupon_code: order.coupon_code,
    payment_method: order.payment_method,
    payment_status: order.payment_status,
    payment_mode: order.payment_mode,
    notes: order.notes,
    is_demo: order.is_demo,
    created_at: order.created_at,
    confirmed_at: order.confirmed_at,
    preparing_at: order.preparing_at,
    ready_at: order.ready_at,
    on_the_way_at: order.on_the_way_at,
    delivered_at: order.delivered_at,
    cancelled_at: order.cancelled_at,
    items,
  };
}

export async function loadItems(orderIds) {
  if (!orderIds.length) return new Map();
  const { rows } = await q(`SELECT * FROM order_item WHERE order_id = ANY($1::int[]) ORDER BY id`, [orderIds]);
  const map = new Map();
  for (const row of rows) {
    if (!map.has(row.order_id)) map.set(row.order_id, []);
    map.get(row.order_id).push(row);
  }
  return map;
}

const STATUS_LABEL = {
  preparing: 'is being prepared',
  ready: 'is ready',
  on_the_way: 'is on the way',
  delivered: 'has been delivered',
  cancelled: 'was cancelled',
};

/**
 * Applies a status change with the allowed transition rules, timestamps,
 * one-time loyalty award on delivery and a customer notification.
 */
export async function updateOrderStatus(orderId, { status, note = null }) {
  const { rows } = await q(`SELECT * FROM "order" WHERE id = $1`, [orderId]);
  const order = rows[0];
  if (!order) throw httpError(404, 'Order not found');
  if (status !== order.status && !TRANSITIONS[order.status]?.includes(status)) {
    throw httpError(400, `An order cannot move from ${order.status} to ${status}`);
  }

  const settings = await getSettings();
  return withTransaction(async (client) => {
    const { rows: next } = await client.query(
      `UPDATE "order" SET status = $2, updated_at = now(),
              ${STATUS_TIMESTAMP[status] ?? 'updated_at'} = now(),
              notes = COALESCE($3, notes)
        WHERE id = $1 RETURNING *`,
      [orderId, status, note ? String(note).slice(0, 500) : null],
    );

    if (status === 'delivered' && order.user_id) {
      const earned = Math.floor(order.total_cents / 100) * (settings.loyalty?.points_per_dollar ?? 10);
      if (earned > 0) {
        const { rowCount } = await client.query(
          `INSERT INTO loyalty_transaction (user_id, order_id, points, reason, detail)
           VALUES ($1,$2,$3,'earned',$4) ON CONFLICT DO NOTHING`,
          [order.user_id, orderId, earned, `Order ${order.order_number} delivered`],
        );
        if (rowCount) {
          await client.query(
            `UPDATE loyalty_account SET points = points + $2, lifetime_points = lifetime_points + $2 WHERE user_id = $1`,
            [order.user_id, earned],
          );
          await client.query(
            `INSERT INTO notification (user_id, title, body, href) VALUES ($1,$2,$3,'/rewards')`,
            [order.user_id, `You earned ${earned} Crunch points`, `Order ${order.order_number} was delivered.`],
          );
        }
      }
    }

    if (status === 'cancelled' && order.coupon_id) {
      await client.query(
        `UPDATE coupon SET used_count = GREATEST(used_count - 1, 0) WHERE id = $1`,
        [order.coupon_id],
      );
    }

    if (order.user_id && STATUS_LABEL[status]) {
      await client.query(
        `INSERT INTO notification (user_id, title, body, href) VALUES ($1,$2,$3,$4)`,
        [order.user_id, `Order ${order.order_number} ${STATUS_LABEL[status]}`,
          status === 'delivered' ? 'Thanks for ordering with Crunch House!' : 'We will keep you posted.',
          `/track/${order.order_number}`],
      );
    }

    return next[0];
  });
}
