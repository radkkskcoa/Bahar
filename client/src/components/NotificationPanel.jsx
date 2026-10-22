import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { BellRing, CheckCheck } from 'lucide-react';
import Drawer from './Drawer.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

export default function NotificationPanel({ open, onClose }) {
  const { notifications, unreadCount, markNotificationsRead, user } = useAuth();
  const { locale } = useI18n();

  useEffect(() => {
    if (open && unreadCount > 0) markNotificationsRead();
  }, [open, unreadCount, markNotificationsRead]);

  return (
    <Drawer open={open} onClose={onClose} title="Notifications" side="right">
      {!user ? (
        <p className="text-sm text-ink-soft">
          <Link to="/account?mode=signin" className="text-brand" onClick={onClose}>Sign in</Link> to get order updates and reward news.
        </p>
      ) : notifications.length === 0 ? (
        <p className="text-sm text-ink-muted">Nothing yet — order updates will show up here.</p>
      ) : (
        <ul className="space-y-3">
          {notifications.map((notification) => (
            <li key={notification.id} className="rounded-2xl border border-line bg-elevate/70 p-4">
              <div className="flex items-start justify-between gap-3">
                <p className="text-sm font-bold">{notification.title}</p>
                {notification.read_at ? (
                  <CheckCheck className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden="true" />
                ) : (
                  <BellRing className="h-4 w-4 shrink-0 text-brand" aria-hidden="true" />
                )}
              </div>
              <p className="mt-1 text-xs text-ink-muted">{notification.body}</p>
              <div className="mt-2 flex items-center justify-between gap-2">
                <span className="text-[11px] text-ink-muted">{formatDate(notification.created_at, locale)}</span>
                {notification.href ? (
                  <Link to={notification.href} className="text-xs font-semibold text-brand" onClick={onClose}>
                    View
                  </Link>
                ) : null}
              </div>
            </li>
          ))}
        </ul>
      )}
    </Drawer>
  );
}
