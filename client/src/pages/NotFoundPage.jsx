import { Link } from 'react-router-dom';
import { UtensilsCrossed } from 'lucide-react';
import { useI18n } from '../context/I18nContext.jsx';

export default function NotFoundPage() {
  const { t } = useI18n();

  return (
    <div className="container-page py-16">
      <div className="card mx-auto max-w-lg space-y-4 p-10 text-center">
        <span className="mx-auto grid h-14 w-14 place-items-center rounded-full border border-line bg-elevate text-brand">
          <UtensilsCrossed className="h-6 w-6" aria-hidden="true" />
        </span>
        <h1 className="text-2xl font-extrabold">{t('notFound.title')}</h1>
        <p className="text-sm text-ink-muted">{t('notFound.body')}</p>
        <div className="flex flex-wrap justify-center gap-3">
          <Link to="/" className="btn-primary">{t('notFound.home')}</Link>
          <Link to="/menu" className="btn-ghost">{t('notFound.menu')}</Link>
        </div>
      </div>
    </div>
  );
}
