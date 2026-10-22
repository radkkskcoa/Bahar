import { CategoryIcon } from './CategoryIcon.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/** Horizontally scrollable category tiles — data-driven, keyboard reachable. */
export default function CategoryScroller({ categories, activeSlug, onSelect }) {
  const { t } = useI18n();

  return (
    <div className="no-scrollbar -mx-4 flex gap-3 overflow-x-auto px-4 pb-1 sm:mx-0 sm:px-0" role="tablist" aria-label={t('home.categories')}>
      <button
        type="button"
        role="tab"
        aria-selected={!activeSlug}
        onClick={() => onSelect(null)}
        className={`flex min-w-[86px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition
          ${!activeSlug ? 'border-brand bg-brand text-white' : 'border-line bg-elevate text-ink-soft hover:border-brand/60'}`}
      >
        <span className={`grid h-10 w-10 place-items-center rounded-xl ${!activeSlug ? 'bg-white/15' : 'bg-base text-lime'}`}>
          <CategoryIcon name="salad" />
        </span>
        {t('categories.all')}
      </button>

      {categories.map((category) => {
        const active = activeSlug === category.slug;
        return (
          <button
            key={category.id}
            type="button"
            role="tab"
            aria-selected={active}
            onClick={() => onSelect(category.slug)}
            className={`flex min-w-[86px] shrink-0 flex-col items-center gap-2 rounded-2xl border px-3 py-3 text-xs font-semibold transition
              ${active ? 'border-brand bg-brand text-white' : 'border-line bg-elevate text-ink-soft hover:border-brand/60'}`}
          >
            <span className={`grid h-10 w-10 place-items-center rounded-xl ${active ? 'bg-white/15' : 'bg-base text-lime'}`}>
              <CategoryIcon name={category.icon} />
            </span>
            {category.name}
          </button>
        );
      })}
    </div>
  );
}
