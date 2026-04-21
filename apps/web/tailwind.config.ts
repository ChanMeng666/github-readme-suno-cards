import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: 'class',
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--background)',
        foreground: 'var(--foreground)',
        muted: 'var(--muted)',
        'muted-strong': 'var(--muted-strong)',
        'surface-1': 'var(--surface-1)',
        'surface-2': 'var(--surface-2)',
        'surface-3': 'var(--surface-3)',
        'surface-4': 'var(--surface-4)',
        surface: 'var(--surface-1)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        hairline: 'var(--hairline)',
        accent: 'var(--accent)',
        success: 'var(--success)',
        warning: 'var(--warning)',
        destructive: 'var(--destructive)',
      },
      fontFamily: {
        sans: [
          'var(--font-sans-var)',
          '"Plus Jakarta Sans"',
          '-apple-system',
          'BlinkMacSystemFont',
          '"Segoe UI"',
          '"Helvetica Neue"',
          '"PingFang SC"',
          '"Microsoft YaHei"',
          'sans-serif',
        ],
        display: ['var(--font-display-var)', '"Fraunces"', '"Times New Roman"', 'serif'],
        mono: [
          'var(--font-mono-var)',
          '"JetBrains Mono"',
          '"SF Mono"',
          'ui-monospace',
          'Menlo',
          'Monaco',
          'Consolas',
          'monospace',
        ],
      },
      borderRadius: {
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
      },
      keyframes: {
        'fade-rise': {
          '0%': { opacity: '0', transform: 'translateY(18px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        breathe: {
          '0%,100%': { transform: 'translate(-50%,-50%) scale(1)', opacity: '0.55' },
          '50%': { transform: 'translate(-50%,-50%) scale(1.14)', opacity: '0.95' },
        },
        'scroll-marquee': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-50%)' },
        },
        'pulse-scale': {
          '0%,100%': { transform: 'scale(1)', opacity: '0.75' },
          '20%,50%': { transform: 'scale(1.18)', opacity: '1' },
          '35%': { transform: 'scale(1)', opacity: '0.9' },
        },
        shimmer: {
          '0%,100%': { opacity: '0.55' },
          '50%': { opacity: '1' },
        },
      },
      animation: {
        'fade-rise': 'fade-rise 0.9s cubic-bezier(0.16, 1, 0.3, 1) both',
        breathe: 'breathe 9s ease-in-out infinite',
        'scroll-marquee': 'scroll-marquee 45s linear infinite',
        'pulse-scale': 'pulse-scale 2.4s cubic-bezier(0.25, 1, 0.5, 1) infinite',
        shimmer: 'shimmer 1.6s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};

export default config;
