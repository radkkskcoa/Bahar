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

/**
 * Steps shown in the order tracker. Pickup swaps the courier step for a counter handover.
 * Pass the `t` helper to get translated labels; without it the keys come back untranslated,
 * which is all `statusIndex` needs.
 */
export function orderSteps(fulfillment = 'delivery', t = (key) => key) {
  const steps = [
    { key: 'confirmed', label: t('step.confirmed'), icon: 'check', hint: t('step.hint.confirmed') },
    { key: 'preparing', label: t('step.preparing'), icon: 'chef', hint: t('step.hint.preparing') },
  ];
  if (fulfillment === 'pickup') {
    steps.push({ key: 'ready', label: t('step.ready'), icon: 'bag', hint: t('step.hint.ready') });
  } else {
    steps.push({ key: 'on_the_way', label: t('step.on_the_way'), icon: 'scooter', hint: t('step.hint.on_the_way') });
  }
  steps.push({
    key: 'delivered',
    label: fulfillment === 'pickup' ? t('step.collected') : t('step.delivered'),
    icon: 'home',
    hint: t('step.hint.delivered'),
  });
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

export function etaLabel(minutes, locale = 'en-US', t) {
  const range = Array.isArray(minutes) && minutes.length > 0 ? minutes : [18, 22];
  const [min, max] = range.length > 1 ? range : [range[0], range[0]];
  const unit = t ? t('common.minutesShort') : 'min';
  try {
    const fmt = new Intl.NumberFormat(locale);
    return `${fmt.format(min)}–${fmt.format(max)} ${unit}`;
  } catch {
    return `${min}–${max} ${unit}`;
  }
}

export function percent(part, whole) {
  if (!whole) return 0;
  return Math.max(0, Math.min(100, Math.round((part / whole) * 100)));
}
