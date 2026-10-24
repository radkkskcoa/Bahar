// CRUNCH HOUSE — Menu data (configurable catalog)
// Images from Unsplash (free for commercial use, no attribution required)

const img = (id, w = 800) =>
  `https://images.unsplash.com/photo-${id}?auto=format&fit=crop&w=${w}&q=80`

export const HERO_IMAGE = img('1771360963016-1408c2de12c4', 1200)

export const categories = [
  { id: 'fried-chicken', name: 'Fried Chicken', icon: '🍗' },
  { id: 'burgers',       name: 'Burgers',       icon: '🍔' },
  { id: 'wraps',         name: 'Wraps',         icon: '🌯' },
  { id: 'sides',         name: 'Sides',         icon: '🍟' },
  { id: 'drinks',        name: 'Drinks',        icon: '🥤' },
  { id: 'desserts',      name: 'Desserts',      icon: '🍰' },
  { id: 'healthy',       name: 'Healthy',       icon: '🥗' },
]

// Shared customization option groups
const optionGroups = {
  spice: {
    id: 'spice', name: 'Spice Level', type: 'single', required: true,
    options: [
      { id: 'mild',  name: 'Mild',      price: 0 },
      { id: 'med',   name: 'Medium',    price: 0 },
      { id: 'hot',   name: 'Hot',       price: 0 },
      { id: 'xhot',  name: 'Extra Hot', price: 0.50 },
    ],
  },
  sauce: {
    id: 'sauce', name: 'Sauce Selection', type: 'single', required: true,
    options: [
      { id: 'bbq',    name: 'BBQ',         price: 0 },
      { id: 'gmayo',  name: 'Garlic Mayo', price: 0 },
      { id: 'ranch',  name: 'Ranch',      price: 0 },
      { id: 'hot',    name: 'Hot Sauce',  price: 0 },
    ],
  },
  extras: {
    id: 'extras', name: 'Add-ons', type: 'multi', required: false,
    options: [
      { id: 'cheese',  name: 'Extra Cheese',  price: 1.50 },
      { id: 'chicken', name: 'Extra Chicken', price: 3.00 },
      { id: 'lfries',  name: 'Loaded Fries',  price: 2.50 },
      { id: 'drink',   name: 'Soft Drink',    price: 1.99 },
    ],
  },
  size: {
    id: 'size', name: 'Portion Size', type: 'single', required: true,
    options: [
      { id: 'reg',  name: 'Regular', price: 0 },
      { id: 'large',name: 'Large',   price: 2.00 },
      { id: 'xl',   name: 'Extra Large', price: 3.50 },
    ],
  },
}

