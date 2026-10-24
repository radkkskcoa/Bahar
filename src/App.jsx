import { useState, useCallback } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { CartProvider } from './context/CartContext'
import { ToastProvider, useToast } from './context/ToastContext'
import AppHeader from './components/AppHeader'
import NavDrawer from './components/NavDrawer'
import MobileBottomNav from './components/MobileBottomNav'
import CartDrawer from './components/CartDrawer'
import ProductDetailModal from './components/ProductDetailModal'
import ScrollToTop from './components/ScrollToTop'
import Footer from './components/Footer'
import Home from './pages/Home'
import Menu from './pages/Menu'
import Deals from './pages/Deals'
import Checkout from './pages/Checkout'
import OrderTracking from './pages/OrderTracking'
import Profile from './pages/Profile'
import Rewards from './pages/Rewards'
import About from './pages/About'
import Notifications from './pages/Notifications'
import NotFound from './pages/NotFound'
import { getProductById } from './data/menu'
import './styles/components.css'

function AppContent() {
  const [drawerOpen, setDrawerOpen] = useState(false)
  const [modalProduct, setModalProduct] = useState(null)
  const [favs, setFavs] = useState(() => {
    try { return new Set(JSON.parse(localStorage.getItem('crunch-favs') || '[]')) } catch { return new Set() }
  })
  const { showToast } = useToast()

  const toggleFav = useCallback((id) => {
    setFavs((prev) => {
      const next = new Set(prev)
      if (next.has(id)) { next.delete(id); showToast('Removed from favorites') }
      else { next.add(id); showToast('Added to favorites!') }
      localStorage.setItem('crunch-favs', JSON.stringify([...next]))
      return next
    })
  }, [showToast])

  const handleAdd = useCallback((item) => {
    // For products with option groups, open the modal; for bundles/chef specials, add directly
    if (item.optionGroups && item.optionGroups.length > 0) {
      setModalProduct(item)
    } else {
      // Direct add (bundles, chef specials)
      const cartKey = `${item.id}-${Date.now()}`
      // Use cart context addItem through a custom event? No — we need access to cart.
      // Instead, we'll open the modal for everything to keep it simple
      setModalProduct(item)
    }
  }, [])

  const handleOpen = useCallback((product) => {
    setModalProduct(product)
  }, [])

  return (
    <div className="app-shell">
      <AppHeader onOpenDrawer={() => setDrawerOpen(true)} />
      <NavDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />

      <main className="page-content">
        <Routes>
          <Route path="/" element={
            <Home onAdd={handleAdd} onOpen={handleOpen} favs={favs} onToggleFav={toggleFav} />
          } />
          <Route path="/menu" element={
            <Menu onAdd={handleAdd} onOpen={handleOpen} favs={favs} onToggleFav={toggleFav} />
          } />
          <Route path="/deals" element={<Deals onAdd={handleAdd} />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/track" element={<OrderTracking />} />
          <Route path="/profile" element={
            <Profile favs={favs} onToggleFav={toggleFav} getProductById={getProductById} />
          } />
          <Route path="/rewards" element={<Rewards />} />
          <Route path="/about" element={<About />} />
          <Route path="/notifications" element={<Notifications />} />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </main>

      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <ProductDetailModal product={modalProduct} onClose={() => setModalProduct(null)} />
    </div>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <CartProvider>
          <ScrollToTop />
          <AppContent />
        </CartProvider>
      </ToastProvider>
    </BrowserRouter>
  )
}
