import { ArrowRight } from './Icons'
import { promotions } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function PromoBanner() {
  const navigate = useNavigate()
  const active = promotions.filter((p) => p.active)

  if (active.length === 0) return null

  const main = active[0]
  const side = active.find((p) => p.id !== main.id) || {
    title: 'CHEF SPECIALS',
    subtitle: 'Made with ❤️ by our chefs',
    description: '',
    cta: 'Order Now',
    bg: 'dark',
    image: main.image,
  }

  return (
    <section className="container reveal">
      <div className="section-header">
        <div className="section-header-left">
          <span className="section-header-icon"><ArrowRight size={22} /></span>
          <div>
            <h2 className="section-title">Promotions</h2>
            <p className="section-header-sub">Limited-time offers</p>
          </div>
        </div>
      </div>
      <div className="promo-row">
        <div className={`promo-banner ${main.bg === 'orange' ? 'orange' : 'dark'}`}>
          <div className="promo-banner-content">
            <h3 className="promo-banner-title" style={{ color: main.bg === 'orange' ? '#fff' : 'var(--text-primary)' }}>{main.title}</h3>
            <p className="promo-banner-sub" style={{ color: main.bg === 'orange' ? 'rgba(255,255,255,0.9)' : 'var(--text-secondary)' }}>{main.subtitle}</p>
            {main.code && <div className="promo-code" style={{ color: main.bg === 'orange' ? 'rgba(255,255,255,0.85)' : 'var(--lime)' }}>Code: {main.code}</div>}
            <button className={`btn ${main.bg === 'orange' ? 'btn-lime' : 'btn-primary'}`} onClick={() => navigate('/deals')}>
              {main.cta}
            </button>
          </div>
          <div className="promo-banner-img">
            <img src={main.image} alt={main.title} loading="lazy" />
          </div>
          <div className="promo-banner-overlay" />
        </div>

        <div className="promo-banner dark">
          <div className="promo-banner-content">
            <span className="badge badge-bestseller" style={{ marginBottom: 8 }}>{side.title === 'CHEF SPECIALS' ? 'CHEF SPECIAL' : 'SPECIAL OFFER'}</span>
            <h3 className="promo-banner-title">{side.title}</h3>
            <p className="promo-banner-sub" style={{ color: 'var(--text-secondary)' }}>{side.subtitle}</p>
            <button className="btn btn-ghost" onClick={() => navigate('/menu')}>
              {side.cta || 'Order Now'}
            </button>
          </div>
          <div className="promo-banner-img">
            <img src={side.image} alt={side.title} loading="lazy" />
          </div>
          <div className="promo-banner-overlay" />
        </div>
      </div>
    </section>
  )
}
