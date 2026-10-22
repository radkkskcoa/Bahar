import { ArrowRight, Users } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { Badge } from './ui.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Large bundle card. "Customize" opens the product modal so sides/drinks can be chosen. */
export default function FamilyBundleCard({ bundle, onOpen }) {
  const money = useMoney();
  const { t } = useI18n();

  return (
    <article className="group relative overflow-hidden rounded-3xl border border-line bg-card shadow-card">
      <ProductImage
        src={bundle.image_url}
        alt={bundle.name}
        className="h-56 w-full sm:h-64"
        sizes="(max-width: 768px) 90vw, 480px"
      />
      <div className="absolute inset-x-0 top-0 flex justify-between p-4">
        <Badge tone="lime">
          <Users className="h-3 w-3" aria-hidden="true" />
          {bundle.badge ?? t('product.bundleBadge')}
        </Badge>
        <Badge tone="brand">{money(bundle.price_cents)}</Badge>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-xl font-extrabold">{bundle.name}</h3>
        <p className="text-sm text-ink-muted">{bundle.description}</p>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-1">
          <span className="text-2xl font-extrabold text-brand">{money(bundle.price_cents)}</span>
          <button type="button" className="btn-primary" onClick={() => onOpen(bundle)}>
            {t('product.customize')}
            <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
