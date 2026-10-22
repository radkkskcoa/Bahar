import { Link } from 'react-router-dom';
import { ChefHat, Clock, Leaf, ShieldCheck, Sparkles } from 'lucide-react';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';
import { etaLabel } from '../lib/format.js';

const DEFAULT_HERO = 'https://images.unsplash.com/photo-1600565193348-f74bd3c7ccdf?auto=format&fit=crop&w=1600&q=75';

/** Cinematic hero: dark scrim keeps the headline readable over the photo. */
export default function HeroSection() {
  const { brand, settings, delivery } = useCatalog();
  const { t, locale } = useI18n();
  const heroImage = settings.brand?.hero_image || DEFAULT_HERO;
  const headline = settings.brand?.hero_headline || 'Crispy Flavor,';
  const headlineAccent = settings.brand?.hero_headline_accent || 'Delivered Fast';

  return (
    <section className="relative isolate overflow-hidden rounded-3xl border border-line bg-soft">
      <img
        src={heroImage}
        alt="Chef preparing crispy fried chicken in a restaurant kitchen"
        className="absolute inset-0 h-full w-full object-cover"
        loading="eager"
        decoding="async"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-base via-base/85 to-base/35" aria-hidden="true" />
      <div className="absolute inset-0 bg-gradient-to-e from-base/80 to-transparent" aria-hidden="true" />

      <div className="relative flex min-h-[420px] flex-col justify-end gap-5 px-5 py-8 sm:min-h-[480px] sm:px-10 sm:py-12 lg:min-h-[540px]">
        <span className="inline-flex w-fit items-center gap-2 rounded-full border border-lime/50 bg-base/70 px-3 py-1.5 text-[11px] font-bold uppercase tracking-widest text-lime backdrop-blur">
          <ChefHat className="h-3.5 w-3.5" aria-hidden="true" />
          {brand.name}
        </span>

        <div className="max-w-2xl space-y-3">
          <h1 className="text-4xl font-extrabold leading-[1.05] sm:text-5xl lg:text-6xl">
            {headline} <span className="text-brand">{headlineAccent}</span>
          </h1>
          <p className="max-w-xl text-sm text-ink-soft sm:text-base">
            {settings.brand?.hero_subtitle || 'Hot, crunchy & made fresh for you.'}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link to="/menu" className="btn-primary px-6">{t('hero.orderNow')}</Link>
          <Link to="/menu?focus=all" className="btn-ghost px-6">{t('hero.exploreMenu')}</Link>
        </div>

        <ul className="flex flex-wrap gap-x-6 gap-y-2 text-xs text-ink-soft">
          <li className="inline-flex items-center gap-2">
            <Sparkles className="h-3.5 w-3.5 text-lime" aria-hidden="true" /> {t('hero.fresh')}
          </li>
          <li className="inline-flex items-center gap-2">
            <Clock className="h-3.5 w-3.5 text-lime" aria-hidden="true" />
            {t('hero.deliveryIn', { eta: etaLabel(delivery.eta_minutes, locale, t) })}
          </li>
          <li className="inline-flex items-center gap-2">
            <Leaf className="h-3.5 w-3.5 text-lime" aria-hidden="true" /> {t('hero.quality')}
          </li>
          <li className="inline-flex items-center gap-2">
            <ShieldCheck className="h-3.5 w-3.5 text-lime" aria-hidden="true" /> {t('hero.secure')}
          </li>
        </ul>
      </div>
    </section>
  );
}
