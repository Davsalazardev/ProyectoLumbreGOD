/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ['JetBrains Mono', 'Fira Code', 'monospace'],
        sans: ['"Helvetica Neue"', 'Helvetica', 'Arial', 'sans-serif'],
      },
      colors: {
        sonar: {
          blue: '#e1e7f0',
          darkBlue: '#425164',     // Navbar
          accent: '#0271b9',       // Links / buttons
          background: '#f3f5f8',   // Main body
          gray: '#7f8a9a',         // Soft text
          green: '#00aa00',      // Passed
          red: '#d4333f',        // Failed
          orange: '#ed7d20',     // Warning
          border: '#e1e4e8',     // Borders
          rating: {
            a: '#00aa00',
            b: '#b0d513',
            c: '#eabe06',
            d: '#ed7d20',
            e: '#d4333f'
          }
        }
      }
    },
  },
  plugins: [],
}
