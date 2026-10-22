import { Link, NavLink } from 'react-router-dom';
import { Globe, LayoutDashboard, LogIn, LogOut, MapPin, User } from 'lucide-react';
import Drawer from './Drawer.jsx';
import { NAV_LINKS } from '../lib/nav.js';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

export default function NavDrawer({ open, onClose, onOpenLocation }) {
  const { user, isStaff, logout } = useAuth();
  const { t, language, setLanguage, languages } = useI18n();

  return (
    <Drawer open={open} onClose={onClose} title={t('nav.menu')} side="right">
      <nav className="space-y-1" aria-label={t('common.mainNav')}>
        {NAV_LINKS.map((link) => (
          <NavLink
            key={link.to}
            to={link.to}
            onClick={onClose}
            className={({ isActive }) =>
              `flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold transition ${
                isActive ? 'bg-brand text-white' : 'text-ink-soft hover:bg-elevate hover:text-white'
              }`
            }
          >
            {t(link.key)}
          </NavLink>
        ))}
        <Link to="/track" onClick={onClose} className="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-elevate hover:text-white">
          {t('nav.track')}
        </Link>
        <Link to="/support" onClick={onClose} className="flex min-h-[44px] items-center rounded-xl px-3 text-sm font-semibold text-ink-soft hover:bg-elevate hover:text-white">
          {t('nav.support')}
        </Link>
      </nav>

      <hr className="my-5 border-line" />

      <button
        type="button"
        onClick={() => {
          onClose();
          onOpenLocation();
        }}
        className="flex w-full items-center gap-3 rounded-xl border border-line bg-elevate px-3 py-3 text-left text-sm"
      >
        <MapPin className="h-4 w-4 text-brand" aria-hidden="true" />
        <span>
          <span className="block font-semibold">{t('nav.deliverTo')}</span>
          <span className="block text-xs text-ink-muted">{t('location.setAddress')}</span>
        </span>
      </button>

      <div className="mt-4 flex items-center gap-1 rounded-full border border-line bg-elevate p-1" role="group" aria-label={t('nav.language')}>
        <Globe className="ms-1.5 h-3.5 w-3.5 text-ink-muted" aria-hidden="true" />
        {languages.map((entry) => (
          <button
            key={entry.code}
            type="button"
            onClick={() => setLanguage(entry.code)}
            aria-pressed={language === entry.code}
            className={`flex-1 rounded-full px-2.5 py-1.5 text-xs font-bold transition ${
              language === entry.code ? 'bg-brand text-white' : 'text-ink-muted hover:text-white'
            }`}
          >
            {entry.label}
          </button>
        ))}
      </div>

      <div className="mt-4 space-y-2">
        {user ? (
          <>
            <Link to="/account" onClick={onClose} className="btn-ghost w-full justify-start">
              <User className="h-4 w-4" aria-hidden="true" />
              {t('nav.account')}
            </Link>
            {isStaff ? (
              <Link to="/admin" onClick={onClose} className="btn-ghost w-full justify-start">
                <LayoutDashboard className="h-4 w-4" aria-hidden="true" />
                {t('nav.admin')}
              </Link>
            ) : null}
            <button type="button" className="btn-ghost w-full justify-start" onClick={() => { onClose(); logout(); }}>
              <LogOut className="h-4 w-4" aria-hidden="true" />
              {t('nav.signOut')}
            </button>
          </>
        ) : (
          <Link to="/account?mode=signin" onClick={onClose} className="btn-primary w-full justify-start">
            <LogIn className="h-4 w-4" aria-hidden="true" />
            {t('nav.signIn')}
          </Link>
        )}
      </div>
    </Drawer>
  );
}
