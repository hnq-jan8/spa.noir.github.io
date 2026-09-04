// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
const COLORS = {
  chrome: "#404040", // nền header (Navbar) và menu mobile toàn màn hình
  chromePanelHover: "#525252", // nền panel dropdown chọn ngôn ngữ (desktop)
  page: "#f5f5f5", // nền nội dung trang (class bg-page, áp ở layout gốc)
  surface: "#eeeeee", // nền footer và card Hỗ trợ trên trang chủ
  cardHover: "#efefef", // Nền hover/active của MỌI card bấm được (class bg-cardHover).
};

module.exports = { COLORS };
