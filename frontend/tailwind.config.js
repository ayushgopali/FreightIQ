/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        ink: {
          950: '#05070C',
          900: '#070B12',
          850: '#0A0F18',
          800: '#0E1420',
          700: '#131C2E',
          600: '#1A253D',
        },
        radar: '#00F0FF',
        beacon: '#FFB800',
        mint: '#10B981',
        alert: '#EF4444',
        fog: '#94A3B8',
        dim: '#64748B',
        charcoal: {
          950: '#070B12',
          900: '#070B12',
          850: '#0E1420',
          800: '#131C2E',
          750: '#1A253D',
          700: 'rgba(255, 255, 255, 0.08)',
        },
        navy: {
          950: '#070B12',
          900: '#070B12',
          850: '#0E1420',
          800: '#131C2E',
          700: 'rgba(255, 255, 255, 0.08)',
          600: 'rgba(255, 255, 255, 0.15)',
        },
        ocean: {
          400: '#00F0FF',
          500: '#0284C7',
          600: '#0369A1',
        },
        amber: {
          400: '#FFB800',
          500: '#FFB800',
          600: '#D97706',
          700: '#B45309',
          glow: 'rgba(255, 184, 0, 0.2)',
        },
        terminal: {
          amber: '#FFB800',
          amberDim: '#D97706',
          amberGlow: 'rgba(255, 184, 0, 0.18)',
          cyan: '#00F0FF',
          blue: '#0284C7',
          green: '#10B981',
          red: '#EF4444',
          gray: '#94A3B8',
          dim: '#64748B',
          light: '#F1F5F9',
        },
        slate: {
          250: '#F1F5F9',
          450: '#94A3B8',
        },
        maritime: {
          success: '#10B981',
          warning: '#FFB800',
          danger: '#EF4444',
        }
      },
      fontFamily: {
        display: ['Outfit', 'sans-serif'],
        sans: ['Archivo', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
      },
      borderRadius: {
        none: '0px',
        xs: '3px',
        sm: '4px',
        DEFAULT: '6px',
        md: '6px',
        lg: '8px',
        xl: '12px',
        '2xl': '16px',
      },
      boxShadow: {
        'glass': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.08), 0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'glass-hover': 'inset 0 1px 0 0 rgba(255, 255, 255, 0.14), 0 12px 36px 0 rgba(0, 0, 0, 0.55)',
        'tactile-input': 'inset 0 1px 2px rgba(0, 0, 0, 0.6), 0 1px 0 rgba(255, 255, 255, 0.04)',
        'amber-glow': '0 0 20px rgba(224, 142, 57, 0.3)',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['"JetBrains Mono"', '"IBM Plex Mono"', 'Consolas', 'monospace'],
      }
    },
  },
  plugins: [],
}
