"use client";

import type { LucideIcon } from "lucide-react";

/**
 * Nút gợi ý cuộn (mũi tên trái/phải của carousel & nav, nút cuộn xuống của
 * modal). Gói phần contract lặp lại ở mọi chỗ: khi `active` = false thì mờ đi,
 * chặn pointer, và ẩn khỏi thứ tự tab + trình đọc màn hình. Phần hình thức
 * (vị trí, kích thước, nền) truyền qua `className`/`iconClassName` vì mỗi nơi
 * một kiểu.
 */
export default function ScrollButton({
  active,
  onClick,
  label,
  Icon,
  className = "",
  iconClassName,
  strokeWidth = 2,
}: {
  active: boolean;
  onClick: () => void;
  label: string;
  Icon: LucideIcon;
  className?: string;
  iconClassName?: string;
  strokeWidth?: number;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={label}
      aria-hidden={!active}
      tabIndex={active ? 0 : -1}
      className={`transition-opacity duration-200 ${
        active ? "opacity-100" : "opacity-0 pointer-events-none"
      } ${className}`}
    >
      <Icon className={iconClassName} strokeWidth={strokeWidth} />
    </button>
  );
}
