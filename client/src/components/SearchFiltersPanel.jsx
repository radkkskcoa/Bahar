import Drawer from './Drawer.jsx';
import { useMoney } from '../lib/money.js';
import { useI18n } from '../context/I18nContext.jsx';

/** Sort labels are translated at render time; call with the `t` helper from `useI18n`. */
export function sortOptions(t) {
  return [
    { value: 'recommended', label: t('sort.recommended') },
    { value: 'popularity', label: t('sort.popularity') },
    { value: 'price-asc', label: t('sort.price-asc') },
    { value: 'price-desc', label: t('sort.price-desc') },
    { value: 'new', label: t('sort.new') },
  ];
}

export const DEFAULT_FILTERS = {
  sort: 'recommended',
  maxPrice: null,
  vegetarian: false,
  spicy: false,
  bestsellers: false,
  availableOnly: true,
};

/** Filters run against the live catalog data the storefront already loaded. */
export default function SearchFiltersPanel({ open, onClose, filters, setFilters, maxPriceCents }) {
  const money = useMoney();
  const { t } = useI18n();
  const update = (patch) => setFilters({ ...filters, ...patch });

  const preferences = [
    { key: 'vegetarian', label: t('filters.vegetarian') },
    { key: 'spicy', label: t('filters.spicy') },
    { key: 'bestsellers', label: t('filters.bestsellers') },
    { key: 'availableOnly', label: t('filters.availableOnly') },
  ];

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title={t('filters.title')}
      side="bottom"
      footer={
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
            {t('filters.reset')}
          </button>
          <button type="button" className="btn-primary flex-1" onClick={onClose}>
            {t('filters.show')}
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="label" htmlFor="filter-sort">{t('search.sort')}</label>
          <select
            id="filter-sort"
            className="field"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value })}
          >
            {sortOptions(t).map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-price">
            {t('filters.maxPrice')} · {filters.maxPrice ? money(filters.maxPrice) : t('filters.any')}
          </label>
          <input
            id="filter-price"
            type="range"
            min={200}
            max={maxPriceCents}
            step={50}
            value={filters.maxPrice ?? maxPriceCents}
            onChange={(event) => update({ maxPrice: Number(event.target.value) })}
            className="w-full accent-brand"
          />
        </div>

        <fieldset className="space-y-3">
          <legend className="label mb-0">{t('filters.preferences')}</legend>
          {preferences.map((option) => (
            <label key={option.key} className="flex cursor-pointer items-center gap-3 text-sm text-ink-soft">
              <input
                type="checkbox"
                className="h-5 w-5 rounded border-line bg-elevate accent-brand"
                checked={Boolean(filters[option.key])}
                onChange={(event) => update({ [option.key]: event.target.checked })}
              />
              {option.label}
            </label>
          ))}
        </fieldset>
      </div>
    </Drawer>
  );
}
