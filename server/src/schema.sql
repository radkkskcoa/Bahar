-- Crunch House schema. Idempotent: safe to re-run on every boot.
-- All monetary values are stored as integer cents to avoid float rounding.

CREATE TABLE IF NOT EXISTS app_user (
  id            serial PRIMARY KEY,
  email         text NOT NULL,
  password_hash text NOT NULL,
  name          text NOT NULL,
  phone         text,
  role          text NOT NULL DEFAULT 'customer',   -- customer | staff | admin
  created_at    timestamptz NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX IF NOT EXISTS app_user_email_key ON app_user (lower(email));

CREATE TABLE IF NOT EXISTS address (
  id           serial PRIMARY KEY,
  user_id      integer NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  label        text NOT NULL DEFAULT 'Home',
  line1        text NOT NULL,
  line2        text,
  city         text NOT NULL,
  postal_code  text,
  instructions text,
  is_default   boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS favorite (
  user_id    integer NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  product_id integer NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  PRIMARY KEY (user_id, product_id)
);

CREATE TABLE IF NOT EXISTS category (
  id    serial PRIMARY KEY,
  slug  text NOT NULL UNIQUE,
  name  text NOT NULL,
  icon  text NOT NULL DEFAULT 'utensils',
  sort  integer NOT NULL DEFAULT 0,
  active boolean NOT NULL DEFAULT true
);

CREATE TABLE IF NOT EXISTS product (
  id           serial PRIMARY KEY,
  slug         text NOT NULL UNIQUE,
  name         text NOT NULL,
  description  text NOT NULL DEFAULT '',
  category_id  integer NOT NULL REFERENCES category(id),
  price_cents  integer NOT NULL CHECK (price_cents >= 0),
  image_url    text NOT NULL DEFAULT '',
  badge        text,                                  -- BESTSELLER | NEW | CHEF'S SPECIAL | SAVE
  rating       numeric(2,1),
  review_count integer NOT NULL DEFAULT 0,
  spicy        boolean NOT NULL DEFAULT false,
  vegetarian   boolean NOT NULL DEFAULT false,
  available    boolean NOT NULL DEFAULT true,
  featured     boolean NOT NULL DEFAULT false,
  is_bundle    boolean NOT NULL DEFAULT false,
  ingredients  text,
  allergens    text,
  prep_minutes integer,
  sort         integer NOT NULL DEFAULT 0,
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS option_group (
  id          serial PRIMARY KEY,
  product_id  integer NOT NULL REFERENCES product(id) ON DELETE CASCADE,
  name        text NOT NULL,
  type        text NOT NULL DEFAULT 'single',         -- single | multi
  required    boolean NOT NULL DEFAULT false,
  min_select  integer NOT NULL DEFAULT 0,
  max_select  integer NOT NULL DEFAULT 1,
  sort        integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS option_item (
  id          serial PRIMARY KEY,
  group_id    integer NOT NULL REFERENCES option_group(id) ON DELETE CASCADE,
  name        text NOT NULL,
  price_cents integer NOT NULL DEFAULT 0 CHECK (price_cents >= 0),
  is_default  boolean NOT NULL DEFAULT false,
  sort        integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS coupon (
  id                serial PRIMARY KEY,
  code              text NOT NULL UNIQUE,
  kind              text NOT NULL DEFAULT 'percent',  -- percent | fixed
  value             integer NOT NULL,                 -- percent points, or cents
  description       text NOT NULL DEFAULT '',
  min_order_cents   integer NOT NULL DEFAULT 0,
  category_id       integer REFERENCES category(id),
  starts_at         timestamptz,
  ends_at           timestamptz,
  active            boolean NOT NULL DEFAULT true,
  usage_limit       integer,
  used_count        integer NOT NULL DEFAULT 0,
  created_at        timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS promotion (
  id              serial PRIMARY KEY,
  slug            text NOT NULL UNIQUE,
  title           text NOT NULL,
  subtitle        text NOT NULL DEFAULT '',
  body            text NOT NULL DEFAULT '',
  image_url       text NOT NULL DEFAULT '',
  cta_label       text NOT NULL DEFAULT 'Order Now',
  cta_href        text NOT NULL DEFAULT '/menu',
  accent          text NOT NULL DEFAULT 'orange',
  coupon_code     text,
  category_id     integer REFERENCES category(id),
  min_order_cents integer NOT NULL DEFAULT 0,
  starts_at       timestamptz,
  ends_at         timestamptz,
  active          boolean NOT NULL DEFAULT true,
  sort            integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS "order" (
  id                 serial PRIMARY KEY,
  order_number       text NOT NULL UNIQUE,
  user_id            integer REFERENCES app_user(id) ON DELETE SET NULL,
  customer_name      text NOT NULL,
  email              text NOT NULL,
  phone              text NOT NULL,
  fulfillment        text NOT NULL DEFAULT 'delivery',  -- delivery | pickup
  address_line1      text,
  address_line2      text,
  city               text,
  postal_code        text,
  instructions       text,
  subtotal_cents     integer NOT NULL,
  discount_cents     integer NOT NULL DEFAULT 0,
  delivery_fee_cents integer NOT NULL DEFAULT 0,
  tax_cents          integer NOT NULL DEFAULT 0,
  total_cents        integer NOT NULL,
  coupon_code        text,
  coupon_id          integer REFERENCES coupon(id),
  payment_method     text NOT NULL DEFAULT 'cod',       -- cod | card_test
  payment_status     text NOT NULL DEFAULT 'pending',   -- pending | test_paid | paid | failed
  payment_mode       text NOT NULL DEFAULT 'test',      -- test | live
  status             text NOT NULL DEFAULT 'confirmed',
  confirmed_at       timestamptz NOT NULL DEFAULT now(),
  preparing_at       timestamptz,
  ready_at           timestamptz,
  on_the_way_at      timestamptz,
  delivered_at       timestamptz,
  cancelled_at       timestamptz,
  notes              text,
  client_token       text UNIQUE,
  is_demo            boolean NOT NULL DEFAULT false,
  created_at         timestamptz NOT NULL DEFAULT now(),
  updated_at         timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT order_status_check CHECK (status IN ('confirmed','preparing','ready','on_the_way','delivered','cancelled'))
);
CREATE INDEX IF NOT EXISTS order_user_idx ON "order" (user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS order_status_idx ON "order" (status);

CREATE TABLE IF NOT EXISTS order_item (
  id               serial PRIMARY KEY,
  order_id         integer NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  product_id       integer REFERENCES product(id),
  name             text NOT NULL,
  unit_price_cents integer NOT NULL,
  quantity         integer NOT NULL CHECK (quantity > 0),
  options          jsonb NOT NULL DEFAULT '[]'::jsonb,
  notes            text,
  line_total_cents integer NOT NULL
);

CREATE TABLE IF NOT EXISTS payment_transaction (
  id           serial PRIMARY KEY,
  order_id     integer NOT NULL REFERENCES "order"(id) ON DELETE CASCADE,
  provider     text NOT NULL,
  amount_cents integer NOT NULL,
  status       text NOT NULL,
  mode         text NOT NULL DEFAULT 'test',
  reference    text,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_account (
  id              serial PRIMARY KEY,
  user_id         integer NOT NULL UNIQUE REFERENCES app_user(id) ON DELETE CASCADE,
  points          integer NOT NULL DEFAULT 0 CHECK (points >= 0),
  lifetime_points integer NOT NULL DEFAULT 0,
  created_at      timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS loyalty_transaction (
  id         serial PRIMARY KEY,
  user_id    integer NOT NULL REFERENCES app_user(id) ON DELETE CASCADE,
  order_id   integer REFERENCES "order"(id) ON DELETE SET NULL,
  points     integer NOT NULL,          -- positive = earned, negative = redeemed
  reason     text NOT NULL,             -- earned | redeemed | welcome
  detail     text NOT NULL DEFAULT '',
  created_at timestamptz NOT NULL DEFAULT now()
);
-- One award (or redemption) of a given kind per order: blocks duplicate point awards.
CREATE UNIQUE INDEX IF NOT EXISTS loyalty_order_reason_key ON loyalty_transaction (order_id, reason) WHERE order_id IS NOT NULL;

CREATE TABLE IF NOT EXISTS reward (
  id          serial PRIMARY KEY,
  name        text NOT NULL,
  description text NOT NULL DEFAULT '',
  points_cost integer NOT NULL,
  active      boolean NOT NULL DEFAULT true,
  sort        integer NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS business_setting (
  key   text PRIMARY KEY,
  value jsonb NOT NULL
);

CREATE TABLE IF NOT EXISTS support_message (
  id           serial PRIMARY KEY,
  name         text NOT NULL,
  email        text NOT NULL,
  order_number text,
  subject      text NOT NULL DEFAULT '',
  message      text NOT NULL,
  created_at   timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notification (
  id         serial PRIMARY KEY,
  user_id    integer REFERENCES app_user(id) ON DELETE CASCADE,
  title      text NOT NULL,
  body       text NOT NULL DEFAULT '',
  href       text,
  read_at    timestamptz,
  created_at timestamptz NOT NULL DEFAULT now()
);
