import { create } from 'zustand';
import type { User } from '@fellowx/shared';
import { getMeApi } from '../api/user';

interface UserState {
  user: (User & { level?: unknown }) | null;
  isLoading: boolean;
  fetchUser: () => Promise<void>;
  setUser: (user: User & { level?: unknown }) => void;
  clearUser: () => void;
}

export const useUserStore = create<UserState>()((set) => ({
  user: null,
  isLoading: false,

  fetchUser: async () => {
    set({ isLoading: true });
    try {
      const user = await getMeApi();
      set({ user, isLoading: false });
    } catch {
      set({ user: null, isLoading: false });
    }
  },

  setUser: (user) => set({ user }),
  clearUser: () => set({ user: null }),
}));
