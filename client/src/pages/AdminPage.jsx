import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  BadgePercent, LayoutDashboard, Loader2, Package, Settings, ShieldAlert, ShoppingBag,
} from 'lucide-react';
import OverviewTab from './admin/OverviewTab.jsx';
import OrdersTab from './admin/OrdersTab.jsx';
import ProductsTab from './admin/ProductsTab.jsx';
import PromotionsTab from './admin/PromotionsTab.jsx';
import SettingsTab from './admin/SettingsTab.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const TABS = [
  { key: 'overview', label: 'Overview', icon: LayoutDashboard, component: OverviewTab },
  { key: 'orders', label: 'Orders', icon: ShoppingBag, component: OrdersTab },
  { key: 'products', label: 'Products', icon: Package, component: ProductsTab },
  { key: 'promotions', label: 'Promotions', icon: BadgePercent, component: PromotionsTab },
  { key: 'settings', label: 'Business settings', icon: Settings, component: SettingsTab },
];

/** Administrative area. The API enforces admin authorisation on every endpoint. */
export default function AdminPage() {
  const { user, ready, isStaff } = useAuth();
  const [tab, setTab] = useState('overview');

  if (!ready) {
    return (
      <div className="container-page grid place-items-center py-24">
        <Loader2 className="h-6 w-6 animate-spin text-brand" aria-hidden="true" />
      </div>
    );
  }

  if (!isStaff) {
    return (
      <div className="container-page py-16">
        <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
          <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-danger/40 bg-danger/10 text-danger">
            <ShieldAlert className="h-6 w-6" aria-hidden="true" />
          </span>
          <h1 className="text-2xl font-extrabold">Administrator access required</h1>
          <p className="text-sm text-ink-muted">
            {user
              ? 'Your account does not have staff permissions for this dashboard.'
              : 'Sign in with an administrator account to manage the restaurant.'}
          </p>
          {user ? null : (
            <Link to="/account?mode=signin" className="btn-primary">Sign in</Link>
          )}
        </div>
      </div>
    );
  }

  const Active = TABS.find((entry) => entry.key === tab)?.component ?? OverviewTab;

  return (
    <div className="container-page py-6">
      <header className="mb-6 space-y-1">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Admin dashboard</h1>
        <p className="text-sm text-ink-muted">Signed in as {user.name} · {user.email}</p>
      </header>

      <div className="grid gap-6 lg:grid-cols-[240px_1fr]">
        <nav className="no-scrollbar -mx-4 flex gap-2 overflow-x-auto px-4 lg:mx-0 lg:flex-col lg:overflow-visible lg:px-0" aria-label="Dashboard sections">
          {TABS.map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              type="button"
              onClick={() => setTab(key)}
              aria-current={tab === key ? 'page' : undefined}
              className={`flex min-h-[44px] shrink-0 items-center gap-2 rounded-xl px-4 text-sm font-semibold transition
                ${tab === key ? 'bg-brand text-white' : 'border border-line bg-elevate text-ink-soft hover:text-white'}`}
            >
              <Icon className="h-4 w-4" aria-hidden="true" />
              {label}
            </button>
          ))}
        </nav>

        <div className="min-w-0">
          <Active />
        </div>
      </div>
    </div>
  );
}
