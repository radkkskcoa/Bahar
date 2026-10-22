import { createContext, useCallback, useContext, useMemo, useState } from 'react';

const DestinationContext = createContext(null);
const KEY = 'ch_destination';

const EMPTY = { label: 'Home', line1: '', line2: '', city: '', postal_code: '', instructions: '' };

/** Where the customer wants the food delivered — shared by the header and checkout. */
export function DestinationProvider({ children }) {
  const [destination, setDestinationState] = useState(() => {
    try {
      const stored = JSON.parse(localStorage.getItem(KEY) || 'null');
      return stored ? { ...EMPTY, ...stored } : EMPTY;
    } catch {
      return EMPTY;
    }
  });

  const setDestination = useCallback((next) => {
    setDestinationState((current) => {
      const merged = { ...current, ...next };
      localStorage.setItem(KEY, JSON.stringify(merged));
      return merged;
    });
  }, []);

  const value = useMemo(
    () => ({ destination, setDestination, isComplete: Boolean(destination.line1 && destination.city) }),
    [destination, setDestination],
  );

  return <DestinationContext.Provider value={value}>{children}</DestinationContext.Provider>;
}

export function useDestination() {
  const ctx = useContext(DestinationContext);
  if (!ctx) throw new Error('useDestination must be used inside DestinationProvider');
  return ctx;
}