export const products = [
  // === FRIED CHICKEN ===
  {
    id: 'crispy-chicken-bucket', name: 'Crispy Chicken Bucket',
    description: 'Golden, crunchy chicken pieces prepared fresh with our signature seasoning.',
    price: 12.99, originalPrice: null, badge: 'BESTSELLER', category: 'fried-chicken',
    image: img('1608039755401-742074f0548d'), rating: 4.9, prepTime: '15-20 min',
    optionGroups: [optionGroups.size, optionGroups.spice, optionGroups.sauce, optionGroups.extras],
  },
  {
    id: 'korean-bbq-wings', name: 'Korean BBQ Wings',
    description: 'Crispy wings coated in a savory Korean BBQ glaze with sesame.',
    price: 11.49, originalPrice: null, badge: 'BESTSELLER', category: 'fried-chicken',
    image: img('1766589221606-08bc21fa1acd'), rating: 4.8, prepTime: '12-15 min',
    optionGroups: [optionGroups.spice, optionGroups.sauce, optionGroups.extras],
  },
  {
    id: 'chicken-tenders', name: 'Chicken Tenders',
    description: 'Tender chicken strips with a crunchy coating, served with dipping sauce.',
    price: 8.99, originalPrice: null, badge: null, category: 'fried-chicken',
    image: img('1766589221324-656419e4c844'), rating: 4.7, prepTime: '10-12 min',
    optionGroups: [optionGroups.size, optionGroups.sauce, optionGroups.extras],
  },
  {
    id: 'spicy-chicken-pieces', name: 'Spicy Chicken Pieces',
    description: 'Fiery chicken pieces marinated in our hottest blend.',
    price: 10.49, originalPrice: 12.99, badge: null, category: 'fried-chicken',
    image: img('1767065703660-7f14b6e29210'), rating: 4.6, prepTime: '12-15 min',
    optionGroups: [optionGroups.spice, optionGroups.sauce, optionGroups.extras],
  },
  {
    id: 'hot-honey-chicken', name: 'Hot Honey Chicken',
    description: 'Crispy chicken drizzled with a sweet and spicy hot honey glaze.',
    price: 10.99, originalPrice: null, badge: 'NEW', category: 'fried-chicken',
    image: img('1766589221606-08bc21fa1acd'), rating: 4.9, prepTime: '12-15 min',
    optionGroups: [optionGroups.spice, optionGroups.extras],
  },

  // === BURGERS ===
  {
    id: 'spicy-crunch-burger', name: 'Spicy Crunch Burger',
    description: 'Crispy chicken fillet, fresh vegetables, and spicy chipotle sauce.',
    price: 9.49, originalPrice: null, badge: 'BESTSELLER', category: 'burgers',
    image: img('1637710847214-f91d99669e18'), rating: 4.8, prepTime: '8-10 min',
    optionGroups: [optionGroups.spice, optionGroups.extras],
  },
  {
    id: 'classic-crispy-burger', name: 'Classic Crispy Burger',
    description: 'Crunchy chicken patty with lettuce, tomato, and house sauce.',
    price: 8.49, originalPrice: null, badge: null, category: 'burgers',
    image: img('1606755962773-d324e0a13086'), rating: 4.6, prepTime: '8-10 min',
    optionGroups: [optionGroups.extras],
  },
  {
    id: 'double-crunch-burger', name: 'Double Crunch Burger',
    description: 'Two crispy chicken fillets, double cheese, and smoky BBQ sauce.',
    price: 12.99, originalPrice: 14.99, badge: null, category: 'burgers',
    image: img('1655895176036-bf1a11326e5c'), rating: 4.7, prepTime: '10-12 min',
    optionGroups: [optionGroups.spice, optionGroups.extras],
  },

  // === WRAPS ===
  {
    id: 'crispy-chicken-wrap', name: 'Crispy Chicken Wrap',
    description: 'Crispy chicken strips, fresh greens, and creamy dressing in a soft tortilla.',
    price: 7.99, originalPrice: null, badge: null, category: 'wraps',
    image: img('1626700051175-6818013e1d4f'), rating: 4.5, prepTime: '6-8 min',
    optionGroups: [optionGroups.spice, optionGroups.sauce],
  },
  {
    id: 'spicy-chicken-wrap', name: 'Spicy Chicken Wrap',
    description: 'Spicy chicken with jalapeños, salsa, and pepper jack cheese.',
    price: 8.49, originalPrice: null, badge: null, category: 'wraps',
    image: img('1778168199427-4e839943d20f'), rating: 4.6, prepTime: '6-8 min',
    optionGroups: [optionGroups.spice, optionGroups.sauce],
  },

  // === SIDES ===
  {
    id: 'french-fries', name: 'French Fries',
    description: 'Golden, crispy fries lightly seasoned with sea salt.',
    price: 3.49, originalPrice: null, badge: null, category: 'sides',
    image: img('1768215610440-fcb9631c7ee2'), rating: 4.5, prepTime: '5 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'loaded-fries', name: 'Loaded Fries',
    description: 'Fries topped with melted cheese, bacon bits, and green onions.',
    price: 5.99, originalPrice: null, badge: 'BESTSELLER', category: 'sides',
    image: img('1639744210631-209fce3e256c'), rating: 4.8, prepTime: '8 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'coleslaw', name: 'Coleslaw',
    description: 'Fresh, creamy coleslaw with a tangy dressing.',
    price: 2.99, originalPrice: null, badge: null, category: 'sides',
    image: img('1639744091981-2f826321fae6'), rating: 4.2, prepTime: '3 min',
    optionGroups: [],
  },
  {
    id: 'onion-rings', name: 'Onion Rings',
    description: 'Crispy, golden onion rings with a crunchy batter coating.',
    price: 4.49, originalPrice: null, badge: null, category: 'sides',
    image: img('1639744091981-2f826321fae6'), rating: 4.4, prepTime: '6 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'chicken-nuggets', name: 'Chicken Nuggets',
    description: 'Bite-sized crunchy nuggets, perfect for dipping.',
    price: 5.49, originalPrice: null, badge: null, category: 'sides',
    image: img('1766589221324-656419e4c844'), rating: 4.5, prepTime: '6 min',
    optionGroups: [optionGroups.size, optionGroups.sauce],
  },

  // === DRINKS ===
  {
    id: 'cola', name: 'Cola',
    description: 'Ice-cold classic cola, refreshing and fizzy.',
    price: 1.99, originalPrice: null, badge: null, category: 'drinks',
    image: img('1527960392543-80cd0fa46382'), rating: 4.3, prepTime: '1 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'lemonade', name: 'Lemonade',
    description: 'Freshly squeezed lemonade with a hint of mint.',
    price: 2.49, originalPrice: null, badge: null, category: 'drinks',
    image: img('1622483767028-3f66f32aef97'), rating: 4.4, prepTime: '1 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'iced-tea', name: 'Iced Tea',
    description: 'Chilled iced tea with lemon, lightly sweetened.',
    price: 2.29, originalPrice: null, badge: null, category: 'drinks',
    image: img('1622483767028-3f66f32aef97'), rating: 4.3, prepTime: '1 min',
    optionGroups: [optionGroups.size],
  },
  {
    id: 'bottled-water', name: 'Bottled Water',
    description: 'Pure, refreshing spring water.',
    price: 1.49, originalPrice: null, badge: null, category: 'drinks',
    image: img('1622483767028-3f66f32aef97'), rating: 4.5, prepTime: '0 min',
    optionGroups: [],
  },
  {
    id: 'milkshake', name: 'Milkshake',
    description: 'Thick, creamy milkshake available in vanilla, chocolate, or strawberry.',
    price: 4.99, originalPrice: null, badge: 'BESTSELLER', category: 'drinks',
    image: img('1763649157120-0235d2209fb6'), rating: 4.9, prepTime: '3 min',
    optionGroups: [],
  },

  // === DESSERTS ===
  {
    id: 'chocolate-brownie', name: 'Chocolate Brownie',
    description: 'Rich, fudgy chocolate brownie served warm.',
    price: 3.99, originalPrice: null, badge: null, category: 'desserts',
    image: img('1769434128994-fa6634bf6310'), rating: 4.7, prepTime: '3 min',
    optionGroups: [],
  },
  {
    id: 'cheesecake', name: 'Cheesecake',
    description: 'Creamy New York-style cheesecake with a graham crust.',
    price: 4.49, originalPrice: null, badge: null, category: 'desserts',
    image: img('1610611424854-5e07032143d8'), rating: 4.6, prepTime: '3 min',
    optionGroups: [],
  },
  {
    id: 'ice-cream', name: 'Ice Cream',
    description: 'Two scoops of premium ice cream. Choose your flavor.',
    price: 3.49, originalPrice: null, badge: null, category: 'desserts',
    image: img('1568901839119-631418a3910d'), rating: 4.5, prepTime: '2 min',
    optionGroups: [],
  },

  // === HEALTHY ===
  {
    id: 'grilled-chicken-salad', name: 'Grilled Chicken Salad',
    description: 'Grilled chicken breast over mixed greens with balsamic vinaigrette.',
    price: 8.99, originalPrice: null, badge: 'NEW', category: 'healthy',
    image: img('1626700051175-6818013e1d4f'), rating: 4.4, prepTime: '8 min',
    optionGroups: [optionGroups.sauce],
  },
  {
    id: 'chicken-caesar-wrap', name: 'Chicken Caesar Wrap',
    description: 'Grilled chicken, romaine, and Caesar dressing in a whole wheat wrap.',
    price: 7.49, originalPrice: null, badge: null, category: 'healthy',
    image: img('1778168199427-4e839943d20f'), rating: 4.5, prepTime: '6 min',
    optionGroups: [],
  },
]

