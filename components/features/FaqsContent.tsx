"use client";

import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useHideBreadcrumbWhen } from "@/hooks/useBreadcrumbVisibility";
import { useContentState } from "@/hooks/useContentData";
import FaqsSkeleton from "@/components/ui/skeletons/FaqsSkeleton";
import Reveal from "../ui/Reveal";

/** Same curve + negative-delay trick as the FAQ accordion's own expand
 * (lib/expandTransition.ts): only the decelerating half of the curve plays. */
const CAPSULE_TRANSITION = "duration-300 delay-[-150ms] ease-out";

/** Delay before a keystroke actually filters the list. */
const SEARCH_DEBOUNCE_MS = 200;

/** Shared by the desktop dock and the mobile capsule — same field, different framing. */
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
  // pointer-events-auto: the desktop dock wraps this in a pointer-events-none
  // sticky box so its empty padding can't swallow clicks on the card below.
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
        // Gray, not amber — same fill a card gets on hover, not the accent.
        className="relative w-full bg-white/75 backdrop-blur-md border border-gray-200 rounded-full pl-11 pr-11 py-3 text-sm text-gray-900 placeholder:text-gray-500 shadow-[0_0_5px_rgba(0,0,0,0.05)] focus:outline-none focus:bg-white focus:border-gray-400"
      />
      {query && (
        <button
          type="button"
          // Applies immediately — waiting out the debounce would read as a dead button.
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
  // `query` drives the field, `applied` lags behind and drives the filtering:
  // the list is keyed on its contents, so filtering per keystroke would remount
  // the whole accordion while the user is still typing.
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  // Below md the field starts collapsed into an icon beside the breadcrumb.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  // Desktop: focusing docks the field under the tab nav and drops the padding
  // above it; reverts once the field is both empty and unfocused.
  const [desktopFieldEngaged, setDesktopFieldEngaged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const desktopInputRef = useRef<HTMLInputElement>(null);
  const prevFirstQuestionRef = useRef<string | undefined>(undefined);
  // Reported by FaqAccordion: it owns the state but remounts, this parent doesn't.
  const firstItemOpenRef = useRef(false);
  // Flips only once real results have rendered — content loads async, so
  // several empty `filtered` renders can precede them.
  const hasShownResultsRef = useRef(false);
  const isFirstAppliedRef = useRef(true);

  useEffect(() => {
    const id = setTimeout(() => setApplied(query), SEARCH_DEBOUNCE_MS);
    return () => clearTimeout(id);
  }, [query]);

  // A fresh result set opens on its own first card; skip the first run so
  // page load doesn't jump too.
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

  // iOS Safari's overscroll bounce can desync fixed/sticky layers and let the
  // breadcrumb peek through the curtain — hide the breadcrumb itself instead.
  useHideBreadcrumbWhen(mobileSearchOpen);

  const faqs = data?.faqs.faqs ?? [];
  const labels = data?.faqs.labels["faqs"] ?? {};
  const normalized = applied.trim().toLocaleLowerCase();
  // searchText spans every locale (lib/contentData.ts), so a query in one
  // language still finds the same item's other translations.
  const filtered = normalized
    ? faqs.filter((faq) => faq.searchText.includes(normalized))
    : faqs;

  // FaqAccordion remounts per result set (its `key` below), so "is this still
  // the card the reader already had open?" has to be tracked here, in the
  // parent that survives. Don't replay the expand-in unless the top question
  // changed or the reader had closed it themselves; the page's own first paint
  // is announced by <Reveal>, not by the card popping open.
  //
  // Memoized per accordionKey, not a plain const: content comes from a
  // module-level cache (useContentData.ts), so a client-side nav can re-render
  // this after mount — recomputing inline would drop <Reveal> before it ever
  // painted, losing the entrance fade.
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

  if (!data) return failed ? <ContentLoadError /> : <FaqsSkeleton />;

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
      // Desktop pt only: engaging trims it to the offset the field's sticky
      // wrapper already sits at, so field and cards slide up together in one
      // reflow. md:pt-[18px] (not pt-4) matches the wrapper's top-[58px]
      // exactly — 2px past it and sticky clamps the field early while the
      // cards keep easing, which reads as the two falling out of sync.
      className={`container-page pb-8 md:pb-8 max-w-3xl mx-auto pt-4 transition-[padding-top] duration-300 ease-out ${
        desktopFieldEngaged ? "md:pt-[18px]" : "md:pt-8"
      } ${desktopFieldEngaged || mobileSearchOpen ? "min-h-[100dvh]" : ""}`}
    >
      {/* min-h while engaged: a short result list would otherwise let the
          field's sticky wrapper reach the footer boundary and un-stick
          mid-search.

          Mobile: one capsule anchored beside the breadcrumb morphs its width
          from a 34px circle into the full-width field (fixed height, so it
          reads as the icon stretching sideways). The z-[19] mask below hides
          the breadcrumb and list scrolling under it. */}
      <div
        className={`md:hidden fixed inset-x-0 top-12 h-[50px] bg-page z-[19] transition-opacity duration-200 pointer-events-none ${
          mobileSearchOpen ? "opacity-100" : "opacity-0"
        }`}
      />
      {/* Fades past the mask's bottom edge so a text line crossing it
          dissolves instead of being sliced in half. */}
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
              // The capsule is pinned to the breadcrumb row — scrolled down, it
              // would expand over content the user wasn't looking at.
              window.scrollTo({ top: 0 });
              setMobileSearchOpen(true);
            }}
            aria-label={labels["searchPlaceholder"]}
            className="absolute inset-0"
          />
        )}
        {/* Centered in the circle when collapsed, docked as the field's prefix
            icon when open — same curve as the capsule so it slides, not jumps. */}
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
          // Blur with nothing typed collapses back to the icon: an open, empty
          // field covering the breadcrumb reads as unfinished.
          onBlur={() => {
            if (!query.trim()) setMobileSearchOpen(false);
          }}
          placeholder={labels["searchPlaceholder"]}
          aria-label={labels["searchPlaceholder"]}
          tabIndex={mobileSearchOpen ? 0 : -1}
          // text-base (16px), not text-sm: iOS Safari auto-zooms the viewport on
          // focus for anything smaller, fighting the capsule's expand.
          className={`absolute inset-y-0 left-9 right-9 bg-transparent text-base text-gray-900 placeholder:text-gray-500 focus:outline-none transition-opacity duration-150 ${
            mobileSearchOpen
              ? "opacity-100"
              : "opacity-0 pointer-events-none"
          }`}
        />
        {mobileSearchOpen && query && (
          <button
            type="button"
            // Clicking blurs the input (native focus shift), so refocus —
            // otherwise the next blur collapses the capsule as "empty".
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

      {/* Permanently sticky (swapping to `fixed` on engage remounts the input
          and drops focus), and `top` transitions directly — riding the
          container's pt animation only worked near scrollY 0. */}
      <div
        className={`hidden md:block sticky z-[9] pt-4 pb-6 -mt-4 -mb-2 pointer-events-none transition-[top] duration-300 ease-out ${
          desktopFieldEngaged ? "top-[58px]" : "top-[72px]"
        }`}
      >
        <div className="relative">
          {/* Masks the band between the navbar and the field's translucent
              surface. Sized for the taller, unengaged gap so it always reaches
              the nav; stops at the field's vertical middle so text scrolling up
              dissolves through the backdrop-blur below that line instead of
              being masked twice. -inset-x-2 covers the cards' 6px shadow blur,
              which bled past a flush edge at the pill's corners. */}
          <div className="absolute -inset-x-2 -top-8 h-[55px] bg-page pointer-events-none" />
          <SearchField
            query={query}
            onChange={setQuery}
            inputRef={desktopInputRef}
            onClear={() => {
              // Clicking blurs the input (native focus shift) — refocus so the
              // now-empty field doesn't un-engage on the next blur check.
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

      {/* Mobile, capsule open: the hidden breadcrumb still reserves its row
          (hooks/useBreadcrumbVisibility.ts), leaving too much air below the
          field. */}
      <div
        className={`transition-[margin-top] ${CAPSULE_TRANSITION} ${mobileSearchOpen ? "-mt-6 md:mt-0" : "mt-0"}`}
      >
      {filtered.length === 0 ? (
        // No <Reveal>: a search outcome isn't the page appearing.
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
        // Remounts on every result-set change: the accordion keys its open
        // state by array index, which filtering would otherwise misalign.
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
          // <Reveal> only for the page's own first paint — later mounts are
          // search outcomes, not the page appearing.
          return isFirstRealRender ? <Reveal>{accordion}</Reveal> : accordion;
        })()
      )}
      </div>
    </div>
  );
}
