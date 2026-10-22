import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Plus, Receipt, Tag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';
import { useI18n } from '../context/I18nContext.jsx';

/** Floating bottom navigation. The raised centre button starts an order. */
export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { t } = useI18n();

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base/95 backdrop-blur lg:hidden"
      aria-label={t('common.mainNav')}
    >
      <div className="mx-auto flex max-w-md items-end justify-between px-4 py-2">
        <NavItem to="/" label={t('nav.home')} icon={Home} />
        <NavItem to="/menu" label={t('nav.menu')} icon={Receipt} />

        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-glow transition active:scale-95"
          aria-label={t('nav.order')}
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>

        <NavItem to="/deals" label={t('nav.deals')} icon={Tag} />
        <NavItem to={user ? '/account' : '/account?mode=signin'} label={t('nav.account')} icon={User} />
      </div>
    </nav>
  );
}

function NavItem({ to, label, icon: Icon }) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        `flex min-h-[44px] min-w-[64px] flex-col items-center justify-center gap-1 rounded-xl px-2 text-[11px] font-semibold transition ${
          isActive ? 'text-brand' : 'text-ink-muted hover:text-white'
        }`
      }
    >
      <Icon className="h-5 w-5" aria-hidden="true" />
      {label}
    </NavLink>
  );
}
