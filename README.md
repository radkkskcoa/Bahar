# Crunch House

A full-stack fried chicken & fast-food ordering platform: cinematic storefront, real cart and
checkout, order tracking, loyalty rewards and an admin dashboard.

- `client/` — React 18 + Vite + Tailwind storefront and admin UI
- `server/` — Express API, PostgreSQL schema and seed

## Run it (sandbox / local)

```bash
docker compose -f docker-compose.base44.yml up -d --build
```

Then open the preview (Vite dev server on port 3000). The API is also exposed on
port 8000; the storefront talks to it through the Vite `/api` proxy, so the browser
only ever uses one origin.

Services: `db` (PostgreSQL 16) → `migrate` (schema + demo seed, one-shot) → `api`
(Express, live reload) and `web` (Vite dev server, live reload).

## Demonstration data

The seed creates a fully browsable restaurant with sample products, prices, photos,
promotions, coupons and a few demo orders. Everything is labelled demo data in the UI:
**prices, contact details and offers are placeholders**, not a real business.

| Account | Email | Password |
| --- | --- | --- |
| Customer (orders, points, favourites) | `demo@crunchhouse.local` | `Crunch123!` |
| Administrator (dashboard) | `admin@crunchhouse.local` | `Crunch123!` |

You can also create your own account from the sign-up form.

## Payments

No payment provider is connected. Checkout offers **cash on delivery** and a clearly
labelled **card (test mode)** option. Test-mode orders are recorded with
`payment_status = test_paid` and `payment_mode = test`, and the UI says so. We never
collect or store card numbers. Connect a provider before taking real payments.

## Order tracking

Tracking is status-based (`confirmed → preparing → ready → on_the_way → delivered`) and
updated by staff from the dashboard — there is no simulated courier GPS. Arrival windows
are shown as estimates.

## Admin dashboard

`/admin` (administrator accounts only; the API enforces the role on every endpoint):
overview metrics, order management with status transitions, product CRUD, campaign and
coupon management, customer list and business settings (fees, minimum order, tax, hours,
contact details, hero image).

## Languages

The storefront ships in **Persian (default) and English**, with the switch in the header
(desktop) and in the menu drawer (mobile). Persian renders the whole site right-to-left in
Vazirmatn. UI strings live in `client/src/lib/locales/`; product names, hero copy and
contact details are business data you edit in the admin dashboard, so they appear in
whatever language you type there. The admin dashboard itself is English-only for now.

## Configuration

Business configuration lives in the `business_setting` table and is editable from the
dashboard. Secrets come from the platform-managed env file `/run/base44/app.env`
(`JWT_SECRET`); see `.base44/environment.json`.
