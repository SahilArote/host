/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,jsx}'],
  theme: {
    extend: {
      colors: {
        spk: {
          50:'#FEF2F2',100:'#FEE2E2',200:'#FECACA',300:'#F87171',400:'#E04040',
          500:'#BE1E2D',600:'#A51B27',700:'#8B1722',800:'#6D1219',900:'#451015',950:'#2A0A0D',
        },
        warm: {
          50:'#FAFAF7',100:'#F5F0EB',200:'#EDE6DD',300:'#DDD3C7',400:'#C4B5A4',
          500:'#A89888',600:'#8C7A6A',700:'#6B5D50',800:'#4A3F35',900:'#2E2720',
        },
      },
      fontFamily: { sans: ['Poppins','sans-serif'] }
    }
  },
  plugins: []
}
