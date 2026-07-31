import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

// Card bấm được — bọc toàn bộ nội dung trong 1 <Link>. Shadow nhẹ ở giữa
// báo hiệu "bấm được" ngay từ đầu; hover/active thì glow và viền cùng
// chuyển sang amber — cùng tông với viền trái của card official update.
export function CardLink({
  className = "",
  children,
  ...linkProps
}: { className?: string; children: ReactNode } & ComponentProps<typeof Link>) {
  return (
    <Link
      {...linkProps}
      className={`group bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_0_5px_rgba(0,0,0,0.05)] hover:shadow-[0_0_12px_rgba(217,119,6,0.25)] active:shadow-[0_0_12px_rgba(217,119,6,0.25)] hover:border-amber-600 active:border-amber-600 transition-[box-shadow,border-color] ${className}`}
    >
      {children}
    </Link>
  );
}
