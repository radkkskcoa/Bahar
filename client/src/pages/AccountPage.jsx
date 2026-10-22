import { useEffect, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  Heart, LogOut, MapPin, Package, Plus, Trash2, User, UtensilsCrossed,
} from 'lucide-react';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { Badge, SectionHeader, StatusPill } from '../components/ui.jsx';
import { LoadingSkeleton, EmptyState } from '../components/states.jsx';
import { auth as authApi, orders as ordersApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useDestination } from '../context/DestinationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useMoney } from '../lib/money.js';
import { formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.js';

export default function AccountPage() {
  const [params] = useSearchParams();
  const { user, login, signup, logout, updateProfile, ready } = useAuth();
  const { products } = useCatalog();
  const { t, locale } = useI18n();
  const money = useMoney();
  const { toast } = useToast();
  const loyalty = useLoyalty();

  const [mode, setMode] = useState(params.get('mode') === 'signup' ? 'signup' : 'signin');
  const [form, setForm] = useState({ name: '', email: '', password: '', phone: '' });
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState(null);
  const [orders, setOrders] = useState([]);
  const [addresses, setAddresses] = useState([]);
  const [newAddress, setNewAddress] = useState({ label: 'Home', line1: '', city: '', postal_code: '', instructions: '' });
  const [openProduct, setOpenProduct] = useState(null);
  const { setDestination } = useDestination();
  const { favorites } = useAuth();

  useEffect(() => {
    if (!user) return;
    ordersApi.mine().then(setOrders).catch(() => setOrders([]));
    authApi.addresses().then(setAddresses).catch(() => setAddresses([]));
  }, [user]);

  const submitAuth = async (event) => {
    event.preventDefault();
    setBusy(true);
    setError(null);
    try {
      if (mode === 'signin') {
        await login(form.email.trim(), form.password);
      } else {
        await signup({
          name: form.name.trim(),
          email: form.email.trim(),
          password: form.password,
          phone: form.phone.trim() || null,
        });
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  };

  const saveProfile = async (event) => {
    event.preventDefault();
    try {
      await updateProfile({ name: form.name || user.name, phone: form.phone || user.phone });
      toast({ title: 'Profile updated', tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not save profile', body: err.message, tone: 'error' });
    }
  };

  const addAddress = async (event) => {
    event.preventDefault();
    try {
      const created = await authApi.addAddress({ ...newAddress, is_default: addresses.length === 0 });
      setAddresses((current) => [...current, created]);
      setNewAddress({ label: 'Home', line1: '', city: '', postal_code: '', instructions: '' });
      toast({ title: 'Address saved', tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not save address', body: err.message, tone: 'error' });
    }
  };

  const removeAddress = async (id) => {
    try {
      await authApi.removeAddress(id);
      setAddresses((current) => current.filter((address) => address.id !== id));
      toast({ title: 'Address removed', tone: 'info' });
    } catch (err) {
      toast({ title: 'Could not remove address', body: err.message, tone: 'error' });
    }
  };

  // ---------- signed out ----------
  if (!user) {
    return (
      <div className="container-page py-10">
        <div className="card mx-auto max-w-md space-y-5 p-7">
          <header className="space-y-1 text-center">
            <h1 className="text-2xl font-extrabold">
              {mode === 'signin' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-ink-muted">
              {mode === 'signin'
                ? 'Sign in to see your orders, favourites and Crunch points.'
                : 'Join Crunch House and start earning rewards on every order.'}
            </p>
          </header>

          <div className="flex rounded-full border border-line bg-elevate p-1" role="tablist">
            {['signin', 'signup'].map((value) => (
              <button
                key={value}
                type="button"
                role="tab"
                aria-selected={mode === value}
                onClick={() => setMode(value)}
                className={`flex-1 rounded-full px-4 py-2 text-sm font-semibold transition ${
                  mode === value ? 'bg-brand text-white' : 'text-ink-muted hover:text-white'
                }`}
              >
                {value === 'signin' ? 'Sign in' : 'Sign up'}
              </button>
            ))}
          </div>

          <form className="space-y-4" onSubmit={submitAuth}>
            {mode === 'signup' ? (
              <div>
                <label className="label" htmlFor="acc-name">Full name</label>
                <input id="acc-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} autoComplete="name" required />
              </div>
            ) : null}
            <div>
              <label className="label" htmlFor="acc-email">Email</label>
              <input id="acc-email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} autoComplete="email" required />
            </div>
            <div>
              <label className="label" htmlFor="acc-password">Password</label>
              <input id="acc-password" type="password" className="field" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} minLength={8} required />
              {mode === 'signup' ? <p className="mt-1 text-xs text-ink-muted">At least 8 characters.</p> : null}
            </div>
            {mode === 'signup' ? (
              <div>
                <label className="label" htmlFor="acc-phone">Phone (optional)</label>
                <input id="acc-phone" className="field" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} autoComplete="tel" />
              </div>
            ) : null}

            {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}

            <button type="submit" className="btn-primary w-full" disabled={busy}>
              {mode === 'signin' ? 'Sign in' : 'Create account'}
            </button>
          </form>

          <div className="rounded-xl border border-line bg-elevate px-4 py-3 text-xs text-ink-muted">
            <p className="font-semibold text-ink-soft">Demonstration accounts</p>
            <p>Customer: demo@crunchhouse.local / Crunch123!</p>
            <p>Admin: admin@crunchhouse.local / Crunch123!</p>
          </div>
        </div>
      </div>
    );
  }

  const favoriteProducts = products.filter((product) => favorites.includes(product.id));

  // ---------- signed in ----------
  return (
    <div className="container-page space-y-10 py-6">
      <header className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold sm:text-4xl">Hi, {user.name.split(' ')[0]}</h1>
          <p className="text-sm text-ink-muted">{user.email}</p>
        </div>
        <button type="button" className="btn-ghost" onClick={logout}>
          <LogOut className="h-4 w-4" aria-hidden="true" />
          {t('nav.signOut')}
        </button>
      </header>

      <section className="grid gap-6 lg:grid-cols-2">
        <form className="card space-y-4 p-6" onSubmit={saveProfile}>
          <SectionHeader icon={<User className="h-5 w-5" aria-hidden="true" />} title="Profile" subtitle="Keep your contact details current" />
          <div>
            <label className="label" htmlFor="pf-name">Name</label>
            <input id="pf-name" className="field" defaultValue={user.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="pf-phone">Phone</label>
            <input id="pf-phone" className="field" defaultValue={user.phone ?? ''} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">Save changes</button>
        </form>

        <section className="card space-y-4 p-6">
          <SectionHeader icon={<Heart className="h-5 w-5" aria-hidden="true" />} title="Crunch points" subtitle="Earned on delivered orders" />
          {loyalty.loading ? (
            <LoadingSkeleton className="h-16 w-full" />
          ) : (
            <>
              <p className="text-3xl font-extrabold text-lime">{loyalty.points.toLocaleString(locale)}</p>
              {loyalty.nextReward ? (
                <p className="text-sm text-ink-muted">
                  Next reward: {loyalty.nextReward.name} at {loyalty.nextReward.points_cost.toLocaleString(locale)} points
                </p>
              ) : null}
              <Link to="/rewards" className="btn-ghost w-fit">View rewards</Link>
            </>
          )}
        </section>
      </section>

      <section aria-labelledby="orders-heading">
        <SectionHeader
          icon={<Package className="h-5 w-5" aria-hidden="true" />}
          title="Order history"
          subtitle="Track anything that is still on its way"
        />
        {orders.length === 0 ? (
          <EmptyState
            icon={<Package className="h-6 w-6" aria-hidden="true" />}
            title="No orders yet"
            description="When you place an order it will appear here with live status updates."
            action={<Link to="/menu" className="btn-primary">Browse the menu</Link>}
          />
        ) : (
          <ul className="card divide-y divide-line">
            {orders.map((order) => (
              <li key={order.id} className="flex flex-wrap items-center justify-between gap-3 p-4">
                <div>
                  <p className="text-sm font-bold">{order.order_number}</p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(order.created_at, locale)} · {order.items.length} item{order.items.length === 1 ? '' : 's'} · {money(order.total_cents)}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <StatusPill status={order.status} />
                  <Link to={`/track/${order.order_number}`} className="link-more">Track →</Link>
                </div>
              </li>
            ))}
          </ul>
        )}
        <span id="orders-heading" className="sr-only">Order history</span>
      </section>

      <section aria-labelledby="addresses-heading">
        <SectionHeader icon={<MapPin className="h-5 w-5" aria-hidden="true" />} title="Saved addresses" subtitle="Faster checkout next time" />
        <div className="grid gap-6 lg:grid-cols-2">
          <ul className="space-y-3">
            {addresses.length === 0 ? (
              <li className="text-sm text-ink-muted">No saved addresses yet.</li>
            ) : (
              addresses.map((address) => (
                <li key={address.id} className="card flex items-start justify-between gap-3 p-4">
                  <div>
                    <p className="flex items-center gap-2 text-sm font-bold">
                      {address.label}
                      {address.is_default ? <Badge tone="lime">Default</Badge> : null}
                    </p>
                    <p className="text-xs text-ink-muted">
                      {address.line1}{address.line2 ? `, ${address.line2}` : ''} · {address.city} {address.postal_code ?? ''}
                    </p>
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      className="icon-btn h-9 w-9"
                      aria-label={`Use ${address.label} for delivery`}
                      onClick={() => {
                        setDestination({
                          label: address.label, line1: address.line1, line2: address.line2 ?? '',
                          city: address.city, postal_code: address.postal_code ?? '', instructions: address.instructions ?? '',
                        });
                        toast({ title: `Delivering to ${address.label}`, tone: 'success' });
                      }}
                    >
                      <MapPin className="h-4 w-4" aria-hidden="true" />
                    </button>
                    <button type="button" className="icon-btn h-9 w-9 hover:border-danger/60 hover:text-danger" aria-label={`Delete ${address.label}`} onClick={() => removeAddress(address.id)}>
                      <Trash2 className="h-4 w-4" aria-hidden="true" />
                    </button>
                  </div>
                </li>
              ))
            )}
          </ul>

          <form className="card space-y-3 p-5" onSubmit={addAddress}>
            <h3 className="text-sm font-bold">Add an address</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="label" htmlFor="ad-label">Label</label>
                <input id="ad-label" className="field" value={newAddress.label} onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="ad-city">City</label>
                <input id="ad-city" className="field" value={newAddress.city} onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })} required />
              </div>
            </div>
            <div>
              <label className="label" htmlFor="ad-line1">Street address</label>
              <input id="ad-line1" className="field" value={newAddress.line1} onChange={(e) => setNewAddress({ ...newAddress, line1: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="ad-postal">Postal code</label>
              <input id="ad-postal" className="field" value={newAddress.postal_code} onChange={(e) => setNewAddress({ ...newAddress, postal_code: e.target.value })} />
            </div>
            <button type="submit" className="btn-primary">
              <Plus className="h-4 w-4" aria-hidden="true" />
              Save address
            </button>
          </form>
        </div>
        <span id="addresses-heading" className="sr-only">Saved addresses</span>
      </section>

      <section aria-labelledby="favorites-heading">
        <SectionHeader icon={<UtensilsCrossed className="h-5 w-5" aria-hidden="true" />} title="Favourites" subtitle="Your saved dishes" />
        <span id="favorites-heading" className="sr-only">Favourites</span>
        {favoriteProducts.length === 0 ? (
          <p className="text-sm text-ink-muted">Tap the heart on any dish to save it here.</p>
        ) : (
          <ProductGrid products={favoriteProducts} onOpen={setOpenProduct} />
        )}
      </section>

      <ProductDetailsModal product={openProduct} open={Boolean(openProduct)} onClose={() => setOpenProduct(null)} />
    </div>
  );
}
