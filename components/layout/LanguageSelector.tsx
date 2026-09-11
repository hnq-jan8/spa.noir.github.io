"use client";

import Link from "next/link";
import {
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type RefObject,
} from "react";
import { languages as configuredLanguages } from "@/i18n/routing";
import { bundledLabels } from "@/i18n/labels";
import { invalidateContent } from "@/hooks/useContentData";

export function useDismissOnOutside(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      const el = containerRef.current;
      // `open` có thể chung state với UI khác đang ẩn qua breakpoint — bỏ
      // qua khi container này `display:none`, không thì tap ở UI kia luôn
      // bị hiểu là "click ra ngoài".
      if (!el || getComputedStyle(el).display === "none") return;
      if (!el.contains(e.target as Node)) onClose();
    };
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [containerRef, open, onClose]);
}

export const languages = configuredLanguages.map((lang) => ({
  code: lang.code,
  label: lang.code.toUpperCase(),
}));

export interface LanguageOption {
  code: string;
  label: string;
}

function ChevronDownIcon() {
  return (
    <svg
      className="w-3 h-3 flex-shrink-0"
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M19 9l-7 7-7-7"
      />
    </svg>
  );
}

/** Dùng chung cho trigger desktop và nút ngôn ngữ mobile trong header. */
export function GlobeIcon({
  className = "w-3.5 h-3.5 flex-shrink-0",
}: {
  className?: string;
}) {
  return (
    <svg
      className={className}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
      />
    </svg>
  );
}

function CircledCheckIcon({ active }: { active: boolean }) {
  return (
    <svg
      className={`w-4 h-4 flex-shrink-0 text-gray-400 ${active ? "opacity-100" : "opacity-0"}`}
      fill="none"
      stroke="currentColor"
      viewBox="0 0 24 24"
    >
      <circle cx="12" cy="12" r="9" strokeWidth={1.5} />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M8.5 12.5l2.5 2.5 4.5-5.5"
      />
    </svg>
  );
}

// h-10 trên từng item dropdown — dùng để tính vị trí trượt của highlight.
const ITEM_HEIGHT = 40;
// Phải khớp với `duration-150` trên className của highlight bên dưới — dùng
// để hẹn giờ đánh dấu "đã tắt hẳn" đúng lúc fade xong (xem `handleItemLeave`).
const HIGHLIGHT_FADE_MS = 150;

