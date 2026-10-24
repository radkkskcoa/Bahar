import { useState } from 'react'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { loyaltyData } from '../data/menu'
import { Award, Gift, Package, Heart, User, ArrowRight } from '../components/Icons'

export default function Profile({ favs, onToggleFav, getProductById }) {
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [signedIn, setSignedIn] = useState(false)
  const [form, setForm] = useState({ name: '', email: '' })

  const favList = [...favs].map((id) => getProductById(id)).filter(Boolean)

  if (!signedIn) {
    return (
      <div className="container" style={{ paddingTop: '24px', maxWidth: 480 }}>
        <h1 className="section-title" style={{ marginBottom: '20px', textAlign: 'center' }}>Sign In</h1>
        <div className="card" style={{ padding: 24 }}>
          <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: '0.9rem' }}>
            Sign in to save addresses, track orders, earn rewards, and check out faster.
          </p>
          <div className="form-group">
            <label className="form-label">Name</label>
            <input className="form-input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="John Doe" />
          </div>
          <div className="form-group">
            <label className="form-label">Email</label>
            <input className="form-input" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="john@example.com" />
          </div>
          <button className="btn btn-primary" style={{ width: '100%', marginTop: 8 }}
            onClick={() => {
              if (!form.name.trim() || !form.email.trim()) { showToast('Please enter your name and email', 'error'); return }
              setSignedIn(true); showToast('Signed in successfully!')
            }}>
            Sign In
          </button>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: 12, textAlign: 'center' }}>
            This is a demo sign-in. No real authentication is performed.
          </p>
        </div>
      </div>
    )
  }

  const menuItems = [
    { icon: Package, label: 'Order History', desc: 'View your past orders', action: () => navigate('/track') },
    { icon: Heart, label: 'Favorites', desc: `${favList.length} saved items`, action: () => showToast(`${favList.length} favorite items`, 'info') },
    { icon: Gift, label: 'Crunch Rewards', desc: `${loyaltyData.points.toLocaleString()} points`, action: () => navigate('/rewards') },
    { icon: Award, label: 'Achievements', desc: 'Coming soon', action: () => showToast('Coming soon!', 'info') },
  ]

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: 600 }}>
      <div className="profile-card">
        <div className="profile-header">
          <div className="profile-avatar">{form.name.charAt(0).toUpperCase()}</div>
          <div>
            <div className="profile-name">{form.name}</div>
            <div className="profile-email">{form.email}</div>
          </div>
          <button className="btn btn-ghost" style={{ marginLeft: 'auto', padding: '6px 16px', fontSize: '0.8rem' }}
            onClick={() => { setSignedIn(false); showToast('Signed out') }}>Sign Out</button>
        </div>
      </div>

      <div className="loyalty-card" style={{ marginBottom: 16 }}>
        <div className="loyalty-header">
          <span className="loyalty-title"><Award size={20} style={{ color: 'var(--lime)' }} /> Crunch Rewards</span>
        </div>
        <div className="loyalty-points">{loyaltyData.points.toLocaleString()}</div>
        <div className="loyalty-points-label">Your Points</div>
        <div className="loyalty-progress">
          <div className="loyalty-progress-fill" style={{ width: `${Math.min(100, (loyaltyData.points / loyaltyData.nextRewardPoints) * 100)}%` }} />
        </div>
        <div className="loyalty-next">Next Reward: {loyaltyData.nextRewardPoints.toLocaleString()} pts</div>
      </div>

      {menuItems.map((item) => {
        const Icon = item.icon
        return (
          <div key={item.label} className="profile-card" style={{ display: 'flex', alignItems: 'center', gap: 16, cursor: 'pointer' }} onClick={item.action}>
            <div style={{ width: 44, height: 44, borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--orange)' }}>
              <Icon size={20} />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 700 }}>{item.label}</div>
              <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{item.desc}</div>
            </div>
            <ArrowRight size={18} style={{ color: 'var(--text-muted)' }} />
          </div>
        )
      })}

      {favList.length > 0 && (
        <>
          <h3 style={{ fontWeight: 800, margin: '24px 0 12px' }}>Your Favorites</h3>
          <div className="product-grid">
            {favList.map((p) => (
              <div key={p.id} className="product-card" onClick={() => showToast(`Opening ${p.name}...`, 'info')}>
                <div className="product-card-img-wrap">
                  <img className="product-card-img" src={p.image} alt={p.name} loading="lazy" />
                </div>
                <div className="product-card-body">
                  <h3 className="product-card-name">{p.name}</h3>
                  <div className="product-card-price"><span className="price">${p.price.toFixed(2)}</span></div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  )
}
