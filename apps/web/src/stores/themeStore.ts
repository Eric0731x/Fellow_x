import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface ThemeState {
  theme: 'light' | 'dark';
  accent: string;
  toggleTheme: () => void;
  setAccent: (color: string) => void;
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set) => ({
      theme: 'light',
      accent: '#ea580c',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'light' ? 'dark' : 'light' })),
      setAccent: (color) => set({ accent: color }),
    }),
    { name: 'fellowx-theme' },
  ),
);
