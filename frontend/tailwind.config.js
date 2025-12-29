/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        primary: '#06aea9',
        secondary: {
          light: '#7fd8d6',
          DEFAULT: '#028090',
          dark: '#025f6a',
        },
        background: {
          light: '#f0fdfa',
          DEFAULT: '#e0f7f5',
          dark: '#b2e4df',
        },
      },
    },
  },
  plugins: [],
};
