/**
 * Server-side pricing. Every number the customer sees at checkout is recalculated
 * here from trusted database records — the client never sends prices.
 */
import { q } from '../db.js';

export function httpError(status, message) {
  const err = new Error(message);
  err.status = status;
  return err;
}

export async function getSettings() {
  const { rows } = await q(`SELECT key, value FROM business_setting`);
  const map = {};
  for (const row of rows) map[row.key] = row.value;
  return map;
}

export function newOrderNumberCandidate() {
  return `CH-${Math.floor(10000 + Math.random() * 89999)}`;
}

async function loadCartRecords(items) {
  const productIds = [...new Set(items.map((i) => Number(i.product_id)))];
  if (productIds.some((id) => !Number.isInteger(id) || id <= 0)) {
    throw httpError(400, 'One of the items in your cart is invalid');
  }
  const { rows: products } = await q(
    `SELECT p.*, c.slug AS category_slug, c.name AS category_name
       FROM product p JOIN category c ON c.id = p.category_id
      WHERE p.id = ANY($1::int[])`,
    [productIds],
  );
  const { rows: groups } = await q(
    `SELECT * FROM option_group WHERE product_id = ANY($1::int[]) ORDER BY sort`,
    [productIds],
  );
  const groupIds = groups.map((g) => g.id);
  const { rows: optionItems } = groupIds.length
    ? await q(`SELECT * FROM option_item WHERE group_id = ANY($1::int[]) ORDER BY sort`, [groupIds])
    : [];
  return { products, groups, optionItems };
}

/**
 * Validates a cart against the catalog and returns fully priced lines plus totals.
 * Throws httpError(400) with a user-facing message when the cart is not orderable.
 */
export async function priceOrder({ items, fulfillment = 'delivery', couponCode = null }) {
  const settings = await getSettings();
  if (!Array.isArray(items) || items.length === 0) throw httpError(400, 'Your cart is empty');
  if (items.length > 50) throw httpError(400, 'Too many different items in one order');

  const { products, groups, optionItems } = await loadCartRecords(items);
  const productById = new Map(products.map((p) => [p.id, p]));
  const optionById = new Map(optionItems.map((o) => [o.id, o]));
  const groupsByProduct = new Map();
  for (const g of groups) {
    if (!groupsByProduct.has(g.product_id)) groupsByProduct.set(g.product_id, []);
    groupsByProduct.get(g.product_id).push(g);
  }

  const lines = [];
  for (const raw of items) {
    const productId = Number(raw.product_id);
    const product = productById.get(productId);
    if (!product) throw httpError(400, 'One of the items is no longer on the menu');
    if (!product.available) throw httpError(400, `${product.name} is currently unavailable`);

    const quantity = Number(raw.quantity);
    if (!Number.isInteger(quantity) || quantity < 1 || quantity > 20) {
      throw httpError(400, `Choose a quantity between 1 and 20 for ${product.name}`);
    }

    const chosenIds = [...new Set((raw.option_item_ids ?? []).map(Number))];
    const chosen = chosenIds.map((id) => {
      const item = optionById.get(id);
      if (!item) throw httpError(400, 'One of the selected options is no longer available');
      if (item.group_id == null) throw httpError(400, 'Invalid option');
      return item;
    });

    const productGroups = groupsByProduct.get(productId) ?? [];
    const groupById = new Map(productGroups.map((g) => [g.id, g]));
    for (const item of chosen) {
      if (!groupById.has(item.group_id)) {
        throw httpError(400, `That option is not available for ${product.name}`);
      }
    }

    for (const group of productGroups) {
      const selected = chosen.filter((c) => c.group_id === group.id);
      const min = group.required ? Math.max(group.min_select, 1) : group.min_select;
      if (selected.length < min) {
        throw httpError(400, `Please choose ${min > 1 ? `at least ${min} options` : group.name.toLowerCase()} for ${product.name}`);
      }
      const max = group.type === 'single' ? 1 : group.max_select;
      if (selected.length > max) {
        throw httpError(400, `You can choose up to ${max} option(s) for ${group.name}`);
      }
    }

    const optionTotal = chosen.reduce((sum, o) => sum + o.price_cents, 0);
    const unitPrice = product.price_cents + optionTotal;
    lines.push({
      product_id: product.id,
      slug: product.slug,
      name: product.name,
      image_url: product.image_url,
      category_id: product.category_id,
      category_slug: product.category_slug,
      is_bundle: product.is_bundle,
      unit_price_cents: unitPrice,
      quantity,
      notes: typeof raw.notes === 'string' ? raw.notes.slice(0, 280) : null,
      options: chosen.map((o) => ({
        group: groupById.get(o.group_id)?.name ?? '',
        name: o.name,
        price_cents: o.price_cents,
      })),
      line_total_cents: unitPrice * quantity,
    });
  }

  const subtotal = lines.reduce((sum, l) => sum + l.line_total_cents, 0);

  const delivery = settings.delivery ?? {};
  // The minimum order is reported, not thrown: the cart still shows a running total
  // and only order submission refuses it.
  const minimumCents = delivery.min_order_cents ?? 0;
  if (fulfillment === 'pickup' && !delivery.pickup_enabled) {
    throw httpError(400, 'Pickup is not available right now');
  }

  const couponResult = couponCode
    ? await resolveCoupon(String(couponCode).trim().toUpperCase(), { lines, subtotal, settings })
    : { discount_cents: 0, coupon: null };

  const discount = Math.min(couponResult.discount_cents, subtotal);
  const fee =
    fulfillment === 'pickup' || subtotal - discount >= (delivery.free_over_cents ?? Number.MAX_SAFE_INTEGER)
      ? 0
      : (delivery.fee_cents ?? 0);
  const tax = Math.round(((subtotal - discount) * (settings.tax?.rate_percent ?? 0)) / 100);
  const total = subtotal - discount + fee + tax;

  return {
    lines,
    subtotal_cents: subtotal,
    discount_cents: discount,
    delivery_fee_cents: fee,
    tax_cents: tax,
    total_cents: total,
    coupon: couponResult.coupon,
    coupon_error: couponResult.error ?? null,
    minimum_order_cents: minimumCents,
    minimum_ok: fulfillment !== 'delivery' || subtotal >= minimumCents,
  };
}

