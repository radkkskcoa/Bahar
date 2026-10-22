import {
  createContext, useCallback, useContext, useEffect, useMemo, useRef, useState,
} from 'react';
import { catalog as catalogApi } from '../lib/api.js';

const CartContext = createContext(null);
const CART_KEY = 'ch_cart_v2';
const FULFILLMENT_KEY = 'ch_fulfillment';

function lineKey(productId, options) {
  const optionIds = options.map((o) => o.id).sort((a, b) => a - b).join(',');
  return `${productId}|${optionIds}`;
}

function readCart() {
  try {
    const parsed = JSON.parse(localStorage.getItem(CART_KEY) || '[]');
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function CartProvider({ children }) {
  const [items, setItems] = useState(readCart);
  const [fulfillment, setFulfillment] = useState(() => localStorage.getItem(FULFILLMENT_KEY) || 'delivery');
  const [couponCode, setCouponCode] = useState('');
  const [totals, setTotals] = useState(null);
  const [pricing, setPricing] = useState({ loading: false, error: null });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const requestId = useRef(0);

  useEffect(() => {
    localStorage.setItem(CART_KEY, JSON.stringify(items));
  }, [items]);

  useEffect(() => {
    localStorage.setItem(FULFILLMENT_KEY, fulfillment);
  }, [fulfillment]);

  const payload = useMemo(
    () =>
      items.map((item) => ({
        product_id: item.product_id,
        quantity: item.quantity,
        option_item_ids: item.options.map((o) => o.id),
      })),
    [items],
  );

  // Totals always come from the server so the customer sees exactly what will be charged.
  useEffect(() => {
    if (payload.length === 0) {
      setTotals(null);
      setPricing({ loading: false, error: null });
      return undefined;
    }
    const id = ++requestId.current;
    setPricing((current) => ({ ...current, loading: true }));
    const timer = setTimeout(async () => {
      try {
        const priced = await catalogApi.price({ items: payload, fulfillment, coupon_code: couponCode || null });
        if (id !== requestId.current) return;
        setTotals(priced);
        setPricing({ loading: false, error: null });
      } catch (err) {
        if (id !== requestId.current) return;
        setTotals(null);
        setPricing({ loading: false, error: err.message });
      }
    }, 220);
    return () => clearTimeout(timer);
  }, [payload, fulfillment, couponCode]);

  const add = useCallback((product, { quantity = 1, options = [], notes = null } = {}) => {
    const key = lineKey(product.id, options);
    setItems((current) => {
      const existing = current.find((item) => item.key === key);
      if (existing) {
        return current.map((item) =>
          item.key === key ? { ...item, quantity: Math.min(item.quantity + quantity, 20) } : item,
        );
      }
      return [
        ...current,
        {
          key,
          product_id: product.id,
          slug: product.slug,
          name: product.name,
          image_url: product.image_url,
          base_price_cents: product.price_cents,
          quantity,
          notes,
          options: options.map((o) => ({ id: o.id, name: o.name, price_cents: o.price_cents, group: o.group_name ?? '' })),
        },
      ];
    });
  }, []);

  const setQuantity = useCallback((key, quantity) => {
    setItems((current) =>
      quantity <= 0
        ? current.filter((item) => item.key !== key)
        : current.map((item) => (item.key === key ? { ...item, quantity: Math.min(quantity, 20) } : item)),
    );
  }, []);

  const remove = useCallback((key) => {
    setItems((current) => current.filter((item) => item.key !== key));
  }, []);

  const clear = useCallback(() => {
    setItems([]);
    setCouponCode('');
    setTotals(null);
  }, []);

  const value = useMemo(() => {
    const localSubtotal = items.reduce(
      (sum, item) =>
        sum + (item.base_price_cents + item.options.reduce((s, o) => s + o.price_cents, 0)) * item.quantity,
      0,
    );
    return {
      items,
      count: items.reduce((sum, item) => sum + item.quantity, 0),
      add,
      setQuantity,
      remove,
      clear,
      subtotalEstimate: localSubtotal,
      totals,
      pricing,
      couponCode,
      setCouponCode,
      coupon: totals?.coupon ?? null,
      couponError: totals?.coupon_error ?? null,
      fulfillment,
      setFulfillment,
      payload,
      drawerOpen,
      openDrawer: () => setDrawerOpen(true),
      closeDrawer: () => setDrawerOpen(false),
    };
  }, [items, add, setQuantity, remove, clear, totals, pricing, couponCode, fulfillment, payload, drawerOpen]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used inside CartProvider');
  return ctx;
}
