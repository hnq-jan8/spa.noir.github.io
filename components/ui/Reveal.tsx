"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { isBackNavigation } from "@/lib/navigationDirection";

interface RevealProps {
  children: ReactNode;
  className?: string;
  delay?: number;
  onClick?: () => void;
}

function shouldSkipAnimation() {
  return (
    isBackNavigation() ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  );
}

/**
 * Hiệu ứng vào trang: mờ + nhích lên, chạy đúng MỘT lần cho mỗi khối.
 *
 * Skeleton và nội dung thật nằm chung một <Reveal> (`{data ? <thật/> :
 * <placeholder/>}` trong các *Content), nên content.json về chỉ đổi ruột —
 * thẻ bọc không unmount nên hiệu ứng không khởi động lại. Không phải canh
 * mốc thời gian nào: về sớm hay muộn mắt cũng chỉ thấy một lần fade.
 */
export default function Reveal({
  children,
  className = "",
  delay = 0,
  onClick,
}: RevealProps) {
  const [visible, setVisible] = useState(
    () => typeof window !== "undefined" && shouldSkipAnimation(),
  );
  const cancelRef = useRef(0);

  useEffect(() => {
    if (visible) return;
    // Double rAF: Safari can coalesce a single rAF with the initial paint,
    // skipping straight to the visible state instead of transitioning to it.
    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => setVisible(true));
      cancelRef.current = inner;
    });
    cancelRef.current = outer;
    return () => cancelAnimationFrame(cancelRef.current);
  }, [visible]);

  return (
    <div
      className={`transition-[opacity,transform] duration-200 ease-out will-change-[opacity,transform] ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2"
      } ${className}`}
      style={{ transitionDelay: visible ? `${delay}ms` : "0ms" }}
      onClick={onClick}
    >
      {children}
    </div>
  );
}
