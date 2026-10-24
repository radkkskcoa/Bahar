import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Home, MenuBook, Tag, User, Cart } from './Icons'
import { useCart } from '../context/CartContext'

export default function MobileBottomNav() {
  const location = useLocation()
  const navigate = useNavigate()
  const { count, setIsCartOpen } = useCart()

  const isActive = (path) => location.pathname === path

  return (
    <nav className="bottom-nav" aria-label="Bottom navigation">
      <Link to="/" className={`bottom-nav-item ${isActive('/') ? 'active' : ''}`}>
        <Home size={22} />
        <span>Home</span>
      </Link>
      <Link to="/menu" className={`bottom-nav-item ${isActive('/menu') ? 'active' : ''}`}>
        <MenuBook size={22} />
        <span>Menu</span>
      </Link>
      <button className="bottom-nav-order" onClick={() => setIsCartOpen(true)} aria-label={`Order — ${count} items in cart`}>
        <Cart size={26} />
        {count > 0 && <span className="icon-badge" style={{ top: -4, right: -4, border: '2px solid var(--bg-primary)' }}>{count}</span>}
      </button>
      <Link to="/deals" className={`bottom-nav-item ${isActive('/deals') ? 'active' : ''}`}>
        <Tag size={22} />
        <span>Deals</span>
      </Link>
      <Link to="/profile" className={`bottom-nav-item ${isActive('/profile') ? 'active' : ''}`}>
        <User size={22} />
        <span>Profile</span>
      </Link>
    </nav>
  )
}
