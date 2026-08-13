"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useHideBreadcrumbWhen } from "@/hooks/useBreadcrumbVisibility";
import { useContentState } from "@/hooks/useContentData";
import Reveal from "../ui/Reveal";

/** Same curve *and* the same negative-delay trick as the FAQ accordion's
 * own expand/collapse (see lib/expandTransition.ts): starting the
 * transition already half-elapsed plays only the back, decelerating half
 * of the ease-out curve, so it reads as quick rather than a full 300ms
 * sweep. */
const CAPSULE_TRANSITION = "duration-300 delay-[-150ms] ease-out";

/** Delay before a keystroke actually filters the list. */
const SEARCH_DEBOUNCE_MS = 200;

/** The pill itself — shared between the always-visible desktop dock and the
 * collapsible mobile overlay, which differ in positioning but not content. */
function SearchField({
  query,
  onChange,
  onClear,
  onFocus,
  onBlur,
  inputRef,
  placeholder,
  clearLabel,
}: {
  query: string;
  onChange: (value: string) => void;
  onClear: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  inputRef?: RefObject<HTMLInputElement>;
  placeholder?: string;
  clearLabel?: string;
}) {
  // Re-enables pointer events for its own contents — the desktop dock
  // wraps this in a `pointer-events-none` sticky box (see below) so the
  // wrapper's own empty padding can't swallow clicks meant for the card
  // underneath it; this is what makes the actual field clickable again.
  return (
    <div className="relative pointer-events-auto">
      <Search
        className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 z-10"
        strokeWidth={2}
      />
      <input
        ref={inputRef}
        type="text"
        value={query}
        onChange={(e) => onChange(e.target.value)}
        onFocus={onFocus}
        onBlur={onBlur}
        placeholder={placeholder}
        aria-label={placeholder}
        // Gray, not amber — matches the same glow a card gets on hover
        // (see ArticleCard) rather than reaching for the accent color.
        className="relative w-full bg-white/75 backdrop-blur-md border border-gray-200 rounded-full pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-400 shadow-[0_0_5px_rgba(0,0,0,0.05)] transition-[box-shadow,border-color] focus:outline-none focus:border-gray-400 focus:shadow-[0_0_12px_rgba(0,0,0,0.1)]"
      />
      {query && (
        <button
          type="button"
          // Clearing applies straight away — waiting out the debounce to see
          // the full list return would read as an unresponsive button.
          onClick={onClear}
          aria-label={clearLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 active:text-gray-700 hover:bg-gray-100 active:bg-gray-100"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default function FaqsContent() {
  const { data, failed } = useContentState();
  // `query` drives the field so typing stays responsive; `applied` drives the
  // filtering and lags behind it. Without the split, every keystroke rebuilds
  // the whole accordion — and because the list is keyed on its contents, that
  // means a remount per character while the user is still typing.
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  // Below md the field starts collapsed into an icon beside the breadcrumb —
  // opening it is a deliberate tap, not something that eats screen space by
  // default the way the always-visible desktop field does.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  // Desktop (no breadcrumb at this size, so there's nothing else in that
  // row to preserve space for): focusing the field docks it right under
  // the tab nav, dropping the padding above it — reverts once the field is
  // both empty and unfocused, same "empty AND unfocused" rule the mobile
  // capsule uses to decide when it's actually done being used.
  const [desktopFieldEngaged, setDesktopFieldEngaged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const prevFirstQuestionRef = useRef<string | undefined>(undefined);
  // Reported by FaqAccordion (see its own onFirstItemOpenChange) since this
  // component doesn't own that state — remounts reset it, so it's the only
  // way to tell "still the same top question" apart from "...and the reader
  // had actually closed it" below.
  const firstItemOpenRef = useRef(false);
  // Deliberately separate from prevFirstQuestionRef: content loads
  // asynchronously, so several renders can pass with an empty `filtered`
  // before real questions exist — this only flips once real results have
  // actually been shown once, however many empty renders preceded that.
  const hasShownResultsRef = useRef(false);
  const isFirstAppliedRef = useRef(true);

  useEffect(() => {
    const id = setTimeout(() => setApplied(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // A fresh result set always opens on its own first card — scrolled away
  // from that, the reader would land back on questions that no longer
  // match. Skips the very first run so page load doesn't also jump.
  useEffect(() => {
    if (isFirstAppliedRef.current) {
      isFirstAppliedRef.current = false;
      return;
    }
    window.scrollTo({ top: 0 });
  }, [applied]);

  useEffect(() => {
    if (mobileSearchOpen) inputRef.current?.focus();
  }, [mobileSearchOpen]);

  // Masking the breadcrumb with the fixed curtain above isn't watertight —
  // iOS Safari's overscroll bounce can momentarily desync fixed/sticky
  // layers and let it peek through underneath. This makes the breadcrumb
  // itself `invisible` via Navbar instead, closing that gap outright.
  useHideBreadcrumbWhen(mobileSearchOpen);

  const faqs = data?.faqs.faqs ?? [];
  const labels = data?.faqs.labels["faqs"] ?? {};
  const normalized = applied.trim().toLocaleLowerCase();
  // searchText (see lib/contentData.ts) spans every locale's question +
  // answer, not just this page's — so a query in one language still
  // surfaces the same FAQ item's translation into the other.
  const filtered = normalized
    ? faqs.filter((faq) => faq.searchText.includes(normalized))
    : faqs;

  // FaqAccordion remounts on every result-set change (see its own `key`
  // below), so it can't tell on its own whether its first card is the same
  // one that was already showing — that comparison has to live up here, in
  // the parent that doesn't remount. Narrowing a search whose top hit
  // hasn't moved shouldn't replay a card the reader already saw open —
  // *unless* they'd closed it themselves, in which case the remount would
  // otherwise silently re-open it with no animation to explain why.
  //
  // hasShownResultsRef excludes the very first *real* render specifically:
  // that one isn't a search result at all, just the page's own initial
  // paint, which the <Reveal> below already announces — playing the
  // expand-in *again* on top of it would read as the first card popping
  // open a beat after the list itself fades in, not as one single reveal.
  //
  // isFirstRealRender is memoized per accordionKey, not recomputed on every
  // render, because content loads from a module-level cache (see
  // useContentData.ts): navigating here client-side (vs. a hard reload)
  // finds it already populated, so this component's *own* content-sync
  // effects (poll/listener bumps) can re-render it — with a plain `const`
  // here, one of those re-renders would land after the mount effect below
  // had already flipped hasShownResultsRef, recompute false, and swap the
  // just-mounted <Reveal> out for a bare accordion before the browser ever
  // painted the faded-in state — the *reveal itself* going missing on
  // client-side nav specifically, which is exactly what was reported.
  const firstQuestion = filtered[0]?.question;
  const accordionKey = filtered.map((f) => f.question).join(" ");
  const isFirstRealRender = useMemo(
    () => firstQuestion !== undefined && !hasShownResultsRef.current,
    [accordionKey],
  );
  const animateFirstOpen =
    !isFirstRealRender &&
    (prevFirstQuestionRef.current !== firstQuestion || !firstItemOpenRef.current);
  useEffect(() => {
    prevFirstQuestionRef.current = firstQuestion;
    if (firstQuestion !== undefined) hasShownResultsRef.current = true;
  });

  if (!data) return failed ? <ContentLoadError /> : null;

  if (faqs.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
        <EmptyState data={data} />
      </div>
    );
  }

  const clearSearch = () => {
    setQuery("");
    setApplied("");
  };

  return (
    <div
      // Desktop pt only: engaging trims it from py-8's 32px down to 16px —
      // the same top offset the field's own sticky wrapper (pt-4, below)
      // already sits at once scrolled. Transitioning this one property
      // slides the field *and* every card below it up together in a single
      // animated reflow, landing them at exactly the natural scrolled-sticky
      // gap rather than a hand-tuned distance that could drift out of sync
      // with it.
      className={`container-page pb-8 md:pb-8 max-w-3xl mx-auto pt-4 transition-[padding-top] duration-300 ease-out ${
        desktopFieldEngaged ? "md:pt-4" : "md:pt-8"
      } ${desktopFieldEngaged || mobileSearchOpen ? "min-h-screen" : ""}`}
    >
      {/* While the search field is engaged (desktop: focused; mobile: the
          capsule open) the content area is forced to at least a full
          viewport tall (footer excluded — this div doesn't contain it) so
          scrolling through results can't bring the footer's sticky
          boundary into play mid-search: without this, a short result list
          could let the field's own sticky wrapper reach that boundary and
          un-stick while the reader is still actively typing/scrolling. */}
      {/* Mobile: one capsule, right-anchored beside the breadcrumb (top-12/
          pt-4 = 64px; this page has no hero above it to scroll past, so
          that row is already in its stuck position from first paint), that
          morphs its own width from a 34px circle into the full-width field
          rather than swapping between two separate elements. Height stays
          fixed at the icon's own 34px throughout — only the rightward-
          anchored width grows, so it reads as the icon itself stretching
          sideways into the field rather than also growing taller. The mask
          behind it (z-[19]) fades in over the same band so the breadcrumb
          and list scrolling underneath don't show through while it's open;
          the capsule sits at z-20, above the breadcrumb's z-10. */}
      <div
        className={`md:hidden fixed inset-x-0 top-12 h-[50px] bg-page z-[19] transition-opacity duration-200 pointer-events-none ${
          mobileSearchOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* A hard-edged mask sliced a scrolling question in half right at its
          own bottom edge — the top of a text line would vanish behind it
          while the bottom half still showed. This fade continues past that
          edge so a line crossing it dissolves instead of being cut. */}
      <div
        className={`md:hidden fixed inset-x-0 top-[98px] h-6 bg-gradient-to-b from-page to-transparent z-[19] transition-opacity duration-200 pointer-events-none ${
          mobileSearchOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      <div
        className={`md:hidden fixed top-16 right-4 z-20 h-[34px] rounded-full bg-white/75 backdrop-blur-md border border-gray-200 shadow-[0_0_5px_rgba(0,0,0,0.05)] overflow-hidden transition-[width] ${CAPSULE_TRANSITION} ${
          mobileSearchOpen ? "w-[calc(100vw-2rem)]" : "w-[34px]"
        }`}
      >
        {!mobileSearchOpen && (
          <button
            type="button"
            onClick={() => {
              // The capsule opens pinned to the breadcrumb's row — if the
              // page were scrolled down, it'd expand over content the user
              // wasn't looking at instead of the header area they just
              // tapped near.
              window.scrollTo({ top: 0 });
              setMobileSearchOpen(true);
            }}
            aria-label={labels["searchPlaceholder"]}
            className="absolute inset-0"
          />
        )}
        {/* Collapsed: true-centered (left-1/2 -translate-x-1/2) in the 34px
            circle. Open: docked as the field's prefix icon (left-2.5). Both
            positions animate on the same curve as the capsule itself so the
            icon visibly slides into place as it expands, instead of jumping. */}
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-[left,transform] ${CAPSULE_TRANSITION} ${
            mobileSearchOpen ? "left-2.5 translate-x-0" : "left-1/2 -translate-x-1/2"
          }`}
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          // Losing focus with nothing typed collapses back to the icon — an
          // open, empty field left covering the breadcrumb reads as
          // unfinished rather than dismissed.
          onBlur={() => {
            if (!query.trim()) setMobileSearchOpen(false);
          }}
          placeholder={labels["searchPlaceholder"]}
          aria-label={labels["searchPlaceholder"]}
          tabIndex={mobileSearchOpen ? 0 : -1}
          // Fades in/out over the same fast window the (now half-duration)
          // capsule transition actually plays, so neither lags the other.
          // 16px, not text-sm: iOS Safari auto-zooms the viewport on focus
          // for any input under 16px, which would fight the capsule's own
          // expand animation.
          className={`absolute inset-y-0 left-9 right-9 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-opacity duration-150 ${
            mobileSearchOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        />
        {mobileSearchOpen && query && (
          <button
            type="button"
            // Clearing only empties the field — it doesn't collapse the
            // capsule. Clicking the button blurs the input first (native
            // focus-shift on click), so without refocusing here the field
            // would be left open but unfocused, one tap away from a second
            // "unfinished, empty" blur collapsing it before the user can
            // type again.
            onClick={() => {
              clearSearch();
              inputRef.current?.focus();
            }}
            aria-label={labels["clearSearch"]}
            className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 active:text-gray-700 hover:bg-gray-100 active:bg-gray-100"
          >
            <X className="w-4 h-4" strokeWidth={2} />
          </button>
        )}
      </div>

      {/* Desktop: a single, permanently-`sticky` wrapper — engaging no
          longer swaps it for a `fixed` one. The "docked" look on focus
          comes entirely from the container's own pt transition above,
          which pulls this (and everything below it) up into the same
          top-14/pt-4 spot native scrolling would've stuck it at anyway. A
          `fixed` branch used to stand in for that, but swapping between two
          differently-shaped trees on every focus/blur made React tear down
          and rebuild the subtree — including the <input> itself, dropping
          focus the instant a click engaged it. One stable tree sidesteps
          that entirely, and the field's relative offset from its own mask
          never changes, so the mask no longer needs a second calibration
          either. */}
      <div className="hidden md:block sticky top-14 z-[9] pt-4 pb-6 -mt-4 -mb-2 pointer-events-none">
        <div className="relative">
          {/* Solid mask covers the band between the navbar and the field's
              own translucent + blurred surface, so the list scrolling
              underneath doesn't show through the gap above it. It stops at
              the field's vertical middle (field top +23px: pt-4's 16px
              plus half of the ~46px-tall pill) so a question scrolling up
              is hard-covered above that line and dissolves through the
              field's backdrop-blur below it, rather than being masked a
              second time over the gap beneath the field. */}
          <div className="absolute inset-x-0 -top-4 h-[39px] bg-page pointer-events-none" />
          <SearchField
            query={query}
            onChange={setQuery}
            inputRef={desktopInputRef}
            onClear={() => {
              // Clicking the button blurs the input first (native
              // focus-shift on click) — without refocusing, an empty-now
              // field would sit there unfocused, one stray blur-rule check
              // away from collapsing before the user gets a chance to type
              // again.
              clearSearch();
              desktopInputRef.current?.focus();
            }}
            onFocus={() => {
              window.scrollTo({ top: 0 });
              setDesktopFieldEngaged(true);
            }}
            onBlur={() => {
              if (!query.trim()) setDesktopFieldEngaged(false);
            }}
            placeholder={labels["searchPlaceholder"]}
            clearLabel={labels["clearSearch"]}
          />
        </div>
      </div>

      {/* Pulled up a touch, mobile-only, while the capsule is open — the
          breadcrumb's own row still reserves its usual space (see
          hooks/useBreadcrumbVisibility.ts), which reads as slightly too far
          below the now full-width field. Reverts with the same transition
          the capsule itself uses. */}
      <div
        className={`transition-[margin-top] ${CAPSULE_TRANSITION} ${mobileSearchOpen ? "-mt-6 md:mt-0" : "mt-0"}`}
      >
      {filtered.length === 0 ? (
        // Not wrapped in <Reveal> — a search producing no results is a
        // search outcome, not a page appearing, so it shouldn't replay the
        // entrance fade the way the very first paint below does.
        <div className="text-center py-16 px-4">
          {labels["noResultsTitle"] && (
            <p className="text-base font-semibold text-gray-900">
              {labels["noResultsTitle"]}
            </p>
          )}
          {labels["noResultsHint"] && (
            <p className="mt-1 text-sm text-gray-500">
              {labels["noResultsHint"]}
            </p>
          )}
        </div>
      ) : (
        // Remounts (not updates) whenever the filtered set itself changes —
        // the accordion's open/collapse state is keyed by array index,
        // which would otherwise point at the wrong question once filtering
        // reorders/removes items. `animateFirstOpen` (computed above, in
        // this non-remounting parent) separately decides whether that's
        // worth replaying the first card's expand-in for.
        (() => {
          const accordion = (
            <FaqAccordion
              key={accordionKey}
              items={filtered}
              animateFirstOpen={animateFirstOpen}
              onFirstItemOpenChange={(isOpen) => {
                firstItemOpenRef.current = isOpen;
              }}
              reopenFirstSignal={applied}
            />
          );
          // <Reveal> only for the page's own first paint — a search
          // narrowing back into results (from a no-results or an empty
          // starting state) is a search outcome, not the page appearing,
          // so later mounts of this branch skip straight to the accordion.
          return isFirstRealRender ? <Reveal>{accordion}</Reveal> : accordion;
        })()
      )}
      </div>
    </div>
  );
}
