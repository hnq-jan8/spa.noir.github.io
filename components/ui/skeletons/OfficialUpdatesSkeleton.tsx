import Skeleton from "@/components/ui/Skeleton";

/**
 * Mirrors TimelineCarousel: the rail (dot + connecting line) is real, only
 * the text and thumbnails are placeholders — the rail is what makes the page
 * recognisable as the update feed before any content arrives.
 */
function NodeSkeleton({
  latest = false,
  last = false,
}: {
  latest?: boolean;
  last?: boolean;
}) {
  return (
    <div className="flex gap-4 sm:gap-5 w-full">
      <div className="flex flex-col items-center flex-shrink-0">
        <div
          className={`w-3 h-3 sm:w-3.5 sm:h-3.5 rounded-full border-2 mt-1 bg-white ${
            latest ? "border-gray-900/50" : "border-gray-300"
          }`}
        />
        {!last && (
          <div
            className={`w-px flex-1 mt-1 ${latest ? "bg-gray-500/40" : "bg-gray-200"}`}
          />
        )}
      </div>
      <div
        className={`flex-1 min-w-0 ${last ? "pb-1" : "pb-8 sm:pb-9"} pt-0.5`}
      >
        <Skeleton className="h-3.5 w-32 mb-3" />
        {latest ? (
          <div className="flex gap-4 items-start">
            <div className="flex-1 min-w-0">
              <Skeleton className="h-5 w-10/12 mb-2.5" />
              <Skeleton className="h-3.5 w-full mb-1.5" />
              <Skeleton className="h-3.5 w-4/5 mb-3" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="w-20 h-20 rounded-xl flex-shrink-0" />
          </div>
        ) : (
          <div className="flex gap-3 items-start">
            <Skeleton className="w-11 h-11 rounded-lg flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <Skeleton className="h-4 w-3/4 mb-2" />
              <Skeleton className="h-3.5 w-full" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

/**
 * Placeholder của TimelineCarousel. Không tự dựng khung trang: nó nằm chung
 * <Reveal> với carousel thật trong OfficialUpdatesContent, khung là của
 * trang — nhờ vậy lúc bàn giao chỉ phần ruột đổi, hiệu ứng không chạy lại.
 */
export default function OfficialUpdatesSkeleton() {
  return (
    <div className="mb-12">
      <NodeSkeleton latest />
      <NodeSkeleton />
      <NodeSkeleton />
      <NodeSkeleton last />
    </div>
  );
}
