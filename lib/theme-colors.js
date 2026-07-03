// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
const COLORS = {
  chrome: "#707070", // nền header/footer
  chromePanel: "#5a5a5a", // panel dropdown menu/ngôn ngữ (mobile)
  chromePanelHover: "#5f5f5f", // panel dropdown ngôn ngữ (desktop, hover)
  page: "#f9fafb", // nền nội dung trang (= Tailwind gray-50)
  surface: "#eef0f2", // nền footer + mobile menu — sáng nhưng tách biệt với bg-page
};

module.exports = { COLORS };
