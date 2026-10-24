import { useState } from 'react'
import HeroSection from '../components/HeroSection'
import SearchBar from '../components/SearchBar'
import CategoryScroller from '../components/CategoryScroller'
import SignatureDishes from '../components/SignatureDishes'
import FamilyBundles from '../components/FamilyBundles'
import ChefSpecials from '../components/ChefSpecials'
import PromoBanner from '../components/PromoBanner'
import OrderTracker from '../components/OrderTracker'
import LoyaltyCard from '../components/LoyaltyCard'
import { useScrollReveal } from '../hooks/useHooks'
import { getProductsByCategory } from '../data/menu'
import ProductCard from '../components/ProductCard'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'

export default function Home({ onAdd, onOpen, favs, onToggleFav }) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState('fried-chicken')
  const { showToast } = useToast()
  const navigate = useNavigate()
  useScrollReveal([])

  const filtered = search
    ? getProductsByCategory('all').filter((p) =>
        p.name.toLowerCase().includes(search.toLowerCase()) ||
        p.description.toLowerCase().includes(search.toLowerCase()) ||
        p.category.toLowerCase().includes(search.toLowerCase())
      )
    : getProductsByCategory(category)

  return (
    <>
      <HeroSection />

      <div className="container" style={{ marginTop: '-24px', position: 'relative', zIndex: 5 }}>
        <SearchBar value={search} onChange={setSearch} onFilter={() => showToast('Filters coming soon!', 'info')} />
      </div>

      <div className="container" style={{ marginTop: '16px' }}>
        <CategoryScroller selected={search ? null : category} onSelect={setCategory} />
      </div>

      {/* Search results or category browse */}
      <section className="container reveal" style={{ marginTop: '16px' }}>
        <div className="section-header">
          <div className="section-header-left">
            <h2 className="section-title">{search ? `Results for "${search}"` : 'Browse Category'}</h2>
          </div>
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
      </section>

      <div className="spacer-h" />
      <SignatureDishes onAdd={onAdd} onOpen={onOpen} favs={favs} onToggleFav={onToggleFav} />
      <div className="spacer-h" />
      <FamilyBundles onAdd={onAdd} />
      <div className="spacer-h" />
      <ChefSpecials onAdd={onAdd} onOpen={onOpen} />
      <div className="spacer-h" />
      <PromoBanner />
      <div className="spacer-h" />
      <OrderTracker />
      <div className="spacer-h" />
      <LoyaltyCard />
    </>
  )
}
