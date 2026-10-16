"use client";

import PageTitle from "@/components/ui/PageTitle";
import { useEffect, useMemo, useRef, useState, type RefObject } from "react";
import { Search, X } from "lucide-react";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useContentState } from "@/hooks/useContentData";
import FaqsSkeleton, {
  FaqsSearchFieldSkeleton,
} from "@/components/ui/skeletons/FaqsSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
import Reveal from "../ui/Reveal";

/** Same curve + negative-delay trick as the FAQ accordion's own expand
 * (lib/expandTransition.ts): only the decelerating half of the curve plays. */

/** Delay before a keystroke actually filters the list. */
const SEARCH_DEBOUNCE_MS = 200;

/** The search field — sticky dock on desktop, in-flow on mobile. */
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
        // `outline-none` chỉ dành cho ô nhập: trình duyệt tính ô text là
        // `:focus-visible` kể cả khi bấm chuột, nên vòng focus chung sẽ hiện
        // mọi lần bấm — thừa, vì con trỏ nháy đã là chỉ báo rõ nhất. Thay bằng
        // viền đậm lên một nấc, cùng tông xám với vòng focus chung. `ring-inset`
        // 1px chồng lên viền cho dày thành 2px mà không đội layout như border-2.
        // Mobile: ô thấp (34px, như viên nang cũ) nên chỉ đậm viền 1px, không chồng ring.
        className="relative w-full bg-white/75 backdrop-blur-md border border-gray-200 rounded-full pl-11 pr-11 h-[34px] md:h-auto md:py-3 text-base md:text-sm leading-5 text-gray-900 placeholder:text-gray-400 shadow-[0_0_5px_rgba(0,0,0,0.05)] focus:outline-none focus:bg-white focus:border-gray-500 md:focus:ring-1 focus:ring-inset focus:ring-gray-500"
      />
      {query && (
        <button
          type="button"
          // Applies immediately — waiting out the debounce would read as a dead button.
          onClick={onClear}
          aria-label={clearLabel}
          className="absolute right-3 top-1/2 -translate-y-1/2 w-6 h-6 flex items-center justify-center rounded-full text-gray-400 hover:text-gray-700 hover:bg-gray-100"
        >
          <X className="w-4 h-4" strokeWidth={2} />
        </button>
      )}
    </div>
  );
}

