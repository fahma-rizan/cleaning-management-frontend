/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  corePlugins: {
    preflight: false, // prevent conflicts with Ant Design base styles
  },
  theme: {
    extend: {
      colors: {
        primary:        '#7C3AED',
        'primary-hover':'#6D28D9',
        input:          '#F3F3F5',
        secondary:      '#6B7280',
        muted:          '#94A3B8',
        sidebar:        '#1A1C2E',
        'sidebar-hover':'#252744',
        'dark-bg':      '#12121E',
        'dark-card':    '#1C1C30',
        'dark-border':  '#2A2A45',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
};
