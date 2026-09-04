import Skeleton from "@/components/ui/Skeleton";

/** One full-width list card: thumbnail beside date/title/excerpt. */
function ListCardSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow flex items-stretch">
      <Skeleton className="skeleton-on-card w-32 sm:w-44 self-stretch flex-shrink-0 rounded-none" />
      <div className="flex-1 min-w-0 flex flex-col justify-center pt-2 sm:pt-2.5 pl-3 sm:pl-3.5 pr-3 sm:pr-4 pb-3 sm:pb-4">
        <Skeleton className="skeleton-on-card h-3 w-24 mb-3" />
        <Skeleton className="skeleton-on-card h-4 w-4/5 mb-2" />
        <Skeleton className="skeleton-on-card h-3.5 w-full mb-1.5" />
        <Skeleton className="skeleton-on-card h-3.5 w-2/3" />
      </div>
      <Skeleton className="skeleton-on-card w-5 h-5 mr-3 sm:mr-4 flex-shrink-0 self-center" />
    </div>
  );
}

/** Compact image-overlay tile — the fixed grid-row height (h-24 sm:h-28). */
function GridTileSkeleton() {
  return (
    <div className="bg-white rounded-2xl overflow-hidden card-shadow h-24 sm:h-28 flex flex-col">
      <Skeleton className="skeleton-on-card flex-1 rounded-none" />
      <div className="bg-white flex items-start justify-between gap-2 px-3.5 pb-2.5 pt-2 sm:px-4 sm:pb-3">
        <Skeleton className="skeleton-on-card h-3.5 flex-1" />
        <Skeleton className="skeleton-on-card w-5 h-5 flex-shrink-0" />
      </div>
    </div>
  );
}

/**
 * Mirrors PressReleasesContent's list view: featured card, two list cards,
 * then a row of three tiles (stacked below md, 3-col grid from md up).
 *
 * Không tự dựng khung trang và cũng không tự bọc <Reveal>: nó nằm chung
 * <Reveal> với danh sách thật, nên lúc bàn giao chỉ phần ruột đổi chỗ.
 */
export default function PressReleasesSkeleton() {
  return (
    <>
      <div className="bg-white rounded-2xl overflow-hidden card-shadow">
        <Skeleton className="skeleton-on-card w-full h-44 sm:h-56 rounded-none" />
        <div className="p-5 sm:p-6 pt-4 sm:pt-5 pb-4 sm:pb-5">
          <Skeleton className="skeleton-on-card h-3.5 w-24 mb-3" />
          <Skeleton className="skeleton-on-card h-6 w-11/12 mb-2" />
          <Skeleton className="skeleton-on-card h-6 w-2/3 mb-4" />
          <Skeleton className="skeleton-on-card h-3.5 w-full mb-2" />
          <Skeleton className="skeleton-on-card h-3.5 w-5/6" />
          <div className="flex items-center justify-between mt-5">
            <Skeleton className="skeleton-on-card h-3 w-28" />
            <Skeleton className="skeleton-on-card h-3 w-20" />
          </div>
        </div>
      </div>

      <div className="mt-4 space-y-3">
        <ListCardSkeleton />
        <ListCardSkeleton />
      </div>

      <div className="mt-3">
        <div className="space-y-3 md:hidden">
          <ListCardSkeleton />
        </div>
        <div className="hidden md:grid grid-cols-3 gap-3">
          <GridTileSkeleton />
          <GridTileSkeleton />
          <GridTileSkeleton />
        </div>
      </div>
    </>
  );
}
