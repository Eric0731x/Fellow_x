import { theme } from 'antd';

// Suzhi design tokens → AntD theme mapping
export const suzhiTheme = {
  token: {
    colorPrimary: '#ea580c',
    colorBgContainer: '#ffffff',
    colorBgLayout: '#fafaf9',
    colorText: '#0a0a0a',
    colorTextSecondary: '#525252',
    colorBorder: 'rgba(10,10,10,.07)',
    borderRadius: 10,
    fontFamily: "'Inter', 'PingFang SC', system-ui, sans-serif",
  },
  algorithm: theme.defaultAlgorithm,
};

export const suzhiDarkTheme = {
  ...suzhiTheme,
  token: {
    ...suzhiTheme.token,
    colorBgContainer: '#1a1a1a',
    colorBgLayout: '#0a0a0a',
    colorText: '#fafafa',
    colorTextSecondary: '#a3a3a3',
    colorBorder: 'rgba(255,255,255,.07)',
  },
  algorithm: theme.darkAlgorithm,
};
