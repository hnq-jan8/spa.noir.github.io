import Skeleton from "@/components/ui/Skeleton";

/**
 * Placeholder cho ArticleDetail / ArticleContent, dùng khi mở thẳng link `?a=`
 * — trang vào giữa bài trước cả khi content.json về. Mỗi khối đi chung
 * <Reveal> với khối thật (xem Reveal.tsx).
 */

/** Nút quay lại ở hàng meta (chỉ có từ md trở lên). */
export function ArticleBackSkeleton() {
  return <Skeleton className="skeleton-on-card hidden md:block h-5 w-20" />;
}

/** Ngày đăng + thời gian đọc, nằm cuối hàng meta. */
export function ArticleMetaSkeleton() {
  return (
    <>
      <Skeleton className="skeleton-on-card h-3 w-28" />
      <Skeleton className="skeleton-on-card h-3 w-16" />
    </>
  );
}

/** Tiêu đề bài + gạch ngang dưới nó. */
export function ArticleTitleSkeleton() {
  return (
    <>
      <Skeleton className="skeleton-on-card h-9 md:h-11 w-11/12 mb-3" />
      <Skeleton className="skeleton-on-card h-9 md:h-11 w-2/3 mb-4" />
      <hr className="border-gray-300 mb-6" />
    </>
  );
}

/** Thân bài: đoạn dài ngắn khác nhau — chồng bar đều tăm tắp không ra văn xuôi. */
export function ArticleBodySkeleton() {
  return (
    <>
      {[
        ["w-full", "w-full", "w-11/12", "w-3/4"],
        ["w-full", "w-10/12", "w-full", "w-1/2"],
        ["w-full", "w-11/12", "w-2/3"],
      ].map((lines, i) => (
        <div key={i} className="mb-6">
          {lines.map((w, j) => (
            <Skeleton
              key={j}
              className={`skeleton-on-card h-3.5 ${w} ${j === lines.length - 1 ? "" : "mb-2.5"}`}
            />
          ))}
        </div>
      ))}
    </>
  );
}
