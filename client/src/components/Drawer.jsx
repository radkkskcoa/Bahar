import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { X } from 'lucide-react';

/**
 * Side sheet (desktop) / bottom sheet (mobile). Same accessibility contract as Modal.
 */
export default function Drawer({ open, onClose, title, children, footer, side = 'right' }) {
  const panelRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;
    const onKeyDown = (event) => {
      if (event.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', onKeyDown);
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    panelRef.current?.focus();
    return () => {
      document.removeEventListener('keydown', onKeyDown);
      document.body.style.overflow = previousOverflow;
    };
  }, [open, onClose]);

  if (!open) return null;

  const position =
    side === 'right'
      ? 'sm:inset-y-0 sm:right-0 sm:h-full sm:max-w-md sm:rounded-l-3xl sm:rounded-tr-none'
      : 'sm:items-center sm:max-w-lg sm:rounded-3xl';

  return createPortal(
    <div className={`fixed inset-0 z-[85] flex ${side === 'right' ? 'justify-end' : 'items-end justify-center'} sm:p-0`}>
      <button
        type="button"
        aria-label="Close panel"
        tabIndex={-1}
        className="absolute inset-0 cursor-default bg-black/75 animate-fade-in"
        onClick={onClose}
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label={typeof title === 'string' ? title : undefined}
        tabIndex={-1}
        className={`relative flex max-h-[92vh] w-full flex-col overflow-hidden rounded-t-3xl border border-line bg-soft
                    shadow-card animate-fade-up ${position}`}
      >
        <div className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
          <h2 className="text-lg font-extrabold">{title}</h2>
          <button type="button" className="icon-btn h-9 w-9" onClick={onClose} aria-label="Close">
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer ? <div className="border-t border-line bg-base/60 px-5 py-4">{footer}</div> : null}
      </div>
    </div>,
    document.body,
  );
}
