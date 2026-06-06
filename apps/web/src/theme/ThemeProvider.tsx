import { ConfigProvider } from 'antd';
import type { ReactNode } from 'react';
import { useThemeStore } from '../stores/themeStore';
import { suzhiTheme, suzhiDarkTheme } from './tokens';

interface Props {
  children: ReactNode;
}

export function ThemeProvider({ children }: Props) {
  const themeMode = useThemeStore((s) => s.theme);
  const config = themeMode === 'dark' ? suzhiDarkTheme : suzhiTheme;

  return <ConfigProvider theme={config}>{children}</ConfigProvider>;
}
