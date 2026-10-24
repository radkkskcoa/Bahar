import { useState, useEffect, useMemo } from 'react'
import { X, Star, Clock, Plus, Minus, Check } from './Icons'
import { useCart } from '../context/CartContext'
import { useToast } from '../context/ToastContext'

export default function ProductDetailModal({ product, onClose }) {
  const { addItem } = useCart()
  const { showToast } = useToast()
  const [qty, setQty] = useState(1)
  const [selections, setSelections] = useState({})
  const [instructions, setInstructions] = useState('')

  useEffect(() => {
    if (product) {
      setQty(1)
      setSelections({})
      setInstructions('')
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => { document.body.style.overflow = '' }
  }, [product])

  const toggleOption = (groupId, type, optId) => {
    setSelections((prev) => {
      const next = { ...prev }
      if (type === 'single') {
        next[groupId] = optId
      } else {
        const arr = next[groupId] || []
        next[groupId] = arr.includes(optId) ? arr.filter((id) => id !== optId) : [...arr, optId]
      }
      return next
    })
  }

  const extraPrice = useMemo(() => {
    if (!product?.optionGroups) return 0
    let extra = 0
    product.optionGroups.forEach((g) => {
      const sel = selections[g.id]
      if (!sel) return
      g.options.forEach((opt) => {
        if (g.type === 'single' && sel === opt.id) extra += opt.price
        if (g.type === 'multi' && Array.isArray(sel) && sel.includes(opt.id)) extra += opt.price
      })
    })
    return extra
  }, [product, selections])

  if (!product) return null

  const unitPrice = product.price + extraPrice
  const total = unitPrice * qty

  const handleAdd = () => {
    // Check required groups
    const missing = product.optionGroups?.filter((g) => g.required && !selections[g.id])
    if (missing?.length > 0) {
      showToast(`Please select: ${missing.map((g) => g.name).join(', ')}`, 'error')
      return
    }

    // Build option summary
    const optSummary = []
    product.optionGroups?.forEach((g) => {
      const sel = selections[g.id]
      if (!sel) return
      if (g.type === 'single') {
        const opt = g.options.find((o) => o.id === sel)
        if (opt) optSummary.push(opt.name)
      } else {
        const opts = g.options.filter((o) => Array.isArray(sel) && sel.includes(o.id))
        opts.forEach((o) => optSummary.push(o.name))
      }
    })

    const cartKey = `${product.id}-${JSON.stringify(selections)}-${instructions || ''}`

    addItem({
      cartKey,
      id: product.id,
      name: product.name,
      image: product.image,
      basePrice: product.price,
      unitPrice,
      options: optSummary,
      instructions,
      qty,
    })
    showToast(`${product.name} added to cart!`)
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-label={product.name}>
        <button className="modal-close" onClick={onClose} aria-label="Close"><X size={20} /></button>
        <img className="modal-img" src={product.image} alt={product.name} />
        <div className="modal-body">
          <h2 className="modal-name">{product.name}</h2>
          <p className="modal-desc">{product.description}</p>
          <div className="modal-meta">
            {product.rating && (
              <span className="modal-meta-item"><Star size={14} style={{ color: 'var(--lime)', fill: 'var(--lime)' }} /> {product.rating}</span>
            )}
            {product.prepTime && <span className="modal-meta-item"><Clock size={14} /> {product.prepTime}</span>}
            <span className="modal-meta-item" style={{ color: 'var(--orange)', fontWeight: 700 }}>${product.price.toFixed(2)}</span>
          </div>

          {product.optionGroups?.map((g) => (
            <div key={g.id} className="opt-group">
              <div className="opt-group-title">
                {g.name}
                {g.required && <span className="opt-group-required">*Required</span>}
              </div>
              <div className="opt-list">
                {g.options.map((opt) => {
                  const sel = selections[g.id]
                  const isSelected = g.type === 'single' ? sel === opt.id : Array.isArray(sel) && sel.includes(opt.id)
                  return (
                    <button
                      key={opt.id}
                      className={`opt-chip ${isSelected ? 'selected' : ''}`}
                      onClick={() => toggleOption(g.id, g.type, opt.id)}
                    >
                      {isSelected && <Check size={14} />}
                      {opt.name}
                      {opt.price > 0 && <span className="opt-chip-price">+${opt.price.toFixed(2)}</span>}
                    </button>
                  )
                })}
              </div>
            </div>
          ))}

          <div className="opt-group">
            <div className="opt-group-title">Special Instructions</div>
            <textarea
              className="modal-instructions"
              placeholder="Add a note (e.g., extra crispy, no onions...)"
              value={instructions}
              onChange={(e) => setInstructions(e.target.value)}
              maxLength={200}
            />
          </div>

          <div className="modal-footer">
            <div className="qty-selector">
              <button className="qty-selector-btn" onClick={() => setQty(Math.max(1, qty - 1))} aria-label="Decrease quantity"><Minus size={18} /></button>
              <span className="qty-selector-val">{qty}</span>
              <button className="qty-selector-btn" onClick={() => setQty(qty + 1)} aria-label="Increase quantity"><Plus size={18} /></button>
            </div>
            <button className="btn btn-primary" style={{ flex: 1, padding: '14px' }} onClick={handleAdd}>
              Add to Cart · ${total.toFixed(2)}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
