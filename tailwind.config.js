const colors = require("tailwindcss/colors");
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
        // Thang xám của site là `neutral` (R=G=B) chứ không phải `gray` mặc
        // định của Tailwind (ám xanh, H~215-220): bảng màu chỉ có trắng-đen nên
        // mọi sắc độ đều phải trung tính. Đè lên tên `gray` để toàn bộ class
        // `*-gray-*` sẵn có giữ nguyên, không phải sửa từng component.
        gray: colors.neutral,
        chrome: {
          DEFAULT: COLORS.chrome,
          panelHover: COLORS.chromePanelHover,
        },
        page: COLORS.page,
        surface: COLORS.surface,
        cardHover: COLORS.cardHover,
      },
      keyframes: {
        "pulse-glow": {
          "0%, 100%": {
            opacity: "1",
          },
          "50%": {
            opacity: ".35",
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