function formatCents(cents, settings) {
  return `${settings.currency?.symbol ?? '$'}${(cents / 100).toFixed(2)}`;
}

/** Validates a coupon against the live cart. Returns the discount in cents. */
export async function resolveCoupon(code, { lines, subtotal, settings }) {
  const { rows } = await q(`SELECT * FROM coupon WHERE code = $1`, [code]);
  const coupon = rows[0];
  if (!coupon) return { discount_cents: 0, coupon: null, error: 'That coupon code was not found' };
  if (!coupon.active) return { discount_cents: 0, coupon: null, error: 'That coupon is no longer active' };

  const now = Date.now();
  if (coupon.starts_at && new Date(coupon.starts_at).getTime() > now) {
    return { discount_cents: 0, coupon: null, error: 'That coupon is not active yet' };
  }
  if (coupon.ends_at && new Date(coupon.ends_at).getTime() < now) {
    return { discount_cents: 0, coupon: null, error: 'That coupon has expired' };
  }
  if (coupon.usage_limit != null && coupon.used_count >= coupon.usage_limit) {
    return { discount_cents: 0, coupon: null, error: 'That coupon has reached its usage limit' };
  }
  if (subtotal < coupon.min_order_cents) {
    return {
      discount_cents: 0,
      coupon: null,
      error: `Add ${formatCents(coupon.min_order_cents - subtotal, settings)} more to use ${coupon.code}`,
    };
  }

  const eligibleLines = coupon.category_id
    ? lines.filter((l) => l.category_id === coupon.category_id)
    : lines;
  const eligibleSubtotal = eligibleLines.reduce((sum, l) => sum + l.line_total_cents, 0);
  if (coupon.category_id && eligibleSubtotal === 0) {
    return { discount_cents: 0, coupon: null, error: `${coupon.code} only applies to selected items` };
  }

  const discount =
    coupon.kind === 'percent'
      ? Math.round((eligibleSubtotal * coupon.value) / 100)
      : Math.min(coupon.value, subtotal);

  return {
    discount_cents: discount,
    coupon: {
      id: coupon.id,
      code: coupon.code,
      description: coupon.description,
      kind: coupon.kind,
      value: coupon.value,
    },
  };
}
