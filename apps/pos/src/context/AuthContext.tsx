import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

export interface AuthUser {
  id: string;
  email: string;
  username: string;
}

export interface AuthStore {
  storeId: string;
  storeName: string;
}

export interface AuthState {
  user: AuthUser | null;
  store: AuthStore | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  needsOnboarding: boolean;
}

interface GoogleProfile {
  googleId: string;
  email: string;
  username: string;
  image: string;
}

interface AuthContextValue extends AuthState {
  loginWithGoogle: (profile: GoogleProfile) => Promise<void>;
  enrollInStore: (storeId: string, storeName: string) => void;
  logout: () => void;
}

const USER_KEY = 'kosh_pos_user';
const STORE_KEY = 'kosh_pos_store';
const LEGACY_TOKEN_KEY = 'kosh_pos_token';

const API_BASE = import.meta.env.VITE_API_URL;

const AuthContext = createContext<AuthContextValue | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [store, setStore] = useState<AuthStore | null>(null);

  useEffect(() => {
    try {
      // Purge any legacy token from localStorage
      localStorage.removeItem(LEGACY_TOKEN_KEY);
      
      const savedUser = localStorage.getItem(USER_KEY);
      const savedStore = localStorage.getItem(STORE_KEY);

      if (savedUser) {
        setUser(JSON.parse(savedUser));
        if (savedStore) {
          setStore(JSON.parse(savedStore));
        }
      }
    } catch (e) {
      toast.error('Failed to load session. Please log in again.');
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(STORE_KEY);
      localStorage.removeItem(LEGACY_TOKEN_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((
    newUser: AuthUser,
    newStore: AuthStore | null
  ) => {
    setUser(newUser);
    setStore(newStore);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    // Ensure token is never stored
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    if (newStore) {
      localStorage.setItem(STORE_KEY, JSON.stringify(newStore));
    } else {
      localStorage.removeItem(STORE_KEY);
    }
  }, []);

  const loginWithGoogle = useCallback(async (profile: GoogleProfile) => {
    setIsLoading(true);
    try {
      let response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, googleId: profile.googleId, isCashier: true }),
        credentials: 'include',
      });

      if (response.status === 401) {
        response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile.email,
            googleId: profile.googleId,
            username: profile.username,
            image: profile.image,
            isCashier: true,
          }),
          credentials: 'include',
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? 'Authentication failed');
      }

      const data = await response.json();
      const newUser: AuthUser = data.user;

      const newStore: AuthStore | null = data.store?.storeId
        ? { storeId: data.store.storeId, storeName: data.store.storeName }
        : null;

      persistSession(newUser, newStore);
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const enrollInStore = useCallback((storeId: string, storeName: string) => {
    const newStore: AuthStore = {
      storeId,
      storeName,
    };
    setStore(newStore);
    localStorage.setItem(STORE_KEY, JSON.stringify(newStore));
    // toast.success('Successfully connected to store!');
  }, []);

  const logout = useCallback(async () => {
    try {
      await fetch(`${API_BASE}/auth/logout`, { method: 'POST', credentials: 'include' });
    } catch (e) {
      console.error('Logout error:', e);
    }
    setUser(null);
    setStore(null);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORE_KEY);
    localStorage.removeItem(LEGACY_TOKEN_KEY);
    toast.success('Logged out successfully');
  }, []);

  const isAuthenticated = !!user;
  const needsOnboarding = isAuthenticated && !store;

  return (
    <AuthContext.Provider value={{
      user,
      store,
      isAuthenticated,
      isLoading,
      needsOnboarding,
      loginWithGoogle,
      enrollInStore,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