export const bundles = [
  {
    id: 'family-feast', name: 'Family Feast',
    summary: '10 PCS Chicken + 2 Large Sides + 4 Drinks',
    description: 'Ten pieces of crispy fried chicken, two large sides, and four drinks — perfect for the whole family.',
    price: 29.99, originalPrice: 38.99, image: img('1767065703660-7f14b6e29210'),
    items: ['10 PCS Chicken', '2 Large Sides', '4 Drinks'],
    customizable: true,
  },
  {
    id: 'mega-bundle', name: 'Mega Bundle',
    summary: '15 PCS Chicken + 3 Large Sides + 6 Drinks',
    description: 'Fifteen pieces of fried chicken, three large sides, and six drinks for the biggest gatherings.',
    price: 42.99, originalPrice: 55.99, image: img('1608039755401-742074f0548d'),
    items: ['15 PCS Chicken', '3 Large Sides', '6 Drinks'],
    customizable: true,
  },
]

export const chefSpecials = [
  {
    id: 'hot-honey-chicken', name: 'Hot Honey Chicken',
    description: 'Crispy chicken drizzled with a sweet and spicy hot honey glaze.',
    price: 10.99, image: img('1766589221606-08bc21fa1acd'),
    limitedTime: true, badge: 'CHEF SPECIAL',
  },
  {
    id: 'korean-bbq-wings', name: 'Korean BBQ Wings',
    description: 'Crispy wings tossed in a sticky, savory Korean BBQ glaze.',
    price: 11.49, image: img('1766589221324-656419e4c844'),
    limitedTime: false, badge: 'CHEF SPECIAL',
  },
]

