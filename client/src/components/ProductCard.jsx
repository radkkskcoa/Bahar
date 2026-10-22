import { Heart, Plus } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { Badge, RatingStars } from './ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Product tile used across the home page, menu and search results. */
export default function ProductCard({ product, onOpen }) {
  const { add, openDrawer } = useCart();
  const { favorites, toggleFavorite } = useAuth();
  const { categoryBySlug } = useCatalog();
  const { toast } = useToast();
  const money = useMoney();
  const { t } = useI18n();

  const isFavorite = favorites.includes(product.id);
  const category = categoryBySlug.get(product.category_slug);
  const needsChoices = product.option_groups?.some((group) => group.required) ?? false;

  const addToCart = () => {
    if (!product.available) {
      toast({ title: t('product.unavailableTitle', { name: product.name }), body: t('product.unavailableBody'), tone: 'error' });
      return;
    }
    // Anything with required choices must be configured first.
    if (needsChoices) {
      onOpen(product);
      return;
    }
    add(product, { quantity: 1 });
    toast({ title: t('product.added', { name: product.name }), body: t('product.addedBody'), tone: 'success' });
    openDrawer();
  };

  return (
    <article className="group card flex flex-col overflow-hidden transition duration-300 hover:-translate-y-1 hover:border-brand/50">
      <div className="relative">
        <button
          type="button"
          onClick={() => onOpen(product)}
          className="block w-full text-left"
          aria-label={t('product.view', { name: product.name })}
        >
          <ProductImage
            src={product.image_url}
            alt={product.name}
            className="aspect-[4/3] w-full"
            sizes="(max-width: 640px) 45vw, 260px"
          />
        </button>
        <div className="pointer-events-none absolute inset-x-0 top-0 flex items-start justify-between p-3">
          {product.badge ? (
            <Badge tone={product.badge === 'NEW' ? 'lime' : 'brand'}>{product.badge}</Badge>
          ) : <span />}
        </div>
        <button
          type="button"
          onClick={() => toggleFavorite(product.id)}
          className="absolute bottom-3 end-3 grid h-9 w-9 place-items-center rounded-full border border-line bg-base/80
                     text-ink-soft backdrop-blur transition hover:text-brand"
          aria-label={isFavorite
            ? t('product.removeFromFavorites', { name: product.name })
            : t('product.saveToFavorites', { name: product.name })}
          aria-pressed={isFavorite}
        >
          <Heart className={`h-4 w-4 ${isFavorite ? 'fill-brand text-brand' : ''}`} aria-hidden="true" />
        </button>
        {!product.available ? (
          <span className="absolute inset-x-0 bottom-0 bg-danger/90 py-1.5 text-center text-xs font-bold uppercase tracking-wide">
            {t('product.unavailable')}
          </span>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <div className="flex items-center justify-between gap-2">
          <p className="text-[11px] font-semibold uppercase tracking-wide text-lime">
            {category?.name ?? product.category_name ?? ''}
          </p>
          <RatingStars value={product.rating} count={product.review_count} />
        </div>

        <button type="button" onClick={() => onOpen(product)} className="text-left">
          <h3 className="text-base font-bold leading-tight hover:text-brand">{product.name}</h3>
        </button>
        <p className="line-clamp-2 text-xs text-ink-muted">{product.description}</p>

        <div className="mt-auto flex items-center justify-between gap-3 pt-2">
          <span className="text-lg font-extrabold text-brand">{money(product.price_cents)}</span>
          <button
            type="button"
            onClick={addToCart}
            disabled={!product.available}
            className="grid h-11 w-11 place-items-center rounded-full bg-brand text-white shadow-glow transition
                       hover:bg-brand-hover active:scale-95 disabled:bg-line disabled:text-ink-muted disabled:shadow-none"
            aria-label={needsChoices
              ? t('product.chooseOptionsFor', { name: product.name })
              : t('product.addToCartFor', { name: product.name })}
          >
            <Plus className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
