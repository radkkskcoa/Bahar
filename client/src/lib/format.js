export function formatMoney(cents, currency = {}, locale = 'en-US') {
  const value = (Number(cents) || 0) / 100;
  const code = currency.code || 'USD';
  try {
    return new Intl.NumberFormat(locale, { style: 'currency', currency: code }).format(value);
  } catch {
    return `${currency.symbol || '$'}${value.toFixed(2)}`;
  }
}

export function formatNumber(value, locale = 'en-US') {
  try {
    return new Intl.NumberFormat(locale).format(Number(value) || 0);
  } catch {
    return String(value ?? 0);
  }
}

export function formatDate(iso, locale = 'en-US', withTime = true) {
  if (!iso) return '';
  try {
    return new Intl.DateTimeFormat(locale, {
      dateStyle: 'medium',
      ...(withTime ? { timeStyle: 'short' } : {}),
    }).format(new Date(iso));
  } catch {
    return new Date(iso).toLocaleString();
  }
}

/** Steps shown in the order tracker. Pickup swaps the courier step for a counter handover. */
export function orderSteps(fulfillment = 'delivery') {
  const steps = [
    { key: 'confirmed', label: 'Confirmed', icon: 'check', hint: 'We received your order' },
    { key: 'preparing', label: 'Preparing', icon: 'chef', hint: 'Our chefs are cooking' },
  ];
  if (fulfillment === 'pickup') {
    steps.push({ key: 'ready', label: 'Ready', icon: 'bag', hint: 'Waiting at the counter' });
  } else {
    steps.push({ key: 'on_the_way', label: 'On the way', icon: 'scooter', hint: 'Rider is heading to you' });
  }
  steps.push({ key: 'delivered', label: fulfillment === 'pickup' ? 'Collected' : 'Delivered', icon: 'home', hint: 'Enjoy your food' });
  return steps;
}

export function statusIndex(status, fulfillment = 'delivery') {
  const steps = orderSteps(fulfillment);
  if (status === 'cancelled') return -1;
  const index = steps.findIndex((s) => s.key === status);
  if (index >= 0) return index;
  // "ready" on a delivery order reads as the moment before dispatch.
  if (status === 'ready') return 1;
  return 0;
}

export function etaLabel(minutes, locale = 'en-US') {
  if (!Array.isArray(minutes) || minutes.length === 0) return '18–22 min';
  const [min, max] = minutes.length > 1 ? minutes : [minutes[0], minutes[0]];
  try {
    const fmt = new Intl.NumberFormat(locale);
    return `${fmt.format(min)}–${fmt.format(max)} min`;
  } catch {
    return `${min}–${max} min`;
  }
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}
