import type { ReactNode } from "react";

/**
 * Một khối placeholder. Hình dạng hoàn toàn do `className` quyết định để mỗi
 * skeleton bám đúng hộp thật. Trên nền card trắng hoặc `surface` xám phải
 * thêm .skeleton-on-card / .skeleton-on-surface, vì màu mặc định chỉ hợp với
 * nền trang và sẽ chìm mất.
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/**
 * Bar mảnh đặt giữa line box của đoạn chữ nó thay (khối cao bằng cả dòng đọc
 * ra thành cái nút, không phải chữ). `box` giữ chiều cao thật + margin,
 * `bar` là vệt bên trong.
 */
export function SkeletonText({
  box,
  bar,
  fill = "",
}: {
  box: string;
  bar: string;
  /** .skeleton-on-card / .skeleton-on-surface, when not on the page bg. */
  fill?: string;
}) {
  return (
    <div className={`${box} flex items-center`}>
      <Skeleton className={`${fill} ${bar}`} />
    </div>
  );
}

/**
 * a11y cho khung trang lúc còn placeholder. Khung là MỘT phần tử dùng chung
 * cho cả hai trạng thái nên không bọc riêng `role="status"` quanh mỗi bên
 * được. Không kèm chữ: mọi nhãn đều từ CMS, mà nhãn cũng đang chờ tải.
 */
export function loadingProps(loading: boolean) {
  return loading ? ({ role: "status", "aria-busy": true } as const) : {};
}
