"use client";

import { useEffect, useState } from "react";

/**
 * Breadcrumb mobile (Navbar) có phải render `invisible` không — vẫn mount để
 * giữ chỗ layout, chỉ không vẽ gì.
 *
 * Để ở module vì Navbar là anh em với nội dung trang: trang cần giấu nó (ô
 * tìm kiếm FAQs) không có đường đi trong cây tới đó — cùng vấn đề mà
 * useArticleRoute giải. Mask bằng z-index không đủ: rubber-band của iOS Safari
 * làm lệch layer fixed/sticky một frame và breadcrumb lọt qua. Đếm chứ không
 * dùng boolean để hai nơi gọi không giẫm lên nhau.
 */
let hiddenCount = 0;
const listeners = new Set<() => void>();

function emit() {
  listeners.forEach((l) => l());
}

function useBreadcrumbHidden(): boolean {
  const [hidden, setHidden] = useState(() => hiddenCount > 0);

  useEffect(() => {
    const sync = () => setHidden(hiddenCount > 0);
    sync();
    listeners.add(sync);
    return () => {
      listeners.delete(sync);
    };
  }, []);

  return hidden;
}

/** For Navbar: whether the breadcrumb should currently render. */
export { useBreadcrumbHidden };

/** For a page: hide the breadcrumb for as long as `active` is true. */
export function useHideBreadcrumbWhen(active: boolean) {
  useEffect(() => {
    if (!active) return;
    hiddenCount += 1;
    emit();
    return () => {
      hiddenCount -= 1;
      emit();
    };
  }, [active]);
}
