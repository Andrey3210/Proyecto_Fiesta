/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        fiestaPurple: '#9756DB',
        fiestaPink: '#DB56B8',
        fiestaLightPurple: '#D789DE',
        fiestaRed: '#DB5668',
        fiestaBlue: '#6B56DB',
        fiestaGreen: '#56DB8A',
        fiestaYellow: '#F8D65C',
      },
      fontFamily: {
        fiesta: ['Poppins', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
