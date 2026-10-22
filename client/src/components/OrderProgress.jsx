import { Check, ChefHat, Home, ShoppingBag, Timer } from 'lucide-react';
import { orderSteps, statusIndex, formatDate } from '../lib/format.js';
import { useI18n } from '../context/I18nContext.jsx';

const ICONS = { check: Check, chef: ChefHat, bag: ShoppingBag, scooter: Timer, home: Home };

const TIMESTAMP_FIELD = {
  confirmed: 'confirmed_at',
  preparing: 'preparing_at',
  ready: 'ready_at',
  on_the_way: 'on_the_way_at',
  delivered: 'delivered_at',
};

/** Status-based progress. Steps are real order states — no simulated courier GPS. */
export default function OrderProgress({ status, fulfillment = 'delivery', order = {} }) {
  const { locale } = useI18n();
  const steps = orderSteps(fulfillment);
  const current = statusIndex(status, fulfillment);
  const cancelled = status === 'cancelled';

  return (
    <ol className="flex flex-col gap-4 sm:flex-row sm:gap-2" aria-label="Order progress">
      {steps.map((step, index) => {
        const done = !cancelled && index < current;
        const active = !cancelled && index === current;
        const Icon = ICONS[step.icon] ?? Check;
        const stamp = order[TIMESTAMP_FIELD[step.key]];

        return (
          <li key={step.key} className="relative flex flex-1 items-start gap-3 sm:flex-col sm:items-center sm:text-center">
            {index < steps.length - 1 ? (
              <span
                className={`absolute left-[19px] top-10 h-[calc(100%-8px)] w-0.5 sm:left-1/2 sm:top-5 sm:h-0.5 sm:w-full ${
                  done ? 'bg-lime' : 'bg-line'
                }`}
                aria-hidden="true"
              />
            ) : null}

            <span
              className={`relative z-10 grid h-10 w-10 shrink-0 place-items-center rounded-full border-2 transition
                ${done ? 'border-lime bg-lime text-base' : ''}
                ${active ? 'border-brand bg-brand text-white shadow-glow' : ''}
                ${!done && !active ? 'border-line bg-elevate text-ink-muted' : ''}`}
            >
              {done ? <Check className="h-5 w-5" aria-hidden="true" /> : <Icon className="h-5 w-5" aria-hidden="true" />}
            </span>

            <span className="sm:mt-2">
              <span className={`block text-sm font-bold ${active ? 'text-brand' : done ? 'text-lime' : 'text-ink-muted'}`}>
                {step.label}
              </span>
              <span className="block text-[11px] text-ink-muted">{step.hint}</span>
              {stamp ? (
                <span className="block text-[11px] text-ink-muted">{formatDate(stamp, locale)}</span>
              ) : null}
            </span>
            {active ? <span className="sr-only">Current status</span> : null}
          </li>
        );
      })}
    </ol>
  );
}
