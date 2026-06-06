import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { logoutApi } from '../api/auth';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  login: (tokens: { accessToken: string; refreshToken: string }) => void;
  logout: () => void;
  refreshAccessToken: (newToken: string) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      accessToken: null,
      refreshToken: null,
      isAuthenticated: false,

      login: (tokens) =>
        set({
          accessToken: tokens.accessToken,
          refreshToken: tokens.refreshToken,
          isAuthenticated: true,
        }),

      logout: () => {
        logoutApi().catch(() => {});
        set({
          accessToken: null,
          refreshToken: null,
          isAuthenticated: false,
        });
      },

      refreshAccessToken: (newToken) => set({ accessToken: newToken }),
    }),
    { name: 'fellowx-auth' },
  ),
);
