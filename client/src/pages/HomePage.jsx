import { useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowRight, Flame, Star, Users } from 'lucide-react';
import HeroSection from '../components/HeroSection.jsx';
import SearchBar from '../components/SearchBar.jsx';
import CategoryScroller from '../components/CategoryScroller.jsx';
import ProductCard from '../components/ProductCard.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import FamilyBundleCard from '../components/FamilyBundleCard.jsx';
import ChefSpecialCard from '../components/ChefSpecialCard.jsx';
import PromotionBanner from '../components/PromotionBanner.jsx';
import LoyaltyCard from '../components/LoyaltyCard.jsx';
import OrderTrackerCard from '../components/OrderTrackerCard.jsx';
import { SectionHeader } from '../components/ui.jsx';
import { ErrorState, SectionSkeleton } from '../components/states.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { useLoyalty } from '../hooks/useLoyalty.js';

export default function HomePage() {
  const {
    status, error, reload, categories, featuredProducts, bundleProducts, menuProducts, promotions, bySlug,
  } = useCatalog();
  const { user } = useAuth();
  const { t } = useI18n();
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [openProduct, setOpenProduct] = useState(null);
  const loyalty = useLoyalty();

  const chefSpecial = useMemo(
    () => bySlug.get('hot-honey-chicken') ?? menuProducts.find((p) => p.badge === "CHEF'S SPECIAL") ?? null,
    [bySlug, menuProducts],
  );

  const featured = featuredProducts.length ? featuredProducts : menuProducts.slice(0, 4);
  const mainPromotion = promotions.find((p) => p.accent === 'orange') ?? promotions[0];
  const secondaryPromotions = promotions.filter((p) => p !== mainPromotion);

  if (status === 'loading') {
    return (
      <div className="container-page space-y-8 py-6">
        <div className="skeleton h-[420px] w-full rounded-3xl" />
        <SectionSkeleton />
        <SectionSkeleton />
      </div>
    );
  }

  if (status === 'error') {
    return (
      <div className="container-page py-10">
        <ErrorState message={error} onRetry={reload} title={t('home.loadError')} />
      </div>
    );
  }

  return (
    <div className="container-page space-y-12 pb-6 pt-5 sm:pb-10">
      <HeroSection />

      <SearchBar
        value={query}
        onChange={setQuery}
        onSubmit={() => query.trim() && navigate(`/menu?q=${encodeURIComponent(query.trim())}`)}
        onOpenFilters={() => navigate('/menu?filters=open')}
      />

      <section aria-label={t('home.categories')}>
        <CategoryScroller
          categories={categories.filter((category) => category.slug !== 'bundles')}
          activeSlug={null}
          onSelect={(slug) => navigate(slug ? `/menu?category=${slug}` : '/menu')}
        />
      </section>

      <section aria-labelledby="signature-heading">
        <SectionHeader
          icon={<Star className="h-5 w-5 fill-lime" aria-hidden="true" />}
          title={t('home.signature')}
          subtitle={t('home.signatureSub')}
          action={<Link to="/menu" className="link-more">{t('home.viewAll')} →</Link>}
        />
        <div className="no-scrollbar -mx-4 flex gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:px-0 lg:grid lg:grid-cols-4 lg:overflow-visible">
          {featured.slice(0, 8).map((product) => (
            <div key={product.id} className="w-[240px] shrink-0 lg:w-auto">
              <ProductCard product={product} onOpen={setOpenProduct} />
            </div>
          ))}
        </div>
        <span id="signature-heading" className="sr-only">{t('home.signature')}</span>
      </section>

      {bundleProducts.length ? (
        <section aria-labelledby="bundles-heading">
          <SectionHeader
            icon={<Users className="h-5 w-5" aria-hidden="true" />}
            title={t('home.bundles')}
            subtitle={t('home.bundlesSub')}
            action={<Link to="/menu?category=bundles" className="link-more">{t('home.viewAll')} →</Link>}
          />
          <div className="grid gap-5 sm:grid-cols-2">
            {bundleProducts.slice(0, 2).map((bundle) => (
              <FamilyBundleCard key={bundle.id} bundle={bundle} onOpen={setOpenProduct} />
            ))}
          </div>
          <span id="bundles-heading" className="sr-only">{t('home.bundles')}</span>
        </section>
      ) : null}

      {chefSpecial || secondaryPromotions.length ? (
        <section aria-labelledby="specials-heading">
          <SectionHeader
            icon={<Flame className="h-5 w-5" aria-hidden="true" />}
            title={t('home.chefSpecials')}
            subtitle={t('home.chefSpecialsSub')}
          />
          <div className="grid gap-5 lg:grid-cols-2">
            {chefSpecial ? <ChefSpecialCard product={chefSpecial} onOpen={setOpenProduct} /> : null}
            {secondaryPromotions[0] ? <PromotionBanner promotion={secondaryPromotions[0]} /> : null}
          </div>
          <span id="specials-heading" className="sr-only">{t('home.chefSpecials')}</span>
        </section>
      ) : null}

      {mainPromotion ? <PromotionBanner promotion={mainPromotion} /> : null}

      <section className="grid gap-5 lg:grid-cols-2">
        <OrderTrackerCard />
        <LoyaltyCard
          points={loyalty.points}
          nextReward={loyalty.nextReward}
          rewards={loyalty.rewards}
          signedIn={Boolean(user)}
          onRedeem={loyalty.redeem}
        />
      </section>

      <section aria-label={t('home.popular')}>
        <SectionHeader
          title={t('home.popular')}
          subtitle={t('home.popularSub')}
          action={<Link to="/menu" className="link-more">{t('home.viewAll')} <ArrowRight className="inline h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" /></Link>}
        />
        <div className="grid gap-4 grid-cols-1 sm:grid-cols-2 lg:grid-cols-4">
          {menuProducts
            .filter((product) => product.badge === 'BESTSELLER')
            .slice(0, 4)
            .map((product) => <ProductCard key={product.id} product={product} onOpen={setOpenProduct} />)}
        </div>
      </section>

      <ProductDetailsModal
        product={openProduct}
        open={Boolean(openProduct)}
        onClose={() => setOpenProduct(null)}
      />
    </div>
  );
}
