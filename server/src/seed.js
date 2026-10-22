/**
 * Seeds the demo catalog, business settings and demo accounts.
 * Idempotent and non-destructive: existing rows (including prices an
 * administrator edited in the dashboard) are never overwritten.
 */
import bcrypt from 'bcryptjs';
import { pool, q, withTransaction } from './db.js';

const IMG = (id) => `https://images.unsplash.com/${id}?auto=format&fit=crop&w=900&q=70`;

const CATEGORIES = [
  { slug: 'fried-chicken', name: 'Fried Chicken', icon: 'drumstick', sort: 1 },
  { slug: 'burgers', name: 'Burgers', icon: 'beef', sort: 2 },
  { slug: 'wraps', name: 'Wraps', icon: 'sandwich', sort: 3 },
  { slug: 'sides', name: 'Sides', icon: 'fries', sort: 4 },
  { slug: 'drinks', name: 'Drinks', icon: 'cup-soda', sort: 5 },
  { slug: 'desserts', name: 'Desserts', icon: 'ice-cream', sort: 6 },
  { slug: 'healthy', name: 'Healthy', icon: 'salad', sort: 7 },
  { slug: 'bundles', name: 'Bundles', icon: 'users', sort: 8 },
];

const G = {
  spice: {
    name: 'Spice level',
    type: 'single',
    required: true,
    options: ['Mild', 'Medium', 'Hot', 'Extra Hot'],
  },
  sauce: {
    name: 'Sauce',
    type: 'single',
    required: true,
    options: ['BBQ', 'Garlic Mayo', 'Ranch', 'Hot Sauce'],
  },
  portion: {
    name: 'Portion',
    type: 'single',
    required: true,
    options: [
      { name: 'Regular', price_cents: 0 },
      { name: 'Large', price_cents: 150 },
      { name: 'Sharing', price_cents: 300 },
    ],
  },
  extras: {
    name: 'Add-ons',
    type: 'multi',
    required: false,
    options: [
      { name: 'Extra cheese', price_cents: 99 },
      { name: 'Extra chicken', price_cents: 249 },
      { name: 'Loaded fries', price_cents: 349 },
      { name: 'Soft drink', price_cents: 199 },
    ],
  },
  size: {
    name: 'Size',
    type: 'single',
    required: true,
    options: [
      { name: 'Regular', price_cents: 0 },
      { name: 'Large', price_cents: 100 },
    ],
  },
  bundleSides: {
    name: 'Choose 2 large sides',
    type: 'multi',
    required: true,
    min_select: 2,
    max_select: 2,
    options: [
      { name: 'French fries', price_cents: 0 },
      { name: 'Coleslaw', price_cents: 0 },
      { name: 'Onion rings', price_cents: 0 },
      { name: 'Loaded fries', price_cents: 249 },
    ],
  },
  bundleDrinks: {
    name: 'Choose drinks',
    type: 'multi',
    required: true,
    min_select: 2,
    max_select: 4,
    options: [
      { name: 'Cola', price_cents: 0 },
      { name: 'Lemonade', price_cents: 0 },
      { name: 'Iced tea', price_cents: 0 },
      { name: 'Bottled water', price_cents: 0 },
      { name: 'Milkshake', price_cents: 199 },
    ],
  },
  shakeFlavor: {
    name: 'Flavour',
    type: 'single',
    required: true,
    options: ['Chocolate', 'Vanilla', 'Strawberry'],
  },
};

