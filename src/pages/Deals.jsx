import { promotions, bundles, chefSpecials } from '../data/menu'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { Tag, Info, ArrowRight } from '../components/Icons'

export default function Deals({ onAdd }) {
  const { showToast } = useToast()
  const navigate = useNavigate()

  return (
    <div className="container" style={{ paddingTop: '16px' }}>
      <h1 className="section-title" style={{ marginBottom: '8px' }}>Deals & Offers</h1>
      <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginBottom: '24px' }}>
        Save big on your favorite Crunch House meals.
      </p>

      {/* Active promotions */}
      <div className="deals-grid">
        {promotions.filter((p) => p.active).map((promo) => (
          <div key={promo.id} className="deal-card">
            <img className="deal-card-img" src={promo.image} alt={promo.title} loading="lazy" />
            <div className="deal-card-body">
              <h3 className="deal-card-title">{promo.title}</h3>
              <p className="deal-card-desc">{promo.description}</p>
              <div className="deal-card-eligibility">
                <Info size={14} /> Valid {promo.startDate} – {promo.endDate} · Min order $10
              </div>
              {promo.code && <span className="deal-card-code">CODE: {promo.code}</span>}
              <button className="btn btn-primary" style={{ marginTop: '12px', width: '100%' }} onClick={() => navigate('/menu')}>
                {promo.cta} <ArrowRight size={16} />
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="spacer-h" />
      <h2 className="section-title" style={{ marginBottom: '16px' }}>Family Bundle Deals</h2>
      <div className="deals-grid">
        {bundles.map((b) => {
          const savings = b.originalPrice ? (b.originalPrice - b.price).toFixed(2) : null
          return (
            <div key={b.id} className="deal-card" onClick={() => onAdd(b)} role="button" tabIndex={0}>
              <img className="deal-card-img" src={b.image} alt={b.name} loading="lazy" />
              <div className="deal-card-body">
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <h3 className="deal-card-title">{b.name}</h3>
                  {savings && <span className="badge badge-saving">Save ${savings}</span>}
                </div>
                <p className="deal-card-desc">{b.summary}</p>
                <div className="deal-card-eligibility"><Tag size={14} /> Bundle deal · No code needed</div>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                  <div>
                    <span style={{ fontSize: '1.4rem', fontWeight: 800, color: 'var(--orange)' }}>${b.price.toFixed(2)}</span>
                    {b.originalPrice && <span style={{ marginLeft: '8px', fontSize: '0.9rem', color: 'var(--text-muted)', textDecoration: 'line-through' }}>${b.originalPrice.toFixed(2)}</span>}
                  </div>
                  <button className="add-btn"><ArrowRight size={20} /></button>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      <div className="spacer-h" />
      <h2 className="section-title" style={{ marginBottom: '16px' }}>Chef Specials</h2>
      <div className="deals-grid">
        {chefSpecials.map((item) => (
          <div key={item.id} className="deal-card" onClick={() => onAdd(item)} role="button" tabIndex={0}>
            <img className="deal-card-img" src={item.image} alt={item.name} loading="lazy" />
            <div className="deal-card-body">
              <h3 className="deal-card-title">{item.name}</h3>
              <p className="deal-card-desc">{item.description}</p>
              {item.limitedTime && <div className="deal-card-eligibility" style={{ color: 'var(--orange)' }}><Info size={14} /> Limited time only</div>}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '12px' }}>
                <span style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--orange)' }}>${item.price.toFixed(2)}</span>
                <button className="add-btn"><ArrowRight size={20} /></button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
