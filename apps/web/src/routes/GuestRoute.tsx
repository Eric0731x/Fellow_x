import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';

interface Props {
  children: ReactNode;
}

/** Public route — redirects authenticated users to /me */
export function GuestRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  if (isAuthenticated) return <Navigate to="/me" replace />;
  return <>{children}</>;
}
