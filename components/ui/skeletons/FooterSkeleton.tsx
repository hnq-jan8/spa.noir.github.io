import Skeleton, { SkeletonText } from "@/components/ui/Skeleton";

/**
 * The footer's contact grid while content.json is in flight. Four slots:
 * that's what the CMS ships (two hotlines + two mailboxes) and the grid is
 * `lg:grid-cols-4`, so a full row is the honest guess. Without it the footer
 * renders short and jumps taller the moment the data lands.
 */
export function FooterContactsSkeleton() {
  return (
    <div className="grid grid-cols-1 min-[510px]:grid-cols-2 lg:grid-cols-4 gap-6">
      {[0, 1, 2, 3].map((i) => (
        // 16 + 4 + 24: the label's text-xs line box, its mb-1, and the
        // inline-flex link below it.
        <div key={i}>
          <SkeletonText
            box="h-4 mb-1"
            bar="h-3 w-24"
            fill="skeleton-on-surface"
          />
          <SkeletonText box="h-6" bar="h-4 w-32" fill="skeleton-on-surface" />
        </div>
      ))}
    </div>
  );
}

/** Eyebrow + the social icon row (five icons, the full set in SOCIAL_ICONS). */
export function FooterSocialSkeleton() {
  return (
    <div className="mt-8">
      <SkeletonText box="h-4 mb-3" bar="h-3 w-28" fill="skeleton-on-surface" />
      {/* Circles, because that is what a row of glyphs reads as at this size.
          Measured against the real row: 17px marks on 33px centres (hence
          gap-4), h-[25px] for the anchor's py-1 around a 16.86px icon, and
          -ml-1 for its px-1 — so each icon lands on its own placeholder. */}
      <div className="flex items-center gap-4 -ml-1 h-[25px]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Skeleton
            key={i}
            className="skeleton-on-surface w-[17px] h-[17px] flex-shrink-0 rounded-full"
          />
        ))}
      </div>
    </div>
  );
}
