"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
  type RefObject,
} from "react";
import { Search } from "lucide-react";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FaqAccordion from "@/components/ui/FaqAccordion";
import { useContentState } from "@/hooks/useContentData";
import FaqsSkeleton, {
  FaqsSearchFieldSkeleton,
} from "@/components/ui/skeletons/FaqsSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
import PageTitle from "@/components/ui/PageTitle";
import Reveal from "@/components/ui/Reveal";

/** Same curve + negative-delay trick as the FAQ accordion's own expand
 * (lib/expandTransition.ts): only the decelerating half of the curve plays. */
const CAPSULE_TRANSITION = "duration-300 delay-[-150ms] ease-out";
/** Phần đường cong thật sự chạy (300ms − 150ms delay âm) — viên nang khoá
 *  thao tác trong khoảng này để không bấm chồng lên lúc đang giãn/thu. */
const CAPSULE_ANIM_MS = 150;

/** Delay before a keystroke actually filters the list. */
const SEARCH_DEBOUNCE_MS = 200;

/**
 * Nút tròn tô nền ở đuôi ô tìm kiếm, như ô tìm kiếm của iOS: dấu X (xoá chữ)
 * hoặc chevron (thu ô mobile). Vùng bấm 32px quanh viên 20px.
 * `preventDefault` lúc nhấn giữ nguyên focus ở ô nhập — không thì blur bắn
 * trước click, ô mobile tưởng bị bỏ dở.
 */
function FieldButton({
  onClick,
  label,
  className = "",
  children,
}: {
  onClick: () => void;
  label?: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <button
      type="button"
      onPointerDown={(e) => e.preventDefault()}
      onClick={onClick}
      aria-label={label}
      className={`group absolute top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center ${className}`}
    >
      <span className="w-5 h-5 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center group-hover:bg-gray-300 group-hover:text-gray-800">
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth={2.5}
          strokeLinecap="round"
          strokeLinejoin="round"
          aria-hidden="true"
          className="w-3 h-3"
        >
          {children}
        </svg>
      </span>
    </button>
  );
}

/** Một path chứ không phải hai như lucide `X`: hai nét chồng nhau khử răng
 *  cưa riêng, chỗ giao để lộ một khe sáng. */
const X_PATH = <path d="M6 6l12 12M18 6L6 18" />;
// Lệch phải 1.5 đơn vị so với tâm hình học: mũi nhọn dồn khối sang phải
// nên chevron căn đúng tâm lại trông lệch trái trong viên tròn.
const CHEVRON_RIGHT_PATH = <path d="M10.5 6l6 6-6 6" />;

/** The desktop search field — docked sticky under the tab nav. */
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
        className="relative w-full bg-white/75 backdrop-blur-md border border-gray-200 rounded-full pl-11 pr-11 py-3 text-sm leading-5 text-gray-900 placeholder:text-gray-400 shadow-[0_0_5px_rgba(0,0,0,0.05)] focus:outline-none focus:bg-white focus:border-gray-500 focus:ring-1 focus:ring-inset focus:ring-gray-500"
      />
      {/* Applies immediately — waiting out the debounce would read as a dead button. */}
      {query && (
        <FieldButton onClick={onClear} label={clearLabel} className="right-2">
          {X_PATH}
        </FieldButton>
      )}
    </div>
  );
}

/**
 * Ô tìm kiếm mobile: viên nang 34px ngang hàng tên trang, cuộn theo trang
 * (header mobile cũng không sticky). Treo trên một mốc cao 0 đặt ngay trên
 * hàng tên trang nên không chiếm chỗ. Bấm vào thì về đầu trang và giãn ngang
 * hết bề rộng tại chỗ; thu lại bằng chevron, hoặc chạm ra ngoài khi ô trống.
 * Mọi lần mở/đóng khoá thao tác CAPSULE_ANIM_MS để hiệu ứng chạy trọn.
 */
