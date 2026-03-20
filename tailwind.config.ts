import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: '#2c2c2e',
        bgSecondary: '#222224',
        text: '#bdbdbd',
        muted: '#8f8f94',
        accent: '#4f9cff',
        success: '#4fcf7a',
        warning: '#f0b35a',
        danger: '#ff6b6b',
        card: '#2f2f33',
        borderTone: '#3a3a3f'
      },
      boxShadow: {
        card: '0 8px 24px rgba(0,0,0,0.25)'
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['ui-monospace', 'SFMono-Regular', 'Menlo', 'monospace']
      }
    }
  },
  plugins: []
} satisfies Config;
