import { NavLink, useNavigate } from 'react-router-dom';
import { Home, Plus, Receipt, Tag, User } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

const ITEMS = [
  { to: '/', label: 'Home', icon: Home },
  { to: '/menu', label: 'Menu', icon: Receipt },
  { to: '/deals', label: 'Deals', icon: Tag },
];

/** Floating bottom navigation. The raised centre button starts an order. */
export default function MobileBottomNav() {
  const navigate = useNavigate();
  const { user } = useAuth();

  return (
    <nav
      className="safe-bottom fixed inset-x-0 bottom-0 z-40 border-t border-line bg-base/95 backdrop-blur lg:hidden"
      aria-label="Bottom navigation"
    >
      <div className="mx-auto flex max-w-md items-end justify-between px-4 py-2">
        {ITEMS.slice(0, 2).map((item) => <NavItem key={item.to} {...item} />)}

        <button
          type="button"
          onClick={() => navigate('/menu')}
          className="-mt-6 grid h-14 w-14 place-items-center rounded-full bg-brand text-white shadow-glow transition active:scale-95"
          aria-label="Start an order"
        >
          <Plus className="h-6 w-6" aria-hidden="true" />
        </button>

        <NavItem to="/deals" label="Deals" icon={Tag} />
        <NavItem to={user ? '/account' : '/account?mode=signin'} label="Profile" icon={User} />
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
