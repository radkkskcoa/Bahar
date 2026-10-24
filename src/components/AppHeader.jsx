import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { Menu as MenuIcon, Bell, Cart as CartIcon, ChevronDown, MapPin, User, X } from './Icons'
import { useCart } from '../context/CartContext'
import { businessSettings } from '../data/menu'

export default function AppHeader({ onOpenDrawer }) {
  const { count, setIsCartOpen, cartBump } = useCart()
  const navigate = useNavigate()
  const location = useLocation()
  const [showAddress, setShowAddress] = useState(false)

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/menu', label: 'Menu' },
    { to: '/deals', label: 'Deals' },
    { to: '/rewards', label: 'Rewards' },
    { to: '/about', label: 'About Us' },
  ]

  const isActive = (path) => location.pathname === path

  return (
    <header className="header">
      <div className="header-inner">
        <button className="icon-btn menu-btn" onClick={onOpenDrawer} aria-label="Open menu">
          <MenuIcon size={22} />
        </button>

        <div className="brand" onClick={() => navigate('/')}>
          <div className="brand-mark">CH</div>
          <span className="brand-text">{businessSettings.name}</span>
        </div>

        <div className="delivery-selector" onClick={() => setShowAddress(!showAddress)}>
          <MapPin size={16} style={{ color: 'var(--orange)' }} />
          <span>Deliver to <strong>Home</strong></span>
          <ChevronDown size={14} />
        </div>

        <nav className="nav-desktop">
          {navLinks.map((l) => (
            <Link key={l.to} to={l.to} className={isActive(l.to) ? 'active' : ''}>{l.label}</Link>
          ))}
        </nav>

        <div className="header-actions">
          <button className="icon-btn" aria-label="Notifications" onClick={() => navigate('/notifications')}>
            <Bell size={20} />
            <span className="icon-badge">2</span>
          </button>
          <button className="icon-btn" aria-label="Shopping cart" onClick={() => setIsCartOpen(true)}>
            <CartIcon size={20} />
            {count > 0 && <span className={`icon-badge ${cartBump ? 'bump' : ''}`}>{count}</span>}
          </button>
          <button className="icon-btn" aria-label="Profile" onClick={() => navigate('/profile')}>
            <User size={20} />
          </button>
        </div>
      </div>

      {showAddress && (
        <div className="drawer-overlay" onClick={() => setShowAddress(false)}>
          <div style={{ position: 'absolute', top: '64px', left: '50%', transform: 'translateX(-50%)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', borderRadius: 'var(--r-md)', padding: '16px', width: '320px', maxWidth: '90vw', animation: 'slideUp 200ms ease' }} onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
              <strong>Delivery Address</strong>
              <button className="icon-btn" onClick={() => setShowAddress(false)} style={{ width: 28, height: 28 }}><X size={16} /></button>
            </div>
            <div style={{ padding: '10px', borderRadius: 'var(--r-sm)', background: 'var(--orange-dim)', border: '1px solid var(--orange)', fontSize: '0.85rem' }}>
              <strong>Home</strong> — {businessSettings.address}
            </div>
            <button className="btn btn-ghost" style={{ width: '100%', marginTop: '12px' }}>Add new address</button>
          </div>
        </div>
      )}
    </header>
  )
}
