import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import { auth as authApi } from '../lib/api.js';
import { useCatalog } from './CatalogContext.jsx';
import { useToast } from './ToastContext.jsx';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const { reload, favorites, setFavorites } = useCatalog();
  const { toast } = useToast();

  const refreshNotifications = useCallback(async () => {
    try {
      setNotifications(await authApi.notifications());
    } catch {
      setNotifications([]);
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const { user: current } = await authApi.me();
        if (cancelled) return;
        setUser(current);
        if (current) await refreshNotifications();
      } catch {
        if (!cancelled) setUser(null);
      } finally {
        if (!cancelled) setReady(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [refreshNotifications]);

  const login = useCallback(
    async (email, password) => {
      const { user: next } = await authApi.login(email, password);
      setUser(next);
      await Promise.all([reload(), refreshNotifications()]);
      toast({ title: `Welcome back, ${next.name.split(' ')[0]}`, tone: 'success' });
      return next;
    },
    [reload, refreshNotifications, toast],
  );

  const signup = useCallback(
    async (payload) => {
      const { user: next } = await authApi.signup(payload);
      setUser(next);
      await Promise.all([reload(), refreshNotifications()]);
      toast({ title: 'Account created', body: 'Welcome to Crunch House.', tone: 'success' });
      return next;
    },
    [reload, refreshNotifications, toast],
  );

  const logout = useCallback(async () => {
    await authApi.logout();
    setUser(null);
    setNotifications([]);
    await reload();
    toast({ title: 'Signed out', tone: 'info' });
  }, [reload, toast]);

  const updateProfile = useCallback(async (payload) => {
    const { user: next } = await authApi.updateProfile(payload);
    setUser(next);
    return next;
  }, []);

  const toggleFavorite = useCallback(
    async (productId) => {
      if (!user) {
        toast({
          title: 'Sign in to save favourites',
          body: 'Your saved dishes follow you across devices.',
          tone: 'info',
        });
        return false;
      }
      const isFavorite = favorites.includes(productId);
      setFavorites((current) =>
        isFavorite ? current.filter((id) => id !== productId) : [...current, productId],
      );
      try {
        const result = await authApi.toggleFavorite(productId);
        toast({ title: result.favorite ? 'Saved to favourites' : 'Removed from favourites', tone: 'success' });
        return result.favorite;
      } catch (err) {
        setFavorites((current) =>
          isFavorite ? [...current, productId] : current.filter((id) => id !== productId),
        );
        toast({ title: 'Could not update favourites', body: err.message, tone: 'error' });
        return isFavorite;
      }
    },
    [user, favorites, setFavorites, toast],
  );

  const markNotificationsRead = useCallback(async () => {
    setNotifications((current) => current.map((n) => ({ ...n, read_at: n.read_at ?? new Date().toISOString() })));
    try {
      await authApi.markNotificationsRead();
    } catch {
      /* non-critical */
    }
  }, []);

  const value = useMemo(
    () => ({
      user,
      ready,
      notifications,
      unreadCount: notifications.filter((n) => !n.read_at).length,
      isStaff: Boolean(user && ['admin', 'staff'].includes(user.role)),
      isAdmin: Boolean(user && user.role === 'admin'),
      login,
      signup,
      logout,
      updateProfile,
      toggleFavorite,
      favorites,
      refreshNotifications,
      markNotificationsRead,
    }),
    [
      user, ready, notifications, login, signup, logout, updateProfile, toggleFavorite, favorites,
      refreshNotifications, markNotificationsRead,
    ],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}
