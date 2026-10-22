import { useCallback, useEffect, useState } from 'react';
import { Save, Store, Users } from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '../../components/states.jsx';
import { admin } from '../../lib/api.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../lib/money.js';

export default function SettingsTab() {
  const { settings, reload } = useCatalog();
  const { toast } = useToast();
  const money = useMoney();
  const [draft, setDraft] = useState(null);
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const [fresh, people] = await Promise.all([admin.settings(), admin.customers()]);
      setDraft(fresh);
      setCustomers(people);
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

  const patch = (key, values) => setDraft((current) => ({ ...current, [key]: { ...current[key], ...values } }));

  const save = async (event) => {
    event.preventDefault();
    try {
      await admin.updateSettings({
        brand: {
          name: draft.brand.name,
          tagline: draft.brand.tagline,
          description: draft.brand.description,
          hero_image: draft.brand.hero_image ?? '',
        },
        contact: draft.contact,
        delivery: {
          fee_cents: Math.round(Number(draft.delivery.fee_cents ?? 0)),
          free_over_cents: Math.round(Number(draft.delivery.free_over_cents ?? 0)),
          min_order_cents: Math.round(Number(draft.delivery.min_order_cents ?? 0)),
        },
        tax: { rate_percent: Number(draft.tax.rate_percent) },
      });
      await reload();
      toast({ title: 'Business settings saved', body: 'The storefront now uses these values.', tone: 'success' });
    } catch (err) {
      toast({ title: 'Could not save settings', body: err.message, tone: 'error' });
    }
  };

  if (loading) return <div className="space-y-3"><LoadingSkeleton className="h-32 w-full" /><LoadingSkeleton className="h-32 w-full" /></div>;
  if (error) return <ErrorState message={error} onRetry={load} />;
  if (!draft) return null;

  return (
    <div className="space-y-8">
      <form className="card space-y-5 p-6" onSubmit={save}>
        <h2 className="flex items-center gap-2 text-lg font-bold">
          <Store className="h-4 w-4 text-lime" aria-hidden="true" />
          Restaurant settings
        </h2>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="set-name">Restaurant name</label>
            <input id="set-name" className="field" value={draft.brand.name} onChange={(e) => patch('brand', { name: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="set-tagline">Tagline</label>
            <input id="set-tagline" className="field" value={draft.brand.tagline} onChange={(e) => patch('brand', { tagline: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="set-description">Short description</label>
            <input id="set-description" className="field" value={draft.brand.description} onChange={(e) => patch('brand', { description: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="set-hero">Homepage hero image URL</label>
            <input id="set-hero" className="field" value={draft.brand.hero_image ?? ''} onChange={(e) => patch('brand', { hero_image: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="label" htmlFor="set-phone">Contact phone</label>
            <input id="set-phone" className="field" value={draft.contact.phone} onChange={(e) => patch('contact', { phone: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="set-email">Contact email</label>
            <input id="set-email" className="field" value={draft.contact.email} onChange={(e) => patch('contact', { email: e.target.value })} />
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="set-address">Address</label>
            <input id="set-address" className="field" value={draft.contact.address} onChange={(e) => patch('contact', { address: e.target.value })} />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-4">
          <div>
            <label className="label" htmlFor="set-fee">Delivery fee (cents)</label>
            <input id="set-fee" type="number" min="0" step="1" className="field" value={draft.delivery.fee_cents ?? 0} onChange={(e) => patch('delivery', { fee_cents: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="set-free">Free delivery over (cents)</label>
            <input id="set-free" type="number" min="0" step="1" className="field" value={draft.delivery.free_over_cents ?? 0} onChange={(e) => patch('delivery', { free_over_cents: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="set-min">Minimum order (cents)</label>
            <input id="set-min" type="number" min="0" step="1" className="field" value={draft.delivery.min_order_cents ?? 0} onChange={(e) => patch('delivery', { min_order_cents: e.target.value })} />
          </div>
          <div>
            <label className="label" htmlFor="set-tax">Tax rate (%)</label>
            <input id="set-tax" type="number" min="0" step="0.1" className="field" value={draft.tax.rate_percent} onChange={(e) => patch('tax', { rate_percent: e.target.value })} />
          </div>
        </div>

        <p className="text-xs text-ink-muted">
          Fees are stored in cents to keep money maths exact. Current fee: {money(Number(draft.delivery.fee_cents ?? 0))}.
          Payment mode: <span className="font-semibold text-ink">{draft.payments?.mode ?? 'test'}</span> — connect a provider to take real payments.
        </p>

        <button type="submit" className="btn-primary">
          <Save className="h-4 w-4" aria-hidden="true" />
          Save settings
        </button>
      </form>

      <section className="card p-6">
        <h2 className="mb-4 flex items-center gap-2 text-lg font-bold">
          <Users className="h-4 w-4 text-lime" aria-hidden="true" />
          Customers
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="border-b border-line text-start text-xs uppercase tracking-wide text-ink-muted">
                <th className="py-2 text-start">Customer</th>
                <th className="py-2 text-start">Contact</th>
                <th className="py-2 text-end">Orders</th>
                <th className="py-2 text-end">Spend</th>
                <th className="py-2 text-end">Points</th>
              </tr>
            </thead>
            <tbody>
              {customers.map((person) => (
                <tr key={person.id} className="border-b border-line/60 last:border-0">
                  <td className="py-3">
                    <span className="block font-semibold">{person.name}</span>
                    <span className="block text-xs text-ink-muted">{person.role}</span>
                  </td>
                  <td className="py-3 text-xs text-ink-muted">
                    <span className="block">{person.email}</span>
                    <span className="block">{person.phone ?? '—'}</span>
                  </td>
                  <td className="py-3 text-end">{person.orders}</td>
                  <td className="py-3 text-end">{money(person.spend_cents)}</td>
                  <td className="py-3 text-end">{person.points}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="mt-3 text-xs text-ink-muted">
          Only staff and administrators can see this list; the API rejects the request for any other account.
        </p>
      </section>
    </div>
  );
}
