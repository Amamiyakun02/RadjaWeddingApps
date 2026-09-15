/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        maroon: {
          50: '#FDF4F5',
          100: '#FCE8EA',
          200: '#F9D5D9',
          300: '#F3B4BC',
          400: '#E98493',
          500: '#D7536A',
          600: '#BC334D',
          700: '#9B2039', // Rich Dark Maroon
          800: '#801D33', // Deep Velvet Maroon
          900: '#6D1C2F', // Imperial Maroon
          950: '#3D0A15', // Dark Midnight Maroon
        },
        gold: {
          50: '#FDFBF7',
          100: '#FBF7EE',
          200: '#F5ECD3',
          300: '#EEDEAF',
          400: '#E4CB83',
          500: '#D4AF37', // Royal Gold
          600: '#BF982A',
          700: '#9B781E',
          800: '#7B5E1A',
          900: '#644D17',
        },
        champagne: {
          50: '#FFFDF9',
          100: '#FAF5EA',
          200: '#F3E8D0',
          300: '#EBD9B2',
          400: '#DFC28B',
          500: '#CFAB65',
        }
      },
      fontFamily: {
        serif: ['"Playfair Display"', 'Georgia', 'serif'],
        sans: ['"Plus Jakarta Sans"', 'Inter', 'system-ui', 'sans-serif'],
      },
      boxShadow: {
        'luxury': '0 20px 40px -15px rgba(128, 29, 51, 0.18)',
        'luxury-hover': '0 25px 50px -12px rgba(128, 29, 51, 0.28)',
        'glass': '0 8px 32px 0 rgba(0, 0, 0, 0.08)',
      }
    },
  },
  plugins: [],
}
