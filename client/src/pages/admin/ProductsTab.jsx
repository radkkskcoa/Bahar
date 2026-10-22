import { useEffect, useState } from 'react';
import { Archive, Plus, Save } from 'lucide-react';
import { ErrorState, LoadingSkeleton } from '../../components/states.jsx';
import { admin } from '../../lib/api.js';
import { useCatalog } from '../../context/CatalogContext.jsx';
import { useToast } from '../../context/ToastContext.jsx';
import { useMoney } from '../../lib/money.js';

const EMPTY_NEW = {
  name: '', price: '', category_id: '', description: '', image_url: '', badge: '', available: true, featured: false,
};

export default function ProductsTab() {
  const { categories, products: catalogProducts, status: catalogStatus, reload, currency } = useCatalog();
  const { toast } = useToast();
  const money = useMoney();
  const [products, setProducts] = useState([]);
  const [draft, setDraft] = useState(EMPTY_NEW);
  const [savingId, setSavingId] = useState(null);

  // The dashboard edits the same catalog rows the storefront reads.
  useEffect(() => {
    if (catalogStatus === 'ready') setProducts(catalogProducts);
  }, [catalogProducts, catalogStatus]);

  const update = (id, patch) => {
    setProducts((current) => current.map((product) => (product.id === id ? { ...product, ...patch } : product)));
  };

  const save = async (product) => {
    setSavingId(product.id);
    try {
      await admin.updateProduct(product.id, {
        name: product.name,
        description: product.description,
        price_cents: product.price_cents,
        available: product.available,
        badge: product.badge || '',
        featured: product.featured,
      });
      toast({ title: `${product.name} updated`, tone: 'success' });
      await reload();
    } catch (err) {
      toast({ title: 'Could not save the product', body: err.message, tone: 'error' });
    } finally {
      setSavingId(null);
    }
  };

  const create = async (event) => {
    event.preventDefault();
    try {
      const created = await admin.createProduct({
        name: draft.name,
        description: draft.description,
        category_id: Number(draft.category_id || categories[0]?.id),
        price_cents: Math.round(Number(draft.price) * 100),
        image_url: draft.image_url,
        badge: draft.badge || null,
        available: draft.available,
        featured: draft.featured,
      });
      setProducts((current) => [...current, created]);
      setDraft(EMPTY_NEW);
      toast({ title: `${created.name} created`, tone: 'success' });
      await reload();
    } catch (err) {
      toast({ title: 'Could not create the product', body: err.message, tone: 'error' });
    }
  };

  const remove = async (product) => {
    try {
      const result = await admin.deleteProduct(product.id);
      if (result.deleted) {
        setProducts((current) => current.filter((entry) => entry.id !== product.id));
        toast({ title: `${product.name} deleted`, tone: 'info' });
      } else {
        update(product.id, { available: false });
        toast({ title: `${product.name} archived`, body: 'It stays in past orders but is hidden from the menu.', tone: 'info' });
      }
      await reload();
    } catch (err) {
      toast({ title: 'Could not remove the product', body: err.message, tone: 'error' });
    }
  };

  if (catalogStatus === 'error') return <ErrorState message="We could not load the catalog." onRetry={reload} />;

  return (
    <div className="space-y-6">
      <form className="card space-y-4 p-5" onSubmit={create}>
        <h2 className="text-lg font-bold">Add a product</h2>
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          <div>
            <label className="label" htmlFor="np-name">Name</label>
            <input id="np-name" className="field" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="np-price">Price ({currency.code})</label>
            <input id="np-price" type="number" step="0.01" min="0" className="field" value={draft.price} onChange={(e) => setDraft({ ...draft, price: e.target.value })} required />
          </div>
          <div>
            <label className="label" htmlFor="np-category">Category</label>
            <select id="np-category" className="field" value={draft.category_id} onChange={(e) => setDraft({ ...draft, category_id: e.target.value })}>
              {categories.map((category) => <option key={category.id} value={category.id}>{category.name}</option>)}
            </select>
          </div>
          <div className="sm:col-span-2">
            <label className="label" htmlFor="np-image">Image URL</label>
            <input id="np-image" className="field" value={draft.image_url} onChange={(e) => setDraft({ ...draft, image_url: e.target.value })} placeholder="https://…" />
          </div>
          <div>
            <label className="label" htmlFor="np-badge">Badge</label>
            <input id="np-badge" className="field" value={draft.badge} onChange={(e) => setDraft({ ...draft, badge: e.target.value })} placeholder="NEW" />
          </div>
          <div className="sm:col-span-2 lg:col-span-3">
            <label className="label" htmlFor="np-description">Description</label>
            <input id="np-description" className="field" value={draft.description} onChange={(e) => setDraft({ ...draft, description: e.target.value })} />
          </div>
        </div>
        <button type="submit" className="btn-primary">
          <Plus className="h-4 w-4" aria-hidden="true" />
          Create product
        </button>
      </form>

      {catalogStatus === 'loading' ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => <LoadingSkeleton key={index} className="h-16 w-full" />)}
        </div>
      ) : (
        <div className="space-y-3">
          {products.map((product) => (
            <div key={product.id} className="card grid gap-3 p-4 lg:grid-cols-[2fr_1fr_1fr_auto] lg:items-end">
              <div>
                <label className="label" htmlFor={`name-${product.id}`}>Name</label>
                <input id={`name-${product.id}`} className="field" value={product.name} onChange={(e) => update(product.id, { name: e.target.value })} />
                <p className="mt-1 text-[11px] text-ink-muted">
                  {product.slug} · {money(product.price_cents)}
                </p>
              </div>
              <div>
                <label className="label" htmlFor={`price-${product.id}`}>Price ({currency.code})</label>
                <input
                  id={`price-${product.id}`}
                  type="number"
                  step="0.01"
                  min="0"
                  className="field"
                  value={(product.price_cents / 100).toFixed(2)}
                  onChange={(e) => update(product.id, { price_cents: Math.round(Number(e.target.value) * 100) })}
                />
              </div>
              <div>
                <label className="label" htmlFor={`badge-${product.id}`}>Badge</label>
                <input id={`badge-${product.id}`} className="field" value={product.badge ?? ''} onChange={(e) => update(product.id, { badge: e.target.value })} />
              </div>
              <div className="flex flex-wrap items-center gap-2 lg:justify-end">
                <label className="chip cursor-pointer">
                  <input
                    type="checkbox"
                    className="h-4 w-4 accent-brand"
                    checked={product.available}
                    onChange={(e) => update(product.id, { available: e.target.checked })}
                  />
                  Available
                </label>
                <button type="button" className="btn-sm btn-primary" disabled={savingId === product.id} onClick={() => save(product)}>
                  <Save className="h-3.5 w-3.5" aria-hidden="true" />
                  Save
                </button>
                <button type="button" className="btn-sm btn-ghost hover:border-danger/60 hover:text-danger" onClick={() => remove(product)}>
                  <Archive className="h-3.5 w-3.5" aria-hidden="true" />
                  Archive
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