const PRODUCTS = [
  // Signature fried chicken
  { slug: 'crispy-chicken-bucket', name: 'Crispy Chicken Bucket', cat: 'fried-chicken', cents: 1299, badge: 'BESTSELLER', img: 'photo-1626645738196-c2a7c87a8f58', rating: 4.9, reviews: 412, featured: true, groups: ['spice', 'sauce', 'extras'], desc: 'Golden, crunchy chicken prepared fresh, with a sauce of your choice.', ingredients: 'Chicken, seasoned flour, buttermilk, spices, sunflower oil', allergens: 'Gluten, milk, egg', prep: 18 },
  { slug: 'korean-bbq-wings', name: 'Korean BBQ Wings', cat: 'fried-chicken', cents: 1149, badge: 'BESTSELLER', img: 'photo-1608039755401-742074f0548d', rating: 4.8, reviews: 268, featured: true, spicy: true, groups: ['spice', 'extras'], desc: 'Crispy wings coated in a savoury Korean BBQ glaze.', ingredients: 'Chicken wings, gochujang, soy, garlic, honey, sesame', allergens: 'Soy, sesame, gluten', prep: 16 },
  { slug: 'chicken-tenders', name: 'Chicken Tenders', cat: 'fried-chicken', cents: 899, img: 'photo-1630384060421-cb20d0e0649d', rating: 4.6, reviews: 191, featured: true, groups: ['sauce', 'extras'], desc: 'Tender chicken strips served with a dipping sauce.', ingredients: 'Chicken breast, breadcrumbs, spices', allergens: 'Gluten, egg', prep: 12 },
  { slug: 'hot-honey-chicken', name: 'Hot Honey Chicken', cat: 'fried-chicken', cents: 1099, badge: "CHEF'S SPECIAL", img: 'photo-1626074353765-517a681e40be', rating: 4.9, reviews: 97, spicy: true, groups: ['spice', 'sauce'], desc: 'Crispy chicken drizzled with a sweet and spicy hot honey glaze.', ingredients: 'Chicken, honey, chilli, butter', allergens: 'Milk', prep: 16 },
  { slug: 'spicy-chicken-pieces', name: 'Spicy Chicken Pieces', cat: 'fried-chicken', cents: 1049, img: 'photo-1562967916-eb82221dfb92', rating: 4.5, reviews: 143, spicy: true, groups: ['spice', 'sauce'], desc: 'Bold, peppery fried chicken pieces with a crunchy crust.', ingredients: 'Chicken, cayenne, paprika, flour', allergens: 'Gluten', prep: 15 },
  { slug: 'crunchy-chicken-nuggets', name: 'Chicken Nuggets', cat: 'fried-chicken', cents: 699, img: 'photo-1562967914-608f82629710', rating: 4.4, reviews: 208, groups: ['sauce', 'extras'], desc: 'Bite-sized nuggets with a crisp golden coating.', ingredients: 'Chicken, breadcrumbs, spices', allergens: 'Gluten', prep: 10 },
  // Burgers
  { slug: 'spicy-crunch-burger', name: 'Spicy Crunch Burger', cat: 'burgers', cents: 949, badge: 'BESTSELLER', img: 'photo-1606755962773-d324e0a13086', rating: 4.8, reviews: 356, featured: true, spicy: true, groups: ['spice', 'sauce', 'extras'], desc: 'Crispy chicken, fresh vegetables and a spicy sauce.', ingredients: 'Brioche bun, chicken fillet, lettuce, tomato, chilli sauce', allergens: 'Gluten, egg, milk', prep: 14 },
  { slug: 'classic-crispy-burger', name: 'Classic Crispy Burger', cat: 'burgers', cents: 849, img: 'photo-1571091718767-18b5b1457add', rating: 4.6, reviews: 244, groups: ['portion', 'sauce', 'extras'], desc: 'The original crispy chicken burger with pickles and mayo.', ingredients: 'Brioche bun, chicken fillet, pickles, mayo', allergens: 'Gluten, egg', prep: 13 },
  { slug: 'double-crunch-burger', name: 'Double Crunch Burger', cat: 'burgers', cents: 1199, badge: 'NEW', img: 'photo-1568901346375-23c9450c58cd', rating: 4.7, reviews: 88, groups: ['spice', 'sauce', 'extras'], desc: 'Two crispy fillets, double cheese and house sauce.', ingredients: 'Brioche bun, 2 chicken fillets, cheddar, house sauce', allergens: 'Gluten, milk, egg', prep: 16 },
  // Wraps
  { slug: 'crispy-chicken-wrap', name: 'Crispy Chicken Wrap', cat: 'wraps', cents: 799, img: 'photo-1626700051175-6818013e1d4f', rating: 4.5, reviews: 126, groups: ['spice', 'sauce'], desc: 'Crispy chicken, crunchy salad and sauce in a soft tortilla.', ingredients: 'Tortilla, chicken, lettuce, tomato, sauce', allergens: 'Gluten, milk', prep: 12 },
  { slug: 'spicy-chicken-wrap', name: 'Spicy Chicken Wrap', cat: 'wraps', cents: 849, img: 'photo-1600850056064-a8b380df8395', rating: 4.6, reviews: 112, spicy: true, groups: ['spice', 'sauce'], desc: 'A fiery wrap with chilli sauce and fresh greens.', ingredients: 'Tortilla, chicken, chilli sauce, salad', allergens: 'Gluten', prep: 12 },
  // Sides
  { slug: 'french-fries', name: 'French Fries', cat: 'sides', cents: 349, img: 'photo-1585109649139-366815a0d713', rating: 4.5, reviews: 302, vegetarian: true, groups: ['size'], desc: 'Golden fries, crisp outside and fluffy inside.', ingredients: 'Potatoes, sunflower oil, salt', allergens: 'None', prep: 8 },
  { slug: 'loaded-fries', name: 'Loaded Fries', cat: 'sides', cents: 599, badge: 'BESTSELLER', img: 'photo-1619881590738-a111d176d906', rating: 4.7, reviews: 214, groups: ['size', 'extras'], desc: 'Fries loaded with cheese sauce and crispy chicken bits.', ingredients: 'Potatoes, cheese sauce, chicken, spring onion', allergens: 'Milk', prep: 10 },
  { slug: 'coleslaw', name: 'Coleslaw', cat: 'sides', cents: 299, img: 'photo-1540189549336-e6e99c3679fe', rating: 4.3, reviews: 87, vegetarian: true, groups: ['size'], desc: 'Crunchy cabbage and carrot slaw in a creamy dressing.', ingredients: 'Cabbage, carrot, mayo, vinegar', allergens: 'Egg', prep: 5 },
  { slug: 'onion-rings', name: 'Onion Rings', cat: 'sides', cents: 449, img: 'photo-1639024471283-03518883512d', rating: 4.5, reviews: 133, vegetarian: true, groups: ['size'], desc: 'Thick-cut onion rings in a crisp batter.', ingredients: 'Onion, batter, oil', allergens: 'Gluten', prep: 9 },
  // Drinks
  { slug: 'cola', name: 'Cola', cat: 'drinks', cents: 199, img: 'photo-1554866585-cd94860890b7', rating: 4.4, reviews: 176, vegetarian: true, groups: ['size'], desc: 'Ice-cold classic cola.', ingredients: 'Carbonated water, sugar, caramel, caffeine', allergens: 'None', prep: 2 },
  { slug: 'lemonade', name: 'Lemonade', cat: 'drinks', cents: 249, img: 'photo-1624517452488-04869289c4ca', rating: 4.6, reviews: 121, vegetarian: true, groups: ['size'], desc: 'Freshly squeezed lemonade with mint.', ingredients: 'Lemon, water, sugar, mint', allergens: 'None', prep: 3 },
  { slug: 'iced-tea', name: 'Iced Tea', cat: 'drinks', cents: 249, img: 'photo-1499638673689-79a0b5115d87', rating: 4.3, reviews: 64, vegetarian: true, groups: ['size'], desc: 'Chilled peach iced tea.', ingredients: 'Tea, peach, water, sugar', allergens: 'None', prep: 3 },
  { slug: 'milkshake', name: 'Milkshake', cat: 'drinks', cents: 399, badge: 'NEW', img: 'photo-1572490122747-3968b75cc699', rating: 4.8, reviews: 158, vegetarian: true, groups: ['shakeFlavor', 'size'], desc: 'Thick, creamy milkshake in your favourite flavour.', ingredients: 'Milk, ice cream, flavour syrup', allergens: 'Milk', prep: 5 },
  { slug: 'bottled-water', name: 'Bottled Water', cat: 'drinks', cents: 149, img: 'photo-1544145945-f90425340c7e', rating: 4.2, reviews: 41, vegetarian: true, desc: 'Still mineral water, 500ml.', ingredients: 'Mineral water', allergens: 'None', prep: 1 },
  // Desserts
  { slug: 'chocolate-brownie', name: 'Chocolate Brownie', cat: 'desserts', cents: 349, img: 'photo-1606313564200-e75d5e30476c', rating: 4.7, reviews: 142, vegetarian: true, desc: 'Warm, fudgy brownie with a molten centre.', ingredients: 'Chocolate, butter, eggs, flour, sugar', allergens: 'Gluten, egg, milk', prep: 6 },
  { slug: 'cheesecake', name: 'Cheesecake', cat: 'desserts', cents: 399, img: 'photo-1533134242443-d4fd215305ad', rating: 4.8, reviews: 119, vegetarian: true, desc: 'Creamy baked cheesecake with a biscuit base.', ingredients: 'Cream cheese, biscuit, butter, sugar', allergens: 'Gluten, milk, egg', prep: 5 },
  { slug: 'ice-cream', name: 'Ice Cream', cat: 'desserts', cents: 299, img: 'photo-1497034825429-c343d7c6a68f', rating: 4.6, reviews: 96, vegetarian: true, groups: ['shakeFlavor'], desc: 'Two scoops of premium ice cream.', ingredients: 'Milk, cream, sugar, vanilla', allergens: 'Milk', prep: 3 },
  // Healthy
  { slug: 'garden-salad', name: 'Garden Salad', cat: 'healthy', cents: 549, img: 'photo-1512621776951-a57141f2eefd', rating: 4.4, reviews: 73, vegetarian: true, desc: 'Crisp leaves, cherry tomatoes and a light vinaigrette.', ingredients: 'Mixed leaves, tomato, cucumber, olive oil', allergens: 'None', prep: 7 },
  { slug: 'grilled-chicken-skewers', name: 'Grilled Chicken Skewers', cat: 'healthy', cents: 999, img: 'photo-1555939594-58d7cb561ad1', rating: 4.7, reviews: 68, desc: 'Marinated grilled chicken skewers with a light side.', ingredients: 'Chicken, yoghurt marinade, spices, pepper', allergens: 'Milk', prep: 15 },
  // Bundles
  { slug: 'family-feast', name: 'Family Feast', cat: 'bundles', cents: 2999, badge: 'SAVE', img: 'photo-1626645738196-c2a7c87a8f58', rating: 4.9, reviews: 210, featured: true, is_bundle: true, groups: ['bundleSides', 'bundleDrinks'], desc: '10 pieces of chicken, 2 large sides and 4 drinks. Perfect for sharing.', ingredients: 'Chicken, sides, drinks', allergens: 'Gluten, milk', prep: 22 },
  { slug: 'mega-bundle', name: 'Mega Bundle', cat: 'bundles', cents: 4299, badge: 'SAVE', img: 'photo-1608039755401-742074f0548d', rating: 4.8, reviews: 128, is_bundle: true, groups: ['bundleSides', 'bundleDrinks'], desc: '15 pieces of chicken, 3 large sides and 6 drinks for the whole crew.', ingredients: 'Chicken, sides, drinks', allergens: 'Gluten, milk', prep: 28 },
];

