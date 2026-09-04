import React from 'react';
import { Navigate, useLocation, Outlet } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import LoadingState from '../common/LoadingState';

export const OnboardingGate = () => {
  const { user, isAuthenticated, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--bg-canvas)]">
        <LoadingState message="Checking profile status..." />
      </div>
    );
  }

  // If authenticated but onboarding is incomplete, and trying to access a protected non-onboarding route
  if (isAuthenticated && user && !user.onboardingCompleted && !location.pathname.startsWith('/onboarding')) {
    return <Navigate to="/onboarding/skills" replace />;
  }

  // If onboarding is already completed, allow access to /onboarding/skills to manage skills, but redirect away from other onboarding steps
  if (isAuthenticated && user && user.onboardingCompleted && location.pathname.startsWith('/onboarding') && location.pathname !== '/onboarding/complete' && location.pathname !== '/onboarding/skills') {
    return <Navigate to="/dashboard" replace />;
  }

  return <Outlet />;
};

export default OnboardingGate;
