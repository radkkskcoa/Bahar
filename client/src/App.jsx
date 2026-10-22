import { useEffect } from 'react';
import { Route, Routes, useLocation } from 'react-router-dom';
import AppHeader from './components/AppHeader.jsx';
import MobileBottomNav from './components/MobileBottomNav.jsx';
import Footer from './components/Footer.jsx';
import CartDrawer from './components/CartDrawer.jsx';
import ToastHost from './components/ToastHost.jsx';
import HomePage from './pages/HomePage.jsx';
import MenuPage from './pages/MenuPage.jsx';
import ProductPage from './pages/ProductPage.jsx';
import DealsPage from './pages/DealsPage.jsx';
import RewardsPage from './pages/RewardsPage.jsx';
import CartPage from './pages/CartPage.jsx';
import CheckoutPage from './pages/CheckoutPage.jsx';
import OrderTrackingPage from './pages/OrderTrackingPage.jsx';
import AccountPage from './pages/AccountPage.jsx';
import AdminPage from './pages/AdminPage.jsx';
import InfoPage from './pages/InfoPage.jsx';
import NotFoundPage from './pages/NotFoundPage.jsx';
import { useI18n } from './context/I18nContext.jsx';

function ScrollToTop() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'auto' });
  }, [pathname]);
  return null;
}

export default function App() {
  const { dir, language } = useI18n();

  // RTL and language live on the document so native controls and forms follow it.
  useEffect(() => {
    document.documentElement.dir = dir;
    document.documentElement.lang = language;
  }, [dir, language]);

  return (
    <div className="flex min-h-screen flex-col">
      <ScrollToTop />
      <AppHeader />
      <main id="main" className="flex-1 pb-24 lg:pb-0">
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/menu" element={<MenuPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/deals" element={<DealsPage />} />
          <Route path="/rewards" element={<RewardsPage />} />
          <Route path="/cart" element={<CartPage />} />
          <Route path="/checkout" element={<CheckoutPage />} />
          <Route path="/track" element={<OrderTrackingPage />} />
          <Route path="/track/:orderNumber" element={<OrderTrackingPage />} />
          <Route path="/account" element={<AccountPage />} />
          <Route path="/admin" element={<AdminPage />} />
          <Route path="/about" element={<InfoPage page="about" />} />
          <Route path="/support" element={<InfoPage page="support" />} />
          <Route path="/terms" element={<InfoPage page="terms" />} />
          <Route path="/privacy" element={<InfoPage page="privacy" />} />
          <Route path="/refunds" element={<InfoPage page="refunds" />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </main>
      <Footer />
      <MobileBottomNav />
      <CartDrawer />
      <ToastHost />
    </div>
  );
}
