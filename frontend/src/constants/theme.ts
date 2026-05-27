export const THEME = {
  colors: {
    background: '#141417', // Very dark grey, not pure black
    foreground: '#fafafa', // Zinc 50
    surface: {
      DEFAULT: '#1c1c20', // Noticeably lighter than background
      hover: '#25252b', // Hover state
      active: '#2d2d34', // Active state
    },
    primary: {
      DEFAULT: '#6366f1', // Electric Indigo accent
      hover: '#4f46e5', // Darker Indigo
      foreground: '#ffffff', // White text on primary
    },
    secondary: {
      DEFAULT: '#25252b',
      hover: '#2d2d34',
    },
    border: {
      DEFAULT: 'rgba(255, 255, 255, 0.15)',
      hover: 'rgba(255, 255, 255, 0.25)',
    },
    status: {
      success: '#22c55e',
      warning: '#eab308',
      danger: '#ef4444',
      info: '#3b82f6',
    },
  },
  typography: {
    fontFamily: {
      sans: 'Inter, sans-serif',
      heading: 'Geist, sans-serif',
      mono: 'JetBrains Mono, monospace',
    },
  },
  spacing: {
    xs: '0.25rem',
    sm: '0.5rem',
    md: '1rem',
    lg: '1.5rem',
    xl: '2rem',
    '2xl': '3rem',
  },
  radius: {
    sm: '0.25rem', // 4px
    md: '0.375rem', // 6px
    lg: '0.5rem', // 8px
    xl: '0.75rem', // 12px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.5)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.5), 0 2px 4px -1px rgba(0, 0, 0, 0.3)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.5), 0 4px 6px -2px rgba(0, 0, 0, 0.3)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 10px 10px -5px rgba(0, 0, 0, 0.3)',
  },
  animations: {
    transition: 'all 0.2s ease-out',
    fast: 'all 0.1s ease-out',
    slow: 'all 0.4s ease-out',
  },
};
