// Nguồn duy nhất cho các màu nền dùng lại nhiều nơi (Tailwind config, viewport themeColor, ...)
const COLORS = {
  // Header tối để nới dải sáng-tối của bảng màu trắng-đen: chrome gần đen,
  // page gần trắng, mọi thứ khác nằm giữa. R=G=B tuyệt đối (S=0%) theo yêu cầu
  // của user: đây là mảng màu lớn nhất trang, nên chỉ cần vài % bão hoà là mắt
  // gộp lại thành xanh chứ không còn đọc ra xám. Đổi lại, nó KHÔNG cùng hệ với
  // mực `gray-900` (#111827, hơi ám xanh) — chấp nhận, vì hai thứ này gần như
  // không bao giờ chạm nhau trên cùng một khung nhìn.
  chrome: "#404040", // nền header (Navbar) và menu mobile toàn màn hình
  chromePanelHover: "#525252", // nền panel dropdown chọn ngôn ngữ (desktop)
  page: "#f5f5f5", // nền nội dung trang (class bg-page, áp ở layout gốc)
  surface: "#eeeeee", // nền footer và card Hỗ trợ trên trang chủ
  // Nền hover/active của MỌI card bấm được (class bg-cardHover). Phải lệch
  // đủ xa `page`, không phải xa màu trắng của card — nhẹ hơn mức này thì
  // hover chìm vào nền trang; đậm hơn thì thành khối xám nặng.
  cardHover: "#fafafa",
};

module.exports = { COLORS };
