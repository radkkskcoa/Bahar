import { useState, useEffect } from 'react'
import { Bell, Tag, Award, Package, X } from '../components/Icons'
import { useToast } from '../context/ToastContext'

const STORAGE_KEY = 'crunch-house-notifications'

const defaultNotifications = [
  { id: 'n1', type: 'promo',    title: 'Weekend Crunch Fest is live!', desc: 'Up to 25% off on selected items. Use code CRUNCH25.', time: '2m ago',  unread: true },
  { id: 'n2', type: 'order',    title: 'Your order is being prepared', desc: 'Order #CH-20261024-001 is now in the kitchen.',     time: '15m ago', unread: true },
  { id: 'n3', type: 'rewards',  title: 'You earned 34 Crunch Points',  desc: 'From your last order. Keep ordering to unlock rewards!', time: '1h ago',  unread: false },
  { id: 'n4', type: 'promo',    title: 'New chef special available',   desc: 'Hot Honey Chicken is here for a limited time.',     time: '3h ago',  unread: false },
  { id: 'n5', type: 'rewards',  title: 'You unlocked a Free Side!',    desc: 'Redeem your 800-point reward from the Rewards page.', time: '1d ago',  unread: false },
]

const typeConfig = {
  promo:   { icon: Tag,     color: 'var(--orange)' },
  order:   { icon: Package, color: 'var(--lime)' },
  rewards: { icon: Award,   color: 'var(--lime)' },
}

export default function Notifications() {
  const { showToast } = useToast()
  const [notifications, setNotifications] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : defaultNotifications
    } catch { return defaultNotifications }
  })

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications)) } catch {}
  }, [notifications])

  const unreadCount = notifications.filter((n) => n.unread).length

  const markAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })))
    showToast('All notifications marked as read')
  }

  const dismiss = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  const clearAll = () => {
    setNotifications([])
    showToast('Notifications cleared')
  }

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: 700 }}>
      <div className="notif-header">
        <h1 className="section-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Bell size={24} style={{ color: 'var(--orange)' }} />
          Notifications
          {unreadCount > 0 && <span className="notif-badge">{unreadCount}</span>}
        </h1>
        <div className="notif-actions">
          {unreadCount > 0 && <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={markAllRead}>Mark all read</button>}
          {notifications.length > 0 && <button className="btn btn-ghost" style={{ padding: '6px 16px', fontSize: '0.8rem' }} onClick={clearAll}>Clear all</button>}
        </div>
      </div>

      {notifications.length === 0 ? (
        <div className="empty-state">
          <span className="empty-state-icon">🔔</span>
          <p className="empty-state-title">No notifications</p>
          <p>You're all caught up!</p>
        </div>
      ) : (
        <div className="notif-list">
          {notifications.map((n) => {
            const cfg = typeConfig[n.type] || typeConfig.promo
            const Icon = cfg.icon
            return (
              <div key={n.id} className={`notif-item ${n.unread ? 'unread' : ''}`}>
                <div className="notif-item-icon" style={{ color: cfg.color, background: cfg.color === 'var(--orange)' ? 'var(--orange-dim)' : 'var(--lime-dim)' }}>
                  <Icon size={18} />
                </div>
                <div className="notif-item-body">
                  <div className="notif-item-title">{n.title}</div>
                  <div className="notif-item-desc">{n.desc}</div>
                  <div className="notif-item-time">{n.time}</div>
                </div>
                <button className="notif-dismiss" onClick={() => dismiss(n.id)} aria-label="Dismiss notification">
                  <X size={16} />
                </button>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