export const promotions = [
  {
    id: 'weekend-crunch-fest',
    title: 'WEEKEND CRUNCH FEST',
    subtitle: 'Up to 25% OFF on selected items',
    description: 'Every weekend, enjoy up to 25% off on our most popular fried chicken combos and family bundles.',
    cta: 'Order Now',
    code: 'CRUNCH25',
    discount: 25,
    bg: 'var(--orange)',
    image: img('1766589221324-656419e4c844'),
    active: true,
    startDate: '2026-01-01', endDate: '2026-12-31',
  },
]

export const signatureDishIds = [
  'crispy-chicken-bucket',
  'spicy-crunch-burger',
  'korean-bbq-wings',
  'chicken-tenders',
]

export const getProductById = (id) => products.find((p) => p.id === id)
export const getProductsByCategory = (catId) =>
  catId === 'all' ? products : products.filter((p) => p.category === catId)
export const getSignatureDishes = () =>
  signatureDishIds.map((id) => getProductById(id)).filter(Boolean)

// Business settings (configurable)
export const businessSettings = {
  name: 'CRUNCH HOUSE',
  tagline: 'Crispy Flavor, Delivered Fast',
  phone: '+1 (555) 123-4567',
  email: 'hello@crunchhouse.com',
  address: '123 Crunch Street, Food City, FC 12345',
  hours: 'Mon–Sun: 10:00 AM – 11:00 PM',
  deliveryFee: 2.99,
  freeDeliveryThreshold: 25,
  taxRate: 0.08,
  currency: 'USD',
  currencySymbol: '$',
  minOrder: 10,
}

// Sample orders for tracking demo
export const sampleOrders = [
  {
    id: 'CH-20261024-001',
    status: 'preparing',
    eta: '18-22 min',
    items: [
      { name: 'Crispy Chicken Bucket', qty: 1, price: 12.99 },
      { name: 'Loaded Fries', qty: 2, price: 5.99 },
      { name: 'Cola', qty: 2, price: 1.99 },
    ],
    total: 34.94,
    placedAt: '2026-10-24T19:45:00',
    address: '123 Main St, Apt 4B',
  },
]

export const orderStatuses = [
  { id: 'confirmed',  name: 'Order Confirmed',     icon: 'check' },
  { id: 'preparing',  name: 'Preparing',            icon: 'chef' },
  { id: 'on-the-way', name: 'On the Way',           icon: 'scooter' },
  { id: 'delivered',  name: 'Delivered',            icon: 'home' },
]

// Loyalty demo data
export const loyaltyData = {
  points: 1250,
  nextRewardPoints: 2000,
  rewards: [
    { id: 'free-drink',   name: 'Free Drink',       points: 500,  icon: '🥤' },
    { id: 'free-side',    name: 'Free Side',        points: 800,  icon: '🍟' },
    { id: 'free-burger',  name: 'Free Burger',      points: 1200, icon: '🍔' },
    { id: '10-off',       name: '$10 Off Order',    points: 2000, icon: '🎁' },
  ],
}

// FAQ
export const faqs = [
  { q: 'What are your delivery hours?', a: 'We deliver from 10:00 AM to 11:00 PM, seven days a week.' },
  { q: 'Is there a minimum order?', a: `Yes, our minimum order for delivery is $${businessSettings.minOrder}.` },
  { q: 'How long does delivery take?', a: 'Most orders arrive within 25–35 minutes depending on your location.' },
  { q: 'Do you offer pickup?', a: 'Yes! Select "Pickup" at checkout and your order will be ready in 15–20 minutes.' },
  { q: 'How do Crunch Rewards work?', a: 'Earn 1 point for every $1 spent. Redeem points for free food and discounts.' },
  { q: 'Can I customize my order?', a: 'Absolutely. Tap any product to see sizes, spice levels, sauces, and add-ons.' },
]
