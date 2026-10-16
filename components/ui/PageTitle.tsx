"use client";

import { usePathname } from "next/navigation";
import Reveal from "@/components/ui/Reveal";
import { SkeletonText } from "@/components/ui/Skeleton";
import { useContentData } from "@/hooks/useContentData";
import { useNavItems } from "@/hooks/useNavItems";
import { normalizePath } from "@/i18n/paths";

/**
 * Tên trang ở đầu nội dung, chỉ dưới md: desktop có tab đang chọn trên
 * header, mobile thì không còn gì cho biết đang ở trang nào. Lấy đúng nhãn
 * nav (ui_labels) nên không cần nhãn mới; cùng cỡ với tiêu đề trang Chuyến bay.
 *
 * Như mọi khối khác của trang: shimmer khi content.json chưa về, rồi bàn giao
 * trong cùng một <Reveal> nên hiệu ứng vào trang chạy đúng một lần. Trễ
 * 100ms như dòng ngày giờ ở trang xem bài.
 */
export default function PageTitle({
  gap = "mb-4",
  skeletonFill,
}: {
  /** Khoảng dưới tiêu đề — mặc định như trang Chuyến bay. */
  gap?: string;
  /** Nền skeleton khi trang không nằm trên nền page (xem SkeletonText). */
  skeletonFill?: string;
}) {
  const pathname = usePathname();
  const data = useContentData();
  const navItems = useNavItems();
  const label = navItems.find(
    (item) => item.href === normalizePath(pathname),
  )?.label;
  if (!label) return null;
  return (
    <Reveal className="md:hidden" delay={100}>
      {data ? (
        <h1 className={`text-xl font-bold ${gap}`}>{label}</h1>
      ) : (
        <SkeletonText box={`h-7 ${gap}`} bar="h-6 w-48" fill={skeletonFill} />
      )}
    </Reveal>
  );
}
