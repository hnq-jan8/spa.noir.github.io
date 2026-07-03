const { COLORS } = require("./lib/theme-colors");

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
        chrome: {
          DEFAULT: COLORS.chrome,
          panel: COLORS.chromePanel,
          panelHover: COLORS.chromePanelHover,
        },
        page: COLORS.page,
        surface: COLORS.surface,
      },
    },
  },
  plugins: [],
};

