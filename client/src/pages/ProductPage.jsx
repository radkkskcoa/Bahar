import { useEffect } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { ErrorState } from '../components/states.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/** Deep link to a dish: the same detail modal, opened over the menu. */
export default function ProductPage() {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { bySlug, status, reload } = useCatalog();
  const { t } = useI18n();
  const product = bySlug.get(slug);

  useEffect(() => {
    if (status === 'ready' && !product) return;
  }, [status, product]);

  if (status === 'loading') {
    return (
      <div className="container-page py-10">
        <div className="skeleton h-72 w-full rounded-3xl" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="container-page py-10">
        <ErrorState
          title={t('product.notFoundTitle')}
          message={t('product.notFoundBody', { slug })}
          onRetry={reload}
        />
        <p className="mt-4 text-center">
          <Link to="/menu" className="link-more">{t('product.backToMenu')} →</Link>
        </p>
      </div>
    );
  }

  return (
    <div className="container-page py-6">
      <Link to="/menu" className="link-more">← {t('product.shortBack')}</Link>
      <ProductDetailsModal product={product} open onClose={() => navigate('/menu')} />
    </div>
  );
}
