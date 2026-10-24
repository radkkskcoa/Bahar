# CRUNCH HOUSE — Base44 Development Notes

## Project Overview
Premium fried chicken & fast food ordering website built with Vite + React + React Router.
Dark mode UI with orange (#FF650D) and lime (#C7F32F) accents, matching the cinematic reference design.

## Tech Stack
- **Framework:** Vite 6 + React 18
- **Routing:** React Router DOM 6
- **Styling:** CSS custom properties (design tokens) + component CSS classes
- **State:** React Context (Cart, Toast) + localStorage persistence
- **Images:** Unsplash food photography (free for commercial use)
- **Fonts:** Inter + Manrope (Google Fonts)

## Architecture
- `src/data/menu.js` — Configurable catalog: categories, products, bundles, chef specials, promotions, business settings
- `src/context/` — CartContext (cart state + localStorage), ToastContext (notifications)
- `src/components/` — Reusable UI: AppHeader, MobileBottomNav, NavDrawer, HeroSection, SearchBar, CategoryScroller, ProductCard, ProductDetailModal, CartDrawer, Footer, section components
- `src/pages/` — Home, Menu, Deals, Checkout, OrderTracking, Profile, Rewards, About
- `src/styles/` — tokens.css (design tokens), global.css (base + utilities), components.css (all component styles)

## Setup
```bash
docker compose -f docker-compose.base44.yml up -d --build
```
App serves on port 3000 (mapped to Vite dev server on 5173).

## Key Features
- Product catalog with 25+ items across 7 categories
- Product customization (size, spice, sauce, extras) with dynamic pricing
- Shopping cart with localStorage persistence, coupon application, tax/delivery calculation
- 5-step checkout flow (contact → delivery → fulfillment → payment → confirmation)
- Order tracking with status-based progress
- Crunch Rewards loyalty system with points and redemption
- Responsive: mobile bottom nav + desktop header nav
- All UI controls functional — no dead buttons

## Notes
- Payment is in **test mode** (no real payment processed). Integration with Stripe or equivalent is needed for production.
- Authentication is a **demo sign-in** (no real auth). Needs Base44 auth or equivalent backend.
- Admin dashboard is not yet implemented — requires backend with server-side authorization.
- Order data is demo/sample data, not persisted to a real database.
- All prices are configurable placeholders; owner should confirm before going live.
