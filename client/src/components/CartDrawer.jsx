import { useNavigate } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import Drawer from './Drawer.jsx';
import CartItem from './CartItem.jsx';
import CartSummary from './CartSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function CartDrawer() {
  const { items, count, drawerOpen, closeDrawer } = useCart();
  const { t } = useI18n();
  const navigate = useNavigate();

  return (
    <Drawer
      open={drawerOpen}
      onClose={closeDrawer}
      title={`${t('cart.title')}${count ? ` (${count})` : ''}`}
      side="right"
      footer={
        items.length ? (
          <CartSummary
            onCheckout={() => {
              closeDrawer();
              navigate('/checkout');
            }}
          />
        ) : null
      }
    >
      {items.length ? (
        <ul className="space-y-4">
          {items.map((item) => (
            <CartItem key={item.key} item={item} />
          ))}
        </ul>
      ) : (
        <div className="flex flex-col items-center gap-3 py-10 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-elevate text-brand">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <h3 className="text-lg font-bold">{t('cart.empty')}</h3>
          <p className="max-w-xs text-sm text-ink-muted">{t('cart.emptyHint')}</p>
          <button
            type="button"
            className="btn-primary"
            onClick={() => {
              closeDrawer();
              navigate('/menu');
            }}
          >
            {t('cart.browseMenu')}
          </button>
        </div>
      )}
    </Drawer>
  );
}
