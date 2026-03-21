import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { toast } from 'sonner';

// ─── Types ───────────────────────────────────────────────────────────────────

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
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  // Whether the user is authenticated but not yet enrolled in any store
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
  enrollInStore: (storeId: string) => void;
  logout: () => void;
}

// ─── Constants ───────────────────────────────────────────────────────────────

const TOKEN_KEY = 'kosh_pos_token';
const USER_KEY = 'kosh_pos_user';
const STORE_KEY = 'kosh_pos_store';

const API_BASE = import.meta.env.VITE_API_URL ?? 'http://localhost:4000';

// ─── Context ──────────────────────────────────────────────────────────────────

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [store, setStore] = useState<AuthStore | null>(null);
  const [token, setToken] = useState<string | null>(null);

  // Hydrate from localStorage on mount
  useEffect(() => {
    try {
      const savedToken = localStorage.getItem(TOKEN_KEY);
      const savedUser = localStorage.getItem(USER_KEY);
      const savedStore = localStorage.getItem(STORE_KEY);

      if (savedToken && savedUser) {
        setToken(savedToken);
        setUser(JSON.parse(savedUser));
        if (savedStore) {
          setStore(JSON.parse(savedStore));
        }
      }
    } catch (e) {
      console.error('Failed to hydrate auth state', e);
      localStorage.removeItem(TOKEN_KEY);
      localStorage.removeItem(USER_KEY);
      localStorage.removeItem(STORE_KEY);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const persistSession = useCallback((
    newToken: string,
    newUser: AuthUser,
    newStore: AuthStore | null
  ) => {
    setToken(newToken);
    setUser(newUser);
    setStore(newStore);
    localStorage.setItem(TOKEN_KEY, newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    if (newStore) {
      localStorage.setItem(STORE_KEY, JSON.stringify(newStore));
    } else {
      localStorage.removeItem(STORE_KEY);
    }
  }, []);

  const loginWithGoogle = useCallback(async (profile: GoogleProfile) => {
    setIsLoading(true);
    try {
      // First try to sign in (existing user)
      let response = await fetch(`${API_BASE}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: profile.email, googleId: profile.googleId }),
      });

      // If user not found, register them
      if (response.status === 401) {
        response = await fetch(`${API_BASE}/auth/register`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: profile.email,
            googleId: profile.googleId,
            username: profile.username,
            image: profile.image,
          }),
        });
      }

      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err?.message ?? 'Authentication failed');
      }

      const data = await response.json();
      const newUser: AuthUser = data.user;
      const newToken: string = data.token;

      // The backend returns store info for store creators. Cashiers won't have it.
      // We treat "no store" as needing onboarding.
      const newStore: AuthStore | null = data.store?.storeId
        ? { storeId: data.store.storeId, storeName: data.store.storeName }
        : null;

      persistSession(newToken, newUser, newStore);
    } catch (err: any) {
      toast.error(err.message ?? 'Login failed. Please try again.');
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, [persistSession]);

  const enrollInStore = useCallback((storeId: string) => {
    // Store enrollment is managed at the API level by an admin adding you.
    // On the POS side, we just save the storeId the cashier connects to.
    const newStore: AuthStore = {
      storeId,
      storeName: `Store ${storeId.slice(0, 6)}`,
    };
    setStore(newStore);
    localStorage.setItem(STORE_KEY, JSON.stringify(newStore));
    toast.success('Successfully connected to store!');
  }, []);

  const logout = useCallback(() => {
    setUser(null);
    setStore(null);
    setToken(null);
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(STORE_KEY);
    toast.success('Logged out successfully');
  }, []);

  const isAuthenticated = !!user && !!token;
  const needsOnboarding = isAuthenticated && !store;

  return (
    <AuthContext.Provider value={{
      user,
      store,
      token,
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

// ─── Hook ─────────────────────────────────────────────────────────────────────

export const useAuth = (): AuthContextValue => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
};