interface LanguageSelectorProps {
  locale: string;
  pathWithoutLocale: string;
  /** Từ content.json — fallback về danh sách build-time nếu chưa fetch xong. */
  languages?: LanguageOption[];
  /** aria-label cho nút mở dropdown (ui_labels: nav.selectLanguage). */
  selectLanguageLabel?: string;
  /** Chung state với nút globe/langView bên mobile drawer (xem Navbar). */
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function DesktopLanguageSelector({
  locale,
  pathWithoutLocale,
  languages: liveLanguages,
  selectLanguageLabel,
  open,
  onOpenChange,
}: LanguageSelectorProps) {
  const options = liveLanguages ?? languages;

  // Hover khi đang đóng: chỉ đổi màu pill, không mở rộng / đổi chữ như lúc
  // mở — xem cách dùng `pillActive` bên dưới.
  const [hovering, setHovering] = useState(false);
  // Ngôn ngữ đang rê chuột tới: chữ trên pill đổi theo (xem `pillLabel`).
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  // Vị trí highlight lúc rời hẳn khỏi danh sách (hoveredCode -> null): giữ
  // nguyên đây thay vì tụt về 0, để nó mờ dần đúng tại chỗ thay vì nhảy lên
  // đầu danh sách rồi mới biến mất.
  const lastHoveredIndexRef = useRef(0);
  // Highlight trong dropdown: đổi chỗ có trượt hay không tuỳ đã tắt hẳn
  // (hết fade) hay chưa — xem `handleItemEnter`/`handleItemLeave`.
  const highlightRef = useRef<HTMLDivElement>(null);
  const highlightFullyHiddenRef = useRef(true);
  const highlightHideTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(highlightHideTimeoutRef.current), []);
  const handleItemEnter = (code: string) => {
    clearTimeout(highlightHideTimeoutRef.current);
    if (highlightFullyHiddenRef.current && highlightRef.current) {
      // Đã tắt hẳn từ trước — tắt riêng transition của `transform` một nhịp
      // để nó xuất hiện thẳng tại ô mới, không trượt từ vị trí cũ nữa. Phải
      // đợi ĐỦ HAI rAF: React commit `transform` mới qua microtask (trước
      // rAF), nhưng rAF đầu vẫn chạy trước khi trình duyệt kịp SƠN khung
      // hình đã tắt transition đó — bật lại transition ngay ở rAF đầu coi
      // như chưa từng tắt, vẫn trượt như thường. rAF thứ hai (lồng bên
      // trong) mới chắc chắn chạy sau khi khung hình "nhảy tại chỗ" đã vẽ.
      highlightRef.current.style.transition = `opacity ${HIGHLIGHT_FADE_MS}ms ease-out`;
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          if (highlightRef.current) highlightRef.current.style.transition = "";
        });
      });
    }
    highlightFullyHiddenRef.current = false;
    setHoveredCode(code);
  };
  const handleItemLeave = () => {
    setHoveredCode(null);
    // Hết `HIGHLIGHT_FADE_MS` (khớp transition opacity của highlight) coi như
    // đã tắt hẳn. Bị huỷ ngay nếu rê sang ô khác kịp lúc (xem `handleItemEnter`),
    // nên chỉ thực sự đánh dấu khi rời hẳn dropdown.
    highlightHideTimeoutRef.current = setTimeout(() => {
      highlightFullyHiddenRef.current = true;
    }, HIGHLIGHT_FADE_MS);
  };
  const close = () => {
    setHoveredCode(null);
    // Vuốt scroll (không phải tap) không phát `mouseleave` bù cho
    // `mouseenter` giả lập lúc chạm mở dropdown — reset thủ công, không thì
    // pill kẹt sáng như đang hover dù dropdown đã đóng.
    setHovering(false);
    // Cả dropdown vừa biến mất — lần mở lại sau luôn phải snap, không trượt
    // từ vị trí hover dở dang trước khi đóng.
    clearTimeout(highlightHideTimeoutRef.current);
    highlightFullyHiddenRef.current = true;
    onOpenChange(false);
  };
  useDismissOnOutside(containerRef, open, close);
  const pillActive = open || hovering;

  // Đo trên các phần tử không animate, để mọi animation chạy trên px cố định.
  const restRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Bản sao ẩn để đo bề rộng thật (thẻ hiển thị bị gán `width` cố định).
  const measureListRef = useRef<HTMLDivElement>(null);
  // Bản sao ẩn đo nhãn "select language" của MỌI ngôn ngữ, vì pill đổi chữ
  // theo dòng đang rê chuột nên bề rộng phải đủ cho bản dịch dài nhất.
  const measureSelectLabelRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{
    rest: number;
    open: number;
    h: number;
  } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      if (
        !restRef.current ||
        !listRef.current ||
        !measureListRef.current ||
        !measureSelectLabelRef.current
      )
        return;
      // Pill lúc mở và dropdown dùng chung 1 bề rộng: max giữa nhãn "select
      // language" dài nhất và label ngôn ngữ dài nhất. `GLOBE_CLEARANCE` =
      // khoảng tối thiểu mép nút–chữ, nhân đôi vì chữ căn giữa nút.
      const GLOBE_CLEARANCE = 12 + 14 + 4;
      setSize({
        rest: restRef.current.offsetWidth,
        open: Math.max(
          measureSelectLabelRef.current.offsetWidth + GLOBE_CLEARANCE * 2,
          measureListRef.current.offsetWidth,
        ),
        h: listRef.current.offsetHeight,
      });
    };
    measure();
    // Font web về muộn thì đo lại, không thì pill giữ số đo bằng font fallback.
    document.fonts?.ready.then(measure).catch(() => {});
    // Dưới md component chỉ `hidden` (không unmount) nên offsetWidth ra 0 —
    // đo lại khi resize để không kẹt width 0 tới lúc reload.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [options, locale, selectLanguageLabel]);

  // Menu liệt kê cả ngôn ngữ hiện tại (đánh dấu bằng icon check tròn).
  if (options.length <= 1) return null;

  // Pill hiện nhãn "select language", dịch theo dòng đang rê chuột — chỉ
  // trang hiện tại có nhãn từ CMS, còn lại tra `bundledLabels`.
  const pillLabel =
    hoveredCode && hoveredCode !== locale
      ? (bundledLabels(hoveredCode, "nav")["selectLanguage"] ??
        selectLanguageLabel)
      : selectLanguageLabel;

  const hoveredIndex = options.findIndex((lang) => lang.code === hoveredCode);
  if (hoveredIndex >= 0) lastHoveredIndexRef.current = hoveredIndex;
  const highlightIndex =
    hoveredIndex >= 0 ? hoveredIndex : lastHoveredIndexRef.current;

  const allSelectLanguageLabels = [
    selectLanguageLabel,
    ...options.map((lang) => bundledLabels(lang.code, "nav")["selectLanguage"]),
  ].filter((label): label is string => Boolean(label));

  return (
    <div
      data-fallback-desktop-only
      ref={containerRef}
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
      className="hidden md:flex relative items-stretch flex-shrink-0 ml-6 lg:ml-2 w-max"
    >
      <button
        type="button"
        aria-label={selectLanguageLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        onClick={() => (open ? close() : onOpenChange(true))}
        // self-stretch để hit-area khớp vùng hover (container ngoài) — viên
        // pill bo tròn chuyển xuống span con, chỉ còn là lớp hiển thị, nên
        // vòng focus cũng phải xuống theo nó (focus-ring-inner).
        className="relative focus-ring-inner self-stretch flex items-center text-xs font-medium"
      >
        <span
          // Chỉ `width` (px đo sẵn) và nền animate; chữ chỉ mờ vào/ra, không
          // dựng lại layout mỗi frame (Safari giật ở đúng chỗ đó).
          style={{ width: size ? (open ? size.open : size.rest) : undefined }}
          className={`relative flex items-center justify-end h-9 rounded-full overflow-hidden [transition:width_200ms_cubic-bezier(0.32,0.72,0,1)_-100ms,background-color_200ms_cubic-bezier(0.32,0.72,0,1)] ${
            pillActive ? "bg-gray-100" : "bg-transparent"
          }`}
        >
          <span
            ref={restRef}
            className={`flex items-center gap-1.5 px-3 whitespace-nowrap transition-[opacity,transform,color] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open
                ? "opacity-0 -translate-x-3 text-gray-200"
                : `opacity-100 translate-x-0 ${hovering ? "text-black" : "text-gray-200"}`
            }`}
          >
            <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
            {locale.toUpperCase()}
          </span>

          {/* `left-1/2 -translate-x-1/2` chứ không `inset-0`, để offsetWidth đo
              ra bề rộng chữ chứ không phải bề rộng nút. */}
          <span
            ref={openRef}
            aria-hidden
            className={`absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center px-1 whitespace-nowrap text-black transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "duration-150 opacity-100" : "duration-0 opacity-0"
            }`}
          >
            {pillLabel}
          </span>

          <span
            aria-hidden
            className={`absolute inset-y-0 right-0 flex items-center pr-3 text-black transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "duration-150 opacity-100" : "duration-0 opacity-0"
            }`}
          >
            <ChevronDownIcon />
          </span>

          <span
            aria-hidden
            className={`absolute inset-y-0 left-3 flex items-center transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
              open ? "duration-150 opacity-100" : "duration-0 opacity-0"
            }`}
          >
            <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0 text-black" />
          </span>
        </span>
      </button>

      <div
        // `box-content` + `px-5`: padding chứa shadow toả, nằm ngoài `width`.
        // `pointer-events-none`: rê chuột vào dải đó vẫn đóng menu — thẻ
        // trắng bên trong tự bật lại `pointer-events-auto`.
        style={{ width: size?.open }}
        // pt-2.5 (10px) = khoảng cách từ pill (h-9, giữa container cao h-14)
        // xuống cạnh dưới navbar, để dropdown cách cạnh dưới navbar đúng
        // bằng khoảng pill cách cạnh dưới đó.
        className={`absolute top-full -right-5 box-content px-5 pt-2.5 z-50 pointer-events-none [transition:opacity_0s,visibility_0s] ${
          open ? "visible opacity-100" : "invisible opacity-0"
        }`}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 pointer-events-auto"
        />

        {/* Delay âm −62ms: vào transition ở trạng thái đã chạy sẵn ¼ đường
            cong, bớt layout recalc — mẹo của lib/expandTransition. */}
        <div
          style={{ height: open && size ? size.h : 0 }}
          className="pointer-events-auto overflow-hidden rounded-[24px] bg-white/80 backdrop-blur-xl shadow-[0_8px_40px_rgba(0,0,0,0.14)] [transition:height_250ms_cubic-bezier(0.32,0.72,0,1)_-62ms]"
        >
          {/* p-2 (8px) quanh danh sách: margin 2 bên và trên/dưới (item
              đầu/cuối) đều bằng nhau, không có gap giữa các item. rounded-2xl
              (16px) trên khối hover = bo góc khối trắng (24px) − margin (8px). */}
          <div ref={listRef} className="relative flex flex-col p-2">
            {/* Một khối nền duy nhất trượt theo `hoveredIndex`, thay vì mỗi
                dòng tự tô hover riêng — mượt hơn khi rê chuột qua các dòng
                liên tiếp. `z-10` trên Link để chữ/icon luôn nổi trên khối
                này (absolute mặc định vẽ sau nội dung tĩnh cùng cấp). */}
            <div
              ref={highlightRef}
              aria-hidden
              className={`absolute inset-x-2 top-2 h-10 rounded-2xl bg-cardHover shadow-[0_0_0.5px_1.5px_rgba(255,255,255,0.6)] transition-[transform,opacity] duration-150 ease-out ${
                hoveredIndex >= 0 ? "opacity-100" : "opacity-0"
              }`}
              style={{
                transform: `translateY(${highlightIndex * ITEM_HEIGHT}px)`,
              }}
            />
            {options.map((lang) => (
              <Link
                key={lang.code}
                href={`/${lang.code}${pathWithoutLocale}`}
                onMouseEnter={() => handleItemEnter(lang.code)}
                onMouseLeave={handleItemLeave}
                onClick={() => {
                  // Cùng locale thì Link không điều hướng, không remount nào
                  // tự đóng dropdown hay refetch. Giữ nguyên bài đang mở —
                  // đổi sang ngôn ngữ khác cũng giữ (href mang theo `?a=`).
                  if (lang.code === locale) {
                    invalidateContent();
                    close();
                  }
                }}
                className="focus-ring-inset relative z-10 flex items-center justify-between gap-3 h-10 pl-3.5 pr-2.5 rounded-2xl text-sm text-black whitespace-nowrap active:bg-cardHover"
              >
                {lang.label}
                <CircledCheckIcon active={lang.code === locale} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Ẩn nhưng vẫn đo được (`invisible`, không `hidden`) — xem `measureListRef`. */}
      <div
        aria-hidden
        className="absolute top-full right-0 invisible -z-10 pointer-events-none"
      >
        <div ref={measureListRef} className="flex flex-col p-2">
          {options.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between gap-3 h-10 pl-3.5 pr-2.5 text-sm whitespace-nowrap"
            >
              {lang.label}
              <CircledCheckIcon active={lang.code === locale} />
            </div>
          ))}
        </div>
      </div>

      {/* Mỗi bản dịch một dòng riêng để đo ra bản dài nhất, không phải tổng
          bề rộng — xem `measureSelectLabelRef`. */}
      <div
        aria-hidden
        className="absolute top-full right-0 invisible -z-10 pointer-events-none"
      >
        <div ref={measureSelectLabelRef}>
          {allSelectLanguageLabels.map((label, index) => (
            <div key={index} className="px-1 whitespace-nowrap">
              {label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
