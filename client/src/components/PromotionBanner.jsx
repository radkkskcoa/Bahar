import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CalendarClock, Copy, Tag } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

const ACCENTS = {
  orange: 'from-brand to-brand-deep text-white',
  lime: 'from-lime to-lime-deep text-base',
  dark: 'from-elevate to-black text-ink',
};

/** Campaign banner. The coupon chip copies the real, server-validated code. */
export default function PromotionBanner({ promotion, compact = false }) {
  const { toast } = useToast();
  const { t, locale } = useI18n();
  const [copied, setCopied] = useState(false);

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(promotion.coupon_code);
      setCopied(true);
      toast({ title: t('promo.copied', { code: promotion.coupon_code }), body: t('promo.copiedBody'), tone: 'success' });
    } catch {
      toast({ title: t('promo.useCode', { code: promotion.coupon_code }), body: t('promo.useCodeBody'), tone: 'info' });
    }
  };

  const accent = ACCENTS[promotion.accent] ?? ACCENTS.orange;

  return (
    <article className={`relative overflow-hidden rounded-3xl border border-line bg-gradient-to-br ${accent} shadow-card`}>
      <div className={`relative grid gap-4 ${compact ? 'p-5' : 'p-6 sm:grid-cols-[1.2fr_1fr] sm:p-8'}`}>
        <div className="space-y-3">
          <p className="text-[11px] font-bold uppercase tracking-[0.2em] opacity-80">{t('promo.limitedTime')}</p>
          <h3 className="text-2xl font-extrabold leading-tight sm:text-3xl">{promotion.title}</h3>
          <p className="text-sm font-semibold opacity-90">{promotion.subtitle}</p>
          <p className="max-w-md text-xs opacity-80">{promotion.body}</p>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <Link
              to={promotion.cta_href || '/menu'}
              className={`btn ${promotion.accent === 'lime' ? 'bg-base text-white' : 'bg-white text-base'} px-5`}
            >
              {promotion.cta_label}
            </Link>
            {promotion.coupon_code ? (
              <button
                type="button"
                onClick={copyCode}
                className="chip border-white/40 bg-black/25 text-white"
                aria-label={t('promo.copyAria', { code: promotion.coupon_code })}
              >
                {copied ? <Tag className="h-3.5 w-3.5" aria-hidden="true" /> : <Copy className="h-3.5 w-3.5" aria-hidden="true" />}
                {promotion.coupon_code}
              </button>
            ) : null}
          </div>

          {promotion.ends_at ? (
            <p className="inline-flex items-center gap-1.5 text-[11px] opacity-80">
              <CalendarClock className="h-3.5 w-3.5" aria-hidden="true" />
              {t('promo.ends', { date: formatDate(promotion.ends_at, locale, false) })}
            </p>
          ) : null}
        </div>

        <ProductImage
          src={promotion.image_url}
          alt={promotion.title}
          className="hidden h-full min-h-[180px] rounded-2xl sm:block"
        />
      </div>
    </article>
  );
}
