/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        // نام کلاس‌ها دلخواه است، من iransans و kook گذاشتم
        iransans: ['IranSans', 'sans-serif'],
        kook: ['Kook', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
