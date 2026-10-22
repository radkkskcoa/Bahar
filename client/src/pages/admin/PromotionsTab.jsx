import { useCallback, useEffect, useState } from 'react';
import { CalendarClock, Plus, Save, Ticket, Trash2 } from 'lucide-react';
import { EmptyState, ErrorState, LoadingSkeleton } from '../../components/states.jsx';
import { Badge } from '../../components/ui.jsx';
import { admin } from '../../lib/api.js';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../lib/money.js';
import { formatDate } from '../../lib/format.js';

const EMPTY_PROMO = { title: '', subtitle: '', body: '', coupon_code: '', starts_at: '', ends_at: '' };
const EMPTY_COUPON = { code: '', kind: 'percent', value: '', min_order: '', description: '' };

const toDateInput = (value) => (value ? new Date(value).toISOString().slice(0, 10) : '');

export default function PromotionsTab() {
  const { toast } = useToast();
  const money = useMoney();
  const [promotions, setPromotions] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [promo, setPromo] = useState(EMPTY_PROMO);
  const [coupon, setCoupon] = useState(EMPTY_COUPON);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [promos, codes] = await Promise.all([admin.promotions(), admin.coupons()]);
      setPromotions(promos);
      setCoupons(codes);
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

  const updatePromotion = (id, patch) => {
    setPromotions((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const savePromotion = async (entry) => {
    try {
      const updated = await admin.updatePromotion(entry.id, {
        title: entry.title,
        subtitle: entry.subtitle,
        active: entry.active,
        coupon_code: entry.coupon_code,
        starts_at: entry.starts_at || null,
        ends_at: entry.ends_at || null,
      });
      setPromotions((current) => current.map((row) => (row.id === entry.id ? updated : row)));
      toast({ title: `${entry.title} saved`, tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not save the campaign', body: err.message, tone: 'error' });
    }
  };

  const createPromotion = async (event) => {
    event.preventDefault();
    try {
      const created = await admin.createPromotion({
        title: promo.title,
        subtitle: promo.subtitle,
        body: promo.body,
        coupon_code: promo.coupon_code || null,
        starts_at: promo.starts_at || null,
        ends_at: promo.ends_at || null,
      });
      setPromotions((current) => [...current, created]);
      setPromo(EMPTY_PROMO);
      toast({ title: `${created.title} created`, tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not create the campaign', body: err.message, tone: 'error' });
    }
  };

  const deletePromotion = async (entry) => {
    try {
      await admin.deletePromotion(entry.id);
      setPromotions((current) => current.filter((row) => row.id !== entry.id));
      toast({ title: `${entry.title} deleted`, tone: 'info' });
    } catch (err) {
      toast({ title: 'Could not delete the campaign', body: err.message, tone: 'error' });
    }
  };

  const updateCoupon = (id, patch) => {
    setCoupons((current) => current.map((entry) => (entry.id === id ? { ...entry, ...patch } : entry)));
  };

  const saveCoupon = async (entry) => {
    try {
      const updated = await admin.updateCoupon(entry.id, {
        active: entry.active,
        value: entry.value,
        min_order_cents: entry.min_order_cents,
      });
      setCoupons((current) => current.map((row) => (row.id === entry.id ? updated : row)));
      toast({ title: `${entry.code} saved`, tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not save the coupon', body: err.message, tone: 'error' });
    }
  };

  const createCoupon = async (event) => {
    event.preventDefault();
    try {
      const created = await admin.createCoupon({
        code: coupon.code,
        kind: coupon.kind,
        value: coupon.kind === 'percent' ? Number(coupon.value) : Math.round(Number(coupon.value) * 100),
        min_order_cents: Math.round(Number(coupon.min_order || 0) * 100),
        description: coupon.description,
      });
      setCoupons((current) => [created, ...current]);
      setCoupon(EMPTY_COUPON);
      toast({ title: `${created.code} created`, tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not create the coupon', body: err.message, tone: 'error' });
    }
  };

  const deleteCoupon = async (entry) => {
    try {
      await admin.deleteCoupon(entry.id);
      setCoupons((current) => current.filter((row) => row.id !== entry.id));
      toast({ title: `${entry.code} deleted`, tone: 'info' });
    } catch (err) {
      toast({ title: 'Could not delete the coupon', body: err.message, tone: 'error' });
    }
  };

  if (error) return <ErrorState message={error} onRetry={load} />;
  if (loading) return <div className="space-y-3"><LoadingSkeleton className="h-24 w-full" /><LoadingSkeleton className="h-24 w-full" /></div>;

  return (
    <div className="space-y-8">
      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <CalendarClock className="h-4 w-4 text-lime" aria-hidden="true" />
          Campaigns
        </h2>

        {promotions.length === 0 ? (
          <EmptyState title="No campaigns yet" description="Create your first campaign to feature it on the storefront." />
        ) : (
          <div className="space-y-3">
            {promotions.map((entry) => (
              <div key={entry.id} className="card grid gap-3 p-4 lg:grid-cols-[1.4fr_1fr_1fr_auto] lg:items-end">
                <div>
                  <label className="label" htmlFor={`promo-title-${entry.id}`}>Title</label>
                  <input id={`promo-title-${entry.id}`} className="field" value={entry.title} onChange={(e) => updatePromotion(entry.id, { title: e.target.value })} />
                  <p className="mt-1 text-[11px] text-ink-muted">{entry.slug}</p>
                </div>
                <div>
                  <label className="label" htmlFor={`promo-code-${entry.id}`}>Coupon code</label>
                  <input id={`promo-code-${entry.id}`} className="field uppercase" value={entry.coupon_code ?? ''} onChange={(e) => updatePromotion(entry.id, { coupon_code: e.target.value.toUpperCase() })} />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label" htmlFor={`promo-start-${entry.id}`}>Starts</label>
                    <input id={`promo-start-${entry.id}`} type="date" className="field" value={toDateInput(entry.starts_at)} onChange={(e) => updatePromotion(entry.id, { starts_at: e.target.value })} />
                  </div>
                  <div>
                    <label className="label" htmlFor={`promo-end-${entry.id}`}>Ends</label>
                    <input id={`promo-end-${entry.id}`} type="date" className="field" value={toDateInput(entry.ends_at)} onChange={(e) => updatePromotion(entry.id, { ends_at: e.target.value })} />
                  </div>
                </div>
                <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                  <label className="chip cursor-pointer">
                    <input type="checkbox" className="h-4 w-4 accent-brand" checked={entry.active} onChange={(e) => updatePromotion(entry.id, { active: e.target.checked })} />
                    Active
                  </label>
                  <button type="button" className="btn-sm btn-primary" onClick={() => savePromotion(entry)}>
                    <Save className="h-3.5 w-3.5" aria-hidden="true" />
                    Save
                  </button>
                  <button type="button" className="btn-sm btn-ghost hover:border-danger/60 hover:text-danger" onClick={() => deletePromotion(entry)}>
                    <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        <form className="card space-y-3 p-5" onSubmit={createPromotion}>
          <h3 className="text-sm font-bold">New campaign</h3>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className="label" htmlFor="np-promo-title">Title</label>
              <input id="np-promo-title" className="field" value={promo.title} onChange={(e) => setPromo({ ...promo, title: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="np-promo-subtitle">Subtitle</label>
              <input id="np-promo-subtitle" className="field" value={promo.subtitle} onChange={(e) => setPromo({ ...promo, subtitle: e.target.value })} />
            </div>
            <div>
              <label className="label" htmlFor="np-promo-coupon">Coupon code</label>
              <input id="np-promo-coupon" className="field uppercase" value={promo.coupon_code} onChange={(e) => setPromo({ ...promo, coupon_code: e.target.value.toUpperCase() })} />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="label" htmlFor="np-promo-start">Starts</label>
                <input id="np-promo-start" type="date" className="field" value={promo.starts_at} onChange={(e) => setPromo({ ...promo, starts_at: e.target.value })} />
              </div>
              <div>
                <label className="label" htmlFor="np-promo-end">Ends</label>
                <input id="np-promo-end" type="date" className="field" value={promo.ends_at} onChange={(e) => setPromo({ ...promo, ends_at: e.target.value })} />
              </div>
            </div>
          </div>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create campaign
          </button>
        </form>
      </section>

      <section className="space-y-4">
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Ticket className="h-4 w-4 text-lime" aria-hidden="true" />
          Coupons
        </h2>

        <div className="space-y-3">
          {coupons.map((entry) => (
            <div key={entry.id} className="card grid gap-3 p-4 lg:grid-cols-[1fr_1fr_1fr_1fr_auto] lg:items-end">
              <div>
                <p className="label">Code</p>
                <p className="text-sm font-extrabold tracking-wide text-brand">{entry.code}</p>
                <p className="text-[11px] text-ink-muted">Used {entry.used_count} times{entry.usage_limit ? ` of ${entry.usage_limit}` : ''}</p>
              </div>
              <div>
                <label className="label" htmlFor={`coupon-value-${entry.id}`}>
                  {entry.kind === 'percent' ? 'Percent off' : 'Amount off'}
                </label>
                <input
                  id={`coupon-value-${entry.id}`}
                  type="number"
                  min="0"
                  step={entry.kind === 'percent' ? '1' : '0.01'}
                  className="field"
                  value={entry.kind === 'percent' ? entry.value : (entry.value / 100).toFixed(2)}
                  onChange={(e) => updateCoupon(entry.id, {
                    value: entry.kind === 'percent' ? Number(e.target.value) : Math.round(Number(e.target.value) * 100),
                  })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`coupon-min-${entry.id}`}>Minimum order</label>
                <input
                  id={`coupon-min-${entry.id}`}
                  type="number"
                  min="0"
                  step="0.01"
                  className="field"
                  value={(entry.min_order_cents / 100).toFixed(2)}
                  onChange={(e) => updateCoupon(entry.id, { min_order_cents: Math.round(Number(e.target.value) * 100) })}
                />
              </div>
              <div>
                <p className="label">Window</p>
                <p className="text-xs text-ink-muted">
                  {entry.starts_at ? formatDate(entry.starts_at, undefined, false) : 'Always'} →{' '}
                  {entry.ends_at ? formatDate(entry.ends_at, undefined, false) : 'No end'}
                </p>
                <p className="mt-1 text-[11px] text-ink-muted">{entry.description}</p>
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <label className="chip cursor-pointer">
                  <input type="checkbox" className="h-4 w-4 accent-brand" checked={entry.active} onChange={(e) => updateCoupon(entry.id, { active: e.target.checked })} />
                  Active
                </label>
                <button type="button" className="btn-sm btn-primary" onClick={() => saveCoupon(entry)}>
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  Save
                </button>
                <button type="button" className="btn-sm btn-ghost hover:border-danger/60 hover:text-danger" onClick={() => deleteCoupon(entry)}>
                  <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                </button>
              </div>
            </div>
          ))}
        </div>

        <form className="card space-y-3 p-5" onSubmit={createCoupon}>
          <h3 className="text-sm font-bold">New coupon</h3>
          <div className="grid gap-3 sm:grid-cols-4">
            <div>
              <label className="label" htmlFor="nc-code">Code</label>
              <input id="nc-code" className="field uppercase" value={coupon.code} onChange={(e) => setCoupon({ ...coupon, code: e.target.value.toUpperCase() })} required />
            </div>
            <div>
              <label className="label" htmlFor="nc-kind">Type</label>
              <select id="nc-kind" className="field" value={coupon.kind} onChange={(e) => setCoupon({ ...coupon, kind: e.target.value })}>
                <option value="percent">Percent off</option>
                <option value="fixed">Fixed amount off</option>
              </select>
            </div>
            <div>
              <label className="label" htmlFor="nc-value">{coupon.kind === 'percent' ? 'Percent' : 'Amount'}</label>
              <input id="nc-value" type="number" min="0" step="0.01" className="field" value={coupon.value} onChange={(e) => setCoupon({ ...coupon, value: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="nc-min">Minimum order</label>
              <input id="nc-min" type="number" min="0" step="0.01" className="field" value={coupon.min_order} onChange={(e) => setCoupon({ ...coupon, min_order: e.target.value })} />
            </div>
          </div>
          <div>
            <label className="label" htmlFor="nc-description">Description shown to customers</label>
            <input id="nc-description" className="field" value={coupon.description} onChange={(e) => setCoupon({ ...coupon, description: e.target.value })} />
          </div>
          <button type="submit" className="btn-primary">
            <Plus className="h-4 w-4" aria-hidden="true" />
            Create coupon
          </button>
        </form>

        <p className="text-xs text-ink-muted">
          <Badge tone="muted">Note</Badge> Discounts are validated on the server for the live cart, so ineligible or expired codes are
          rejected at checkout even if a customer types them in.
        </p>
      </section>
    </div>
  );
}
