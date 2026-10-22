# Notes for agents working in this repo

## Running the stack

```bash
docker compose -f docker-compose.base44.yml up -d --build
docker compose -f docker-compose.base44.yml ps
docker compose -f docker-compose.base44.yml logs -f api
```

- `web` (Vite dev server) is the preview entry point on **host port 3000**; `api`
  (Express) listens on 4000 and is published on **host port 8000**.
- The browser only ever talks to port 3000: `client/vite.config.js` proxies `/api` to
  `http://api:4000`. Auth uses an httpOnly session cookie, so this single-origin setup
  is deliberate — do not switch the client to an absolute API URL.
- Dependencies live in named volumes (`server_modules`, `client_modules`) and are
  installed at container start from the committed lockfiles. Deleting those volumes is
  safe; deleting `db_data` destroys the local database (it will be re-seeded).
- `migrate` is idempotent: `schema.sql` uses `CREATE TABLE IF NOT EXISTS` and the seed
  inserts with `ON CONFLICT DO NOTHING`, so prices/availability edited in the dashboard
  survive a restart. Never make the seed overwrite existing rows.

## Where the important logic lives

- **Money**: every amount is an integer number of cents. `server/src/lib/pricing.js` is
  the only place order totals, discounts, delivery fees and tax are computed; the client
  never sends prices. Cart and checkout both display the server's numbers.
- **Order status + loyalty**: `server/src/lib/orders.js` holds the allowed status
  transitions (`confirmed → preparing → ready → on_the_way|delivered`, plus `cancelled`)
  and awards loyalty points exactly once per delivered order (unique index on
  `loyalty_transaction (order_id, reason)`). Both the customer API and the admin API use
  it, so the two can never drift.
- **Coupons**: validated server-side against the live cart in `pricing.js`
  (window, minimum order, category scope, usage limit).
- **Payments**: test mode only. `payment_mode = 'test'`, and `card_test` orders are stored
  as `test_paid`. No provider is connected — do not claim otherwise in the UI.

## Sandbox-only configuration

`client/vite.config.js` extends Vite's `allowedHosts` with
`.${BASE44_SANDBOX_HOST_DOMAIN}` **only when `BASE44_PREVIEW_MODE === '1'`** (the
platform passes the variable bare into the `web` service). With the flag unset or set to
anything else, Vite keeps its default host checking. `__VITE_ADDITIONAL_SERVER_ALLOWED_HOSTS`
is passed through bare and appended by Vite itself. Secrets are read from
`/run/base44/app.env` (listed last in the `api` service so dashboard values win);
placeholders live in the committed `.env.base44-defaults`.

## Verifying a change

```bash
curl -sS http://localhost:8000/api/health          # {"ok":true,"database":"up"}
curl -sS -o /dev/null -w '%{http_code}\n' http://localhost:3000/
curl -sS http://localhost:8000/api/catalog | head -c 200
```

Session-protected checks (cookies):

```bash
curl -sS -c /tmp/ch.jar -X POST http://localhost:8000/api/auth/login \
  -H 'content-type: application/json' \
  -d '{"email":"demo@crunchhouse.local","password":"Crunch123!"}'
curl -sS -b /tmp/ch.jar http://localhost:8000/api/orders/mine
```

Demo accounts: `demo@crunchhouse.local` / `Crunch123!` and
`admin@crunchhouse.local` / `Crunch123!`. Seeded orders use `is_demo = true` and the UI
labels them as demo data.

There is no automated test suite yet; the checks above plus driving the UI (add to cart →
checkout → tracking, and the admin dashboard) are the current verification path.

## Quirks

- Backend edits are picked up by `node --watch`. On some bind mounts the watcher misses
  events; `docker compose -f docker-compose.base44.yml restart api` is the fallback, and
  the preview needs a full reload afterwards.
- Product photography is served from remote Unsplash URLs (verified reachable). Any URL
  can be swapped from the dashboard (`Products` or `Business settings → hero image`).
- Persian (`fa`) switches the document to RTL and uses Vazirmatn. UI chrome is
  translated; catalog content is whatever the business typed into the database.
