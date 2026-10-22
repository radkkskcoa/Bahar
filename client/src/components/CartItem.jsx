import { Trash2 } from 'lucide-react';
import ProductImage from './ProductImage.jsx';
import { QtyStepper } from './ui.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function CartItem({ item }) {
  const { setQuantity, remove } = useCart();
  const money = useMoney();
  const { t } = useI18n();
  const unit = item.base_price_cents + item.options.reduce((sum, option) => sum + option.price_cents, 0);

  return (
    <li className="flex gap-3 border-b border-line pb-4 last:border-0 last:pb-0">
      <ProductImage src={item.image_url} alt={item.name} className="h-20 w-20 shrink-0 rounded-xl" />
      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-sm font-bold">{item.name}</p>
            {item.options.length ? (
              <p className="mt-0.5 text-[11px] text-ink-muted">
                {item.options.map((option) => option.name).join(' · ')}
              </p>
            ) : null}
            {item.notes ? <p className="mt-0.5 text-[11px] italic text-ink-muted">“{item.notes}”</p> : null}
            <p className="mt-1 text-xs text-ink-muted">{money(unit)} {t('common.each')}</p>
          </div>
          <button
            type="button"
            onClick={() => remove(item.key)}
            className="shrink-0 rounded-lg p-2 text-ink-muted transition hover:text-danger"
            aria-label={`${t('cart.remove')} ${item.name}`}
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>

        <div className="mt-2 flex items-center justify-between gap-3">
          <QtyStepper
            value={item.quantity}
            min={0}
            onChange={(next) => setQuantity(item.key, next)}
            label={`${item.name} — ${t('common.qty')}`}
          />
          <span className="text-sm font-extrabold text-brand">{money(unit * item.quantity)}</span>
        </div>
      </div>
    </li>
  );
}
