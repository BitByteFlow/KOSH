import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Full-page spinner shown during initial auth hydration
const LoadingScreen: React.FC = () => (
  <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center gap-4">
    <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">Loading...</p>
  </div>
);

/**
 * ProtectedRoute — requires the user to be authenticated AND enrolled in a store.
 * Redirects to /login if not authenticated, or /get-started if no store selected.
 */
export const ProtectedRoute: React.FC = () => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (needsOnboarding) return <Navigate to="/get-started" replace />;

  return <Outlet />;
};

/**
 * PublicRoute — accessible only when NOT authenticated.
 * Authenticated users are redirected away.
 */
export const PublicRoute: React.FC = () => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (isAuthenticated && !needsOnboarding) return <Navigate to="/" replace />;
  if (isAuthenticated && needsOnboarding) return <Navigate to="/get-started" replace />;

  return <Outlet />;
};

/**
 * OnboardingRoute — accessible only when authenticated but not yet enrolled.
 */
export const OnboardingRoute: React.FC = () => {
  const { isAuthenticated, isLoading, needsOnboarding } = useAuth();

  if (isLoading) return <LoadingScreen />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (isAuthenticated && !needsOnboarding) return <Navigate to="/" replace />;

  return <Outlet />;
};
