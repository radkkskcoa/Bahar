import { Star, ChevronRight } from './Icons'
import ProductCard from './ProductCard'
import { getSignatureDishes } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function SignatureDishes({ onAdd, onOpen, favs, onToggleFav }) {
  const navigate = useNavigate()
  const dishes = getSignatureDishes()

  return (
    <section className="container reveal">
      <div className="section-header">
        <div className="section-header-left">
          <span className="section-header-icon"><Star size={22} fill="currentColor" /></span>
          <div>
            <h2 className="section-title">Signature Dishes</h2>
            <p className="section-header-sub">Our most-loved Crunch House classics</p>
          </div>
        </div>
        <button className="view-all" onClick={() => navigate('/menu')}>
          View all <ChevronRight size={16} />
        </button>
      </div>
      <div className="product-grid">
        {dishes.map((p) => (
          <ProductCard key={p.id} product={p} onAdd={onAdd} onOpen={onOpen}
            isFav={favs.has(p.id)} onToggleFav={onToggleFav} />
        ))}
      </div>
    </section>
  )
}
