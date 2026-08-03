// Shared timing for the "smooth expand/collapse" effect used by
// grid-template-rows 0fr/1fr accordions (see components/ui/FaqAccordion.tsx)
// and by any JS-driven motion that needs to land on the exact same curve
// (e.g. a FLIP transform animating siblings pushed by an expanding panel).
//
// The negative delay is the trick: setting delay to -EXPAND_HALF_MS makes
// the browser evaluate the transition as if half the duration had already
// elapsed on the very first rendered frame, so only the decelerating back
// half of the ease-out curve actually gets painted. Half as many frames
// need a layout recalc per toggle. (Tried swapping this for an honest full
// curve at half the duration instead — felt laggier in practice, reverted.)
export const EXPAND_DURATION_MS = 300;
export const EXPAND_HALF_MS = EXPAND_DURATION_MS / 2;
export const EXPAND_EASE = "ease-out";

// Literal string (not built via interpolation) so Tailwind's JIT content
// scanner can find it. Keep in sync with the constants above.
export const EXPAND_GRID_TRANSITION_CLASS =
  "grid transition-[grid-template-rows] duration-300 delay-[-150ms] ease-out";

// Inline `transition` value for JS-driven animations that need to match
// EXPAND_GRID_TRANSITION_CLASS above (e.g. el.style.transition = ...).
export function expandTransition(property: string): string {
  return `${property} ${EXPAND_DURATION_MS}ms ${EXPAND_EASE} -${EXPAND_HALF_MS}ms`;
}
