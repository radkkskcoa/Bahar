import { Check, ChefHat, Scooter, Home as HomeIcon, Phone, ArrowRight } from '../components/Icons'
import { sampleOrders, orderStatuses } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function OrderTracking() {
  const navigate = useNavigate()
  const order = sampleOrders[0]

  if (!order) {
    return (
      <div className="container" style={{ paddingTop: '24px' }}>
        <div className="empty-state">
          <span className="empty-state-icon">📦</span>
          <p className="empty-state-title">No active orders</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Start an Order</button>
        </div>
      </div>
    )
  }

  const currentIdx = orderStatuses.findIndex((s) => s.id === order.status)
  const icons = { check: Check, chef: ChefHat, scooter: Scooter, home: HomeIcon }
  const progressPct = (currentIdx / (orderStatuses.length - 1)) * 100

  return (
    <div className="container" style={{ paddingTop: '24px', maxWidth: 700 }}>
      <h1 className="section-title" style={{ marginBottom: '20px' }}>Track Your Order</h1>

      <div className="tracker-card">
        <div className="tracker-header">
          <span className="tracker-title"><Scooter size={20} style={{ color: 'var(--orange)' }} /> Order #{order.id}</span>
          <span className="tracker-eta">ETA: {order.eta}</span>
        </div>

        <div className="tracker-steps" style={{ marginBottom: 24 }}>
          <div className="tracker-line" />
          <div className="tracker-line-fill" style={{ width: `calc(${progressPct}% - ${currentIdx > 0 ? '18px' : '0px'})` }} />
          {orderStatuses.map((step, i) => {
            const Icon = icons[step.icon]
            return (
              <div key={step.id} className={`tracker-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
                <div className="tracker-step-icon"><Icon size={18} /></div>
                <span className="tracker-step-label">{step.name}</span>
              </div>
            )
          })}
        </div>

        <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: 16 }}>
          Status-based tracking with genuine order updates. Live GPS courier tracking is not available — ETA is an estimate.
        </p>

        <div style={{ borderTop: '1px solid var(--border-light)', paddingTop: 16 }}>
          <h3 style={{ fontWeight: 700, marginBottom: 12 }}>Order Items</h3>
          {order.items.map((item, i) => (
            <div key={i} className="checkout-summary-item">
              <span>{item.qty}× {item.name}</span>
              <span>${(item.price * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary-item" style={{ fontWeight: 800, color: 'var(--text-primary)', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
            <span>Total</span><span style={{ color: 'var(--orange)' }}>${order.total.toFixed(2)}</span>
          </div>
        </div>

        {order.address && (
          <div style={{ marginTop: 16, padding: '12px 16px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            📍 Delivering to: {order.address}
          </div>
        )}

        <button className="btn btn-ghost" style={{ marginTop: 16, width: '100%' }}>
          <Phone size={16} /> Contact Support
        </button>
      </div>
    </div>
  )
}
