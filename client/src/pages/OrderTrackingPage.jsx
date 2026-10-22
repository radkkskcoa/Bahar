import { useCallback, useEffect, useState } from 'react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { Headset, Loader2, PackageSearch, RefreshCw } from 'lucide-react';
import OrderProgress from '../components/OrderProgress.jsx';
import { PaymentPill, StatusPill } from '../components/ui.jsx';
import { ErrorState, LoadingSkeleton } from '../components/states.jsx';
import { orders as ordersApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useMoney } from '../lib/money.js';
import { etaLabel, formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function OrderTrackingPage() {
  const { orderNumber } = useParams();
  const [params] = useSearchParams();
  const { user, ready } = useAuth();
  const { delivery } = useCatalog();
  const money = useMoney();
  const { locale } = useI18n();
  const navigate = useNavigate();

  const [order, setOrder] = useState(null);
  const [myOrders, setMyOrders] = useState([]);
  const [status, setStatus] = useState('idle');
  const [error, setError] = useState(null);
  const [proof, setProof] = useState({ number: orderNumber ?? params.get('number') ?? '', phone: params.get('phone') ?? '' });

  const lookup = useCallback(async (number, phone) => {
    if (!number) return;
    setStatus('loading');
    setError(null);
    try {
      const found = await ordersApi.lookup(number.trim(), phone ? { phone } : {});
      setOrder(found);
      setStatus('ready');
    } catch (err) {
      setOrder(null);
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    if (!ready) return;
    if (orderNumber) {
      lookup(orderNumber, params.get('phone') ?? undefined);
    } else if (user) {
      ordersApi.mine().then(setMyOrders).catch(() => setMyOrders([]));
    }
  }, [orderNumber, user, ready, lookup, params]);

  const submitLookup = (event) => {
    event.preventDefault();
    if (!proof.number.trim()) {
      setError('Enter your order number to continue.');
      setStatus('error');
      return;
    }
    navigate(`/track/${proof.number.trim().toUpperCase()}${proof.phone ? `?phone=${encodeURIComponent(proof.phone)}` : ''}`);
  };

  const needsProof = status === 'error' && /phone number|Sign in/i.test(error ?? '');

  return (
    <div className="container-page py-6">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Track your order</h1>
        <p className="text-sm text-ink-muted">
          Status updates come straight from our kitchen and delivery team. Time windows are estimates.
        </p>
      </header>

      {!orderNumber ? (
        <div className="grid gap-6 lg:grid-cols-[1fr_1.2fr]">
          <form className="card space-y-4 p-6" onSubmit={submitLookup}>
            <h2 className="flex items-center gap-2 text-lg font-bold">
              <PackageSearch className="h-4 w-4 text-brand" aria-hidden="true" />
              Find an order
            </h2>
            <div>
              <label className="label" htmlFor="track-number">Order number</label>
              <input
                id="track-number"
                className="field uppercase"
                value={proof.number}
                onChange={(event) => setProof({ ...proof, number: event.target.value })}
                placeholder="CH-10241"
                required
              />
            </div>
            <div>
              <label className="label" htmlFor="track-phone">Phone number used for the order</label>
              <input
                id="track-phone"
                className="field"
                value={proof.phone}
                onChange={(event) => setProof({ ...proof, phone: event.target.value })}
                placeholder="+1 555 0100 241"
              />
            </div>
            <button type="submit" className="btn-primary w-full">Find my order</button>
            {!user ? (
              <p className="text-xs text-ink-muted">
                Signed in? <Link to="/account?mode=signin" className="text-brand">Sign in</Link> and your orders appear automatically.
              </p>
            ) : null}
          </form>

          <section className="card p-6">
            <h2 className="mb-4 text-lg font-bold">Your recent orders</h2>
            {!user ? (
              <p className="text-sm text-ink-muted">Sign in to see your order history here.</p>
            ) : myOrders.length === 0 ? (
              <p className="text-sm text-ink-muted">No orders yet — your first one will show up here.</p>
            ) : (
              <ul className="divide-y divide-line">
                {myOrders.map((entry) => (
                  <li key={entry.id} className="flex items-center justify-between gap-3 py-3">
                    <div>
                      <p className="text-sm font-bold">{entry.order_number}</p>
                      <p className="text-xs text-ink-muted">{formatDate(entry.created_at, locale)} · {money(entry.total_cents)}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <StatusPill status={entry.status} />
                      <Link to={`/track/${entry.order_number}`} className="link-more">Open</Link>
                    </div>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      ) : status === 'loading' ? (
        <div className="card space-y-4 p-6">
          <LoadingSkeleton className="h-6 w-40" />
          <LoadingSkeleton className="h-24 w-full" />
        </div>
      ) : needsProof ? (
        <form className="card mx-auto max-w-lg space-y-4 p-6" onSubmit={submitLookup}>
          <h2 className="text-lg font-bold">Confirm this order</h2>
          <p className="text-sm text-ink-muted">{error}</p>
          <div>
            <label className="label" htmlFor="proof-phone">Phone number used for the order</label>
            <input
              id="proof-phone"
              className="field"
              value={proof.phone}
              onChange={(event) => setProof({ ...proof, phone: event.target.value, number: orderNumber ?? proof.number })}
              required
            />
          </div>
          <button type="submit" className="btn-primary w-full">Show order status</button>
        </form>
      ) : status === 'error' ? (
        <div className="space-y-4">
          <ErrorState message={error} />
          <p className="text-center">
            <button type="button" className="btn-ghost" onClick={() => lookup(orderNumber, params.get('phone') ?? undefined)}>
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              Try again
            </button>
          </p>
        </div>
      ) : order ? (
        <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
          <section className="card space-y-6 p-6">
            <header className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-ink-muted">Order</p>
                <h2 className="text-2xl font-extrabold">{order.order_number}</h2>
                <p className="text-xs text-ink-muted">Placed {formatDate(order.created_at, locale)}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2">
                <StatusPill status={order.status} />
                <PaymentPill status={order.payment_status} mode={order.payment_mode} />
              </div>
            </header>

            {order.status === 'cancelled' ? (
              <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
                This order was cancelled. Contact support if you need help with a refund.
              </p>
            ) : (
              <>
                <OrderProgress status={order.status} fulfillment={order.fulfillment} order={order} />
                <p className="rounded-xl border border-line bg-elevate px-4 py-3 text-xs text-ink-muted">
                  Estimated {order.fulfillment === 'pickup' ? 'pickup' : 'arrival'}:{' '}
                  <span className="font-semibold text-ink">{etaLabel(delivery.eta_minutes, locale)}</span> (estimate)
                </p>
              </>
            )}

            <div className="flex flex-wrap gap-3">
              <button type="button" className="btn-ghost" onClick={() => lookup(order.order_number, params.get('phone') ?? undefined)}>
                <RefreshCw className="h-4 w-4" aria-hidden="true" />
                Refresh status
              </button>
              <Link to="/support" className="btn-ghost">
                <Headset className="h-4 w-4" aria-hidden="true" />
                Contact support
              </Link>
            </div>
          </section>

          <aside className="card space-y-4 p-6">
            <h2 className="text-lg font-bold">Order details</h2>
            <ul className="space-y-3">
              {order.items.map((item) => (
                <li key={item.id} className="flex items-start justify-between gap-3 text-sm">
                  <span>
                    <span className="font-semibold">{item.quantity} × {item.name}</span>
                    {item.options?.length ? (
                      <span className="block text-xs text-ink-muted">{item.options.map((option) => option.name).join(' · ')}</span>
                    ) : null}
                  </span>
                  <span className="font-semibold">{money(item.line_total_cents)}</span>
                </li>
              ))}
            </ul>
            <dl className="space-y-2 border-t border-line pt-4 text-sm">
              <div className="flex justify-between"><dt className="text-ink-muted">Subtotal</dt><dd>{money(order.subtotal_cents)}</dd></div>
              {order.discount_cents ? (
                <div className="flex justify-between text-success"><dt>Discount {order.coupon_code ? `(${order.coupon_code})` : ''}</dt><dd>−{money(order.discount_cents)}</dd></div>
              ) : null}
              <div className="flex justify-between"><dt className="text-ink-muted">Delivery</dt><dd>{order.delivery_fee_cents ? money(order.delivery_fee_cents) : 'Free'}</dd></div>
              <div className="flex justify-between"><dt className="text-ink-muted">Tax</dt><dd>{money(order.tax_cents)}</dd></div>
              <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>Total</dt><dd className="text-brand">{money(order.total_cents)}</dd></div>
            </dl>
            <div className="space-y-1 text-xs text-ink-muted">
              <p className="font-semibold text-ink-soft">{order.fulfillment === 'pickup' ? 'Pickup order' : 'Delivering to'}</p>
              {order.address_line1 ? <p>{order.address_line1}{order.address_line2 ? `, ${order.address_line2}` : ''}</p> : null}
              {order.city ? <p>{order.city} {order.postal_code}</p> : null}
              {order.instructions ? <p className="italic">“{order.instructions}”</p> : null}
            </div>
            {order.notes ? (
              <p className="rounded-xl border border-line bg-elevate px-3 py-2 text-xs text-ink-muted">
                Kitchen note: {order.notes}
              </p>
            ) : null}
          </aside>
        </div>
      ) : (
        <p className="flex items-center gap-2 text-sm text-ink-muted">
          <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> Loading your order…
        </p>
      )}
    </div>
  );
}
