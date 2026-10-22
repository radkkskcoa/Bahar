import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { catalog as catalogApi } from '../lib/api.js';

const CatalogContext = createContext(null);

const EMPTY = {
  categories: [],
  products: [],
  promotions: [],
  rewards: [],
  settings: {},
  favorites: [],
};

export function CatalogProvider({ children }) {
  const [data, setData] = useState(EMPTY);
  const [status, setStatus] = useState('loading'); // loading | ready | error
  const [error, setError] = useState(null);

  const load = useCallback(async () => {
    try {
      const payload = await catalogApi.load();
      setData(payload);
      setStatus('ready');
      setError(null);
    } catch (err) {
      setError(err.message);
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const value = useMemo(() => {
    const bySlug = new Map(data.products.map((p) => [p.slug, p]));
    const byId = new Map(data.products.map((p) => [p.id, p]));
    const categoryBySlug = new Map(data.categories.map((c) => [c.slug, c]));
    const activePromo = (slug) => data.promotions.find((p) => p.slug === slug) ?? null;

    const setFavorites = (updater) =>
      setData((current) => ({
        ...current,
        favorites: typeof updater === 'function' ? updater(current.favorites) : updater,
      }));

    return {
      ...data,
      status,
      error,
      reload: load,
      bySlug,
      byId,
      categoryBySlug,
      activePromo,
      setFavorites,
      bundleProducts: data.products.filter((p) => p.is_bundle),
      menuProducts: data.products.filter((p) => !p.is_bundle),
      featuredProducts: data.products.filter((p) => p.featured),
      currency: data.settings.currency ?? { code: 'USD', symbol: '$' },
      delivery: data.settings.delivery ?? {},
      brand: data.settings.brand ?? { name: 'Crunch House' },
      contact: data.settings.contact ?? {},
    };
  }, [data, status, error, load]);

  return <CatalogContext.Provider value={value}>{children}</CatalogContext.Provider>;
}

export function useCatalog() {
  const ctx = useContext(CatalogContext);
  if (!ctx) throw new Error('useCatalog must be used inside CatalogProvider');
  return ctx;
}
