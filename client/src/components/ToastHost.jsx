import { AlertTriangle, CheckCircle2, Info, X } from 'lucide-react';
import { useToast } from '../context/ToastContext.jsx';

const TONES = {
  success: { icon: CheckCircle2, className: 'border-success/40 text-success' },
  error: { icon: AlertTriangle, className: 'border-danger/40 text-danger' },
  info: { icon: Info, className: 'border-line text-lime' },
};

export default function ToastHost() {
  const { toasts, dismiss } = useToast();
  if (!toasts.length) return null;

  return (
    <div
      className="pointer-events-none fixed inset-x-3 bottom-24 z-[95] flex flex-col items-center gap-2 sm:inset-x-auto sm:bottom-6 sm:end-6 sm:items-end"
      aria-live="polite"
      aria-atomic="false"
    >
      {toasts.map((toast) => {
        const tone = TONES[toast.tone] ?? TONES.info;
        const Icon = tone.icon;
        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex w-full max-w-sm items-start gap-3 rounded-2xl border bg-soft/95 px-4 py-3 shadow-card backdrop-blur animate-fade-up ${tone.className}`}
            role={toast.tone === 'error' ? 'alert' : 'status'}
          >
            <Icon className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-bold text-ink">{toast.title}</p>
              {toast.body ? <p className="mt-0.5 text-xs text-ink-muted">{toast.body}</p> : null}
              {toast.action ? (
                <button type="button" className="mt-2 text-xs font-semibold text-brand" onClick={toast.action.onClick}>
                  {toast.action.label}
                </button>
              ) : null}
            </div>
            <button
              type="button"
              onClick={() => dismiss(toast.id)}
              className="rounded-lg p-1 text-ink-muted transition hover:text-white"
              aria-label="Dismiss notification"
            >
              <X className="h-3.5 w-3.5" aria-hidden="true" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
