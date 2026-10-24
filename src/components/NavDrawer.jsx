import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MenuBook, Tag, Award, Info, User, Phone, Clock, X } from './Icons'
import { businessSettings } from '../data/menu'

export default function NavDrawer({ open, onClose }) {
  const location = useLocation()
  const navigate = useNavigate()

  if (!open) return null

  const links = [
    { to: '/', label: 'Home', icon: Home },
    { to: '/menu', label: 'Menu', icon: MenuBook },
    { to: '/deals', label: 'Deals & Offers', icon: Tag },
    { to: '/rewards', label: 'Crunch Rewards', icon: Award },
    { to: '/about', label: 'About Us', icon: Info },
    { to: '/track', label: 'Track Order', icon: Clock },
    { to: '/profile', label: 'My Profile', icon: User },
  ]

  const handleNav = (to) => { onClose(); navigate(to) }

  return (
    <>
      <div className="drawer-overlay" onClick={onClose} />
      <aside className="drawer" role="dialog" aria-label="Navigation menu">
        <div className="drawer-header">
          <div className="brand" onClick={() => handleNav('/')}>
            <div className="brand-mark">CH</div>
            <span className="brand-text">{businessSettings.name}</span>
          </div>
          <button className="icon-btn" style={{ position: 'absolute', top: 20, right: 16 }} onClick={onClose} aria-label="Close menu">
            <X size={20} />
          </button>
        </div>
        <nav className="drawer-nav">
          {links.map((l) => {
            const Icon = l.icon
            return (
              <button key={l.to} className={location.pathname === l.to ? 'active' : ''} onClick={() => handleNav(l.to)}
                style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', borderRadius: 'var(--r-md)', fontWeight: 600, color: location.pathname === l.to ? 'var(--orange)' : 'var(--text-secondary)', background: location.pathname === l.to ? 'var(--bg-elevated)' : 'none', width: '100%', textAlign: 'left', transition: 'all var(--t-fast)' }}>
                <Icon size={20} />
                {l.label}
              </button>
            )
          })}
        </nav>
        <div className="drawer-footer">
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 8 }}>
            <Phone size={16} /> {businessSettings.phone}
          </div>
          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{businessSettings.hours}</div>
        </div>
      </aside>
    </>
  )
}
