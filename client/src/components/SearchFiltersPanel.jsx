import Drawer from './Drawer.jsx';
import { useMoney } from '../lib/money.js';

export const SORT_OPTIONS = [
  { value: 'recommended', label: 'Recommended' },
  { value: 'popularity', label: 'Popularity' },
  { value: 'price-asc', label: 'Price: low to high' },
  { value: 'price-desc', label: 'Price: high to low' },
  { value: 'new', label: 'New arrivals' },
];

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
  const update = (patch) => setFilters({ ...filters, ...patch });

  return (
    <Drawer
      open={open}
      onClose={onClose}
      title="Filters & sorting"
      side="bottom"
      footer={
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1" onClick={() => setFilters({ ...DEFAULT_FILTERS })}>
            Reset
          </button>
          <button type="button" className="btn-primary flex-1" onClick={onClose}>
            Show results
          </button>
        </div>
      }
    >
      <div className="space-y-6">
        <div>
          <label className="label" htmlFor="filter-sort">Sort by</label>
          <select
            id="filter-sort"
            className="field"
            value={filters.sort}
            onChange={(event) => update({ sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </div>

        <div>
          <label className="label" htmlFor="filter-price">
            Max price {filters.maxPrice ? `· ${money(filters.maxPrice)}` : '· any'}
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
          <legend className="label mb-0">Preferences</legend>
          {[
            { key: 'vegetarian', label: 'Vegetarian options' },
            { key: 'spicy', label: 'Spicy food' },
            { key: 'bestsellers', label: 'Best sellers only' },
            { key: 'availableOnly', label: 'Available now' },
          ].map((option) => (
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
