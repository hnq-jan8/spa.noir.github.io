// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
const COLORS = {
  chrome: "#707070", // nền header (Navbar) và menu mobile toàn màn hình
  chromePanelHover: "#5f5f5f", // nền panel dropdown chọn ngôn ngữ (desktop)
  page: "#f4f5f6", // nền nội dung trang (class bg-page, áp ở layout gốc)
  surface: "#edeff1", // nền footer và card Hỗ trợ trên trang chủ
  // Nền hover/active của MỌI card bấm được (class bg-cardHover). Phải lệch
  // đủ xa `page`, không phải xa màu trắng của card — nhẹ hơn mức này thì
  // hover chìm vào nền trang; đậm hơn thì thành khối xám nặng.
  cardHover: "#f8f9fa",
  // Cặp riêng cho card "cập nhật chính thức" ở trang chủ (nền tông ấm, xem
  // HomeContent) — hover bằng cardHover sẽ kéo nó sang xám lạnh. Đậm hơn
  // cardHover một bậc vì đây là card được ưu tiên nhất trang.
  update: "#fffdf6",
  updateHover: "#faf6ea",
};

module.exports = { COLORS };
