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
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      colors: {
        chrome: {
          DEFAULT: COLORS.chrome,
          panelHover: COLORS.chromePanelHover,
        },
        page: COLORS.page,
        surface: COLORS.surface,
        cardHover: COLORS.cardHover,
        update: COLORS.update,
        updateHover: COLORS.updateHover,
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
            boxShadow: "0 0 3px 1px rgba(239, 68, 68, 0.5)",
          },
          "50%": {
            opacity: ".5",
            boxShadow: "0 0 0 0 rgba(239, 68, 68, 0)",
          },
        },
      },
      animation: {
        "pulse-glow": "pulse-glow 1.5s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
    },
  },
  plugins: [],
};

