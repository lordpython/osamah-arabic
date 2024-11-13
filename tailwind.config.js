/** @type {import('tailwindcss').Config} */
const { theme } = require('./src/styles/theme');

module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: theme.colors,
      boxShadow: theme.shadows,
      borderWidth: {
        '3': '3px',
      }
    },
  },
  plugins: [],
};

