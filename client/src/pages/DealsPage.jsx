import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { BadgePercent, Copy, Ticket, Users } from 'lucide-react';
import PromotionBanner from '../components/PromotionBanner.jsx';
import FamilyBundleCard from '../components/FamilyBundleCard.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { SectionHeader } from '../components/ui.jsx';
import { ErrorState } from '../components/states.jsx';
import { api } from '../lib/api.js';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useMoney } from '../lib/money.js';
import { formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function DealsPage() {
  const { promotions, bundleProducts, reload, status, error } = useCatalog();
  const { setCouponCode, openDrawer } = useCart();
  const { toast } = useToast();
  const money = useMoney();
  const { t, locale } = useI18n();
  const [coupons, setCoupons] = useState([]);
  const [openProduct, setOpenProduct] = useState(null);

  useEffect(() => {
    api.get('/coupons').then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const applyCoupon = (code) => {
    setCouponCode(code);
    toast({ title: t('promo.copied', { code }), body: t('promo.copiedBody'), tone: 'success' });
    openDrawer();
  };

  if (status === 'error') {
    return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  }

  return (
    <div className="container-page space-y-10 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('deals.title')}</h1>
        <p className="text-sm text-ink-muted">{t('deals.subtitle')}</p>
      </header>

      {promotions.length ? (
        <section className="grid gap-5 lg:grid-cols-2" aria-label={t('promo.limitedTime')}>
          {promotions.map((promotion) => (
            <PromotionBanner key={promotion.id} promotion={promotion} compact />
          ))}
        </section>
      ) : null}

      <section aria-labelledby="coupons-heading">
        <SectionHeader
          icon={<Ticket className="h-5 w-5" aria-hidden="true" />}
          title={t('deals.coupons')}
          subtitle={t('deals.couponsSub')}
        />
        {coupons.length === 0 ? (
          <p className="text-sm text-ink-muted">{t('deals.none')}</p>
        ) : (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {coupons.map((coupon) => (
              <li key={coupon.id} className="card flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between gap-3">
                  <span className="rounded-xl border border-dashed border-brand/60 bg-brand/10 px-3 py-1.5 text-sm font-extrabold tracking-wider text-brand">
                    {coupon.code}
                  </span>
                  <BadgePercent className="h-5 w-5 text-lime" aria-hidden="true" />
                </div>
                <p className="text-sm text-ink-soft">{coupon.description}</p>
                <ul className="space-y-1 text-xs text-ink-muted">
                  <li>
                    {coupon.kind === 'percent'
                      ? t('deals.percentOff', { value: coupon.value })
                      : t('deals.amountOff', { amount: money(coupon.value) })}
                    {coupon.category_name ? ` ${t('deals.categoryOnly', { category: coupon.category_name })}` : ''}
                  </li>
                  {coupon.min_order_cents ? <li>{t('deals.minOrder', { amount: money(coupon.min_order_cents) })}</li> : null}
                  {coupon.ends_at ? <li>{t('deals.validUntil', { date: formatDate(coupon.ends_at, locale, false) })}</li> : null}
                </ul>
                <button type="button" className="btn-ghost mt-auto" onClick={() => applyCoupon(coupon.code)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  {t('deals.apply', { code: coupon.code })}
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>

      {bundleProducts.length ? (
        <section aria-labelledby="bundle-deals">
          <SectionHeader
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
            title={t('deals.bundles')}
            subtitle={t('deals.bundlesSub')}
            action={<Link to="/menu?category=bundles" className="link-more">{t('home.viewAll')} →</Link>}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {bundleProducts.map((bundle) => (
              <FamilyBundleCard key={bundle.id} bundle={bundle} onOpen={setOpenProduct} />
            ))}
          </div>
          <span id="bundle-deals" className="sr-only">{t('deals.bundles')}</span>
        </section>
      ) : null}

      <ProductDetailsModal product={openProduct} open={Boolean(openProduct)} onClose={() => setOpenProduct(null)} />
    </div>
  );
}
