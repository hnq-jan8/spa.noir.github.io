import Skeleton, { SkeletonScreen } from "@/components/ui/Skeleton";

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

      <div className="mx-4 border-b pt-4 border-gray-200" />

      <div className="grid grid-cols-3 divide-x divide-gray-200 py-3">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex flex-col items-center justify-center">
            <Skeleton className="skeleton-on-card h-3 w-10 mb-2" />
            <Skeleton className="skeleton-on-card h-5 w-14" />
          </div>
        ))}
      </div>
    </div>
  );
}

/**
 * Mirrors FlightInfoContent: the table (stacked cards below md, a 7-column
 * grid from md up) inside the md+ white card, then the policy section.
 */
export default function FlightInfoSkeleton() {
  return (
    <SkeletonScreen className="container-page pt-4 pb-8 md:py-8 md:max-w-6xl md:mx-auto">
      <div className="md:bg-white md:rounded-2xl md:p-6 md:card-shadow">
        <Skeleton className="h-7 w-52 mb-4 md:skeleton-on-card" />

        <div className="md:hidden grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
          <FlightCardSkeleton />
          <FlightCardSkeleton />
        </div>

        {/* The md+ table: a header row of seven, then body rows. Widths follow
            the real column proportions so nothing jumps on swap — index 3 is
            the wider Route column. */}
        <div className="hidden md:block -mx-6">
          <div className="px-6">
            <div className="grid grid-cols-[3rem_1fr_1fr_1.6fr_1fr_1fr_1fr] gap-x-4 lg:gap-x-8 items-center border-b border-gray-200 pb-2">
              {[0, 1, 2, 3, 4, 5, 6].map((i) => (
                <Skeleton key={i} className="skeleton-on-card h-4 w-full" />
              ))}
            </div>
            {[0, 1, 2, 3, 4].map((row) => (
              <div
                key={row}
                className="grid grid-cols-[3rem_1fr_1fr_1.6fr_1fr_1fr_1fr] gap-x-4 lg:gap-x-8 items-center border-b border-gray-100 py-3"
              >
                {[0, 1, 2, 3, 4, 5, 6].map((col) => (
                  <Skeleton
                    key={col}
                    className={`skeleton-on-card h-4 ${col === 3 ? "w-full" : "w-3/4"}`}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        <div className="mt-10">
          <Skeleton className="h-7 w-40 mb-4 md:skeleton-on-card" />
          <div className="max-w-3xl">
            <Skeleton className="h-3.5 w-full mb-2 md:skeleton-on-card" />
            <Skeleton className="h-3.5 w-full mb-2 md:skeleton-on-card" />
            <Skeleton className="h-3.5 w-11/12 mb-2 md:skeleton-on-card" />
            <Skeleton className="h-3.5 w-3/5 md:skeleton-on-card" />
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
