import { useEffect, useMemo, useState } from 'react';
import { AlertCircle, Flame, Info, ShoppingBag } from 'lucide-react';
import Modal from './Modal.jsx';
import ProductImage from './ProductImage.jsx';
import { Badge, QtyStepper, RatingStars } from './ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useToast } from '../context/ToastContext.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Product detail + customization. Totals recalculate on every option change. */
export default function ProductDetailsModal({ product, open, onClose }) {
  const { add, openDrawer } = useCart();
  const { toast } = useToast();
  const money = useMoney();
  const { t } = useI18n();

  const [selection, setSelection] = useState({});
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState(null);

  // Reset the form whenever a different product opens.
  useEffect(() => {
    if (!product) return;
    const defaults = {};
    for (const group of product.option_groups ?? []) {
      if (group.type === 'single') {
        const preferred = group.items.find((item) => item.is_default) ?? group.items[0];
        defaults[group.id] = preferred ? [preferred.id] : [];
      } else {
        defaults[group.id] = [];
      }
    }
    setSelection(defaults);
    setQuantity(1);
    setNotes('');
    setError(null);
  }, [product]);

  const chosen = useMemo(() => {
    if (!product) return [];
    return (product.option_groups ?? []).flatMap((group) =>
      (selection[group.id] ?? []).map((id) => {
        const item = group.items.find((option) => option.id === id);
        return item ? { ...item, group_name: group.name } : null;
      }).filter(Boolean),
    );
  }, [product, selection]);

  if (!product) return null;

  const extras = chosen.reduce((sum, option) => sum + option.price_cents, 0);
  const unitPrice = product.price_cents + extras;
  const total = unitPrice * quantity;

  const toggleOption = (group, item) => {
    setError(null);
    setSelection((current) => {
      const selected = current[group.id] ?? [];
      if (group.type === 'single') return { ...current, [group.id]: [item.id] };
      if (selected.includes(item.id)) {
        return { ...current, [group.id]: selected.filter((id) => id !== item.id) };
      }
      if (selected.length >= group.max_select) {
        setError(t('product.maxSelect', { group: group.name, max: group.max_select }));
        return current;
      }
      return { ...current, [group.id]: [...selected, item.id] };
    });
  };

  const submit = () => {
    for (const group of product.option_groups ?? []) {
      const count = (selection[group.id] ?? []).length;
      const min = group.required ? Math.max(group.min_select, 1) : group.min_select;
      if (count < min) {
        setError(t('product.chooseOptions', { count: min, group: group.name }));
        return;
      }
    }
    add(product, { quantity, options: chosen, notes: notes.trim() || null });
    toast({ title: t('product.added', { name: product.name }), body: `${quantity} × ${money(unitPrice)}`, tone: 'success' });
    onClose();
    openDrawer();
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={product.name}
      size="lg"
      footer={
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-4">
            <QtyStepper value={quantity} onChange={(next) => setQuantity(Math.max(1, next))} />
            <div>
              <p className="text-[11px] uppercase tracking-wide text-ink-muted">{t('product.itemTotal')}</p>
              <p className="text-xl font-extrabold text-brand" aria-live="polite">{money(total)}</p>
            </div>
          </div>
          <button type="button" className="btn-primary w-full sm:w-auto" onClick={submit} disabled={!product.available}>
            <ShoppingBag className="h-4 w-4" aria-hidden="true" />
            {product.available ? t('common.addToCart') : t('product.unavailable')}
          </button>
        </div>
      }
    >
      <div className="grid gap-5 md:grid-cols-2">
        <ProductImage
          src={product.image_url}
          alt={product.name}
          className="aspect-[4/3] w-full rounded-2xl"
          eager
        />
        <div className="space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            {product.badge ? <Badge tone="brand">{product.badge}</Badge> : null}
            {product.spicy ? (
              <Badge tone="danger"><Flame className="h-3 w-3" aria-hidden="true" /> {t('product.spicy')}</Badge>
            ) : null}
            {product.vegetarian ? <Badge tone="success">{t('product.vegetarian')}</Badge> : null}
            <RatingStars value={product.rating} count={product.review_count} />
          </div>
          <p className="text-2xl font-extrabold text-brand">{money(product.price_cents)}</p>
          <p className="text-sm text-ink-soft">{product.description}</p>
          {product.prep_minutes ? (
            <p className="text-xs text-ink-muted">{t('product.prepTime', { minutes: product.prep_minutes })}</p>
          ) : null}
          {(product.ingredients || product.allergens) && (
            <details className="rounded-xl border border-line bg-elevate px-4 py-3 text-xs text-ink-soft">
              <summary className="flex cursor-pointer items-center gap-2 font-semibold text-ink">
                <Info className="h-3.5 w-3.5" aria-hidden="true" />
                {t('product.ingredientsTitle')}
              </summary>
              <div className="mt-2 space-y-1">
                {product.ingredients ? <p><span className="text-ink-muted">{t('product.ingredients')}</span> {product.ingredients}</p> : null}
                {product.allergens ? <p><span className="text-ink-muted">{t('product.allergens')}</span> {product.allergens}</p> : null}
              </div>
            </details>
          )}
        </div>
      </div>

      {(product.option_groups ?? []).length > 0 ? (
        <div className="mt-6 space-y-5">
          {product.option_groups.map((group) => {
            const selected = selection[group.id] ?? [];
            return (
              <fieldset key={group.id} className="rounded-2xl border border-line bg-elevate/60 p-4">
                <legend className="px-1 text-sm font-bold">
                  {group.name}
                  <span className="ms-2 text-[11px] font-medium uppercase tracking-wide text-ink-muted">
                    {group.required ? t('common.required') : t('common.optional')}
                    {group.type === 'multi' ? ` · ${t('product.upTo', { max: group.max_select })}` : ''}
                  </span>
                </legend>
                <div className="mt-2 flex flex-wrap gap-2">
                  {group.items.map((item) => {
                    const isSelected = selected.includes(item.id);
                    return (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleOption(group, item)}
                        aria-pressed={isSelected}
                        className={`chip ${isSelected ? 'chip-active' : ''}`}
                      >
                        {item.name}
                        {item.price_cents > 0 ? (
                          <span className={isSelected ? 'text-white/90' : 'text-brand'}>+{money(item.price_cents)}</span>
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
            );
          })}
        </div>
      ) : null}

      <div className="mt-5">
        <label className="label" htmlFor="product-notes">{t('product.instructions')}</label>
        <textarea
          id="product-notes"
          rows={2}
          maxLength={280}
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          placeholder={t('product.instructionsPlaceholder')}
          className="field resize-none"
        />
      </div>

      {error ? (
        <p className="mt-3 flex items-center gap-2 text-sm text-danger" role="alert">
          <AlertCircle className="h-4 w-4" aria-hidden="true" />
          {error}
        </p>
      ) : null}
    </Modal>
  );
}
