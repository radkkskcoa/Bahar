import { useNavigate } from 'react-router-dom'
import { ArrowRight, Check } from './Icons'
import { HERO_IMAGE } from '../data/menu'

export default function HeroSection() {
  const navigate = useNavigate()

  return (
    <section className="hero">
      <div className="hero-bg">
        <img src={HERO_IMAGE} alt="Chef preparing crispy fried chicken in a professional kitchen" loading="eager" />
      </div>
      <div className="hero-overlay" />
      <div className="hero-content">
        <div className="hero-badge animate-slide-up">
          <span style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--lime)', display: 'inline-block' }} />
          Now delivering in your area
        </div>
        <h1 className="hero-title animate-slide-up" style={{ animationDelay: '60ms' }}>
          Crispy Flavor,<br /><span className="accent">Delivered Fast</span>
        </h1>
        <p className="hero-subtitle animate-slide-up" style={{ animationDelay: '120ms' }}>
          Hot, crunchy & made fresh for you.
        </p>
        <div className="hero-cta animate-slide-up" style={{ animationDelay: '180ms' }}>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>
            Order Now <ArrowRight size={18} />
          </button>
          <button className="btn btn-outline" onClick={() => navigate('/menu')}>
            Explore Menu
          </button>
        </div>
        <div className="hero-trust animate-slide-up" style={{ animationDelay: '240ms' }}>
          <div className="hero-trust-item">
            <span className="hero-trust-icon"><Check size={18} /></span>
            Freshly prepared
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-icon"><Check size={18} /></span>
            Fast delivery
          </div>
          <div className="hero-trust-item">
            <span className="hero-trust-icon"><Check size={18} /></span>
            Quality ingredients
          </div>
        </div>
      </div>
    </section>
  )
}
