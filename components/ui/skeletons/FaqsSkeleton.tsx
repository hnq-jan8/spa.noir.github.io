import Skeleton from "@/components/ui/Skeleton";

/**
 * Mirrors FaqsContent's resting state: the desktop search field docked above
 * the list, the first card open (the accordion opens item 0 on load), the
 * rest collapsed. The mobile capsule isn't drawn — it's a 34px circle pinned
 * beside the breadcrumb, and a placeholder dot there reads as a stray mark.
 */
/** Ô tìm kiếm desktop, đứng đúng chỗ SearchField thật trong khung sticky. */
export function FaqsSearchFieldSkeleton() {
  return <Skeleton className="h-[46px] w-full rounded-full" />;
}

/**
 * Danh sách câu hỏi: thẻ đầu mở sẵn (accordion mở item 0 lúc vào trang),
 * còn lại đóng. Không tự dựng khung trang, cũng không tự bọc <Reveal> — nó
 * nằm chung <Reveal> với accordion thật trong FaqsContent.
 */
export default function FaqsSkeleton() {
  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl overflow-hidden card-shadow">
        <div className="flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4">
          <Skeleton className="skeleton-on-card h-4 w-3/5" />
          <Skeleton className="skeleton-on-card w-[18px] h-[18px] flex-shrink-0" />
        </div>
        <div className="mx-4 sm:mx-6 border-t border-gray-200 pt-3 sm:pt-4 pb-4 sm:pb-6">
          <Skeleton className="skeleton-on-card h-3.5 w-full mb-2" />
          <Skeleton className="skeleton-on-card h-3.5 w-full mb-2" />
          <Skeleton className="skeleton-on-card h-3.5 w-2/3" />
        </div>
      </div>

      {[0, 1, 2, 3].map((i) => (
        <div
          key={i}
          className="bg-white rounded-2xl overflow-hidden card-shadow"
        >
          <div className="flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4">
            {/* Alternating widths so the stack doesn't read as a striped
                  pattern of identical bars. */}
            <Skeleton
              className={`skeleton-on-card h-4 ${i % 2 === 0 ? "w-4/6" : "w-1/2"}`}
            />
            <Skeleton className="skeleton-on-card w-[18px] h-[18px] flex-shrink-0" />
          </div>
        </div>
      ))}
    </div>
  );
}
