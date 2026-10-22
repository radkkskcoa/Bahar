import { Minus, Plus, Star } from 'lucide-react';
import { useI18n } from '../context/I18nContext.jsx';

export function SectionHeader({ icon, title, subtitle, action }) {
  return (
    <div className="section-head">
      <div>
        <h2 className="section-title">
          {icon ? <span className="text-lime">{icon}</span> : null}
          {title}
        </h2>
        {subtitle ? <p className="mt-1 text-sm text-ink-muted">{subtitle}</p> : null}
      </div>
      {action}
    </div>
  );
}

export function Badge({ children, tone = 'muted', className = '' }) {
  const tones = {
    brand: 'bg-brand text-white',
    lime: 'bg-lime text-base',
    muted: 'bg-elevate text-ink-soft border border-line',
    success: 'bg-success/15 text-success border border-success/40',
    danger: 'bg-danger/15 text-danger border border-danger/40',
    warn: 'bg-warn/15 text-warn border border-warn/40',
  };
  return <span className={`badge ${tones[tone] ?? tones.muted} ${className}`}>{children}</span>;
}

export function RatingStars({ value, count }) {
  if (!value) return null;
  return (
    <span className="inline-flex items-center gap-1 text-xs text-ink-muted">
      <Star className="h-3.5 w-3.5 fill-warn text-warn" aria-hidden="true" />
      <span className="font-semibold text-ink-soft">{Number(value).toFixed(1)}</span>
      {count ? <span>({count})</span> : null}
    </span>
  );
}

export function QtyStepper({ value, onChange, min = 1, max = 20, label }) {
  const { t } = useI18n();
  return (
    <div
      className="inline-flex items-center gap-1 rounded-full border border-line bg-elevate p-1"
      role="group"
      aria-label={label ?? t('common.qty')}
    >
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition hover:bg-base hover:text-white disabled:opacity-40"
        onClick={() => onChange(value - 1)}
        disabled={value <= min}
        aria-label={t('common.decreaseQty')}
      >
        <Minus className="h-4 w-4" aria-hidden="true" />
      </button>
      <span className="min-w-8 text-center text-sm font-bold" aria-live="polite">{value}</span>
      <button
        type="button"
        className="grid h-9 w-9 place-items-center rounded-full text-ink-soft transition hover:bg-base hover:text-white disabled:opacity-40"
        onClick={() => onChange(value + 1)}
        disabled={value >= max}
        aria-label={t('common.increaseQty')}
      >
        <Plus className="h-4 w-4" aria-hidden="true" />
      </button>
    </div>
  );
}

export function StatusPill({ status }) {
  const { t } = useI18n();
  const tones = {
    confirmed: 'muted',
    preparing: 'warn',
    ready: 'lime',
    on_the_way: 'brand',
    delivered: 'success',
    cancelled: 'danger',
  };
  return <Badge tone={tones[status] ?? tones.confirmed}>{t(`status.${status}`)}</Badge>;
}

export function PaymentPill({ status, mode }) {
  const { t } = useI18n();
  const tone = status === 'paid' || status === 'test_paid' ? 'success' : status === 'failed' ? 'danger' : 'warn';
  return (
    <Badge tone={tone}>
      {t(`payment.${status}`)}
      {mode === 'test' ? ` ${t('payment.testSuffix')}` : ''}
    </Badge>
  );
}
