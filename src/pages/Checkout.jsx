import { useState } from 'react'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { businessSettings } from '../data/menu'
import { Check, ArrowRight, ArrowLeft } from '../components/Icons'

const steps = ['Contact', 'Delivery', 'Fulfillment', 'Payment', 'Confirmation']

export default function Checkout() {
  const { items, count, subtotal, discount, clearCart, clearCoupon } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [step, setStep] = useState(0)
  const [fulfillment, setFulfillment] = useState('delivery')
  const [form, setForm] = useState({
    name: '', email: '', phone: '',
    address: '', apt: '', instructions: '',
  })
  const [errors, setErrors] = useState({})
  const [orderConfirmed, setOrderConfirmed] = useState(null)

  const deliveryFee = fulfillment === 'delivery' && subtotal < businessSettings.freeDeliveryThreshold
    ? businessSettings.deliveryFee : 0
  const taxedAmount = Math.max(0, subtotal - discount)
  const tax = taxedAmount * businessSettings.taxRate
  const total = taxedAmount + deliveryFee + tax

  if (count === 0 && !orderConfirmed) {
    return (
      <div className="container" style={{ paddingTop: '24px' }}>
        <div className="empty-state">
          <span className="empty-state-icon">🛒</span>
          <p className="empty-state-title">Your cart is empty</p>
          <button className="btn btn-primary" onClick={() => navigate('/menu')}>Browse Menu</button>
        </div>
      </div>
    )
  }

  if (orderConfirmed) {
    return (
      <div className="container" style={{ paddingTop: '32px', maxWidth: 600, textAlign: 'center' }}>
        <div className="confirm-icon"><Check size={36} /></div>
        <h1 className="confirm-title">Order Confirmed!</h1>
        <p className="confirm-subtitle">Thank you, {form.name}! Your order is being prepared.</p>
        <div className="confirm-order-num">Order #{orderConfirmed}</div>
        <div className="card" style={{ padding: 20, marginTop: 20, textAlign: 'left' }}>
          <h3 style={{ fontWeight: 800, marginBottom: 12 }}>Order Summary</h3>
          {items.map((item) => (
            <div key={item.cartKey} className="checkout-summary-item">
              <span>{item.qty}× {item.name}</span>
              <span>${(item.unitPrice * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div className="checkout-summary-item" style={{ marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)', fontWeight: 700, color: 'var(--text-primary)' }}>
            <span>Total</span><span>${total.toFixed(2)}</span>
          </div>
          {fulfillment === 'delivery' && (
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Estimated delivery: 25–35 min</p>
          )}
          {fulfillment === 'pickup' && (
            <p style={{ marginTop: 12, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Ready for pickup in 15–20 min</p>
          )}
        </div>
        <div style={{ display: 'flex', gap: 12, marginTop: 20, justifyContent: 'center' }}>
          <button className="btn btn-primary" onClick={() => navigate('/track')}>Track Order</button>
          <button className="btn btn-ghost" onClick={() => navigate('/')}>Back to Home</button>
        </div>
      </div>
    )
  }

  const validateStep = () => {
    const errs = {}
    if (step === 0) {
      if (!form.name.trim()) errs.name = 'Name is required'
      if (!form.email.trim()) errs.email = 'Email is required'
      else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) errs.email = 'Invalid email'
      if (!form.phone.trim()) errs.phone = 'Phone is required'
    }
    if (step === 1 && fulfillment === 'delivery') {
      if (!form.address.trim()) errs.address = 'Address is required'
    }
    setErrors(errs)
    return Object.keys(errs).length === 0
  }

  const next = () => {
    if (!validateStep()) { showToast('Please fill in required fields', 'error'); return }
    if (step === 3) {
      // Place order
      const orderNum = `CH-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`
      // Persist order for tracking
      try {
        const order = {
          id: orderNum,
          status: 'preparing',
          eta: fulfillment === 'delivery' ? '25-35 min' : '15-20 min',
          items: items.map((i) => ({ name: i.name, qty: i.qty, price: i.unitPrice })),
          total: parseFloat(total.toFixed(2)),
          placedAt: new Date().toISOString(),
          address: fulfillment === 'delivery' ? `${form.address}${form.apt ? `, ${form.apt}` : ''}` : 'Pickup',
          fulfillment,
          customer: { name: form.name, email: form.email, phone: form.phone },
        }
        localStorage.setItem('crunch-house-last-order', JSON.stringify(order))
      } catch {}
      setOrderConfirmed(orderNum)
      showToast('Order placed successfully!')
      // Don't clear cart yet — show summary first, clear on navigation
      setTimeout(() => { clearCart(); clearCoupon() }, 100)
    } else {
      setStep(step + 1)
    }
  }

  const back = () => setStep(Math.max(0, step - 1))
  const update = (k, v) => setForm({ ...form, [k]: v })

  return (
    <div className="container" style={{ paddingTop: '24px' }}>
      <h1 className="section-title" style={{ marginBottom: '20px' }}>Checkout</h1>

      <div className="checkout-steps">
        {steps.map((label, i) => (
          <div key={label} className={`checkout-step ${i === step ? 'active' : i < step ? 'done' : ''}`}>
            <div className="checkout-step-num">{i < step ? <Check size={16} /> : i + 1}</div>
            <span className="checkout-step-label">{label}</span>
          </div>
        ))}
      </div>

      <div className="checkout-layout">
        <div>
          {step === 0 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Contact Details</h3>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input className="form-input" value={form.name} onChange={(e) => update('name', e.target.value)} placeholder="John Doe" />
                {errors.name && <div className="form-error">{errors.name}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Email *</label>
                  <input className="form-input" type="email" value={form.email} onChange={(e) => update('email', e.target.value)} placeholder="john@example.com" />
                  {errors.email && <div className="form-error">{errors.email}</div>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone *</label>
                  <input className="form-input" type="tel" value={form.phone} onChange={(e) => update('phone', e.target.value)} placeholder="+1 555 123 4567" />
                  {errors.phone && <div className="form-error">{errors.phone}</div>}
                </div>
              </div>
            </div>
          )}

          {step === 1 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Delivery Details</h3>
              <div className="form-group">
                <label className="form-label">Delivery Address *</label>
                <input className="form-input" value={form.address} onChange={(e) => update('address', e.target.value)} placeholder="123 Main Street" />
                {errors.address && <div className="form-error">{errors.address}</div>}
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label className="form-label">Apt / Unit</label>
                  <input className="form-input" value={form.apt} onChange={(e) => update('apt', e.target.value)} placeholder="Apt 4B" />
                </div>
              </div>
              <div className="form-group">
                <label className="form-label">Delivery Instructions</label>
                <textarea className="form-textarea" value={form.instructions} onChange={(e) => update('instructions', e.target.value)} placeholder="Ring the doorbell, 2nd floor..." />
              </div>
            </div>
          )}

          {step === 2 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Fulfillment Method</h3>
              <div className="fulfillment-options">
                <div className={`fulfillment-opt ${fulfillment === 'delivery' ? 'selected' : ''}`} onClick={() => setFulfillment('delivery')}>
                  <div className="fulfillment-opt-name">🛵 Delivery</div>
                  <div className="fulfillment-opt-desc">25–35 min · ${(businessSettings.deliveryFee).toFixed(2)} fee</div>
                </div>
                <div className={`fulfillment-opt ${fulfillment === 'pickup' ? 'selected' : ''}`} onClick={() => setFulfillment('pickup')}>
                  <div className="fulfillment-opt-name">🏪 Pickup</div>
                  <div className="fulfillment-opt-desc">Ready in 15–20 min · No fee</div>
                </div>
              </div>
              {fulfillment === 'delivery' && (
                <p style={{ marginTop: 16, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Free delivery on orders over ${businessSettings.freeDeliveryThreshold.toFixed(2)}.
                </p>
              )}
            </div>
          )}

          {step === 3 && (
            <div className="card" style={{ padding: 20 }}>
              <h3 style={{ fontWeight: 800, marginBottom: 16 }}>Payment</h3>
              <div className="payment-mode-badge">⚠️ TEST MODE — No real payment will be processed</div>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 16 }}>
                This is a demonstration checkout. No credit card information is collected or stored.
                In production, this would integrate with a secure payment provider (e.g. Stripe).
              </p>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" defaultChecked /> Credit / Debit Card (test)
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" /> Cash on Delivery
                </label>
                <label style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '14px 16px', borderRadius: 'var(--r-md)', background: 'var(--bg-elevated)', border: '1px solid var(--border)', cursor: 'pointer' }}>
                  <input type="radio" name="payment" /> Pay at Pickup
                </label>
              </div>
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, marginTop: 20 }}>
            {step > 0 && <button className="btn btn-ghost" onClick={back}><ArrowLeft size={18} /> Back</button>}
            <button className="btn btn-primary" style={{ flex: 1 }} onClick={next}>
              {step === 3 ? 'Place Order' : 'Continue'} <ArrowRight size={18} />
            </button>
          </div>
        </div>

        <div className="checkout-summary">
          <h3>Order Summary</h3>
          {items.map((item) => (
            <div key={item.cartKey} className="checkout-summary-item">
              <span>{item.qty}× {item.name}</span>
              <span>${(item.unitPrice * item.qty).toFixed(2)}</span>
            </div>
          ))}
          <div style={{ marginTop: 12, paddingTop: 12, borderTop: '1px solid var(--border-light)' }}>
            <div className="checkout-summary-item"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
            {discount > 0 && <div className="checkout-summary-item" style={{ color: 'var(--success)' }}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
            <div className="checkout-summary-item"><span>Delivery</span><span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span></div>
            <div className="checkout-summary-item"><span>Tax</span><span>${tax.toFixed(2)}</span></div>
            <div className="checkout-summary-item" style={{ fontWeight: 800, color: 'var(--text-primary)', fontSize: '1.1rem', marginTop: 8, paddingTop: 8, borderTop: '1px solid var(--border-light)' }}>
              <span>Total</span><span style={{ color: 'var(--orange)' }}>${total.toFixed(2)}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
