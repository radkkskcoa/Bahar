import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const ToastContext = createContext(null);

let nextId = 1;

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([]);

  const dismiss = useCallback((id) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback(
    (toast) => {
      const id = nextId++;
      const entry = {
        id,
        tone: toast.tone ?? 'info',
        title: toast.title,
        body: toast.body ?? '',
        action: toast.action ?? null,
      };
      setToasts((current) => [...current.slice(-3), entry]);
      const ttl = toast.duration ?? (toast.action ? 8000 : 4000);
      if (ttl > 0) setTimeout(() => dismiss(id), ttl);
      return id;
    },
    [dismiss],
  );

  const value = useMemo(
    () => ({
      toasts,
      dismiss,
      toast: push,
      success: (title, body) => push({ title, body, tone: 'success' }),
      error: (title, body) => push({ title, body, tone: 'error' }),
      info: (title, body) => push({ title, body, tone: 'info' }),
    }),
    [toasts, dismiss, push],
  );

  return <ToastContext.Provider value={value}>{children}</ToastContext.Provider>;
}

export function useToast() {
  const ctx = useContext(ToastContext);
  if (!ctx) throw new Error('useToast must be used inside ToastProvider');
  return ctx;
}
