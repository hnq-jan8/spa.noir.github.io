import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

/**
 * Placeholder cho từng khối của FlightInfoContent — bảng chuyến bay và mục
 * chính sách. Mỗi khối nằm chung một <Reveal> với khối thật nó thay thế,
 * nên hộp phải khớp hộp thật để lúc bàn giao trang không co giãn.
 */

/** One stacked flight card — the below-md layout of FlightTable. */
function FlightCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow">
      <div className="px-4 pt-4">
        <div className="flex items-center justify-between mb-3">
          <Skeleton className="skeleton-on-card h-4 w-24" />
          <Skeleton className="skeleton-on-card h-6 w-16 rounded" />
        </div>
        <div className="flex gap-3 max-w-xs px-2 py-3 mx-auto items-center justify-center">
          <Skeleton className="skeleton-on-card h-8 w-16" />
          <div className="flex-1 flex items-center gap-2">
            <div className="flex-1 border-t border-dashed border-gray-300" />
            <Skeleton className="skeleton-on-card w-4 h-4 rounded-full" />
            <div className="flex-1 border-t border-dashed border-gray-300" />
          </div>
          <Skeleton className="skeleton-on-card h-8 w-16" />
        </div>
      </div>

      {/* Real layout varies here (3-col grid vs. stacked rows, see
          FlightTable) — one block just marks the area. */}
      <div className="px-4 pb-4 pt-2">
        <Skeleton className="skeleton-on-card h-10 w-full" />
      </div>
    </div>
  );
}

/** Tiêu đề mục + bảng: cards xếp chồng dưới md, một khối placeholder từ md trở lên. */
export function FlightTableSkeleton() {
  return (
    <>
      <SkeletonText box="h-9 mb-4" bar="h-7 w-52 md:skeleton-on-card" />

      <div className="md:hidden grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
        <FlightCardSkeleton />
        <FlightCardSkeleton />
      </div>

      {/* Real layout varies here too (single-flight key/value table vs.
          multi-row grid, see FlightTable) — one block marks the area. */}
      <div className="hidden md:block">
        <Skeleton className="h-64 w-full" />
      </div>
    </>
  );
}

/** Tiêu đề "chính sách đổi/hoàn vé" + đoạn markdown bên dưới. */
export function FlightPolicySkeleton() {
  return (
    <>
      <SkeletonText box="h-9 mb-4" bar="h-7 w-40 md:skeleton-on-card" />
      <div className="max-w-3xl">
        <Skeleton className="h-3.5 w-full mb-2 md:skeleton-on-card" />
        <Skeleton className="h-3.5 w-full mb-2 md:skeleton-on-card" />
        <Skeleton className="h-3.5 w-11/12 mb-2 md:skeleton-on-card" />
        <Skeleton className="h-3.5 w-3/5 md:skeleton-on-card" />
      </div>
    </>
  );
}
