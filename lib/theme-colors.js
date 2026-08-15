// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
const COLORS = {
  chrome: "#707070", // nền header (Navbar) và menu mobile toàn màn hình
  chromePanelHover: "#5f5f5f", // nền panel dropdown chọn ngôn ngữ (desktop)
  page: "#f6f7f8", // nền nội dung trang (class bg-page, áp ở layout gốc)
  surface: "#eef0f2", // nền footer và card Hỗ trợ trên trang chủ
};

module.exports = { COLORS };
