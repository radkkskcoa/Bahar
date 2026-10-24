import { useState } from 'react'
import { X, Plus, Minus, Trash, Cart as CartIcon, ArrowRight } from './Icons'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'
import { useNavigate } from 'react-router-dom'
import { businessSettings, promotions } from '../data/menu'

export default function CartDrawer() {
  const { items, count, subtotal, discount, couponCode, removeItem, updateQty, clearCart, applyCoupon: applyCouponCtx, clearCoupon, isCartOpen, setIsCartOpen } = useCart()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const [coupon, setCoupon] = useState(couponCode || '')

  if (!isCartOpen) return null

  const deliveryFee = subtotal >= businessSettings.freeDeliveryThreshold ? 0 : businessSettings.deliveryFee
  const tax = Math.max(0, (subtotal - discount) * businessSettings.taxRate)
  const total = Math.max(0, subtotal - discount + deliveryFee + tax)

  const handleApplyCoupon = () => {
    const promo = promotions.find((p) => p.code?.toLowerCase() === coupon.trim().toLowerCase() && p.active)
    if (promo) {
      const amount = (subtotal * promo.discount) / 100
      applyCouponCtx(promo.code, amount)
      showToast(`Coupon applied: ${promo.discount}% off!`)
    } else {
      showToast('Invalid or expired coupon code', 'error')
      clearCoupon()
    }
  }

  const handleRemoveCoupon = () => {
    clearCoupon()
    setCoupon('')
    showToast('Coupon removed')
  }

  const handleCheckout = () => {
    if (count === 0) return
    setIsCartOpen(false)
    navigate('/checkout')
  }

  return (
    <>
      <div className="cart-overlay" onClick={() => setIsCartOpen(false)} />
      <aside className="cart-drawer" role="dialog" aria-label="Shopping cart">
        <div className="cart-header">
          <h2><CartIcon size={22} /> Your Cart ({count})</h2>
          <button className="icon-btn" onClick={() => setIsCartOpen(false)} aria-label="Close cart"><X size={20} /></button>
        </div>

        {count === 0 ? (
          <div className="cart-items">
            <div className="cart-empty">
              <span className="cart-empty-icon">🛒</span>
              <p>Your cart is empty</p>
              <p style={{ fontSize: '0.85rem' }}>Add some crispy goodness to get started!</p>
              <button className="btn btn-primary" onClick={() => { setIsCartOpen(false); navigate('/menu') }}>Browse Menu</button>
            </div>
          </div>
        ) : (
          <>
            <div className="cart-items">
              {items.map((item) => (
                <div key={item.cartKey} className="cart-item">
                  <img className="cart-item-img" src={item.image} alt={item.name} />
                  <div className="cart-item-info">
                    <div className="cart-item-name">{item.name}</div>
                    {item.options?.length > 0 && <div className="cart-item-opts">{item.options.join(', ')}</div>}
                    {item.instructions && <div className="cart-item-opts" style={{ fontStyle: 'italic' }}>"{item.instructions}"</div>}
                    <div className="cart-item-price">${item.unitPrice.toFixed(2)}</div>
                    <div className="cart-item-controls">
                      <button className="qty-btn" onClick={() => updateQty(item.cartKey, -1)} aria-label="Decrease"><Minus size={14} /></button>
                      <span className="qty-val">{item.qty}</span>
                      <button className="qty-btn" onClick={() => updateQty(item.cartKey, 1)} aria-label="Increase"><Plus size={14} /></button>
                      <span style={{ marginLeft: 'auto', fontSize: '0.85rem', fontWeight: 700 }}>${(item.unitPrice * item.qty).toFixed(2)}</span>
                      <button className="cart-item-remove" onClick={() => removeItem(item.cartKey)} aria-label="Remove item"><Trash size={16} /></button>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="cart-footer">
              <div className="cart-coupon">
                {couponCode ? (
                  <div className="cart-coupon-applied">
                    <span className="cart-coupon-tag">✓ {couponCode}</span>
                    <button className="cart-coupon-remove" onClick={handleRemoveCoupon} aria-label="Remove coupon"><X size={14} /></button>
                  </div>
                ) : (
                  <>
                    <input type="text" placeholder="Coupon code" value={coupon} onChange={(e) => setCoupon(e.target.value)} aria-label="Coupon code" />
                    <button className="cart-coupon-btn" onClick={handleApplyCoupon}>Apply</button>
                  </>
                )}
              </div>
              <div className="cart-summary-row"><span>Subtotal</span><span>${subtotal.toFixed(2)}</span></div>
              {discount > 0 && <div className="cart-summary-row" style={{ color: 'var(--success)' }}><span>Discount</span><span>-${discount.toFixed(2)}</span></div>}
              <div className="cart-summary-row"><span>Delivery Fee</span><span>{deliveryFee === 0 ? 'FREE' : `$${deliveryFee.toFixed(2)}`}</span></div>
              <div className="cart-summary-row"><span>Tax ({(businessSettings.taxRate * 100).toFixed(0)}%)</span><span>${tax.toFixed(2)}</span></div>
              <div className="cart-summary-row total"><span>Total</span><span>${total.toFixed(2)}</span></div>
              <button className="btn btn-primary" style={{ width: '100%', marginTop: '12px' }} onClick={handleCheckout}>
                Checkout <ArrowRight size={18} />
              </button>
              <button className="btn btn-ghost" style={{ width: '100%', marginTop: '8px' }} onClick={clearCart}>Clear Cart</button>
            </div>
          </>
        )}
      </aside>
    </>
  )
}