function MobileSearch({
  open,
  onOpenChange,
  query,
  onQueryChange,
  onClear,
  placeholder,
  clearLabel,
  closeLabel,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  query: string;
  onQueryChange: (value: string) => void;
  onClear: () => void;
  placeholder?: string;
  clearLabel?: string;
  closeLabel?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const capsuleRef = useRef<HTMLDivElement>(null);
  const busyRef = useRef(false);
  const queryRef = useRef(query);
  queryRef.current = query;

  /** false khi đang khoá (animation chưa xong) — lệnh bị bỏ qua. */
  const toggle = (next: boolean) => {
    if (busyRef.current) return false;
    busyRef.current = true;
    setTimeout(() => (busyRef.current = false), CAPSULE_ANIM_MS);
    onOpenChange(next);
    return true;
  };
  const close = () => {
    if (toggle(false)) inputRef.current?.blur();
  };

  useEffect(() => {
    if (open) inputRef.current?.focus();
  }, [open]);

  // Chạm ra ngoài khi ô trống thì thu lại. Không trông vào blur: iOS chạm
  // vào vùng không focus được thì ô nhập vẫn giữ focus, blur không bắn.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: PointerEvent) => {
      if (capsuleRef.current?.contains(e.target as Node)) return;
      if (!queryRef.current.trim()) close();
    };
    document.addEventListener("pointerdown", onDown);
    return () => document.removeEventListener("pointerdown", onDown);
    // close() chỉ đọc ref + setter ổn định, không cần làm mới theo render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  return (
    <div className="md:hidden relative z-[1] h-0">
      <div
        ref={capsuleRef}
        className={`absolute right-0 top-0 h-[34px] rounded-full bg-white border border-gray-200 shadow-[0_0_5px_rgba(0,0,0,0.05)] overflow-hidden transition-[width] ${CAPSULE_TRANSITION} focus-within:border-gray-500 ${
          open ? "w-full" : "w-[34px]"
        }`}
      >
        {!open && (
          <button
            type="button"
            onClick={() => {
              // Về đầu trang trước, để ô giãn đúng chỗ người đọc đang nhìn.
              if (toggle(true)) window.scrollTo({ top: 0 });
            }}
            aria-label={placeholder}
            className="absolute inset-0 z-10"
          />
        )}
        <Search
          className={`pointer-events-none absolute top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 transition-[left,transform] ${CAPSULE_TRANSITION} ${
            open ? "left-2.5 translate-x-0" : "left-1/2 -translate-x-1/2"
          }`}
          strokeWidth={2}
        />
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          // Bỏ ra ngoài mà chưa gõ gì thì thu về viên tròn.
          onBlur={() => {
            if (!query.trim()) toggle(false);
          }}
          placeholder={placeholder}
          aria-label={placeholder}
          tabIndex={open ? 0 : -1}
          // text-base (16px): nhỏ hơn là iOS Safari tự phóng to trang lúc focus.
          className={`absolute inset-y-0 left-9 right-9 bg-transparent text-base text-gray-900 placeholder:text-gray-400 focus:outline-none transition-opacity duration-150 ${
            open ? "opacity-100" : "opacity-0 pointer-events-none"
          }`}
        />
        {/* Có chữ: X để xoá. Hết chữ: chevron để thu ô lại — nhiều người
            không biết chạm ra ngoài là đóng. */}
        {open &&
          (query ? (
            <FieldButton
              onClick={onClear}
              label={clearLabel}
              className="right-0.5"
            >
              {X_PATH}
            </FieldButton>
          ) : (
            <FieldButton
              onClick={close}
              label={closeLabel}
              className="right-0.5"
            >
              {CHEVRON_RIGHT_PATH}
            </FieldButton>
          ))}
      </div>
    </div>
  );
}

export default function FaqsContent() {
  const { data, failed } = useContentState();
  // `query` cho ô nhập, `applied` trễ hơn và mới là thứ lọc: danh sách key
  // theo nội dung nên lọc từng phím sẽ remount accordion khi đang gõ.
  const [query, setQuery] = useState("");
  const [applied, setApplied] = useState("");
  // Desktop: focusing docks the field under the tab nav and drops the padding
  // above it; reverts once the field is both empty and unfocused.
  const [fieldEngaged, setFieldEngaged] = useState(false);
  // Below md the field starts as a 34px circle beside the page title.
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
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
  const a11y = data?.common.labels["a11y"] ?? {};
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
      // kiếm đang đứng, để ô và card trượt lên cùng một nhịp.
      // Mobile: mở ô tìm kiếm thì pt co 32px → 16px, ô nhích lên sát header
      // cùng nhịp giãn ngang (tên trang đã mờ, khoảng trống đó thừa).
      // md:pt-[18px] khớp chính xác top-[58px] — lệch 2px là sticky kẹp ô sớm
      // trong khi card còn đang chạy, nhìn ra ngay là hai thứ rời nhau.
      className={`container-page pb-8 max-xs:pb-0 md:pb-8 max-w-3xl mx-auto pt-8 transition-[padding-top] duration-300 max-md:delay-[-150ms] ease-out ${
        fieldEngaged ? "md:pt-[18px]" : ""
      } ${mobileSearchOpen ? "max-md:pt-4" : ""} ${fieldEngaged ? "min-h-[100dvh]" : ""}`}
      {...loadingProps(!data)}
    >
      {/* min-h while engaged: a short result list would otherwise let the
          field's sticky wrapper reach the footer boundary and un-stick
          mid-search. */}
      {data && (
        <MobileSearch
          open={mobileSearchOpen}
          onOpenChange={setMobileSearchOpen}
          query={query}
          onQueryChange={setQuery}
          onClear={clearSearch}
          placeholder={labels["searchPlaceholder"]}
          clearLabel={labels["clearSearch"]}
          closeLabel={a11y["close"]}
        />
      )}
      <div
        className={`md:hidden flex items-center min-h-[34px] pr-12 mb-4 transition-opacity duration-200 ${
          mobileSearchOpen ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden={mobileSearchOpen}
      >
        <PageTitle gap="mb-0" />
      </div>
      {/* Desktop: permanently sticky (swapping to `fixed` on engage remounts
          the input and drops focus), and `top` transitions directly — riding
          the container's pt animation only worked near scrollY 0. */}
      <div
        className={`hidden md:block sticky z-[9] pt-4 pb-6 -mt-4 -mb-2 pointer-events-none transition-[top] duration-300 ease-out ${
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
          <div className="absolute -inset-x-2 -top-8 h-[55px] bg-page pointer-events-none" />
          {!data && <FaqsSearchFieldSkeleton />}
          {data && (
            <SearchField
              query={query}
              onChange={setQuery}
              inputRef={inputRef}
              onClear={clearSearch}
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
