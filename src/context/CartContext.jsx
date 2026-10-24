import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react'

const CartContext = createContext(null)

const STORAGE_KEY = 'crunch-house-cart'

export function CartProvider({ children }) {
  const [items, setItems] = useState(() => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch { return [] }
  })
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [cartBump, setCartBump] = useState(false)
  const bumpTimer = useRef(null)

  useEffect(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)) } catch {}
  }, [items])

  const triggerBump = useCallback(() => {
    setCartBump(true)
    clearTimeout(bumpTimer.current)
    bumpTimer.current = setTimeout(() => setCartBump(false), 300)
  }, [])

  const addItem = useCallback((item) => {
    setItems((prev) => {
      const key = item.cartKey
      const existing = prev.find((i) => i.cartKey === key)
      if (existing) {
        return prev.map((i) =>
          i.cartKey === key ? { ...i, qty: i.qty + (item.qty || 1) } : i
        )
      }
      return [...prev, { ...item, qty: item.qty || 1 }]
    })
    triggerBump()
  }, [triggerBump])

  const removeItem = useCallback((cartKey) => {
    setItems((prev) => prev.filter((i) => i.cartKey !== cartKey))
  }, [])

  const updateQty = useCallback((cartKey, delta) => {
    setItems((prev) =>
      prev
        .map((i) =>
          i.cartKey === cartKey ? { ...i, qty: Math.max(0, i.qty + delta) } : i
        )
        .filter((i) => i.qty > 0)
    )
  }, [])

  const clearCart = useCallback(() => setItems([]), [])

  const count = items.reduce((sum, i) => sum + i.qty, 0)
  const subtotal = items.reduce((sum, i) => sum + i.unitPrice * i.qty, 0)

  return (
    <CartContext.Provider value={{
      items, count, subtotal,
      addItem, removeItem, updateQty, clearCart,
      isCartOpen, setIsCartOpen, cartBump,
    }}>
      {children}
    </CartContext.Provider>
  )
}

export const useCart = () => useContext(CartContext)
