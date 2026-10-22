import { Link } from 'react-router-dom';
import { ShoppingBag } from 'lucide-react';
import CartItem from '../components/CartItem.jsx';
import CartSummary from '../components/CartSummary.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function CartPage() {
  const { items, count } = useCart();
  const { t } = useI18n();

  return (
    <div className="container-page py-6">
      <header className="mb-6">
        <h1 className="text-3xl font-extrabold sm:text-4xl">{t('cart.title')}</h1>
        <p className="text-sm text-ink-muted">{count} item{count === 1 ? '' : 's'}</p>
      </header>

      {items.length === 0 ? (
        <div className="card flex flex-col items-center gap-3 px-6 py-14 text-center">
          <span className="grid h-14 w-14 place-items-center rounded-full border border-line bg-elevate text-brand">
            <ShoppingBag className="h-6 w-6" aria-hidden="true" />
          </span>
          <h2 className="text-lg font-bold">{t('cart.empty')}</h2>
          <p className="max-w-sm text-sm text-ink-muted">{t('cart.emptyHint')}</p>
          <Link to="/menu" className="btn-primary">{t('cart.browseMenu')}</Link>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[1.4fr_1fr]">
          <ul className="card space-y-4 p-5">
            {items.map((item) => <CartItem key={item.key} item={item} />)}
          </ul>
          <aside className="card h-fit p-5">
            <CartSummary />
          </aside>
        </div>
      )}
    </div>
  );
}