export default function FaqsContent() {
  const { data, failed } = useContentState();
  // `query` cho ô nhập, `applied` trễ hơn và mới là thứ lọc: danh sách key
  // theo nội dung nên lọc từng phím sẽ remount accordion khi đang gõ.
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  // Focusing docks the field near the top and drops what's above it — desktop:
  // under the tab nav; mobile: the page title collapses and the padding
  // shrinks so the field rises to just under the header. Reverts once the
  // field is both empty and unfocused.
  const [fieldEngaged, setFieldEngaged] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
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

  const faqs = data?.faqs.faqs ?? [];
  const labels = data?.faqs.labels["faqs"] ?? {};
  const normalized = applied.trim().toLocaleLowerCase();
  // searchText spans every locale (lib/contentData.ts), so a query in one
  // language still finds the same item's other translations.
  const filtered = normalized
    ? faqs.filter((faq) => faq.searchText.includes(normalized))
    : faqs;

  // FaqAccordion remount theo mỗi tập kết quả (`key` bên dưới), nên "vẫn là
  // thẻ người đọc đang mở?" phải theo dõi ở đây — component cha sống sót.
  // Chỉ diễn lại animation mở khi câu đầu đổi hoặc người đọc đã tự đóng.
  //
  // Memo theo accordionKey chứ không phải const thường: content đến từ cache
  // module-level nên một lần nav client-side có thể re-render lại sau mount,
  // tính lại inline sẽ giết <Reveal> trước khi nó kịp vẽ.
  const firstQuestion = filtered[0]?.question;
  const accordionKey = filtered.map((f) => f.question).join(" ");
  const isFirstRealRender = useMemo(
    () => firstQuestion !== undefined && !hasShownResultsRef.current,
    [accordionKey],
  );
  const animateFirstOpen =
    !isFirstRealRender &&
    (prevFirstQuestionRef.current !== firstQuestion ||
      !firstItemOpenRef.current);
  useEffect(() => {
    prevFirstQuestionRef.current = firstQuestion;
    if (firstQuestion !== undefined) hasShownResultsRef.current = true;
  });

  if (!data && failed) return <ContentLoadError />;

  if (data && faqs.length === 0) {
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
      // Desktop: lúc engage pt co về đúng offset mà khung sticky của ô tìm
      // kiếm đang đứng, để ô và card trượt lên cùng một nhịp. Mobile: co từ
      // 32px về 16px, cùng lúc tiêu đề trang thu lại.
      // md:pt-[18px] khớp chính xác top-[58px] — lệch 2px là sticky kẹp ô sớm
      // trong khi card còn đang chạy, nhìn ra ngay là hai thứ rời nhau.
      className={`container-page pb-8 max-xs:pb-0 md:pb-8 max-w-3xl mx-auto transition-[padding-top] duration-300 ease-out ${
        fieldEngaged ? "pt-4 md:pt-[18px]" : "pt-8"
      } ${fieldEngaged ? "min-h-[100dvh]" : ""}`}
      {...loadingProps(!data)}
    >
      {/* min-h while engaged: a short result list would otherwise let the
          field's sticky wrapper reach the footer boundary and un-stick
          mid-search. */}
      {/* Thu cao về 0 bằng grid-rows (như accordion) lúc engage. */}
      <div
        className={`md:hidden grid transition-[grid-template-rows,opacity] duration-300 ease-out ${
          fieldEngaged ? "grid-rows-[0fr] opacity-0" : "grid-rows-[1fr]"
        }`}
      >
        <div className="overflow-hidden">
          <PageTitle />
        </div>
      </div>
      {/* Mọi size dùng chung ô này. Desktop: luôn sticky dưới tab nav
          (swapping to `fixed` on engage remounts the input and drops focus),
          `top` transitions directly — riding the container's pt animation
          only worked near scrollY 0. Mobile: header không sticky nên ô cũng
          nằm yên, cuộn theo trang. */}
      <div
        className={`md:sticky z-[9] pt-4 pb-6 -mt-4 -mb-2 pointer-events-none transition-[top] duration-300 ease-out ${
          fieldEngaged ? "top-[58px]" : "top-[72px]"
        }`}
      >
        <div className="relative">
          {/* Masks the band between the navbar and the field's translucent
              surface. Sized for the taller, unengaged gap so it always reaches
              the nav; stops at the field's vertical middle so text scrolling up
              dissolves through the backdrop-blur below that line instead of
              being masked twice. -inset-x-2 covers the cards' 6px shadow blur,
              which bled past a flush edge at the pill's corners. */}
          <div className="hidden md:block absolute -inset-x-2 -top-8 h-[55px] bg-page pointer-events-none" />
          {!data && <FaqsSearchFieldSkeleton />}
          {data && (
            <SearchField
              query={query}
              onChange={setQuery}
              inputRef={inputRef}
              onClear={() => {
                // Clicking blurs the input (native focus shift) — refocus so the
                // now-empty field doesn't un-engage on the next blur check.
                clearSearch();
                inputRef.current?.focus();
              }}
              onFocus={() => {
                window.scrollTo({ top: 0 });
                setFieldEngaged(true);
              }}
              onBlur={() => {
                if (!query.trim()) setFieldEngaged(false);
              }}
              placeholder={labels["searchPlaceholder"]}
              clearLabel={labels["clearSearch"]}
            />
          )}
        </div>
      </div>

      <div>
        {!data ? (
          // Placeholder đi chung <Reveal> với accordion thật nên React giữ
          // nguyên thẻ bọc, chỉ đổi ruột (xem Reveal.tsx).
          <Reveal>
            <FaqsSkeleton />
          </Reveal>
        ) : filtered.length === 0 ? (
          // No <Reveal>: a search outcome isn't the page appearing.
          <div className="text-center py-16 px-4">
            {labels["noResultsTitle"] && (
              <p className="text-base font-semibold text-gray-900">
                {labels["noResultsTitle"]}
              </p>
            )}
            {labels["noResultsHint"] && (
              <p className="mt-1 text-sm text-gray-600">
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
