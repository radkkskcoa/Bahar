import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, PackageSearch } from 'lucide-react';
import OrderProgress from './OrderProgress.jsx';
import { StatusPill } from './ui.jsx';
import { LoadingSkeleton } from './states.jsx';
import { orders as ordersApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { etaLabel } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

const ACTIVE_STATUSES = ['confirmed', 'preparing', 'ready', 'on_the_way'];

/** Live tracker for the signed-in customer's latest active order. */
export default function OrderTrackerCard() {
  const { user, ready } = useAuth();
  const { delivery } = useCatalog();
  const { t, locale } = useI18n();
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user) return undefined;
    let cancelled = false;
    setLoading(true);
    ordersApi
      .mine()
      .then((list) => {
        if (cancelled) return;
        setOrder(list.find((entry) => ACTIVE_STATUSES.includes(entry.status)) ?? null);
      })
      .catch(() => setOrder(null))
      .finally(() => !cancelled && setLoading(false));
    return () => {
      cancelled = true;
    };
  }, [user]);

  if (!ready || loading) {
    return <div className="card space-y-3 p-5"><LoadingSkeleton className="h-5 w-40" /><LoadingSkeleton className="h-16 w-full" /></div>;
  }

  if (!user) {
    return (
      <section className="card flex flex-col gap-4 p-5">
        <header className="flex items-center justify-between gap-3">
          <h2 className="flex items-center gap-2 text-lg font-extrabold">
            <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
            {t('home.tracking')}
          </h2>
          <StatusPill status="confirmed" />
        </header>
        <p className="text-sm text-ink-soft">
          Track any order with its order number. Sign in to see your orders here automatically.
        </p>
        <Link to="/track" className="btn-primary w-fit">Track an order</Link>
      </section>
    );
  }

  return (
    <section className="card flex flex-col gap-4 p-5">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <h2 className="flex items-center gap-2 text-lg font-extrabold">
          <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
          {t('home.tracking')}
        </h2>
        {order ? <StatusPill status={order.status} /> : null}
      </header>

      {order ? (
        <>
          <p className="text-sm text-ink-soft">
            Order <span className="font-bold text-ink">{order.order_number}</span> · Estimated{' '}
            {etaLabel(delivery.eta_minutes, locale)} (estimate)
          </p>
          <OrderProgress status={order.status} fulfillment={order.fulfillment} order={order} />
          <Link to={`/track/${order.order_number}`} className="btn-ghost w-fit">Track order</Link>
        </>
      ) : (
        <>
          <p className="flex items-center gap-2 text-sm text-ink-soft">
            <PackageSearch className="h-4 w-4 text-lime" aria-hidden="true" />
            No active orders right now.
          </p>
          <Link to="/menu" className="btn-primary w-fit">Browse the menu</Link>
        </>
      )}
    </section>
  );
}
