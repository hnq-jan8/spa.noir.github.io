// Timing dùng chung cho expand/collapse bằng grid-template-rows 0fr/1fr và cho
// mọi animation JS phải khớp cùng đường cong (FLIP của FaqAccordion).
//
// Mẹo nằm ở delay âm: -EXPAND_HALF_MS cho trình duyệt vào transition ở nửa sau
// đường cong, chỉ vẽ phần giảm tốc — nửa số lần layout recalc mỗi lần toggle.
// (Chạy trọn đường cong với nửa thời lượng thấy ì hơn.)
export const EXPAND_DURATION_MS = 300;
export const EXPAND_HALF_MS = EXPAND_DURATION_MS / 2;
export const EXPAND_EASE = "ease-out";

// Literal string (not built via interpolation) so Tailwind's JIT content
// scanner can find it. Keep in sync with the constants above.
export const EXPAND_GRID_TRANSITION_CLASS =
  "grid transition-[grid-template-rows] duration-300 delay-[-150ms] ease-out";

// Inline `transition` value for JS-driven animations that need to match
// EXPAND_GRID_TRANSITION_CLASS above (e.g. el.style.transition = ...).
export function expandTransition(property: string): string {
  return `${property} ${EXPAND_DURATION_MS}ms ${EXPAND_EASE} -${EXPAND_HALF_MS}ms`;
}
