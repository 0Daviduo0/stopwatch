/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{vue,js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['"Inter"', 'sans-serif'],
        serif: ['"Outfit"', 'serif'],
      },
      fontWeight: {
        heading: '600',
        body: '400',
      },
      lineHeight: {
        heading: '1.2',
        body: '1.5',
      },
      letterSpacing: {
        heading: '-0.02em',
        body: '0em',
      },
      fontSize: {
        // Mobile sizes (default)
        'xs': '0.75rem',
        'sm': '0.875rem',
        'base': '1.000rem',
        'lg': '1.125rem',
        'xl': '1.250rem',
        '2xl': '1.375rem',
        '3xl': '1.625rem',
        '4xl': '1.750rem',
        '5xl': '2.000rem',
      },
      colors: {
        // Monochromatic Palette
        black: '#09090b', // Zinc 950
        white: '#ffffff',
        gray: {
          50: '#fafafa',  // Zinc 50
          100: '#f4f4f5', // Zinc 100
          200: '#e4e4e7', // Zinc 200
          300: '#d4d4d8', // Zinc 300
          400: '#a1a1aa', // Zinc 400
          500: '#71717a', // Zinc 500
          600: '#52525b', // Zinc 600
          700: '#3f3f46', // Zinc 700
          800: '#27272a', // Zinc 800
          900: '#18181b', // Zinc 900
          950: '#09090b', // Zinc 950
        }
      },
      borderRadius: {
        'lg': '0.75rem',
        'xl': '1rem',
        '2xl': '1.5rem',
        '3xl': '2rem',
      }
    },
  },
  plugins: [],
}