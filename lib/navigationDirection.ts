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

export function isBackNavigation() {
  return isBack;
}
