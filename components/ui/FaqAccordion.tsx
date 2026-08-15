"use client";
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import {
  EXPAND_GRID_TRANSITION_CLASS,
  expandTransition,
} from "@/lib/expandTransition";

// Less negative delay than EXPAND_GRID_TRANSITION_CLASS's -150ms: a rotation
// needs more of the curve on screen to read as motion.
const CHEVRON_TRANSITION_CLASS =
  "transition-transform duration-300 delay-[-100ms] ease-out";

interface FaqItem {
  question: string;
  answer: string;
}

function AccordionPanel({
  isOpen,
  panelId,
  children,
}: {
  isOpen: boolean;
  panelId: string;
  children: React.ReactNode;
}) {
  // grid-rows 0fr/1fr trick (no JS height measuring). min-h-0 on the inner
  // wrapper is required or the track never reaches 0fr. See
  // lib/expandTransition.ts for the negative-delay timing trick.
  return (
    <div
      id={panelId}
      role="region"
      aria-hidden={!isOpen}
      style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
      className={EXPAND_GRID_TRANSITION_CLASS}
    >
      <div className="overflow-hidden min-h-0">{children}</div>
    </div>
  );
}

export default function FaqAccordion({
  items,
  animateFirstOpen = true,
  onFirstItemOpenChange,
  reopenFirstSignal,
}: {
  items: FaqItem[];
  /** Skip when the caller already knows the first item is the same one
   * that was showing before this remount (e.g. narrowing a search without
   * the top result changing) — opens it plainly instead of replaying the
   * expand-in, since nothing actually changed for the reader to notice. */
  animateFirstOpen?: boolean;
  /** Reports whenever item 0's open state changes, so a non-remounting
   * caller (this component doesn't own that decision — see FaqsContent's
   * own `animateFirstOpen` computation) can tell a plain unchanged-question
   * remount apart from one where the reader had actually closed it. */
  onFirstItemOpenChange?: (isOpen: boolean) => void;
  /** Bump (e.g. pass the applied search string) whenever a new search just
   * resolved, even one that left the result set untouched — a change here
   * re-opens item 0 if it's currently closed, as confirmation the search
   * actually re-ran. Only acts on updates, not the mount that first sets
   * it, so it never fights animateFirstOpen's own opening sequence. */
  reopenFirstSignal?: string | number;
}) {
  // Starts closed (not item 0 open) only when animating in — the mount
  // effect below needs somewhere to animate *from*. Otherwise item 0 opens
  // immediately, unanimated, same as a plain `defaultOpen`.
  const [openSet, setOpenSet] = useState<Set<number>>(() =>
    animateFirstOpen ? new Set() : new Set(items.length > 0 ? [0] : []),
  );

  // FLIP: growing/shrinking a panel pushes every card below it through
  // normal flow, which forces the browser to recompute their position on
  // every animation frame (the actual jank source on mobile Safari — a
  // single card's own layout is cheap, but reflowing the whole list below
  // it every frame isn't). Instead we let the DOM jump straight to the new
  // layout in one reflow, then paper over the jump by animating each
  // shifted card's `transform` from its old position back to zero —
  // transform runs on the compositor, not main-thread layout.
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const prevRects = useRef<Map<number, number>>(new Map());
  const cancelRef = useRef(0);

  const captureRects = () => {
    const rects = new Map<number, number>();
    cardRefs.current.forEach((el, idx) => {
      if (el) rects.set(idx, el.getBoundingClientRect().top);
    });
    prevRects.current = rects;
  };

  const toggle = (i: number) => {
    captureRects();
    setOpenSet((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });
  };

  // Plays the first card's own expand transition in on mount, standing in
  // for a generic fade/slide reveal of the whole list. Double rAF (same
  // trick as components/ui/Reveal.tsx) so Safari doesn't coalesce the
  // initial paint with the very next frame and skip straight to open.
  useEffect(() => {
    if (!animateFirstOpen || items.length === 0) return;
    const outer = requestAnimationFrame(() => {
      const inner = requestAnimationFrame(() => {
        captureRects();
        setOpenSet(new Set([0]));
      });
      cancelRef.current = inner;
    });
    cancelRef.current = outer;
    return () => cancelAnimationFrame(cancelRef.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    onFirstItemOpenChange?.(openSet.has(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [openSet]);

  // Every applied search re-opens a closed item 0 — a plain state flip,
  // not the mount effect's double-rAF dance, since the instance is already
  // live and a normal isOpen:false→true change is all the CSS transition
  // needs to catch. Skips its own mount firing (every effect runs once
  // then) so it doesn't race the entrance animation above when both are
  // triggered by the same first search.
  const hasHandledMountRef = useRef(false);
  useEffect(() => {
    if (!hasHandledMountRef.current) {
      hasHandledMountRef.current = true;
      return;
    }
    if (items.length === 0 || openSet.has(0)) return;
    captureRects();
    setOpenSet((prev) => new Set(prev).add(0));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [reopenFirstSignal]);

  useLayoutEffect(() => {
    const prev = prevRects.current;
    if (prev.size === 0) return;
    prevRects.current = new Map();

    cardRefs.current.forEach((el, idx) => {
      if (!el) return;
      const before = prev.get(idx);
      if (before === undefined) return;
      const after = el.getBoundingClientRect().top;
      const dy = before - after;
      if (dy === 0) return;

      el.style.transition = "none";
      el.style.transform = `translateY(${dy}px)`;
      el.getBoundingClientRect(); // force reflow before re-enabling transition
      el.style.transition = expandTransition("transform");
      el.style.transform = "";
    });
  }, [openSet]);

  const renderCard = (item: FaqItem, i: number) => {
    const isOpen = openSet.has(i);
    const panelId = `faq-panel-${i}`;
    return (
      <div
        key={i}
        ref={(el) => {
          cardRefs.current[i] = el;
        }}
        className="bg-white border border-gray-100 rounded-2xl overflow-hidden"
      >
        <button
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          // Rounded on the button itself, not just the card: the focus
          // outline follows a button's *own* border-radius, so without this
          // it stayed square and got hard-cut by the card's overflow-hidden.
          // Top/bottom as separate longhands (not one `rounded-2xl` toggle)
          // so the bottom pair can transition instead of snapping — square
          // when open, since that edge then borders the answer panel.
          className={`w-full rounded-t-2xl ${isOpen ? "rounded-b-none" : "rounded-b-2xl"} flex items-center justify-between pl-4 pr-4 py-3 sm:pl-[22px] sm:pr-6 sm:py-4 text-left transition-[background-color,border-radius] duration-300 ease-out hover:bg-gray-100 active:bg-gray-100`}
          onClick={() => toggle(i)}
        >
          <span className="pr-4 text-gray-900 font-medium">
            {item.question}
          </span>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="18"
            height="18"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            className={`flex-shrink-0 text-gray-500 ${CHEVRON_TRANSITION_CLASS}`}
            style={{ transform: `rotate(${isOpen ? 180 : 0}deg)` }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>
        <AccordionPanel isOpen={isOpen} panelId={panelId}>
          <div className="mx-4 sm:mx-6 border-t border-gray-200 pt-3 sm:pt-4 pb-4 sm:pb-6 text-gray-700 leading-relaxed text-sm">
            {item.answer}
          </div>
        </AccordionPanel>
      </div>
    );
  };

  return <div className="space-y-3">{items.map(renderCard)}</div>;
}
