import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import LoadingScreen from './LoadingScreen';

interface AdminGuardProps {
  children: React.ReactNode;
}

function AdminGuard({ children }: AdminGuardProps) {
  const { profile, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return <LoadingScreen />;
  }

  if (profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  // Don't redirect to onboarding for admin routes
  return <>{children}</>;
}

export default AdminGuard;