import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Modal from './Modal.jsx';
import { auth as authApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useDestination } from '../context/DestinationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

/** Delivery destination picker: saved addresses for members, free entry for guests. */
export default function LocationModal({ open, onClose }) {
  const { user } = useAuth();
  const { delivery } = useCatalog();
  const { destination, setDestination } = useDestination();
  const { toast } = useToast();
  const [saved, setSaved] = useState([]);
  const [form, setForm] = useState(destination);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!open) return;
    setForm(destination);
    if (!user) return;
    authApi.addresses().then(setSaved).catch(() => setSaved([]));
  }, [open, user, destination]);

  const save = () => {
    if (!form.line1?.trim() || !form.city?.trim()) {
      setError('Please add a street address and a city so we know where to deliver.');
      return;
    }
    setDestination({ ...form, label: form.label?.trim() || 'Home' });
    toast({ title: 'Delivery destination updated', body: `${form.label || 'Home'} · ${form.city}`, tone: 'success' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Where should we deliver?"
      description="Pick a saved address or enter a new one."
      size="sm"
      footer={
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>Cancel</button>
          <button type="button" className="btn-primary flex-1" onClick={save}>Save destination</button>
        </div>
      }
    >
      <div className="space-y-4">
        {saved.length ? (
          <div className="space-y-2">
            <p className="label mb-0">Saved addresses</p>
            {saved.map((address) => (
              <button
                key={address.id}
                type="button"
                onClick={() =>
                  setForm({
                    label: address.label,
                    line1: address.line1,
                    line2: address.line2 ?? '',
                    city: address.city,
                    postal_code: address.postal_code ?? '',
                    instructions: address.instructions ?? '',
                  })
                }
                className={`flex w-full items-start gap-3 rounded-xl border px-3 py-2 text-left text-sm transition
                  ${form.line1 === address.line1 ? 'border-brand bg-brand/10' : 'border-line bg-elevate hover:border-brand/50'}`}
              >
                <MapPin className="mt-0.5 h-4 w-4 text-brand" aria-hidden="true" />
                <span>
                  <span className="block font-semibold">{address.label}</span>
                  <span className="block text-xs text-ink-muted">
                    {address.line1}{address.line2 ? `, ${address.line2}` : ''} · {address.city}
                  </span>
                </span>
              </button>
            ))}
          </div>
        ) : null}

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="dest-label">Label</label>
            <input
              id="dest-label"
              className="field"
              value={form.label ?? ''}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              placeholder="Home"
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-zone">Zone</label>
            <select
              id="dest-zone"
              className="field"
              value={form.zone ?? ''}
              onChange={(event) => setForm({ ...form, zone: event.target.value })}
            >
              <option value="">Select a zone</option>
              {(delivery.zones ?? []).map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="dest-line1">Street address</label>
          <input
            id="dest-line1"
            className="field"
            value={form.line1 ?? ''}
            onChange={(event) => setForm({ ...form, line1: event.target.value })}
            placeholder="42 Crispy Lane"
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="dest-line2">Apartment / unit</label>
            <input
              id="dest-line2"
              className="field"
              value={form.line2 ?? ''}
              onChange={(event) => setForm({ ...form, line2: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-city">City</label>
            <input
              id="dest-city"
              className="field"
              value={form.city ?? ''}
              onChange={(event) => setForm({ ...form, city: event.target.value })}
            />
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="dest-postal">Postal code</label>
            <input
              id="dest-postal"
              className="field"
              value={form.postal_code ?? ''}
              onChange={(event) => setForm({ ...form, postal_code: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-notes">Delivery instructions</label>
            <input
              id="dest-notes"
              className="field"
              value={form.instructions ?? ''}
              onChange={(event) => setForm({ ...form, instructions: event.target.value })}
              placeholder="Ring the green doorbell"
            />
          </div>
        </div>

        {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}
