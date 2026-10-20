/** @type {import('tailwindcss').Config} */
// Colors mirror the "TripUp Colors" variables in the BendingSpoonsCase Figma file.
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: { DEFAULT: '#ffffff', 2: '#f2f2f7' },
        label: { DEFAULT: '#000000', 2: 'rgba(60,60,67,0.6)', 3: 'rgba(60,60,67,0.3)' },
        fill3: 'rgba(118,118,128,0.12)',
        sep: '#c6c6c8',
        gray: { DEFAULT: '#8e8e93', 3: '#c7c7cc', 4: '#d1d1d6', 5: '#e5e5ea', 6: '#f2f2f7' },
        blue: '#0088ff',
        green: '#34c759',
        red: '#ff383c',
        orange: '#ff8d28',
        indigo: '#6155f5',
      },
      fontFamily: {
        sans: ['-apple-system', 'BlinkMacSystemFont', '"SF Pro Text"', 'Inter', 'system-ui', 'sans-serif'],
      },
      fontSize: {
        large: ['34px', { lineHeight: '41px', fontWeight: '700', letterSpacing: '-0.4px' }],
        title1: ['28px', { lineHeight: '34px', fontWeight: '700' }],
        title2: ['22px', { lineHeight: '28px', fontWeight: '700' }],
        title3: ['20px', { lineHeight: '25px', fontWeight: '600' }],
        headline: ['17px', { lineHeight: '22px', fontWeight: '600' }],
        body: ['17px', { lineHeight: '22px' }],
        callout: ['16px', { lineHeight: '21px' }],
        sub: ['15px', { lineHeight: '20px' }],
        foot: ['13px', { lineHeight: '18px' }],
        cap: ['12px', { lineHeight: '16px' }],
      },
    },
  },
  plugins: [],
}
