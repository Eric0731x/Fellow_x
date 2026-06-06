import type { ReactNode } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import { useUserStore } from '../stores/userStore';

interface Props {
  children: ReactNode;
}

/** Launcher route — only LAUNCHER role allowed (Admin does NOT inherit) */
export function LauncherRoute({ children }: Props) {
  const { isAuthenticated } = useAuthStore();
  const { user } = useUserStore();

  if (!isAuthenticated || !user || user.role !== 'LAUNCHER') {
    return <Navigate to="/me" replace />;
  }

  return <>{children}</>;
}
