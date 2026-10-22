import { Heart, PenLine, Plus } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { Badge } from './ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useMoney } from '../lib/money.js';

/** Editorial "Chef Specials" card. */
export default function ChefSpecialCard({ product, onOpen }) {
  const { add, openDrawer } = useCart();
  const money = useMoney();
  const needsChoices = product.option_groups?.some((group) => group.required) ?? false;

  return (
    <article className="relative overflow-hidden rounded-3xl border border-line bg-card shadow-card">
      <ProductImage src={product.image_url} alt={product.name} className="h-52 w-full sm:h-60" />
      <div className="absolute inset-x-0 top-0 flex justify-between p-4">
        <Badge tone="lime">
          <PenLine className="h-3 w-3" aria-hidden="true" />
          {product.badge ?? "Chef's special"}
        </Badge>
        <Badge tone="muted">Limited</Badge>
      </div>

      <div className="space-y-3 p-5">
        <h3 className="text-xl font-extrabold">{product.name}</h3>
        <p className="text-sm text-ink-muted">{product.description}</p>
        <p className="inline-flex items-center gap-2 text-xs text-ink-muted">
          <Heart className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
          Made with love by our chefs
        </p>
        <div className="flex items-center justify-between gap-3 pt-1">
          <span className="text-2xl font-extrabold text-brand">{money(product.price_cents)}</span>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              if (needsChoices) return onOpen(product);
              add(product, { quantity: 1 });
              openDrawer();
            }}
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            Add
          </button>
        </div>
      </div>
    </article>
  );
}
