import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

// Card bấm được — bọc toàn bộ nội dung trong 1 <Link>. Lúc nghỉ, card bấm được
// và card nội dung trông y hệt nhau: không viền, chỉ có nền + glow rất nhẹ tỏa
// đều 4 phía (0 offset, không lệch xuống dưới như shadow thường) để tách khỏi
// màu nền trang. Thứ duy nhất phân biệt là phản hồi khi tương tác — hover/active
// đổi màu nền (card nội dung thì đứng yên).
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
      className={`group bg-white rounded-2xl p-6 shadow-[0_0_6px_rgba(0,0,0,0.03)] transition-colors hover:bg-cardHover active:bg-cardHover ${className}`}
    >
      {children}
    </Link>
  );
}
