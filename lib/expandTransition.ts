// Shared timing for the grid-template-rows 0fr/1fr expand/collapse and for any
// JS-driven motion that has to land on the same curve (e.g. FaqAccordion's FLIP
// transforms).
//
// The negative delay is the trick: -EXPAND_HALF_MS makes the browser start the
// transition already half-elapsed, so only the decelerating half of the curve
// is painted — half as many layout recalcs per toggle. (An honest full curve at
// half the duration felt laggier.)
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
