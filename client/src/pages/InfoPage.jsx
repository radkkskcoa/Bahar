import { useState } from 'react';
import { Link } from 'react-router-dom';
import { HelpCircle, Mail, MapPin, Phone, Send } from 'lucide-react';
import { SectionHeader } from '../components/ui.jsx';
import { support as supportApi } from '../lib/api.js';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useToast } from '../context/ToastContext.jsx';

const FAQ = [
  { q: 'How long does delivery take?', a: 'Most orders arrive in 18–22 minutes during opening hours. The window shown on your order is an estimate.' },
  { q: 'Can I track my order?', a: 'Yes — open “Track order” and enter your order number. Signed-in customers see their orders automatically.' },
  { q: 'How do coupon codes work?', a: 'Add items to your cart, enter the code in the cart, and we validate the conditions (minimum order, dates, eligible items) before applying the discount.' },
  { q: 'How do Crunch points work?', a: 'You earn 10 points for every $1 on delivered orders. Points are awarded once per order and can be redeemed for rewards.' },
  { q: 'Is payment secure?', a: 'No payment provider is connected in this demonstration, so card payments run in a clearly labelled test mode. We never store card numbers.' },
];

export default function InfoPage({ page = 'about' }) {
  const { contact, brand, delivery } = useCatalog();
  const { user } = useAuth();
  const { toast } = useToast();
  const [form, setForm] = useState({ name: user?.name ?? '', email: user?.email ?? '', order_number: '', subject: 'Order question', message: '' });
  const [busy, setBusy] = useState(false);
  const [sent, setSent] = useState(false);

  const submit = async (event) => {
    event.preventDefault();
    setBusy(true);
    try {
      await supportApi.send(form);
      setSent(true);
      toast({ title: 'Message sent', body: 'Our team will get back to you shortly.', tone: 'success' });
      setForm({ ...form, message: '' });
    } catch (err) {
      toast({ title: 'Could not send your message', body: err.message, tone: 'error' });
    } finally {
      setBusy(false);
    }
  };

  if (page === 'support') {
    return (
      <div className="container-page space-y-8 py-6">
        <header className="space-y-2">
          <h1 className="text-3xl font-extrabold sm:text-4xl">Support &amp; FAQ</h1>
          <p className="text-sm text-ink-muted">Answers to common questions, plus a direct line to our team.</p>
        </header>

        <section className="grid gap-6 lg:grid-cols-[1.1fr_1fr]">
          <div className="card p-6">
            <SectionHeader icon={<HelpCircle className="h-5 w-5" aria-hidden="true" />} title="Frequently asked questions" />
            <div className="space-y-3">
              {FAQ.map((entry) => (
                <details key={entry.q} className="rounded-2xl border border-line bg-elevate/60 px-4 py-3">
                  <summary className="cursor-pointer text-sm font-bold">{entry.q}</summary>
                  <p className="mt-2 text-sm text-ink-muted">{entry.a}</p>
                </details>
              ))}
            </div>
          </div>

          <form className="card space-y-3 p-6" onSubmit={submit}>
            <SectionHeader icon={<Mail className="h-5 w-5" aria-hidden="true" />} title="Contact support" subtitle="We reply during opening hours" />
            <div>
              <label className="label" htmlFor="sup-name">Name</label>
              <input id="sup-name" className="field" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="sup-email">Email</label>
              <input id="sup-email" type="email" className="field" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required />
            </div>
            <div>
              <label className="label" htmlFor="sup-order">Order number (optional)</label>
              <input id="sup-order" className="field uppercase" value={form.order_number} onChange={(e) => setForm({ ...form, order_number: e.target.value })} placeholder="CH-10241" />
            </div>
            <div>
              <label className="label" htmlFor="sup-message">How can we help?</label>
              <textarea id="sup-message" rows={4} className="field resize-none" value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} required />
            </div>
            <button type="submit" className="btn-primary w-full" disabled={busy}>
              <Send className="h-4 w-4" aria-hidden="true" />
              Send message
            </button>
            {sent ? <p className="text-xs text-success">Thanks — we have your message.</p> : null}

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
      title: `About ${brand.name}`,
      body: [
        brand.description,
        'We cook everything to order, so it reaches you hot and crunchy. Our menu is built around fried chicken, burgers, wraps and family-style bundles you can share.',
        'Crunch Rewards gives you points on every delivered order, and every coupon on the deals page shows the conditions it actually applies.',
      ],
      listTitle: 'Opening hours',
      list: contact.hours ?? [],
    },
    terms: {
      title: 'Terms & conditions',
      body: [
        'This is a demonstration application. Orders placed here are not fulfilled and no real payment is processed.',
        'Prices, delivery fees, taxes and promotions shown in the app are sample data managed through the admin dashboard.',
        `Minimum order for delivery is ${((delivery.min_order_cents ?? 0) / 100).toFixed(2)} and delivery is free over ${((delivery.free_over_cents ?? 0) / 100).toFixed(2)} in sample settings.`,
      ],
    },
    privacy: {
      title: 'Privacy policy',
      body: [
        'We store only what an order needs: your name, phone number, email and delivery address, plus your order history and loyalty points.',
        'Your orders are visible only to you and to authorised staff. Passwords are stored as salted hashes, and card numbers are never collected or stored.',
        'You can ask us to delete your account data by contacting support.',
      ],
    },
    refunds: {
      title: 'Refund & cancellation policy',
      body: [
        'You can cancel an order before it starts cooking and our team will cancel it in the dashboard — any coupon used is released.',
        'Once an order is marked as preparing we cannot cancel it, but contact support and we will make it right.',
        'In test mode no money changes hands, so no refunds are processed for demonstration orders.',
      ],
    },
  }[page] ?? { title: 'Information', body: [] };

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
          <Link to="/menu" className="btn-primary">Browse the menu</Link>
          <Link to="/support" className="btn-ghost">Contact support</Link>
        </div>
      </article>
    </div>
  );
}
