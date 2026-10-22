import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { BadgeCheck, Loader2, Tag, Truck, XCircle } from 'lucide-react';
import { useCart } from '../context/CartContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Totals always mirror the server calculation for the current cart. */
export default function CartSummary({ onCheckout, showCheckout = true, disabled = false }) {
  const { items, totals, pricing, couponCode, setCouponCode, coupon, couponError, subtotalEstimate, fulfillment } = useCart();
  const { delivery } = useCatalog();
  const { t } = useI18n();
  const money = useMoney();
  const navigate = useNavigate();
  const [draftCoupon, setDraftCoupon] = useState(couponCode);

  const subtotal = totals?.subtotal_cents ?? subtotalEstimate;
  const remainingForFreeDelivery =
    fulfillment === 'delivery' && delivery.free_over_cents ? delivery.free_over_cents - subtotal : 0;

  const goToCheckout = () => {
    if (onCheckout) return onCheckout();
    navigate('/checkout');
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="label" htmlFor="coupon-code">{t('cart.coupon')}</label>
        <div className="flex gap-2">
          <input
            id="coupon-code"
            className="field uppercase"
            value={draftCoupon}
            onChange={(event) => setDraftCoupon(event.target.value.toUpperCase())}
            placeholder="CRUNCH25"
            autoComplete="off"
          />
          <button type="button" className="btn-ghost shrink-0" onClick={() => setCouponCode(draftCoupon.trim())}>
            {t('cart.apply')}
          </button>
        </div>
        {coupon ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-success">
            <BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
            {coupon.code} · {coupon.description}
          </p>
        ) : null}
        {couponError ? (
          <p className="mt-2 flex items-center gap-1.5 text-xs text-danger" role="alert">
            <XCircle className="h-3.5 w-3.5" aria-hidden="true" />
            {couponError}
          </p>
        ) : null}
      </div>

      {totals && !totals.minimum_ok ? (
        <p className="rounded-xl border border-warn/40 bg-warn/10 px-3 py-2 text-xs text-warn" role="alert">
          {t('cart.minimum', { amount: money(totals.minimum_order_cents) })}
        </p>
      ) : null}

      {remainingForFreeDelivery > 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-ink-muted">
          <Truck className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
          {t('cart.freeDeliveryHint', { amount: money(remainingForFreeDelivery) })}
        </p>
      ) : null}

      <dl className="space-y-2 text-sm">
        <div className="flex justify-between">
          <dt className="text-ink-muted">{t('cart.subtotal')}</dt>
          <dd className="font-semibold">{money(subtotal)}</dd>
        </div>
        {totals?.discount_cents ? (
          <div className="flex justify-between text-success">
            <dt className="flex items-center gap-1.5"><Tag className="h-3.5 w-3.5" aria-hidden="true" />{t('cart.discount')}</dt>
            <dd className="font-semibold">−{money(totals.discount_cents)}</dd>
          </div>
        ) : null}
        <div className="flex justify-between">
          <dt className="text-ink-muted">{t('cart.delivery')}</dt>
          <dd className="font-semibold">
            {fulfillment === 'pickup' ? t('cart.pickup') : totals?.delivery_fee_cents ? money(totals.delivery_fee_cents) : t('cart.free')}
          </dd>
        </div>
        <div className="flex justify-between">
          <dt className="text-ink-muted">{t('cart.tax')}</dt>
          <dd className="font-semibold">{money(totals?.tax_cents ?? 0)}</dd>
        </div>
        <div className="flex items-center justify-between border-t border-line pt-3 text-base">
          <dt className="font-bold">{t('cart.total')}</dt>
          <dd className="flex items-center gap-2 text-xl font-extrabold text-brand">
            {pricing.loading ? <Loader2 className="h-4 w-4 animate-spin text-ink-muted" aria-hidden="true" /> : null}
            {money(totals?.total_cents ?? subtotal)}
          </dd>
        </div>
      </dl>

      {pricing.error ? (
        <p className="rounded-xl border border-danger/40 bg-danger/10 px-3 py-2 text-xs text-danger" role="alert">
          {pricing.error}
        </p>
      ) : null}

      {showCheckout ? (
        <button
          type="button"
          className="btn-primary w-full"
          onClick={goToCheckout}
          disabled={disabled || items.length === 0 || !totals?.minimum_ok}
        >
          {t('cart.checkout')}
        </button>
      ) : null}
    </div>
  );
}
