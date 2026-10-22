import { useEffect, useState } from 'react';
import { MapPin } from 'lucide-react';
import Modal from './Modal.jsx';
import { auth as authApi } from '../lib/api.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useDestination } from '../context/DestinationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/** Delivery destination picker: saved addresses for members, free entry for guests. */
export default function LocationModal({ open, onClose }) {
  const { user } = useAuth();
  const { delivery } = useCatalog();
  const { destination, setDestination } = useDestination();
  const { toast } = useToast();
  const { t } = useI18n();
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
      setError(t('location.missing'));
      return;
    }
    const label = form.label?.trim() || t('location.labelPlaceholder');
    setDestination({ ...form, label });
    toast({ title: t('location.updated'), body: `${label} · ${form.city}`, tone: 'success' });
    onClose();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={t('location.title')}
      description={t('location.description')}
      size="sm"
      footer={
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={onClose}>{t('common.cancel')}</button>
          <button type="button" className="btn-primary flex-1" onClick={save}>{t('location.save')}</button>
        </div>
      }
    >
      <div className="space-y-4">
        {saved.length ? (
          <div className="space-y-2">
            <p className="label mb-0">{t('location.savedAddresses')}</p>
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
            <label className="label" htmlFor="dest-label">{t('location.label')}</label>
            <input
              id="dest-label"
              className="field"
              value={form.label ?? ''}
              onChange={(event) => setForm({ ...form, label: event.target.value })}
              placeholder={t('location.labelPlaceholder')}
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-zone">{t('location.zone')}</label>
            <select
              id="dest-zone"
              className="field"
              value={form.zone ?? ''}
              onChange={(event) => setForm({ ...form, zone: event.target.value })}
            >
              <option value="">{t('location.zoneSelect')}</option>
              {(delivery.zones ?? []).map((zone) => (
                <option key={zone} value={zone}>{zone}</option>
              ))}
            </select>
          </div>
        </div>

        <div>
          <label className="label" htmlFor="dest-line1">{t('location.street')}</label>
          <input
            id="dest-line1"
            className="field"
            value={form.line1 ?? ''}
            onChange={(event) => setForm({ ...form, line1: event.target.value })}
            placeholder={t('location.streetPlaceholder')}
          />
        </div>

        <div className="grid gap-3 sm:grid-cols-2">
          <div>
            <label className="label" htmlFor="dest-line2">{t('location.unit')}</label>
            <input
              id="dest-line2"
              className="field"
              value={form.line2 ?? ''}
              onChange={(event) => setForm({ ...form, line2: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-city">{t('location.city')}</label>
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
            <label className="label" htmlFor="dest-postal">{t('location.postal')}</label>
            <input
              id="dest-postal"
              className="field"
              value={form.postal_code ?? ''}
              onChange={(event) => setForm({ ...form, postal_code: event.target.value })}
            />
          </div>
          <div>
            <label className="label" htmlFor="dest-notes">{t('location.instructions')}</label>
            <input
              id="dest-notes"
              className="field"
              value={form.instructions ?? ''}
              onChange={(event) => setForm({ ...form, instructions: event.target.value })}
              placeholder={t('location.instructionsPlaceholder')}
            />
          </div>
        </div>

        {error ? <p className="text-sm text-danger" role="alert">{error}</p> : null}
      </div>
    </Modal>
  );
}
