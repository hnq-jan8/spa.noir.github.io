let isBack = false;

if (typeof window !== "undefined") {
  window.addEventListener("popstate", () => {
    isBack = true;
  });

  document.addEventListener(
    "click",
    (e) => {
      if ((e.target as HTMLElement)?.closest("a")) {
        isBack = false;
      }
    },
    { capture: true },
  );
}

/**
 * Điều hướng tiến do app tự đẩy history. Listener trên chỉ bắt `<a>`, còn thẻ
 * bài viết là `<button>` gọi pushState — không gọi hàm này thì sau một cú back
 * của trình duyệt cờ kẹt ở true và mọi bài mở sau đó mất hiệu ứng reveal.
 */
export function markForwardNavigation() {
  isBack = false;
}

export function isBackNavigation() {
  return isBack;
}