export const DEMO_PASSWORD = 'Crunch123!';
export const ADMIN_EMAIL = 'admin@crunchhouse.local';
export const DEMO_EMAIL = 'demo@crunchhouse.local';

async function insertGroups(client, productId, groupKeys) {
  for (let i = 0; i < groupKeys.length; i += 1) {
    const key = groupKeys[i];
    const spec = G[key];
    const { rows } = await client.query(
      `INSERT INTO option_group (product_id, name, type, required, min_select, max_select, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7) RETURNING id`,
      [
        productId,
        spec.name,
        spec.type,
        spec.required,
        spec.min_select ?? (spec.required ? 1 : 0),
        spec.max_select ?? (spec.type === 'single' ? 1 : 6),
        i,
      ],
    );
    const groupId = rows[0].id;
    const options = spec.options.map((o) => (typeof o === 'string' ? { name: o, price_cents: 0 } : o));
    for (let j = 0; j < options.length; j += 1) {
      await client.query(
        `INSERT INTO option_item (group_id, name, price_cents, is_default, sort) VALUES ($1,$2,$3,$4,$5)`,
        [groupId, options[j].name, options[j].price_cents, j === 0, j],
      );
    }
  }
}

export async function seed() {
  // ---------- settings ----------
  const settings = {
    brand: {
      name: 'Crunch House',
      tagline: 'Crispy flavor, delivered fast',
      logo_text: 'CH',
      description:
        'A modern fried chicken and fast-food kitchen. Crispy on the outside, juicy on the inside, made fresh to order.',
      demo_mode: true,
    },
    contact: {
      phone: '+1 (555) 0100-240',
      email: 'hello@crunchhouse.example',
      address: '120 Crunch Avenue, Springfield',
      hours: ['Mon–Thu 11:00–23:00', 'Fri–Sat 11:00–01:00', 'Sunday 12:00–22:00'],
      social: { instagram: '#', tiktok: '#', facebook: '#' },
    },
    delivery: {
      fee_cents: 399,
      free_over_cents: 3000,
      min_order_cents: 1500,
      eta_minutes: [18, 22],
      pickup_enabled: true,
      pickup_eta_minutes: [12, 18],
      zones: ['Springfield Central', 'Riverside', 'Northgate', 'Old Town'],
      slots: ['ASAP', '18:30', '19:00', '19:30', '20:00'],
    },
    tax: { rate_percent: 8.5, label: 'Sales tax' },
    currency: { code: 'USD', symbol: '$', locale: 'en-US' },
    loyalty: { points_per_dollar: 10, next_reward_points: 2000, expiry_months: 12, welcome_bonus: 250 },
    payments: { mode: 'test', methods: ['cod', 'card_test'] },
    languages: ['en', 'fa'],
  };
  for (const [key, value] of Object.entries(settings)) {
    await q(`INSERT INTO business_setting (key, value) VALUES ($1,$2) ON CONFLICT (key) DO NOTHING`, [
      key,
      JSON.stringify(value),
    ]);
  }

  // ---------- catalog ----------
  const catIds = {};
  for (const c of CATEGORIES) {
    const { rows } = await q(
      `INSERT INTO category (slug, name, icon, sort) VALUES ($1,$2,$3,$4)
       ON CONFLICT (slug) DO UPDATE SET name = EXCLUDED.name, icon = EXCLUDED.icon
       RETURNING id`,
      [c.slug, c.name, c.icon, c.sort],
    );
    catIds[c.slug] = rows[0].id;
  }

  for (let i = 0; i < PRODUCTS.length; i += 1) {
    const p = PRODUCTS[i];
    const { rows } = await q(
      `INSERT INTO product (slug, name, description, category_id, price_cents, image_url, badge, rating,
                            review_count, spicy, vegetarian, is_bundle, ingredients, allergens, prep_minutes,
                            featured, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14,$15,$16,$17)
       ON CONFLICT (slug) DO NOTHING
       RETURNING id`,
      [
        p.slug, p.name, p.desc, catIds[p.cat], p.cents, IMG(p.img), p.badge ?? null, p.rating,
        p.reviews ?? 0, !!p.spicy, !!p.vegetarian, !!p.is_bundle, p.ingredients ?? null,
        p.allergens ?? null, p.prep ?? null, !!p.featured, i,
      ],
    );
    if (rows[0]) await insertGroups(pool, rows[0].id, p.groups ?? []);
  }

  // ---------- rewards ----------
  const rewards = [
    { name: 'Free French Fries', description: 'Any size fries on us.', points_cost: 1000, sort: 1 },
    { name: '$5 off your order', description: 'Applied at checkout on orders over $20.', points_cost: 2000, sort: 2 },
    { name: 'Free Chicken Bucket', description: 'A full bucket of crispy chicken.', points_cost: 3500, sort: 3 },
  ];
  const { rows: rewardCount } = await q(`SELECT count(*)::int AS n FROM reward`);
  if (rewardCount[0].n === 0) {
    for (const r of rewards) {
      await q(`INSERT INTO reward (name, description, points_cost, sort) VALUES ($1,$2,$3,$4)`, [
        r.name, r.description, r.points_cost, r.sort,
      ]);
    }
  }

  // ---------- coupons & promotions ----------
  const now = Date.now();
  const day = 86400000;
  const iso = (ms) => new Date(ms).toISOString();
  const coupons = [
    {
      code: 'CRUNCH25', kind: 'percent', value: 25,
      description: 'Weekend Crunch Fest — 25% off fried chicken', min_order_cents: 2500,
      category_id: catIds['fried-chicken'], starts_at: iso(now - 2 * day), ends_at: iso(now + 5 * day), usage_limit: 500,
    },
    {
      code: 'FAMILY15', kind: 'percent', value: 15,
      description: '15% off orders over $40', min_order_cents: 4000,
      starts_at: iso(now - 10 * day), ends_at: iso(now + 60 * day),
    },
    {
      code: 'CRUNCH5', kind: 'fixed', value: 500,
      description: '$5 off orders over $25', min_order_cents: 2500,
      starts_at: iso(now - 10 * day), ends_at: iso(now + 90 * day),
    },
  ];
  for (const c of coupons) {
    await q(
      `INSERT INTO coupon (code, kind, value, description, min_order_cents, category_id, starts_at, ends_at, usage_limit)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) ON CONFLICT (code) DO NOTHING`,
      [c.code, c.kind, c.value, c.description, c.min_order_cents, c.category_id ?? null, c.starts_at ?? null, c.ends_at ?? null, c.usage_limit ?? null],
    );
  }

  const promotions = [
    {
      slug: 'weekend-crunch-fest', title: 'WEEKEND CRUNCH FEST', subtitle: 'Up to 25% OFF on selected items',
      body: 'Fried chicken favourites are 25% off this weekend with code CRUNCH25. Minimum order $25.',
      image_url: IMG('photo-1606755962773-d324e0a13086'), cta_label: 'Order Now', cta_href: '/menu?category=fried-chicken',
      accent: 'orange', coupon_code: 'CRUNCH25', category_id: catIds['fried-chicken'], min_order_cents: 2500,
      starts_at: iso(now - 2 * day), ends_at: iso(now + 5 * day), sort: 1,
    },
    {
      slug: 'chef-specials', title: 'Chef Specials', subtitle: 'Made with love by our chefs',
      body: 'Hot Honey Chicken — crispy chicken drizzled with a sweet and spicy hot honey glaze.',
      image_url: IMG('photo-1626074353765-517a681e40be'), cta_label: 'Try it', cta_href: '/product/hot-honey-chicken',
      accent: 'dark', sort: 2,
    },
    {
      slug: 'family-bundle-deal', title: 'Family Bundle Deal', subtitle: '15% off orders over $40',
      body: 'Feeding the crew? Use code FAMILY15 on any order over $40, bundles included.',
      image_url: IMG('photo-1626645738196-c2a7c87a8f58'), cta_label: 'Shop bundles', cta_href: '/menu?category=bundles',
      accent: 'lime', coupon_code: 'FAMILY15', min_order_cents: 4000, starts_at: iso(now - 10 * day), ends_at: iso(now + 60 * day), sort: 3,
    },
  ];
  for (const p of promotions) {
    await q(
      `INSERT INTO promotion (slug, title, subtitle, body, image_url, cta_label, cta_href, accent, coupon_code,
                              category_id, min_order_cents, starts_at, ends_at, sort)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13,$14) ON CONFLICT (slug) DO NOTHING`,
      [p.slug, p.title, p.subtitle, p.body, p.image_url, p.cta_label, p.cta_href, p.accent, p.coupon_code ?? null,
        p.category_id ?? null, p.min_order_cents ?? 0, p.starts_at ?? null, p.ends_at ?? null, p.sort ?? 0],
    );
  }

  // ---------- accounts ----------
  const hash = await bcrypt.hash(DEMO_PASSWORD, 10);
  const { rows: adminRows } = await q(
    `INSERT INTO app_user (email, password_hash, name, phone, role)
     VALUES ($1,$2,'Crunch House Admin','+15550100240','admin')
     ON CONFLICT (lower(email)) DO NOTHING RETURNING id`,
    [ADMIN_EMAIL, hash],
  );
  const { rows: demoRows } = await q(
    `INSERT INTO app_user (email, password_hash, name, phone, role)
     VALUES ($1,$2,'Demo Customer','+15550100241','customer')
     ON CONFLICT (lower(email)) DO NOTHING RETURNING id`,
    [DEMO_EMAIL, hash],
  );
  const demoId = demoRows[0]?.id;
  if (adminRows[0]) console.log('[seed] admin account created:', ADMIN_EMAIL);
  if (demoId) console.log('[seed] demo customer created:', DEMO_EMAIL);

  if (!demoId) return; // demo orders/notifications already seeded

  await withTransaction(async (client) => {
    await client.query(
      `INSERT INTO address (user_id, label, line1, city, postal_code, instructions, is_default)
       VALUES ($1,'Home','42 Crispy Lane','Springfield','62704','Ring the green doorbell',true)`,
      [demoId],
    );
    await client.query(
      `INSERT INTO loyalty_account (user_id, points, lifetime_points) VALUES ($1, 0, 0) ON CONFLICT (user_id) DO NOTHING`,
      [demoId],
    );
    await client.query(
      `INSERT INTO loyalty_transaction (user_id, points, reason, detail) VALUES ($1, 250, 'welcome', 'Welcome bonus')`,
      [demoId],
    );

    const favorites = ['korean-bbq-wings', 'loaded-fries'];
    for (const slug of favorites) {
      await client.query(
        `INSERT INTO favorite (user_id, product_id)
         SELECT $1, id FROM product WHERE slug = $2 ON CONFLICT DO NOTHING`,
        [demoId, slug],
      );
    }

    const { rows: prod } = await client.query(`SELECT id, slug, name, price_cents FROM product`);
    const bySlug = Object.fromEntries(prod.map((p) => [p.slug, p]));
    const line = (slug, qty, options = []) => ({
      product: bySlug[slug], qty, options,
    });

    // A live order (for the home tracker) and a completed one (for order history + points).
    const demoOrders = [
      {
        number: 'CH-10241', status: 'preparing', token: 'seed-demo-order-1',
        subtotal: 3198, discount: 0, fee: 399, tax: 272, total: 3869, method: 'cod', payment: 'pending',
        items: [line('family-feast', 1, [{ group: 'Choose 2 large sides', name: 'French fries' }, { group: 'Choose 2 large sides', name: 'Coleslaw' }, { group: 'Choose drinks', name: 'Cola' }]), line('cola', 1)],
        createdOffsetMin: 14,
      },
      {
        number: 'CH-10238', status: 'delivered', token: 'seed-demo-order-2',
        subtotal: 2297, discount: 325, fee: 399, tax: 168, total: 2539, method: 'card_test', payment: 'test_paid', coupon: 'CRUNCH25',
        items: [line('crispy-chicken-bucket', 1, [{ group: 'Spice level', name: 'Hot' }, { group: 'Sauce', name: 'BBQ' }]), line('loaded-fries', 1), line('milkshake', 1, [{ group: 'Flavour', name: 'Chocolate' }])],
        createdOffsetMin: 60 * 26,
      },
      {
        number: 'CH-10222', status: 'delivered', token: 'seed-demo-order-3',
        subtotal: 1848, discount: 0, fee: 399, tax: 157, total: 2404, method: 'cod', payment: 'pending',
        items: [line('spicy-crunch-burger', 1, [{ group: 'Spice level', name: 'Medium' }, { group: 'Sauce', name: 'Ranch' }]), line('chicken-tenders', 1, [{ group: 'Sauce', name: 'Garlic Mayo' }])],
        createdOffsetMin: 60 * 72,
      },
    ];

    for (const o of demoOrders) {
      const createdAt = new Date(Date.now() - o.createdOffsetMin * 60000).toISOString();
      const { rows } = await client.query(
        `INSERT INTO "order" (order_number, user_id, customer_name, email, phone, fulfillment, address_line1, address_line2,
                              city, postal_code, instructions, subtotal_cents, discount_cents, delivery_fee_cents, tax_cents,
                              total_cents, coupon_code, payment_method, payment_status, payment_mode, status,
                              confirmed_at, preparing_at, ready_at, on_the_way_at, delivered_at, client_token, is_demo, created_at)
         VALUES ($1,$2,'Demo Customer','${DEMO_EMAIL}','+15550100241','delivery','42 Crispy Lane',NULL,'Springfield','62704',
                 'Ring the green doorbell',$3,$4,$5,$6,$7,$8,$9,$10,'test',$11,
                 $12,
                 CASE WHEN $11 IN ('preparing','ready','on_the_way','delivered') THEN $12::timestamptz + interval '4 minutes' END,
                 CASE WHEN $11 IN ('ready','on_the_way','delivered') THEN $12::timestamptz + interval '12 minutes' END,
                 CASE WHEN $11 IN ('on_the_way','delivered') THEN $12::timestamptz + interval '16 minutes' END,
                 CASE WHEN $11 = 'delivered' THEN $12::timestamptz + interval '26 minutes' END,
                 $13, true, $12)
         ON CONFLICT (order_number) DO NOTHING RETURNING id`,
        [o.number, demoId, o.subtotal, o.discount, o.fee, o.tax, o.total, o.coupon ?? null, o.method, o.payment,
          o.status, createdAt, o.token],
      );
      const orderId = rows[0]?.id;
      if (!orderId) continue;
      for (const li of o.items) {
        await client.query(
          `INSERT INTO order_item (order_id, product_id, name, unit_price_cents, quantity, options, line_total_cents)
           VALUES ($1,$2,$3,$4,$5,$6,$7)`,
          [orderId, li.product.id, li.product.name, li.product.price_cents, li.qty, JSON.stringify(li.options),
            li.product.price_cents * li.qty],
        );
      }
    }

    // Points for delivered demo orders — the same rule the API applies on delivery.
    const { rows: delivered } = await client.query(
      `SELECT id, order_number, total_cents FROM "order" WHERE client_token IN ('seed-demo-order-2','seed-demo-order-3')`,
    );
    for (const ord of delivered) {
      const earned = Math.floor(ord.total_cents / 100) * settings.loyalty.points_per_dollar;
      await client.query(
        `INSERT INTO loyalty_transaction (user_id, order_id, points, reason, detail)
         VALUES ($1,$2,$3,'earned',$4) ON CONFLICT DO NOTHING`,
        [demoId, ord.id, earned, `Order ${ord.order_number} delivered`],
      );
    }
    // The balance always mirrors the ledger.
    await client.query(
      `UPDATE loyalty_account
         SET points = GREATEST(COALESCE((SELECT sum(points) FROM loyalty_transaction WHERE user_id = $1), 0), 0),
             lifetime_points = COALESCE((SELECT sum(points) FROM loyalty_transaction WHERE user_id = $1 AND points > 0), 0)
       WHERE user_id = $1`,
      [demoId],
    );

    const notifications = [
      ['Your order is being prepared', 'CH-10241 — our chefs are on it. ETA 18–22 min.', '/track/CH-10241'],
      ['You earned 253 Crunch points', 'Thanks for ordering with Crunch House.', '/rewards'],
      ['Weekend Crunch Fest is live', 'Up to 25% off fried chicken with code CRUNCH25.', '/deals'],
    ];
    for (const [title, body, href] of notifications) {
      await client.query(
        `INSERT INTO notification (user_id, title, body, href) VALUES ($1,$2,$3,$4)`,
        [demoId, title, body, href],
      );
    }
  });
}
