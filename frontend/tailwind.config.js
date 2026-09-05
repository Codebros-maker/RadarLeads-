/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        ink: '#17202a',
        field: '#eef2f6',
        mint: '#16a085',
        coral: '#e76f51'
      }
    }
  },
  plugins: []
};
