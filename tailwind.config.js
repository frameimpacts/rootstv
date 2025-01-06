/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      aspectRatio: {
        '4/5': '4 / 5',
        '21/9': '21 / 9',
      },
    },
  },
  plugins: [
    require('tailwind-scrollbar-hide'),
  ],
}

