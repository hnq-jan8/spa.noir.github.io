import Skeleton, { SkeletonScreen } from "@/components/ui/Skeleton";

/**
 * Mirrors ArticleDetail, used when the page loads straight into `?a=` — a
 * shared or reloaded article link — where the list skeleton would show the
 * wrong shape and then swap to a full-width article.
 *
 * Same wrapper as the real detail view: below md there is no card box, so the
 * wrapper carries the white itself and `flex-1` claims main's leftover height
 * (see PressReleasesContent for the full rationale).
 */
export default function ArticleDetailSkeleton() {
  return (
    <SkeletonScreen className="relative z-0 flex-1 md:flex-none container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 pb-8">
      {/* Meta bar: back on the left from md up, date + reading time right. */}
      <div className="flex flex-col gap-2 md:flex-row md:items-center md:justify-between md:gap-4 mb-3 md:mb-4 md:px-1">
        <Skeleton className="skeleton-on-card hidden md:block h-4 w-20" />
        <div className="flex items-center gap-3 justify-start md:justify-end">
          <Skeleton className="skeleton-on-card h-3 w-28" />
          <Skeleton className="skeleton-on-card h-3 w-16" />
        </div>
      </div>

      <div className="press-article-card md:bg-white md:rounded-2xl md:p-8 md:card-shadow md:border md:border-white">
        <Skeleton className="skeleton-on-card h-8 md:h-9 w-11/12 mb-3" />
        <Skeleton className="skeleton-on-card h-8 md:h-9 w-2/3 mb-4" />
        <hr className="border-gray-300 mb-6" />
        {/* Body: paragraph blocks of uneven length, with a gap between them —
            a single even stack of bars doesn't read as prose. */}
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
      </div>
    </SkeletonScreen>
  );
}
