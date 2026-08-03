import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

// Card bấm được — bọc toàn bộ nội dung trong 1 <Link>. Shadow nhẹ ở giữa
// báo hiệu "bấm được" ngay từ đầu; hover/active mặc định chuyển viền sang
// xám đậm. Riêng card official update dùng `amber` để đồng bộ với viền
// trái amber sẵn có của nó.
export function CardLink({
  className = "",
  children,
  amber = false,
  ...linkProps
}: {
  className?: string;
  children: ReactNode;
  amber?: boolean;
} & ComponentProps<typeof Link>) {
  const accentClasses = amber
    ? "hover:shadow-[0_0_12px_rgba(217,119,6,0.25)] active:shadow-[0_0_12px_rgba(217,119,6,0.25)] hover:border-amber-600 active:border-amber-600"
    : "hover:shadow-[0_0_12px_rgba(0,0,0,0.1)] active:shadow-[0_0_12px_rgba(0,0,0,0.1)] hover:border-gray-400 active:border-gray-400";

  return (
    <Link
      {...linkProps}
      className={`group bg-white border border-gray-200 rounded-2xl p-6 shadow-[0_0_5px_rgba(0,0,0,0.05)] transition-[box-shadow,border-color] ${accentClasses} ${className}`}
    >
      {children}
    </Link>
  );
}
