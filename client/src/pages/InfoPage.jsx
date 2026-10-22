import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { SectionHeader } from '../components/ui.jsx';
import { support as supportApi } from '../lib/api.js';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

const FAQ_KEYS = ['q1', 'q2', 'q3', 'q4', 'q5'];

export default function InfoPage({ page = 'about' }) {
  const { contact, brand, delivery } = useCatalog();
  const { user } = useAuth();
  const { toast } = useToast();
  const { t } = useI18n();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', order_number: '', subject: 'Order question', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await supportApi.send(form);
      setSent(true);
      toast({ title: t('info.messageSent'), body: t('info.messageSentBody'), tone: 'success' });
      setForm({ ...form, message: '' });
    } catch (err) {
      toast({ title: t('info.messageError'), body: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (page === 'support') {
    return (
      <div className="container-page space-y-8 py-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">{t('info.supportTitle')}</h1>
          <p className="text-sm text-ink-muted">{t('info.supportSub')}</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="card p-6">
            <SectionHeader icon={<HelpCircle className="h-5 w-5" aria-hidden="true" />} title={t('info.faq')} />
            <div className="space-y-3">
              {FAQ_KEYS.map((key) => (
                <details key={key} className="rounded-2xl border border-line bg-elevate/60 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-bold">{t(`info.faq.${key}`)}</summary>
                  <p className="mt-2 text-sm text-ink-muted">{t(`info.faq.a${key.slice(1)}`)}</p>
                </details>
              ))}
            </div>
          </div>

          <form className="card space-y-3 p-6" onSubmit={submit}>
            <SectionHeader icon={<Mail className="h-5 w-5" aria-hidden="true" />} title={t('info.contactSupport')} subtitle={t('info.contactSupportSub')} />
            <div>
              <label className="label" htmlFor="sup-name">{t('info.name')}</label>
              <input id="sup-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="sup-email">{t('info.email')}</label>
              <input id="sup-email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="sup-order">{t('info.orderOptional')}</label>
              <input id="sup-order" className="field uppercase" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} placeholder="CH-10241" />
            </div>
            <div>
              <label className="label" htmlFor="sup-message">{t('info.howCanWeHelp')}</label>
              <textarea id="sup-message" rows={4} className="field resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              <Send className="h-4 w-4" aria-hidden="true" />
              {t('info.send')}
            </button>
            {sent ? <p className="text-xs text-success">{t('info.sent')}</p> : null}

            <div className="space-y-1 border-t border-line pt-4 text-xs text-ink-muted">
              <p className="flex items-center gap-2"><Phone className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> {contact.phone}</p>
              <p className="flex items-center gap-2"><Mail className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> {contact.email}</p>
              <p className="flex items-center gap-2"><MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" /> {contact.address}</p>
            </div>
          </form>
        </section>
      </div>
    );
  }

  const content = {
    about: {
      title: t('info.aboutTitle', { brand: brand.name }),
      body: [brand.description, t('info.aboutBody'), t('info.aboutRewards')],
      listTitle: t('info.openingHours'),
      list: contact.hours ?? [],
    },
    terms: {
      title: t('info.termsTitle'),
      body: [
        t('info.termsP1'),
        t('info.termsP2'),
        t('info.termsP3', {
          minimum: ((delivery.min_order_cents ?? 0) / 100).toFixed(2),
          free: ((delivery.free_over_cents ?? 0) / 100).toFixed(2),
        }),
      ],
    },
    privacy: {
      title: t('info.privacyTitle'),
      body: [t('info.privacyP1'), t('info.privacyP2'), t('info.privacyP3')],
    },
    refunds: {
      title: t('info.refundsTitle'),
      body: [t('info.refundsP1'), t('info.refundsP2'), t('info.refundsP3')],
    },
  }[page] ?? { title: t('nav.about'), body: [] };

  return (
    <div className="container-page py-10">
      <article className="card mx-auto max-w-3xl space-y-5 p-8">
        <h1 className="text-3xl font-extrabold">{content.title}</h1>
        {content.body.map((paragraph) => (
          <p key={paragraph} className="text-sm leading-relaxed text-ink-soft">{paragraph}</p>
        ))}
        {content.list?.length ? (
          <div>
            <h2 className="mb-2 text-sm font-bold uppercase tracking-wide text-lime">{content.listTitle}</h2>
            <ul className="space-y-1 text-sm text-ink-muted">
              {content.list.map((line) => <li key={line}>{line}</li>)}
            </ul>
          </div>
        ) : null}
        <div className="flex flex-wrap gap-3 border-t border-line pt-5">
          <Link to="/menu" className="btn-primary">{t('info.browseMenu')}</Link>
          <Link to="/support" className="btn-ghost">{t('info.contactSupport')}</Link>
        </div>
      </article>
    </div>
  );
}
