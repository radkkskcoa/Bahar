import { Search, SlidersHorizontal, X } from 'lucide-react';
import { useI18n } from '../context/I18nContext.jsx';

/** Search field + filter trigger. Filtering happens on the real menu data. */
export default function SearchBar({ value, onChange, onOpenFilters, activeFilterCount = 0, onSubmit }) {
  const { t } = useI18n();

  return (
    <form
      className="flex items-center gap-2"
      role="search"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <div className="relative flex-1">
        <Search className="pointer-events-none absolute start-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted" aria-hidden="true" />
        <label className="sr-only" htmlFor="menu-search">{t('search.placeholder')}</label>
        <input
          id="menu-search"
          type="search"
          value={value}
          onChange={(event) => onChange(event.target.value)}
          placeholder={t('search.placeholder')}
          className="field ps-11 pe-11"
          autoComplete="off"
        />
        {value ? (
          <button
            type="button"
            onClick={() => onChange('')}
            className="absolute end-3 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-ink-muted transition hover:text-white"
            aria-label={t('search.clear')}
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <button
        type="button"
        onClick={onOpenFilters}
        className="icon-btn h-[46px] w-[46px] shrink-0"
        aria-label={`${t('search.filters')}${activeFilterCount ? ` (${activeFilterCount})` : ''}`}
      >
        <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
        {activeFilterCount > 0 ? (
          <span className="absolute -end-1 -top-1 grid h-5 w-5 place-items-center rounded-full bg-brand text-[10px] font-bold text-white">
            {activeFilterCount}
          </span>
        ) : null}
      </button>
    </form>
  );
}
