/** @type {import('tailwindcss').Config} */
module.exports = {
  future: {
    // hover chỉ áp dụng trên thiết bị có con trỏ thật,
    // tránh glow bị "dính" khi chạm trên thiết bị cảm ứng
    hoverOnlyWhenSupported: true,
  },
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        dark: {
          DEFAULT: "#1a1a1a",
          nav: "#5a5a5a",
        },
      },
    },
  },
  plugins: [],
};

