// Mốc dùng ở JS (matchMedia) và ở CSS dự phòng inline trong app/layout.tsx —
// hai chỗ không đọc được tailwind.config.js. Phải khớp `screens` ở đó:
// xs = 390px, md = 768px.
export const SMALL_MOBILE_QUERY = "(max-width: 389px)"; // < xs
export const MOBILE_QUERY = "(max-width: 767px)"; // < md
