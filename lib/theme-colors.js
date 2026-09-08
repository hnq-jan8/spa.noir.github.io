// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
//
// Thang nền từ nổi xuống chìm — mỗi bậc phải cách bậc kề đủ để mắt thấy được
// mà không cần viền (card không có viền, xem Card.tsx):
//   card trắng 255 › page 245 › cardHover 235 › surface 232 › gray-300 212
// Bậc cuối là dải lưu ý dưới card hotline trong HomeContent.
const COLORS = {
  chrome: "#404040", // nền header (Navbar) và menu mobile toàn màn hình
  chromePanelHover: "#525252", // nền panel dropdown chọn ngôn ngữ (desktop)
  page: "#f5f5f5", // nền nội dung trang (class bg-page, áp ở layout gốc)
  surface: "#e8e8e8", // nền footer và card Hỗ trợ trên trang chủ
  cardHover: "#ebebeb", // Nền hover/active của MỌI card bấm được (class bg-cardHover).
};

module.exports = { COLORS };
