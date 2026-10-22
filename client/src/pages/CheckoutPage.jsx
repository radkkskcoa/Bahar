import { useEffect, useRef, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertTriangle, BadgeCheck, Banknote, Check, CreditCard, Loader2, MapPin, Phone, ShoppingBag, User,
} from 'lucide-react';
import { StatusPill, PaymentPill } from '../components/ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useDestination } from '../context/DestinationContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { orders as ordersApi, auth as authApi } from '../lib/api.js';
import { useMoney } from '../lib/money.js';
import { etaLabel } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

const STEPS = ['contact', 'delivery', 'fulfillment', 'payment'];

export default function CheckoutPage() {
  const { items, totals, count, clear, fulfillment, setFulfillment, couponCode, payload } = useCart();
  const { delivery, currency, settings } = useCatalog();
  const { user } = useAuth();
  const { destination, setDestination } = useDestination();
  const { toast } = useToast();
  const money = useMoney();
  const { t, locale } = useI18n();
  const navigate = useNavigate();

  const [step, setStep] = useState(0);
  const [customer, setCustomer] = useState({ name: '', email: '', phone: '' });
  const [address, setAddress] = useState(destination);
  const [paymentMethod, setPaymentMethod] = useState('cod');
  const [slot, setSlot] = useState(delivery.slots?.[0] ?? '');
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [placed, setPlaced] = useState(null);
  const [savedAddresses, setSavedAddresses] = useState([]);
  const clientToken = useRef(crypto.randomUUID());

  useEffect(() => {
    if (user) {
      setCustomer((current) => ({
        name: current.name || user.name || '',
        email: current.email || user.email || '',
        phone: current.phone || user.phone || '',
      }));
      authApi.addresses().then(setSavedAddresses).catch(() => setSavedAddresses([]));
    }
  }, [user]);

  useEffect(() => {
    setAddress(destination);
  }, [destination]);

  const validateStep = () => {
    setError(null);
    if (step === 0) {
      if (customer.name.trim().length < 2) return setError(t('checkout.error.name')), false;
      if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(customer.email)) return setError(t('checkout.error.email')), false;
      if (customer.phone.replace(/\D/g, '').length < 6) return setError(t('checkout.error.phone')), false;
    }
    if (step === 1 && fulfillment === 'delivery') {
      if (!address.line1?.trim()) return setError(t('checkout.error.street')), false;
      if (!address.city?.trim()) return setError(t('checkout.error.city')), false;
    }
    return true;
  };

  const next = () => {
    if (!validateStep()) return;
    setStep((current) => Math.min(current + 1, STEPS.length - 1));
  };

  const placeOrder = async () => {
    setError(null);
    if (!totals?.minimum_ok) {
      setError(t('checkout.minimumError'));
      return;
    }
    setSubmitting(true);
    try {
      const response = await ordersApi.create({
        customer,
        fulfillment,
        address,
        items: payload,
        coupon_code: couponCode || null,
        payment_method: paymentMethod,
        slot,
        client_token: clientToken.current,
      });
      setDestination({ ...address });
      setPlaced(response);
      clear();
      toast({
        title: t('checkout.placedToast', { number: response.order.order_number }),
        body: t('checkout.placedToastBody'),
        tone: 'success',
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ---------- confirmation ----------
  if (placed) {
    const order = placed.order;
    return (
      <div className="container-page py-10">
        <div className="card mx-auto max-w-2xl space-y-5 p-8">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-success/40 bg-success/10 text-success">
            <BadgeCheck className="h-7 w-7" aria-hidden="true" />
          </span>
          <div className="space-y-1">
            <h1 className="text-2xl font-extrabold">{t('checkout.thanks', { name: order.customer_name.split(' ')[0] })}</h1>
            <p className="text-sm text-ink-muted">
              {t('checkout.orderNumberLead')} <span className="font-bold text-ink">{order.order_number}</span>. {t('checkout.keepHandy')}
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <StatusPill status={order.status} />
            <PaymentPill status={order.payment_status} mode={order.payment_mode} />
          </div>

          <ul className="divide-y divide-line rounded-2xl border border-line">
            {order.items.map((item) => (
              <li key={item.id} className="flex items-center justify-between gap-3 px-4 py-3 text-sm">
                <span>
                  <span className="font-semibold">{item.quantity} × {item.name}</span>
                  {item.options?.length ? (
                    <span className="block text-xs text-ink-muted">
                      {item.options.map((option) => option.name).join(' · ')}
                    </span>
                  ) : null}
                </span>
                <span className="font-semibold">{money(item.line_total_cents)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.subtotal')}</dt><dd>{money(order.subtotal_cents)}</dd></div>
            {order.discount_cents ? (
              <div className="flex justify-between text-success"><dt>{t('cart.discount')} {order.coupon_code ? `(${order.coupon_code})` : ''}</dt><dd>−{money(order.discount_cents)}</dd></div>
            ) : null}
            <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.delivery')}</dt><dd>{order.delivery_fee_cents ? money(order.delivery_fee_cents) : t('cart.free')}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.tax')}</dt><dd>{money(order.tax_cents)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>{t('cart.total')}</dt><dd className="text-brand">{money(order.total_cents)}</dd></div>
          </dl>

          <p className="rounded-xl border border-line bg-elevate px-4 py-3 text-xs text-ink-muted">
            {t('checkout.etaNote', {
              kind: order.fulfillment === 'pickup' ? t('checkout.etaKindPickup') : t('checkout.etaKindDelivery'),
              eta: etaLabel(placed.eta_minutes, locale, t),
            })}
          </p>

          <div className="flex flex-wrap gap-3">
            <Link to={`/track/${order.order_number}`} className="btn-primary">{t('checkout.trackThisOrder')}</Link>
            <Link to="/menu" className="btn-ghost">{t('checkout.orderSomethingElse')}</Link>
          </div>
        </div>
      </div>
    );
  }

  if (count === 0) {
    return (
      <div className="container-page py-10">
        <div className="card mx-auto max-w-lg space-y-4 p-8 text-center">
          <ShoppingBag className="mx-auto h-8 w-8 text-brand" aria-hidden="true" />
          <h1 className="text-xl font-extrabold">{t('checkout.emptyCart')}</h1>
          <p className="text-sm text-ink-muted">{t('checkout.emptyHint')}</p>
          <Link to="/menu" className="btn-primary">{t('cart.browseMenu')}</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <header className="mb-6 space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('checkout.title')}</h1>
        <ol className="flex flex-wrap items-center gap-2 text-xs text-ink-muted">
          {STEPS.map((key, index) => (
            <li key={key} className="flex items-center gap-2">
              <span
                className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] font-bold ${
                  index < step ? 'border-lime bg-lime text-base'
                    : index === step ? 'border-brand bg-brand text-white'
                      : 'border-line bg-elevate text-ink-muted'
                }`}
              >
                {index < step ? <Check className="h-3 w-3" aria-hidden="true" /> : index + 1}
              </span>
              {t(`checkout.step.${key}`)}
            </li>
          ))}
        </ol>
      </header>

      <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
        <section className="card space-y-5 p-6">
          {step === 0 ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold"><User className="h-4 w-4 text-brand" aria-hidden="true" /> {t('checkout.contact')}</h2>
              <div>
                <label className="label" htmlFor="co-name">{t('checkout.fullName')}</label>
                <input id="co-name" className="field" value={customer.name} onChange={(e) => setCustomer({ ...customer, name: e.target.value })} autoComplete="name" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="co-email">{t('checkout.email')}</label>
                  <input id="co-email" type="email" className="field" value={customer.email} onChange={(e) => setCustomer({ ...customer, email: e.target.value })} autoComplete="email" />
                </div>
                <div>
                  <label className="label" htmlFor="co-phone">{t('checkout.phone')}</label>
                  <input id="co-phone" type="tel" className="field" value={customer.phone} onChange={(e) => setCustomer({ ...customer, phone: e.target.value })} autoComplete="tel" />
                </div>
              </div>
              <p className="text-xs text-ink-muted">{t('checkout.phoneNote')}</p>
            </div>
          ) : null}

          {step === 1 ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold"><MapPin className="h-4 w-4 text-brand" aria-hidden="true" /> {t('checkout.delivery')}</h2>
              {savedAddresses.length ? (
                <div className="space-y-2">
                  <p className="label mb-0">{t('checkout.savedAddresses')}</p>
                  {savedAddresses.map((saved) => (
                    <button
                      key={saved.id}
                      type="button"
                      onClick={() => setAddress({
                        label: saved.label, line1: saved.line1, line2: saved.line2 ?? '',
                        city: saved.city, postal_code: saved.postal_code ?? '', instructions: saved.instructions ?? '',
                      })}
                      className={`flex w-full items-center gap-3 rounded-xl border px-3 py-2 text-left text-sm transition
                        ${address.line1 === saved.line1 ? 'border-brand bg-brand/10' : 'border-line bg-elevate hover:border-brand/50'}`}
                    >
                      <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
                      {saved.label} · {saved.line1}, {saved.city}
                    </button>
                  ))}
                </div>
              ) : null}
              <div>
                <label className="label" htmlFor="co-line1">{t('checkout.street')}</label>
                <input id="co-line1" className="field" value={address.line1 ?? ''} onChange={(e) => setAddress({ ...address, line1: e.target.value })} autoComplete="address-line1" />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="co-line2">{t('checkout.unit')}</label>
                  <input id="co-line2" className="field" value={address.line2 ?? ''} onChange={(e) => setAddress({ ...address, line2: e.target.value })} autoComplete="address-line2" />
                </div>
                <div>
                  <label className="label" htmlFor="co-city">{t('checkout.city')}</label>
                  <input id="co-city" className="field" value={address.city ?? ''} onChange={(e) => setAddress({ ...address, city: e.target.value })} autoComplete="address-level2" />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="label" htmlFor="co-postal">{t('checkout.postal')}</label>
                  <input id="co-postal" className="field" value={address.postal_code ?? ''} onChange={(e) => setAddress({ ...address, postal_code: e.target.value })} autoComplete="postal-code" />
                </div>
                <div>
                  <label className="label" htmlFor="co-instructions">{t('checkout.instructions')}</label>
                  <input id="co-instructions" className="field" value={address.instructions ?? ''} onChange={(e) => setAddress({ ...address, instructions: e.target.value })} />
                </div>
              </div>
            </div>
          ) : null}

          {step === 2 ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold"><Phone className="h-4 w-4 text-brand" aria-hidden="true" /> {t('checkout.fulfillment')}</h2>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => setFulfillment('delivery')}
                  aria-pressed={fulfillment === 'delivery'}
                  className={`rounded-2xl border p-4 text-left transition ${fulfillment === 'delivery' ? 'border-brand bg-brand/10' : 'border-line bg-elevate'}`}
                >
                  <span className="block text-sm font-bold">{t('checkout.deliveryOption')}</span>
                  <span className="block text-xs text-ink-muted">
                    {t('checkout.deliveryFee', {
                      eta: etaLabel(delivery.eta_minutes, locale, t),
                      fee: delivery.fee_cents ? money(delivery.fee_cents) : t('cart.free'),
                    })}
                  </span>
                </button>
                <button
                  type="button"
                  onClick={() => delivery.pickup_enabled && setFulfillment('pickup')}
                  disabled={!delivery.pickup_enabled}
                  aria-pressed={fulfillment === 'pickup'}
                  className={`rounded-2xl border p-4 text-left transition disabled:opacity-50 ${fulfillment === 'pickup' ? 'border-brand bg-brand/10' : 'border-line bg-elevate'}`}
                >
                  <span className="block text-sm font-bold">{t('checkout.pickupOption')}</span>
                  <span className="block text-xs text-ink-muted">
                    {delivery.pickup_enabled
                      ? t('checkout.pickupReady', { eta: etaLabel(delivery.pickup_eta_minutes, locale, t) })
                      : t('checkout.pickupUnavailable')}
                  </span>
                </button>
              </div>
              <div>
                <label className="label" htmlFor="co-slot">{t('checkout.preferredTime')}</label>
                <select id="co-slot" className="field" value={slot} onChange={(e) => setSlot(e.target.value)}>
                  {(delivery.slots ?? []).map((option) => <option key={option} value={option}>{option}</option>)}
                </select>
              </div>
            </div>
          ) : null}

          {step === 3 ? (
            <div className="space-y-4">
              <h2 className="flex items-center gap-2 text-lg font-bold"><CreditCard className="h-4 w-4 text-brand" aria-hidden="true" /> {t('checkout.payment')}</h2>
              {settings.payments?.mode === 'test' ? (
                <p className="flex items-start gap-2 rounded-xl border border-warn/40 bg-warn/10 px-4 py-3 text-xs text-warn" role="note">
                  <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
                  {t('checkout.testNotice')}
                </p>
              ) : null}
              <div className="grid gap-3 sm:grid-cols-2">
                <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${paymentMethod === 'cod' ? 'border-brand bg-brand/10' : 'border-line bg-elevate'}`}>
                  <input type="radio" name="payment" value="cod" checked={paymentMethod === 'cod'} onChange={() => setPaymentMethod('cod')} className="mt-1 h-4 w-4 accent-brand" />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-bold"><Banknote className="h-4 w-4" aria-hidden="true" /> {t('checkout.cod')}</span>
                    <span className="block text-xs text-ink-muted">{t('checkout.codNote')}</span>
                  </span>
                </label>
                <label className={`flex cursor-pointer items-start gap-3 rounded-2xl border p-4 ${paymentMethod === 'card_test' ? 'border-brand bg-brand/10' : 'border-line bg-elevate'}`}>
                  <input type="radio" name="payment" value="card_test" checked={paymentMethod === 'card_test'} onChange={() => setPaymentMethod('card_test')} className="mt-1 h-4 w-4 accent-brand" />
                  <span>
                    <span className="flex items-center gap-2 text-sm font-bold"><CreditCard className="h-4 w-4" aria-hidden="true" /> {t('checkout.cardTest')}</span>
                    <span className="block text-xs text-ink-muted">{t('checkout.cardTestNote')}</span>
                  </span>
                </label>
              </div>
            </div>
          ) : null}

          {error ? (
            <p className="flex items-start gap-2 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-danger" role="alert">
              <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              {error}
            </p>
          ) : null}

          <div className="flex flex-wrap gap-3">
            {step > 0 ? (
              <button type="button" className="btn-ghost" onClick={() => setStep(step - 1)}>{t('checkout.back')}</button>
            ) : (
              <Link to="/cart" className="btn-ghost">{t('checkout.reviewCart')}</Link>
            )}
            {step < STEPS.length - 1 ? (
              <button type="button" className="btn-primary" onClick={next}>{t('checkout.next')}</button>
            ) : (
              <button type="button" className="btn-primary" onClick={placeOrder} disabled={submitting}>
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" /> : null}
                {t('checkout.placeOrder', { total: money(totals?.total_cents ?? 0) })}
              </button>
            )}
          </div>
        </section>

        <aside className="card h-fit space-y-4 p-6">
          <h2 className="text-lg font-bold">{t('checkout.summary')}</h2>
          <ul className="space-y-3">
            {items.map((item) => (
              <li key={item.key} className="flex items-start justify-between gap-3 text-sm">
                <span>
                  <span className="font-semibold">{item.quantity} × {item.name}</span>
                  {item.options.length ? (
                    <span className="block text-xs text-ink-muted">{item.options.map((o) => o.name).join(' · ')}</span>
                  ) : null}
                </span>
                <span className="font-semibold">
                  {money((item.base_price_cents + item.options.reduce((s, o) => s + o.price_cents, 0)) * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
          <dl className="space-y-2 border-t border-line pt-4 text-sm">
            <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.subtotal')}</dt><dd>{money(totals?.subtotal_cents ?? 0)}</dd></div>
            {totals?.discount_cents ? (
              <div className="flex justify-between text-success"><dt>{t('cart.discount')}</dt><dd>−{money(totals.discount_cents)}</dd></div>
            ) : null}
            <div className="flex justify-between"><dt className="text-ink-muted">{t('cart.delivery')}</dt><dd>{fulfillment === 'pickup' ? t('cart.pickup') : totals?.delivery_fee_cents ? money(totals.delivery_fee_cents) : t('cart.free')}</dd></div>
            <div className="flex justify-between"><dt className="text-ink-muted">{t('checkout.taxLine', { rate: settings.tax?.rate_percent ?? 0 })}</dt><dd>{money(totals?.tax_cents ?? 0)}</dd></div>
            <div className="flex justify-between border-t border-line pt-2 text-base font-extrabold"><dt>{t('cart.total')}</dt><dd className="text-brand">{money(totals?.total_cents ?? 0)}</dd></div>
          </dl>
          <p className="text-[11px] text-ink-muted">{t('checkout.pricesNote', { code: currency.code })}</p>
        </aside>
      </div>
    </div>
  );
}
