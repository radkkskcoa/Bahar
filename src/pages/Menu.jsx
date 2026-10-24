import { useState, useMemo } from 'react'
import SearchBar from '../components/SearchBar'
import CategoryScroller from '../components/CategoryScroller'
import ProductCard from '../components/ProductCard'
import { products, categories } from '../data/menu'
import { useToast } from '../context/ToastContext'

const sortOptions = [
  { id: 'recommended', label: 'Recommended' },
  { id: 'popular', label: 'Popularity' },
  { id: 'price-low', label: 'Price: Low to High' },
  { id: 'price-high', label: 'Price: High to Low' },
]

export default function Menu({ onAdd, onOpen, favs, onToggleFav }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('all')
  const [sort, setSort] = useState('recommended')
  const { showToast } = useToast()

  const filtered = useMemo(() => {
    let list = products
    if (category !== 'all') list = list.filter((p) => p.category === category)
    if (search) {
      const q = search.toLowerCase()
      list = list.filter((p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
      )
    }
    switch (sort) {
      case 'price-low': return [...list].sort((a, b) => a.price - b.price)
      case 'price-high': return [...list].sort((a, b) => b.price - a.price)
      case 'popular': return [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
      default: return list
    }
  }, [search, category, sort])

  return (
    <div className="container" style={{ paddingTop: '16px' }}>
      <h1 className="section-title" style={{ marginBottom: '16px' }}>Full Menu</h1>
      <SearchBar value={search} onChange={setSearch} onFilter={() => showToast('Filters coming soon!', 'info')} />

      <div style={{ marginTop: '16px', overflowX: 'auto' }}>
        <div style={{ display: 'flex', gap: '8px', minWidth: 'min-content' }}>
          <button
            className={`cat-tile ${category === 'all' ? 'active' : ''}`}
            style={{ width: 'auto', padding: '10px 16px', flexDirection: 'row', gap: '6px' }}
            onClick={() => setCategory('all')}
          >
            <span className="cat-icon" style={{ fontSize: '1.2rem' }}>🍽️</span>
            <span className="cat-label">All</span>
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`cat-tile ${category === cat.id ? 'active' : ''}`}
              style={{ width: 'auto', padding: '10px 16px', flexDirection: 'row', gap: '6px' }}
              onClick={() => setCategory(cat.id)}
            >
              <span className="cat-icon" style={{ fontSize: '1.2rem' }}>{cat.icon}</span>
              <span className="cat-label">{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginTop: '16px', marginBottom: '16px' }}>
        <label style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Sort:</label>
        <select className="form-select" style={{ width: 'auto' }} value={sort} onChange={(e) => setSort(e.target.value)}>
          {sortOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <span style={{ marginLeft: 'auto', fontSize: '0.85rem', color: 'var(--text-muted)' }}>{filtered.length} items</span>
      </div>

      {filtered.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔍</span>
          <p className="empty-state-title">No items found</p>
          <p>Try a different search or category.</p>
        </div>
      ) : (
        <div className="product-grid">
          {filtered.map((p) => (
            <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpen}
              isFav={favs.has(p.id)} onToggleFav={onToggleFav} />
          ))}
        </div>
      )}
    </div>
  )
}
