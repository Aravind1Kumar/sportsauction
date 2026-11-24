/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        gold: {
          400: '#FACC15',
          500: '#EAB308',
          600: '#CA8A04',
        },
        csk: '#FDB913',
        mi: '#004BA0',
        rcb: '#D71920',
        kkr: '#3A225D',
        srh: '#F26522',
        dc: '#0078BC',
        pbks: '#DD1F2D',
        rr: '#EA1A85',
        gt: '#1C2951',
        lsg: '#A7D5E8',
      },
      animation: {
        'pulse-fast': 'pulse 1s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'gavel-strike': 'strike 0.5s ease-in-out',
        'bounce-short': 'bounce 0.6s ease-in-out 2',
      },
      keyframes: {
        strike: {
          '0%': { transform: 'rotate(0deg)' },
          '40%': { transform: 'rotate(-45deg)' },
          '70%': { transform: 'rotate(15deg)' },
          '100%': { transform: 'rotate(0deg)' },
        }
      }
    },
  },
  plugins: [],
}
