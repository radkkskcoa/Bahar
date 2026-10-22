import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarDays, DollarSign, RefreshCw, TrendingUp, Users } from 'lucide-react';
import { LoadingSkeleton, ErrorState } from '../../components/states.jsx';
import { SectionHeader, StatusPill } from '../../components/ui.jsx';
import { admin } from '../../lib/api.js';
import { useMoney } from '../../lib/money.js';

export default function OverviewTab() {
  const money = useMoney();
  const [stats, setStats] = useState(null);
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setStats(await admin.stats());
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  if (loading) {
    return (
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-28 w-full" />)}
      </div>
    );
  }

  if (error) return <ErrorState message={error} onRetry={load} />;

  const cards = [
    { label: 'Total orders', value: stats.orders_total, icon: CalendarDays, hint: `${stats.orders_today} today` },
    { label: "Today's revenue", value: money(stats.revenue_today_cents), icon: DollarSign, hint: 'Excludes cancelled orders' },
    { label: 'Average order value', value: money(stats.aov_cents), icon: TrendingUp, hint: 'All time' },
    { label: 'Customers', value: stats.customer_count, icon: Users, hint: `${stats.points_outstanding} points outstanding` },
  ];

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between gap-3">
        <h2 className="text-lg font-bold">Live numbers from your database</h2>
        <button type="button" className="btn-ghost btn-sm" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, hint }) => (
          <div key={label} className="card p-5">
            <div className="flex items-center justify-between">
              <p className="text-xs uppercase tracking-wide text-ink-muted">{label}</p>
              <Icon className="h-4 w-4 text-lime" aria-hidden="true" />
            </div>
            <p className="mt-2 text-2xl font-extrabold">{value}</p>
            <p className="mt-1 text-xs text-ink-muted">{hint}</p>
          </div>
        ))}
      </div>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="card p-6">
          <SectionHeader title="Orders by status" subtitle="Where every order stands right now" />
          <ul className="space-y-3">
            {Object.entries(stats.status_counts).length === 0 ? (
              <li className="text-sm text-ink-muted">No orders yet.</li>
            ) : (
              Object.entries(stats.status_counts).map(([status, count]) => (
                <li key={status} className="flex items-center justify-between gap-3">
                  <StatusPill status={status} />
                  <span className="text-sm font-bold">{count}</span>
                </li>
              ))
            )}
          </ul>
        </div>

        <div className="card p-6">
          <SectionHeader title="Best-selling dishes" subtitle="By quantity, excluding cancelled orders" />
          {stats.best_sellers.length === 0 ? (
            <p className="text-sm text-ink-muted">No sales yet.</p>
          ) : (
            <ul className="divide-y divide-line">
              {stats.best_sellers.map((item) => (
                <li key={item.name} className="flex items-center justify-between gap-3 py-3">
                  <span className="text-sm font-semibold">{item.name}</span>
                  <span className="text-xs text-ink-muted">
                    {item.quantity} sold · {money(item.revenue_cents)}
                  </span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </section>

      <p className="text-xs text-ink-muted">
        Need to change something? Head to <Link to="/admin" className="text-brand">Products</Link>,{' '}
        update an order in <Link to="/admin" className="text-brand">Orders</Link>, or fine-tune fees and hours in{' '}
        <Link to="/admin" className="text-brand">Business settings</Link>.
      </p>
    </div>
  );
}
