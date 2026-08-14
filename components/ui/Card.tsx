import Link from "next/link";
import { ComponentProps, ReactNode } from "react";

// Card bấm được — bọc toàn bộ nội dung trong 1 <Link>. Không border: shadow
// một mình đảm nhận việc báo hiệu "bấm được", đậm hơn ở hover/active. Card
// bao ngoài nội dung (không bấm được) đi ngược lại — border, không shadow —
// nên hai loại card đọc được ngay từ giao diện rằng có tương tác hay không.
// Riêng card official update dùng `amber` để đồng bộ với viền trái amber
// sẵn có của nó.
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
    ? "hover:shadow-[0_0_10px_rgba(217,119,6,0.22)] active:shadow-[0_0_10px_rgba(217,119,6,0.22)]"
    : "hover:shadow-[0_0_10px_rgba(0,0,0,0.1)] active:shadow-[0_0_10px_rgba(0,0,0,0.1)]";

  return (
    <Link
      {...linkProps}
      className={`group bg-white rounded-2xl p-6 shadow-[0_0_5px_rgba(0,0,0,0.06)] transition-shadow ${accentClasses} ${className}`}
    >
      {children}
    </Link>
  );
}
