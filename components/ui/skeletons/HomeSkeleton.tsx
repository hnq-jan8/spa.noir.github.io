import Skeleton, {
  SkeletonScreen,
  SkeletonText,
} from "@/components/ui/Skeleton";

/** Mirrors HomeContent: as-of pill, latest update, hotlines, browse set. */
export default function HomeSkeleton() {
  return (
    <SkeletonScreen className="container-page pb-8 md:pt-3 md:pb-11 max-w-3xl mx-auto">
      {/* As-of pill. Not sticky here — there is nothing yet to scroll under it. */}
      <div className="pt-4 mb-4 md:mb-6">
        <Skeleton className="h-[26px] w-56 max-w-full rounded-full" />
      </div>

      {/* Latest official update. Keeps the dark left rule at reduced weight:
          the card's identity is visible before its text is. */}
      <div className="bg-white border-l-4 border-l-gray-900/30 rounded-2xl p-6 pb-4 card-shadow mb-4">
        <Skeleton className="h-3.5 w-32 mb-3" />
        <Skeleton className="h-5 w-11/12 mb-2" />
        <Skeleton className="h-5 w-2/3 mb-4" />
        <Skeleton className="h-3.5 w-full mb-2" />
        <Skeleton className="h-3.5 w-4/5" />
        <div className="flex items-center justify-between mt-6">
          <Skeleton className="h-3 w-28" />
          <Skeleton className="h-3 w-20" />
        </div>
      </div>

      {/* Support hotlines — same label/value pair as the footer's grid. */}
      <Skeleton className="h-3 w-24 mb-2 mt-6 ml-1.5" />
      <div className="bg-surface rounded-2xl p-6 card-shadow border border-gray-200 mb-4">
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-5">
          {[0, 1, 2, 3].map((i) => (
            <div key={i}>
              <SkeletonText
                box="h-4 mb-1"
                bar="h-3 w-20"
                fill="skeleton-on-surface"
              />
              <SkeletonText
                box="h-6"
                bar="h-4 w-32"
                fill="skeleton-on-surface"
              />
            </div>
          ))}
        </div>
      </div>

      <Skeleton className="h-3 w-20 mb-2 mt-6 ml-1.5" />

      {/* Browse, below 800px: the grouped, hairline-divided list. */}
      <div className="min-[800px]:hidden mb-4 bg-white rounded-2xl divide-y divide-gray-100 overflow-hidden card-shadow">
        {[0, 1, 2].map((i) => (
          <div key={i} className="flex items-center gap-4 px-4 py-3.5 sm:px-6">
            <Skeleton className="skeleton-on-card w-5 h-5 flex-shrink-0 mr-1 sm:mr-2" />
            <div className="flex-1 min-w-0">
              <Skeleton className="skeleton-on-card h-4 w-2/5 mb-2" />
              <Skeleton className="skeleton-on-card h-3.5 w-3/4" />
            </div>
            <Skeleton className="skeleton-on-card w-5 h-5 flex-shrink-0" />
          </div>
        ))}
      </div>

      {/* 800px+: two cards in a row, then one full-width card. */}
      <div className="hidden min-[800px]:block">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {[0, 1].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 card-shadow">
              <Skeleton className="skeleton-on-card w-6 h-6 mb-3" />
              <Skeleton className="skeleton-on-card h-5 w-2/5 mb-2" />
              <Skeleton className="skeleton-on-card h-3.5 w-4/5" />
            </div>
          ))}
        </div>
        <div className="bg-white rounded-2xl p-6 card-shadow flex items-center gap-4">
          <Skeleton className="skeleton-on-card w-6 h-6 flex-shrink-0" />
          <div className="flex-1">
            <Skeleton className="skeleton-on-card h-5 w-1/4 mb-2" />
            <Skeleton className="skeleton-on-card h-3.5 w-1/2" />
          </div>
        </div>
      </div>
    </SkeletonScreen>
  );
}
