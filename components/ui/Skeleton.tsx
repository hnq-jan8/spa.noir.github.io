import type { ReactNode } from "react";

/**
 * One placeholder block. Geometry comes entirely from `className` so each
 * page skeleton can mirror its real layout box for box — the point is that
 * nothing shifts when the content lands. On a white card or the `surface`
 * gray, add .skeleton-on-card / .skeleton-on-surface: the default fill is
 * tuned for the page background and disappears against those.
 */
export default function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`skeleton ${className}`} aria-hidden="true" />;
}

/**
 * A bar centred in the line box of the text it stands in for. The bar stays
 * slim (a full-height block reads as a button, not as text) while the row
 * keeps the real element's height — `box` is that height plus any margin,
 * `bar` the mark inside it.
 */
export function SkeletonText({
  box,
  bar,
  fill = "",
}: {
  box: string;
  bar: string;
  /** .skeleton-on-card / .skeleton-on-surface, when not on the page bg. */
  fill?: string;
}) {
  return (
    <div className={`${box} flex items-center`}>
      <Skeleton className={`${fill} ${bar}`} />
    </div>
  );
}

/**
 * Page-level wrapper for a set of blocks. `role="status"` + `aria-busy`
 * announce the wait without any text — every visible string on this site
 * comes from the CMS (ui_labels), and the labels themselves are part of what
 * is still loading here.
 */
export function SkeletonScreen({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) {
  return (
    <div role="status" aria-busy="true" className={className}>
      {children}
    </div>
  );
}
