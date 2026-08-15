import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

// Card bấm được — bọc toàn bộ nội dung trong 1 <Link>. Lúc nghỉ, shadow (và
// việc không có border) là dấu hiệu "bấm được"; card không bấm được đi ngược
// lại — border, không shadow. Hover/active đổi màu nền, không tăng shadow.
export function CardLink({
  className = "",
  children,
  ...linkProps
}: {
  className?: string;
  children: ReactNode;
} & ComponentProps<typeof Link>) {
  return (
    <Link
      {...linkProps}
      className={`group bg-white rounded-2xl p-6 shadow-[0_0_5px_rgba(0,0,0,0.06)] transition-colors hover:bg-gray-100 active:bg-gray-100 ${className}`}
    >
      {children}
    </Link>
  );
}
