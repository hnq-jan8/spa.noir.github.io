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

export function useDismissOnOutside(
  containerRef: RefObject<HTMLElement | null>,
  open: boolean,
  onClose: () => void,
) {
  useEffect(() => {
    if (!open) return;
    const handlePointerDown = (e: PointerEvent) => {
      if (!containerRef.current?.contains(e.target as Node)) onClose();
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

// Khớp tay với transition chậm nhất lúc mở (background-color, 200ms) — không
// ghép được bằng biến vì Tailwind chỉ quét class tĩnh.
const OPEN_ANIM_MS = 200;

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

interface LanguageSelectorProps {
  locale: string;
  pathWithoutLocale: string;
  /** Từ content.json — fallback về danh sách build-time nếu chưa fetch xong. */
  languages?: LanguageOption[];
  /** aria-label cho nút mở dropdown (ui_labels: nav.selectLanguage). */
  selectLanguageLabel?: string;
}

export function DesktopLanguageSelector({
  locale,
  pathWithoutLocale,
  languages: liveLanguages,
  selectLanguageLabel,
}: LanguageSelectorProps) {
  const options = liveLanguages ?? languages;

  // Chỉ hover. Đóng thì biến mất ngay, không fade — trừ khi chuột rời đi
  // giữa lúc animation mở còn đang chạy, `hide` sẽ đợi nốt `OPEN_ANIM_MS`
  // rồi mới đóng, để không cắt animation giữa chừng.
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);
  // Ngôn ngữ đang rê chuột tới: chữ trên pill đổi theo (xem `pillLabel`).
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const openedAt = useRef<number | null>(null);
  const closeTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (closeTimer.current) {
      clearTimeout(closeTimer.current);
      closeTimer.current = null;
    }
    if (openedAt.current === null) openedAt.current = performance.now();
    setOpen(true);
    setTall(true);
  };
  const hide = () => {
    setHoveredCode(null);
    const elapsed =
      openedAt.current === null
        ? OPEN_ANIM_MS
        : performance.now() - openedAt.current;
    const remaining = Math.max(0, OPEN_ANIM_MS - elapsed);
    closeTimer.current = setTimeout(() => {
      setOpen(false);
      setTall(false);
      openedAt.current = null;
    }, remaining);
  };
  useEffect(
    () => () => {
      if (closeTimer.current) clearTimeout(closeTimer.current);
    },
    [],
  );

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

  const allSelectLanguageLabels = [
    selectLanguageLabel,
    ...options.map((lang) => bundledLabels(lang.code, "nav")["selectLanguage"]),
  ].filter((label): label is string => Boolean(label));

  return (
    <div
      data-fallback-desktop-only
      onMouseEnter={show}
      onMouseLeave={hide}
      className="hidden md:flex relative items-stretch flex-shrink-0 ml-6 lg:ml-2 w-max"
    >
      <button
        type="button"
        aria-label={selectLanguageLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        // Chỉ `width` (px đo sẵn) và nền animate; chữ chỉ mờ vào/ra, không
        // dựng lại layout mỗi frame (Safari giật ở đúng chỗ đó).
        style={{ width: size ? (open ? size.open : size.rest) : undefined }}
        className={`relative self-center flex items-center justify-end h-9 rounded-full overflow-hidden text-xs font-medium [transition:width_200ms_cubic-bezier(0.32,0.72,0,1)_-100ms,background-color_200ms_cubic-bezier(0.32,0.72,0,1)] ${
          open ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        <span
          ref={restRef}
          className={`flex items-center gap-1.5 px-3 whitespace-nowrap text-gray-200 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-0 -translate-x-3" : "opacity-100 translate-x-0"
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
      </button>

      <div
        // `box-content` + `px-5`: padding chứa shadow toả, nằm ngoài `width`.
        // `pointer-events-none`: rê chuột vào dải đó vẫn đóng menu — thẻ
        // trắng bên trong tự bật lại `pointer-events-auto`.
        style={{ width: size?.open }}
        className={`absolute top-full -right-5 box-content px-5 pt-1 z-50 pointer-events-none [transition:opacity_0s,visibility_0s] ${
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
          style={{ height: tall && size ? size.h : 0 }}
          className="pointer-events-auto overflow-hidden rounded-[20px] bg-white shadow-[0_0_16px_rgba(0,0,0,0.12)] [transition:height_250ms_cubic-bezier(0.32,0.72,0,1)_-62ms]"
        >
          <div ref={listRef}>
            {options.map((lang, index) => (
              <Link
                key={lang.code}
                href={`/${lang.code}${pathWithoutLocale}`}
                onMouseEnter={() => setHoveredCode(lang.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className={`flex items-center justify-between gap-3 h-11 px-4 text-sm whitespace-nowrap hover:bg-cardHover active:bg-cardHover ${
                  lang.code === locale ? "text-black" : "text-gray-700"
                } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
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
        <div ref={measureListRef}>
          {options.map((lang) => (
            <div
              key={lang.code}
              className="flex items-center justify-between gap-3 h-11 px-4 text-sm whitespace-nowrap"
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
