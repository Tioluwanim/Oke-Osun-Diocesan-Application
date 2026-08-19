import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './data/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        // Core Diocese of Oke-Osun palette, extracted from the original red/*.css files.
        navy: {
          DEFAULT: '#061a35', // primary-dark, used for headers/footers/headings
          deep: '#04152d',
          darker: '#020c1c',
        },
        blue: {
          DEFAULT: '#0b3d73', // primary brand blue
          light: '#155c9f',
        },
        gold: {
          DEFAULT: '#c9a227', // accent
          light: '#f0d879',
        },
        cream: '#f8f6ef',
        ink: {
          DEFAULT: '#2b3646', // body text — darker than the original #566170 for AA/AAA contrast
          muted: '#5b6a7a',   // secondary/supporting text
        },
        line: '#e4e7eb', // border color
        surface: '#ffffff',
      },
      fontFamily: {
        display: ['var(--font-cinzel)', 'Georgia', 'serif'],
        body: ['var(--font-poppins)', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        base: ['1.125rem', { lineHeight: '1.7' }], // 18px minimum body text
      },
      boxShadow: {
        diocese: '0 15px 45px rgba(4, 21, 45, 0.15)',
        soft: '0 8px 24px rgba(4, 21, 45, 0.08)',
      },
      borderRadius: {
        card: '14px',
      },
      transitionTimingFunction: {
        'diocese-ease': 'cubic-bezier(0.22, 1, 0.36, 1)',
      },
      keyframes: {
        'logo-pulse': {
          '0%, 100%': { opacity: '1', transform: 'scale(1) rotate(0deg)' },
          '50%': { opacity: '0.55', transform: 'scale(0.92) rotate(180deg)' },
        },
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(16px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        'logo-pulse': 'logo-pulse 1400ms ease-in-out infinite',
        'fade-up': 'fade-up 500ms cubic-bezier(0.22, 1, 0.36, 1) both',
      },
    },
  },
  plugins: [],
};

export default config;
