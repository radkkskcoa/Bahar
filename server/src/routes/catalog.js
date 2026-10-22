import express from 'express';
import { q } from '../db.js';
import { attachUser } from '../lib/auth.js';
import { getSettings, priceOrder, httpError } from '../lib/pricing.js';

const router = express.Router();
router.use(attachUser);

/** Everything the storefront needs to render: catalog, promotions, settings. */
router.get('/catalog', async (req, res, next) => {
  try {
    const [{ rows: categories }, { rows: products }, { rows: groups }, { rows: optionItems }, { rows: promotions }, { rows: rewards }, settings] =
      await Promise.all([
        q(`SELECT * FROM category WHERE active = true ORDER BY sort, id`),
        q(`SELECT * FROM product ORDER BY sort, id`),
        q(`SELECT * FROM option_group ORDER BY product_id, sort`),
        q(`SELECT * FROM option_item ORDER BY group_id, sort`),
        q(`SELECT * FROM promotion WHERE active = true ORDER BY sort, id`),
        q(`SELECT * FROM reward WHERE active = true ORDER BY sort, id`),
        getSettings(),
      ]);

    const itemsByGroup = new Map();
    for (const item of optionItems) {
      if (!itemsByGroup.has(item.group_id)) itemsByGroup.set(item.group_id, []);
      itemsByGroup.get(item.group_id).push(item);
    }
    const groupsByProduct = new Map();
    for (const group of groups) {
      const enriched = { ...group, items: itemsByGroup.get(group.id) ?? [] };
      if (!groupsByProduct.has(group.product_id)) groupsByProduct.set(group.product_id, []);
      groupsByProduct.get(group.product_id).push(enriched);
    }

    const withGroups = products.map((p) => ({ ...p, option_groups: groupsByProduct.get(p.id) ?? [] }));

    let favorites = [];
    if (req.user) {
      const { rows } = await q(`SELECT product_id FROM favorite WHERE user_id = $1`, [req.user.id]);
      favorites = rows.map((r) => r.product_id);
    }

    const now = Date.now();
    const livePromotions = promotions.filter(
      (p) => (!p.starts_at || new Date(p.starts_at).getTime() <= now) && (!p.ends_at || new Date(p.ends_at).getTime() >= now),
    );

    res.json({
      categories,
      products: withGroups,
      promotions: livePromotions,
      rewards,
      settings,
      favorites,
    });
  } catch (err) {
    next(err);
  }
});

router.get('/products/:slug', async (req, res, next) => {
  try {
    const { rows } = await q(
      `SELECT p.*, c.slug AS category_slug, c.name AS category_name
         FROM product p JOIN category c ON c.id = p.category_id WHERE p.slug = $1`,
      [req.params.slug],
    );
    if (!rows[0]) throw httpError(404, 'Product not found');
    const { rows: groups } = await q(`SELECT * FROM option_group WHERE product_id = $1 ORDER BY sort`, [rows[0].id]);
    const groupIds = groups.map((g) => g.id);
    const { rows: items } = groupIds.length
      ? await q(`SELECT * FROM option_item WHERE group_id = ANY($1::int[]) ORDER BY sort`, [groupIds])
      : [];
    res.json({
      ...rows[0],
      option_groups: groups.map((g) => ({ ...g, items: items.filter((i) => i.group_id === g.id) })),
    });
  } catch (err) {
    next(err);
  }
});

/** Server-side cart pricing — used by the cart and checkout before submitting. */
router.post('/cart/price', async (req, res, next) => {
  try {
    const { items = [], fulfillment = 'delivery', coupon_code = null } = req.body ?? {};
    const priced = await priceOrder({ items, fulfillment, couponCode: coupon_code });
    res.json(priced);
  } catch (err) {
    next(err);
  }
});

router.get('/settings', async (_req, res, next) => {
  try {
    res.json(await getSettings());
  } catch (err) {
    next(err);
  }
});

/** Public list of live coupon codes for the deals page. */
router.get('/coupons', async (_req, res, next) => {
  try {
    const { rows } = await q(
      `SELECT c.id, c.code, c.kind, c.value, c.description, c.min_order_cents, c.category_id, c.starts_at, c.ends_at,
              cat.name AS category_name
         FROM coupon c LEFT JOIN category cat ON cat.id = c.category_id
        WHERE c.active = true
          AND (c.starts_at IS NULL OR c.starts_at <= now())
          AND (c.ends_at IS NULL OR c.ends_at >= now())
        ORDER BY c.created_at DESC`,
    );
    res.json(rows);
  } catch (err) {
    next(err);
  }
});

export default router;
