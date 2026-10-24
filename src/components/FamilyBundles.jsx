import { Users, ChevronRight, ArrowRight } from './Icons'
import { bundles } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function FamilyBundles({ onAdd }) {
  const navigate = useNavigate()

  return (
    <section className="container reveal">
      <div className="section-header">
        <div className="section-header-left">
          <span className="section-header-icon"><Users size={22} /></span>
          <div>
            <h2 className="section-title">Family Bundles</h2>
            <p className="section-header-sub">Perfect for sharing!</p>
          </div>
        </div>
        <button className="view-all" onClick={() => navigate('/menu')}>
          View all <ChevronRight size={16} />
        </button>
      </div>
      <div className="bundle-grid">
        {bundles.map((b) => {
          const savings = b.originalPrice ? (b.originalPrice - b.price).toFixed(2) : null
          return (
            <div key={b.id} className="bundle-card" onClick={() => onAdd(b)} role="button" tabIndex={0}>
              <div className="bundle-card-img">
                <img src={b.image} alt={b.name} loading="lazy" />
                {savings && <span className="badge badge-saving bundle-card-saving">Save ${savings}</span>}
              </div>
              <div className="bundle-card-body">
                <div className="bundle-card-info">
                  <h3 className="bundle-card-name">{b.name}</h3>
                  <p className="bundle-card-summary">{b.summary}</p>
                  <div className="bundle-card-price-row">
                    <span className="bundle-card-price">${b.price.toFixed(2)}</span>
                    {b.originalPrice && <span className="bundle-card-original">${b.originalPrice.toFixed(2)}</span>}
                  </div>
                </div>
                <button className="bundle-arrow" aria-label={`Add ${b.name}`}>
                  <ArrowRight size={20} />
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </section>
  )
}
