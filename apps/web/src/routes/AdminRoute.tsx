import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

interface Props {
  children: ReactNode;
}

/** Admin route — only ADMIN role allowed */
export function AdminRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { user } = useUserStore();

  if (!isAuthenticated || !user || user.role !== 'ADMIN') {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
}
