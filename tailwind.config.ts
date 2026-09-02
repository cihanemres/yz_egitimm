import type { Config } from 'tailwindcss';

const config: Config = {
  content: [
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50: '#eef4ff',
          100: '#dae4ff',
          200: '#bccfff',
          300: '#8eaeff',
          400: '#5982ff',
          500: '#3358f4',
          600: '#2039d9',
          700: '#1c2faf',
          800: '#1c2c8a',
          900: '#1c2b6d',
        },
      },
      fontFamily: {
        sans: ['system-ui', '-apple-system', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
    },
  },
  plugins: [],
};

export default config;
