import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import {
  Bell, ChefHat, Globe, LayoutDashboard, LogOut, Menu, MapPin, ShoppingBag, User,
} from 'lucide-react';
import NavDrawer from './NavDrawer.jsx';
import NotificationPanel from './NotificationPanel.jsx';
import LocationModal from './LocationModal.jsx';
import { NAV_LINKS } from '../lib/nav.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useCart } from '../context/CartContext.jsx';
import { useCatalog } from '../context/CatalogContext.jsx';
import { useDestination } from '../context/DestinationContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function AppHeader() {
  const { user, isStaff, unreadCount, logout } = useAuth();
  const { count, openDrawer } = useCart();
  const { brand } = useCatalog();
  const { destination } = useDestination();
  const { t, language, setLanguage, languages } = useI18n();
  const [navOpen, setNavOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [locationOpen, setLocationOpen] = useState(false);

  const destinationLabel = destination.label || t('location.labelPlaceholder');

  return (
    <>
      <header className="sticky top-0 z-40 border-b border-line bg-base/85 backdrop-blur supports-[backdrop-filter]:bg-base/70">
        <div className="container-page flex h-16 items-center gap-3">
          <button
            type="button"
            className="icon-btn lg:hidden"
            onClick={() => setNavOpen(true)}
            aria-label={t('common.openNav')}
          >
            <Menu className="h-5 w-5" aria-hidden="true" />
          </button>

          <Link to="/" className="flex items-center gap-2" aria-label={t('common.brandHome', { brand: brand.name })}>
            <span className="grid h-10 w-10 place-items-center rounded-2xl bg-brand text-white">
              <ChefHat className="h-5 w-5" aria-hidden="true" />
            </span>
            <span className="hidden flex-col leading-none sm:flex">
              <span className="text-base font-extrabold">{brand.name}</span>
              <span className="text-[10px] uppercase tracking-widest text-lime">{t('header.tagline')}</span>
            </span>
          </Link>

          <button
            type="button"
            onClick={() => setLocationOpen(true)}
            className="ms-1 flex min-h-[40px] items-center gap-1.5 rounded-full border border-line bg-elevate px-3 text-xs font-semibold text-ink-soft transition hover:border-brand/60 hover:text-white"
            aria-label={`${t('nav.deliverTo')} ${destinationLabel} — ${t('location.changeAria')}`}
          >
            <MapPin className="h-3.5 w-3.5 text-brand" aria-hidden="true" />
            <span className="max-w-[110px] truncate">
              {t('nav.deliverTo')} <span className="text-ink">{destinationLabel}</span>
            </span>
          </button>

          <nav className="ms-6 hidden items-center gap-1 lg:flex" aria-label={t('common.mainNav')}>
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                className={({ isActive }) =>
                  `rounded-full px-3.5 py-2 text-sm font-semibold transition ${
                    isActive ? 'bg-elevate text-brand' : 'text-ink-soft hover:text-white'
                  }`
                }
              >
                {t(link.key)}
              </NavLink>
            ))}
          </nav>

          <div className="ms-auto flex items-center gap-2">
            <div className="hidden items-center gap-1 rounded-full border border-line bg-elevate p-1 sm:flex" role="group" aria-label={t('nav.language')}>
              <Globe className="ms-1.5 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
              {languages.map((entry) => (
                <button
                  key={entry.code}
                  type="button"
                  onClick={() => setLanguage(entry.code)}
                  aria-pressed={language === entry.code}
                  className={`rounded-full px-2.5 py-1 text-[11px] font-bold uppercase transition ${
                    language === entry.code ? 'bg-brand text-white' : 'text-ink-muted hover:text-white'
                  }`}
                >
                  {entry.code}
                </button>
              ))}
            </div>

            <button
              type="button"
              className="icon-btn"
              onClick={() => setNotificationsOpen(true)}
              aria-label={`${t('nav.notifications')}${unreadCount ? t('message.unread', { count: unreadCount }) : ''}`}
            >
              <Bell className="h-4 w-4" aria-hidden="true" />
              {unreadCount > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {unreadCount}
                </span>
              ) : null}
            </button>

            <button
              type="button"
              className="icon-btn"
              onClick={openDrawer}
              aria-label={`${t('nav.cart')}${count ? t('message.items', { count }) : ''}`}
            >
              <ShoppingBag className="h-4 w-4" aria-hidden="true" />
              {count > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-brand px-1 text-[10px] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </button>

            <div className="relative hidden lg:block">
              <details className="group">
                <summary className="icon-btn cursor-pointer list-none" aria-label={t('nav.account')}>
                  <User className="h-4 w-4" aria-hidden="true" />
                </summary>
                <div className="absolute end-0 mt-2 w-56 overflow-hidden rounded-2xl border border-line bg-soft p-2 shadow-card">
                  {user ? (
                    <>
                      <p className="px-3 py-2 text-xs text-ink-muted">
                        {t('header.signedInAs')} <span className="font-semibold text-ink">{user.name}</span>
                      </p>
                      <Link to="/account" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-elevate">
                        {t('nav.account')}
                      </Link>
                      <Link to="/track" className="block rounded-xl px-3 py-2 text-sm font-semibold hover:bg-elevate">
                        {t('nav.track')}
                      </Link>
                      {isStaff ? (
                        <Link to="/admin" className="flex items-center gap-2 rounded-xl px-3 py-2 text-sm font-semibold hover:bg-elevate">
                          <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                          {t('nav.admin')}
                        </Link>
                      ) : null}
                      <button
                        type="button"
                        onClick={logout}
                        className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-ink-soft hover:bg-elevate hover:text-white"
                      >
                        <LogOut className="h-4 w-4" aria-hidden="true" />
                        {t('nav.signOut')}
                      </button>
                    </>
                  ) : (
                    <Link to="/account?mode=signin" className="btn-primary m-1 w-[calc(100%-0.5rem)]">
                      {t('nav.signIn')}
                    </Link>
                  )}
                </div>
              </details>
            </div>
          </div>
        </div>
      </header>

      <NavDrawer open={navOpen} onClose={() => setNavOpen(false)} onOpenLocation={() => setLocationOpen(true)} />
      <NotificationPanel open={notificationsOpen} onClose={() => setNotificationsOpen(false)} />
      <LocationModal open={locationOpen} onClose={() => setLocationOpen(false)} />
    </>
  );
}
