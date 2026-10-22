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

export default function DealsPage() {
  const { promotions, bundleProducts, reload, status, error } = useCatalog();
  const { setCouponCode, openDrawer } = useCart();
  const { toast } = useToast();
  const money = useMoney();
  const [coupons, setCoupons] = useState([]);
  const [openProduct, setOpenProduct] = useState(null);

  useEffect(() => {
    api.get('/coupons').then(setCoupons).catch(() => setCoupons([]));
  }, []);

  const applyCoupon = (code) => {
    setCouponCode(code);
    toast({ title: `Coupon ${code} applied`, body: 'Check the cart for your updated total.', tone: 'success' });
    openDrawer();
  };

  if (status === 'error') {
    return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  }

  return (
    <div className="container-page space-y-10 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Deals &amp; offers</h1>
        <p className="text-sm text-ink-muted">
          Every offer shows its real conditions — discounts are validated on the server when you check out.
        </p>
      </header>

      {promotions.length ? (
        <section className="grid gap-5 lg:grid-cols-2" aria-label="Active campaigns">
          {promotions.map((promotion) => (
            <PromotionBanner key={promotion.id} promotion={promotion} compact />
          ))}
        </section>
      ) : null}

      <section aria-labelledby="coupons-heading">
        <SectionHeader
          icon={<Ticket className="h-5 w-5" aria-hidden="true" />}
          title="Coupon codes"
          subtitle="Tap to copy, then apply it in your cart"
        />
        {coupons.length === 0 ? (
          <p className="text-sm text-ink-muted">No coupons are live right now — check back soon.</p>
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
                    {coupon.kind === 'percent' ? `${coupon.value}% off` : `${money(coupon.value)} off`}
                    {coupon.category_name ? ` · ${coupon.category_name} only` : ''}
                  </li>
                  {coupon.min_order_cents ? <li>Minimum order {money(coupon.min_order_cents)}</li> : null}
                  {coupon.ends_at ? <li>Valid until {formatDate(coupon.ends_at, undefined, false)}</li> : null}
                </ul>
                <button type="button" className="btn-ghost mt-auto" onClick={() => applyCoupon(coupon.code)}>
                  <Copy className="h-4 w-4" aria-hidden="true" />
                  Apply {coupon.code}
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
            title="Bundle offers"
            subtitle="Add a bundle straight to your cart"
            action={<Link to="/menu?category=bundles" className="link-more">View all →</Link>}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {bundleProducts.map((bundle) => (
              <FamilyBundleCard key={bundle.id} bundle={bundle} onOpen={setOpenProduct} />
            ))}
          </div>
          <span id="bundle-deals" className="sr-only">Bundle offers</span>
        </section>
      ) : null}

      <ProductDetailsModal product={openProduct} open={Boolean(openProduct)} onClose={() => setOpenProduct(null)} />
    </div>
  );
}
