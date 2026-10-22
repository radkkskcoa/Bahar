import { useEffect, useMemo, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Loader2 } from 'lucide-react';
import SearchBar from '../components/SearchBar.jsx';
import SearchFiltersPanel, { DEFAULT_FILTERS, SORT_OPTIONS } from '../components/SearchFiltersPanel.jsx';
import CategoryScroller from '../components/CategoryScroller.jsx';
import ProductGrid from '../components/ProductGrid.jsx';
import ProductDetailsModal from '../components/ProductDetailsModal.jsx';
import { ErrorState, ProductGridSkeleton } from '../components/states.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function MenuPage() {
  const { status, error, reload, categories, menuProducts, categoryBySlug } = useCatalog();
  const { t } = useI18n();
  const [params, setParams] = useSearchParams();

  const [query, setQuery] = useState(params.get('q') ?? '');
  const [categorySlug, setCategorySlug] = useState(params.get('category'));
  const [filters, setFilters] = useState({ ...DEFAULT_FILTERS, sort: params.get('sort') ?? 'recommended' });
  const [filtersOpen, setFiltersOpen] = useState(params.get('filters') === 'open');
  const [openProduct, setOpenProduct] = useState(null);

  // Keep the URL in step with the search state so results are shareable.
  useEffect(() => {
    const next = new URLSearchParams();
    if (query.trim()) next.set('q', query.trim());
    if (categorySlug) next.set('category', categorySlug);
    if (filters.sort !== 'recommended') next.set('sort', filters.sort);
    setParams(next, { replace: true });
  }, [query, categorySlug, filters.sort, setParams]);

  const maxPriceCents = useMemo(
    () => Math.max(200, ...menuProducts.map((product) => product.price_cents)),
    [menuProducts],
  );

  const results = useMemo(() => {
    const needle = query.trim().toLowerCase();
    let list = menuProducts.filter((product) => {
      if (categorySlug && product.category_slug !== categorySlug) return false;
      if (filters.vegetarian && !product.vegetarian) return false;
      if (filters.spicy && !product.spicy) return false;
      if (filters.bestsellers && product.badge !== 'BESTSELLER') return false;
      if (filters.availableOnly && !product.available) return false;
      if (filters.maxPrice && product.price_cents > filters.maxPrice) return false;
      if (!needle) return true;
      const haystack = [
        product.name,
        product.description,
        product.ingredients ?? '',
        categoryBySlug.get(product.category_slug)?.name ?? '',
      ]
        .join(' ')
        .toLowerCase();
      return haystack.includes(needle);
    });

    switch (filters.sort) {
      case 'price-asc':
        list = [...list].sort((a, b) => a.price_cents - b.price_cents);
        break;
      case 'price-desc':
        list = [...list].sort((a, b) => b.price_cents - a.price_cents);
        break;
      case 'popularity':
        list = [...list].sort((a, b) => (b.review_count ?? 0) - (a.review_count ?? 0));
        break;
      case 'new':
        list = [...list].sort((a, b) => Number(b.badge === 'NEW') - Number(a.badge === 'NEW'));
        break;
      default:
        list = [...list].sort((a, b) => {
          const featured = Number(b.featured) - Number(a.featured);
          return featured !== 0 ? featured : (b.rating ?? 0) - (a.rating ?? 0);
        });
    }
    return list;
  }, [menuProducts, categorySlug, filters, query, categoryBySlug]);

  const activeFilterCount = [
    filters.maxPrice !== DEFAULT_FILTERS.maxPrice,
    filters.vegetarian,
    filters.spicy,
    filters.bestsellers,
    !filters.availableOnly,
  ].filter(Boolean).length;

  if (status === 'error') {
    return <div className="container-page py-10"><ErrorState message={error} onRetry={reload} /></div>;
  }

  return (
    <div className="container-page space-y-6 py-6">
      <header className="space-y-2">
        <h1 className="text-3xl font-extrabold sm:text-4xl">Full menu</h1>
        <p className="text-sm text-ink-muted">
          {menuProducts.length} dishes · {categories.length} categories
        </p>
      </header>

      <SearchBar
        value={query}
        onChange={setQuery}
        onOpenFilters={() => setFiltersOpen(true)}
        activeFilterCount={activeFilterCount}
      />

      <CategoryScroller
        categories={categories.filter((category) => category.slug !== 'bundles')}
        activeSlug={categorySlug}
        onSelect={setCategorySlug}
      />

      <div className="flex flex-wrap items-center justify-between gap-3">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {status === 'loading' ? <Loader2 className="inline h-4 w-4 animate-spin" aria-hidden="true" /> : `${results.length} results`}
        </p>
        <label className="flex items-center gap-2 text-xs text-ink-muted">
          {t('search.sort')}
          <select
            className="field w-auto py-2 text-xs"
            value={filters.sort}
            onChange={(event) => setFilters({ ...filters, sort: event.target.value })}
          >
            {SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>{option.label}</option>
            ))}
          </select>
        </label>
      </div>

      {status === 'loading' ? (
        <ProductGridSkeleton />
      ) : (
        <ProductGrid
          products={results}
          onOpen={setOpenProduct}
          emptyTitle={t('search.empty')}
          emptyBody="Try another search term, or clear the filters to see the whole menu."
        />
      )}

      <SearchFiltersPanel
        open={filtersOpen}
        onClose={() => setFiltersOpen(false)}
        filters={filters}
        setFilters={setFilters}
        maxPriceCents={maxPriceCents}
      />

      <ProductDetailsModal product={openProduct} open={Boolean(openProduct)} onClose={() => setOpenProduct(null)} />
    </div>
  );
}
