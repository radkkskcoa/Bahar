import { Check, ChefHat, Scooter, Home as HomeIcon, ArrowRight } from './Icons'
import { sampleOrders, orderStatuses } from '../data/menu'
import { useNavigate } from 'react-router-dom'

export default function OrderTracker() {
  const navigate = useNavigate()
  const order = sampleOrders[0]
  if (!order) return null

  const currentIdx = orderStatuses.findIndex((s) => s.id === order.status)
  const progressPct = (currentIdx / (orderStatuses.length - 1)) * 100

  const icons = { check: Check, chef: ChefHat, scooter: Scooter, home: HomeIcon }

  return (
    <section className="container reveal">
      <div className="tracker-card">
        <div className="tracker-header">
          <span className="tracker-title">
            <Scooter size={20} style={{ color: 'var(--orange)' }} />
            Live Order Tracker
          </span>
          <span className="tracker-eta">ETA: {order.eta}</span>
        </div>
        <div className="tracker-steps">
          <div className="tracker-line" />
          <div className="tracker-line-fill" style={{ width: `calc(${progressPct}% - ${currentIdx > 0 ? '18px' : '0px'})` }} />
          {orderStatuses.map((step, i) => {
            const Icon = icons[step.icon]
            return (
              <div key={step.id} className={`tracker-step ${i < currentIdx ? 'done' : i === currentIdx ? 'active' : ''}`}>
                <div className="tracker-step-icon">
                  <Icon size={18} />
                </div>
                <span className="tracker-step-label">{step.name}</span>
              </div>
            )
          })}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '20px' }}>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>Order #{order.id}</span>
          <button className="btn btn-ghost" style={{ padding: '8px 18px', fontSize: '0.85rem' }} onClick={() => navigate('/track')}>
            Track Order <ArrowRight size={16} />
          </button>
        </div>
      </div>
    </section>
  )
}
