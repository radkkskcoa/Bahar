import { useCallback, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { RefreshCw, Search, Trash2 } from 'lucide-react';
import { ErrorState, LoadingSkeleton, EmptyState } from '../../components/states.jsx';
import { PaymentPill, StatusPill } from '../../components/ui.jsx';
import { admin } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../lib/money.js';
import { formatDate } from '../../lib/format.js';

const NEXT_STATUS = {
  confirmed: ['preparing', 'cancelled'],
  preparing: ['ready', 'cancelled'],
  ready: ['on_the_way', 'delivered', 'cancelled'],
  on_the_way: ['delivered', 'cancelled'],
  delivered: [],
  cancelled: [],
};

const LABELS = {
  preparing: 'Start preparing', ready: 'Mark ready', on_the_way: 'Out for delivery',
  delivered: 'Mark delivered', cancelled: 'Cancel order',
};

export default function OrdersTab() {
  const { toast } = useToast();
  const money = useMoney();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [busyId, setBusyId] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      setOrders(await admin.orders({ status: filter === 'all' ? '' : filter, q: search.trim() }));
      setError(null);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [filter, search]);

  useEffect(() => {
    const timer = setTimeout(load, 200);
    return () => clearTimeout(timer);
  }, [load]);

  const changeStatus = async (order, status) => {
    setBusyId(order.id);
    try {
      const updated = await admin.updateOrder(order.id, {
        status,
        note: status === 'cancelled' ? `Cancelled by staff for order ${order.order_number}` : undefined,
      });
      setOrders((current) => current.map((entry) => (entry.id === order.id ? updated : entry)));
      toast({
        title: `${order.order_number} → ${status.replace('_', ' ')}`,
        body: status === 'delivered' ? 'Loyalty points awarded once for this order.' : undefined,
        tone: 'success',
      });
    } catch (err) {
      toast({ title: 'Could not update the order', body: err.message, tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  const removeOrder = async (order) => {
    setBusyId(order.id);
    try {
      await admin.deleteOrder(order.id);
      setOrders((current) => current.filter((entry) => entry.id !== order.id));
      toast({ title: `Order ${order.order_number} deleted`, tone: 'info' });
    } catch (err) {
      toast({ title: 'Could not delete the order', body: err.message, tone: 'error' });
    } finally {
      setBusyId(null);
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          Status
          <select className="field w-auto py-2 text-xs" value={filter} onChange={(event) => setFilter(event.target.value)}>
            {['all', 'confirmed', 'preparing', 'ready', 'on_the_way', 'delivered', 'cancelled'].map((status) => (
              <option key={status} value={status}>{status === 'all' ? 'All orders' : status.replace('_', ' ')}</option>
            ))}
          </select>
        </label>
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute start-3 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
          <label className="sr-only" htmlFor="order-search">Search orders</label>
          <input
            id="order-search"
            className="field ps-10 py-2 text-sm"
            placeholder="Search order number, name or email"
            value={search}
            onChange={(event) => setSearch(event.target.value)}
          />
        </div>
        <button type="button" className="btn-ghost btn-sm" onClick={load}>
          <RefreshCw className="h-3.5 w-3.5" aria-hidden="true" />
          Refresh
        </button>
      </div>

      {loading ? (
        <div className="space-y-3">
          <LoadingSkeleton className="h-24 w-full" />
          <LoadingSkeleton className="h-24 w-full" />
        </div>
      ) : orders.length === 0 ? (
        <EmptyState title="No orders match" description="Try a different status filter or search term." />
      ) : (
        <ul className="space-y-4">
          {orders.map((order) => (
            <li key={order.id} className="card p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <p className="flex items-center gap-2 text-base font-extrabold">
                    {order.order_number}
                    {order.is_demo ? <span className="badge border border-line bg-elevate text-ink-muted">Demo data</span> : null}
                  </p>
                  <p className="text-xs text-ink-muted">
                    {formatDate(order.created_at)} · {order.customer_name} · {order.phone} · {order.email}
                  </p>
                  <p className="mt-1 text-xs text-ink-muted">
                    {order.fulfillment === 'pickup' ? 'Pickup' : `${order.address_line1 ?? ''}${order.city ? `, ${order.city}` : ''}`}
                    {order.instructions ? ` · “${order.instructions}”` : ''}
                  </p>
                </div>
                <div className="text-end">
                  <p className="text-lg font-extrabold text-brand">{money(order.total_cents)}</p>
                  <div className="mt-1 flex flex-wrap items-center justify-end gap-2">
                    <StatusPill status={order.status} />
                    <PaymentPill status={order.payment_status} mode={order.payment_mode} />
                  </div>
                </div>
              </div>

              <ul className="mt-3 space-y-1 border-t border-line pt-3 text-xs text-ink-muted">
                {order.items.map((item) => (
                  <li key={item.id}>
                    {item.quantity} × {item.name}
                    {item.options?.length ? ` (${item.options.map((option) => option.name).join(', ')})` : ''}
                  </li>
                ))}
              </ul>

              <div className="mt-4 flex flex-wrap items-center gap-2">
                {NEXT_STATUS[order.status].map((status) => (
                  <button
                    key={status}
                    type="button"
                    className={`btn-sm ${status === 'cancelled' ? 'btn-ghost hover:border-danger/60 hover:text-danger' : 'btn-primary'}`}
                    disabled={busyId === order.id}
                    onClick={() => changeStatus(order, status)}
                  >
                    {LABELS[status]}
                  </button>
                ))}
                <Link to={`/track/${order.order_number}`} className="btn-ghost btn-sm">View tracking</Link>
                <button
                  type="button"
                  className="btn-sm btn-ghost hover:border-danger/60 hover:text-danger"
                  disabled={busyId === order.id}
                  onClick={() => removeOrder(order)}
                >
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  Delete
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
