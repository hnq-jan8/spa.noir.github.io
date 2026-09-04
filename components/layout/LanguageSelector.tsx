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

// Mở: chỉ chạy height. Đóng: chỉ fade, height đứng yên tới khi mờ hẳn.
// Khớp 100ms ở class fade bên dưới — không ghép class bằng template literal,
// Tailwind chỉ quét source tĩnh.
const FADE_MS = 100;

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
  /** Danh sách ngôn ngữ hiện tại (từ content.json) — fallback về danh sách build-time nếu chưa fetch xong. */
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

  // Chỉ hover, không click-to-toggle. `open` đổi tức thì cả hai chiều;
  // `tall` (chiều cao menu) chỉ trễ ở chiều đóng, để menu mờ hẳn rồi mới xẹp.
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);
  // Ngôn ngữ đang rê chuột tới: chữ trên pill đổi theo (xem `pillLabel`).
  const [hoveredCode, setHoveredCode] = useState<string | null>(null);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setOpen(true);
    setTall(true);
  };
  const hide = () => {
    setOpen(false);
    setHoveredCode(null);
    collapseTimer.current = setTimeout(() => setTall(false), FADE_MS);
  };
  useEffect(
    () => () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    },
    [],
  );

  // Đo trên các phần tử không bao giờ animate, để mọi animation sau đó chạy
  // trên px cố định — không frame nào phải tính lại layout theo nội dung.
  // `listRef` đo phần bên trong thẻ menu, vì chiều cao thẻ là thứ đang bị
  // điều khiển.
  const restRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  // Bản sao ẩn để đo bề rộng, vì nó không bao giờ bị gán `width` cố định.
  // Đo thẳng trên thẻ thật sẽ khoá số đo đầu (font web chưa về, hẹp hơn) và
  // lần đo lại chỉ đọc được đúng số đã khoá — menu kẹt hẹp, check icon tràn.
  const measureListRef = useRef<HTMLDivElement>(null);
  // Nhãn "select language" của MỌI ngôn ngữ: pill đổi chữ theo dòng đang rê
  // chuột, nên bề rộng phải đủ cho bản dịch dài nhất. Đo theo riêng bản dịch
  // của trang hiện tại thì mỗi locale ra một bề rộng pill khác nhau.
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
      // Pill lúc mở và thẻ dropdown dùng chung một bề rộng, giống nhau trên
      // mọi locale: max giữa nhãn "select language" dài nhất và label ngôn
      // ngữ dài nhất.
      //
      // `GLOBE_CLEARANCE` = khoảng tối thiểu từ mép nút tới chữ (`left-3` +
      // `w-3.5` + 4px đệm). Chữ căn giữa nút nên mỗi bên dư `(open - text)/2`
      // — muốn khoảng đó ≥ clearance thì nút tối thiểu phải là text + 2×.
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
    // Font web về muộn thì chữ đổi bề rộng — đo lại, nếu không pill giữ số
    // px đo bằng font fallback.
    document.fonts?.ready.then(measure).catch(() => {});
    // Dưới md component chỉ bị `hidden` (không unmount) nên offsetWidth ra 0.
    // Không đo lại khi resize thì nút kẹt width 0 — vô hình — tới lúc reload.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [options, locale, selectLanguageLabel]);

  // Menu liệt kê cả ngôn ngữ hiện tại (đánh dấu bằng icon check tròn).
  if (options.length <= 1) return null;

  // Pill luôn hiện nhãn "select language" (không phải tên ngôn ngữ), nhưng
  // dịch theo dòng đang rê chuột: rê dòng tiếng Hàn thì hiện bản tiếng Hàn.
  // Chỉ trang hiện tại có nhãn từ CMS; các ngôn ngữ khác tra `bundledLabels`.
  const pillLabel =
    hoveredCode && hoveredCode !== locale
      ? (bundledLabels(hoveredCode, "nav")["selectLanguage"] ??
        selectLanguageLabel)
      : selectLanguageLabel;

  // Mọi bản dịch có thể xuất hiện trên pill, dùng để đo bề rộng tối thiểu.
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
        // Chỉ `width` (px đo sẵn) và nền animate; hai lớp chữ đứng yên và chỉ
        // mờ vào/ra. Bản cũ nở bằng grid `0fr→1fr` phải dựng lại layout chữ
        // mỗi frame — Safari giật ở đúng chỗ đó. `justify-end` neo nội dung
        // vào mép phải để chữ không xê dịch khi nút nở sang trái.
        style={{ width: size ? (open ? size.open : size.rest) : undefined }}
        // Delay âm chỉ cho `width` (vào giữa đường cong, đỡ ì lúc bắt đầu nở);
        // `background-color` phải đúng nhịp nên tách thành hai khai báo.
        className={`relative self-center flex items-center justify-end h-9 rounded-full overflow-hidden text-xs font-medium [transition:width_200ms_cubic-bezier(0.32,0.72,0,1)_-100ms,background-color_200ms_cubic-bezier(0.32,0.72,0,1)] ${
          open ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        {/* Lớp thu gọn: nằm trong luồng nên là bề rộng mặc định của nút. */}
        <span
          ref={restRef}
          // Dịch trái nhẹ song song với fade, trôi cùng chiều pill đang nở.
          // Transform không đổi offsetWidth nên không đụng phép đo ở trên.
          className={`flex items-center gap-1.5 px-3 whitespace-nowrap text-gray-200 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
          }`}
        >
          <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {locale.toUpperCase()}
        </span>

        {/* Lớp mở, chỉ chữ, căn giữa nút. `left-1/2 -translate-x-1/2` chứ
            không `inset-0`: `inset-0` ép span giãn full nút, offsetWidth đo ra
            bề rộng nút thay vì bề rộng chữ. */}
        <span
          ref={openRef}
          aria-hidden
          // Đóng thì ẩn ngay (duration-0), không fade — fade dù nhanh đến
          // đâu vẫn kịp đè lên chữ trắng của lớp thu gọn đang hiện lên.
          className={`absolute left-1/2 -translate-x-1/2 inset-y-0 flex items-center px-1 whitespace-nowrap text-black transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "duration-150 opacity-100" : "duration-0 opacity-0"
          }`}
        >
          {pillLabel}
        </span>

        {/* Chevron neo phải cố định, không theo chữ căn giữa ở trên. */}
        <span
          aria-hidden
          className={`absolute inset-y-0 right-0 flex items-center pr-3 text-black transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "duration-150 opacity-100" : "duration-0 opacity-0"
          }`}
        >
          <ChevronDownIcon />
        </span>

        {/* Globe neo trái theo chính nút, không theo nhóm chữ — để nó luôn
            bám mép trái kể cả khi bề rộng do label danh sách quyết định. */}
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
        // Khung tĩnh: chỉ lo vị trí và bề rộng, không animate gì. `box-content`
        // để padding nằm ngoài `width`; `px-5` chừa chỗ cho shadow toả, `-right-5`
        // bù lại nên mép phải thẳng hàng trigger; `pt-1` là khe hở tới pill.
        //
        // `pointer-events-none` luôn: dải `px-5` chỉ để chứa shadow, rê chuột
        // vào đó phải đóng menu chứ không giữ mở. Thẻ trắng bên trong và span
        // cầu nối ở khe `pt-1` tự bật lại `pointer-events-auto`.
        style={{ width: size?.open }}
        className={`absolute top-full -right-5 box-content px-5 pt-1 z-50 pointer-events-none ${
          open
            ? "visible opacity-100 [transition:opacity_0s,visibility_0s]"
            : "invisible opacity-0 [transition:opacity_100ms_ease-in,visibility_0s_linear_100ms]"
        }`}
      >
        <span
          aria-hidden
          className="absolute inset-x-0 top-0 h-1 pointer-events-auto"
        />

        {/* Chính thẻ co giãn, không dùng mask trượt — nhờ vậy bo góc dưới và
            shadow luôn chạy theo thẻ thay vì bị cắt phẳng lúc animate.
            Delay âm −62ms (¼ của 250ms): vào transition ở trạng thái đã chạy
            sẵn ¼ đường cong, bớt layout recalc — mẹo của lib/expandTransition. */}
        <div
          style={{ height: tall && size ? size.h : 0 }}
          className="pointer-events-auto overflow-hidden rounded-[20px] bg-white shadow-[0_0_24px_rgba(0,0,0,0.18)] [transition:height_250ms_cubic-bezier(0.32,0.72,0,1)_-62ms]"
        >
          <div ref={listRef}>
            {options.map((lang, index) => (
              <Link
                key={lang.code}
                href={`/${lang.code}${pathWithoutLocale}`}
                onMouseEnter={() => setHoveredCode(lang.code)}
                onMouseLeave={() => setHoveredCode(null)}
                className={`flex items-center justify-between gap-3 h-11 px-4 text-sm whitespace-nowrap hover:bg-gray-50 active:bg-gray-50 ${
                  lang.code === locale ? "text-black" : "text-gray-700"
                } ${index !== options.length - 1 ? "border-b border-gray-100" : ""}`}
              >
                {lang.label}
                {/* Mọi dòng đều render icon (chỉ đổi opacity) để bề rộng đo
                    được không đổi theo ngôn ngữ nào đang active. */}
                <CircledCheckIcon active={lang.code === locale} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bản sao ẩn để đo (xem `measureListRef`). `invisible` chứ không
          `hidden` để vẫn đo được; `px-4`/`gap-3` phải khớp danh sách thật. */}
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

      {/* Bản sao ẩn để đo (xem `measureSelectLabelRef`). Mỗi bản dịch một
          dòng riêng để đo ra bản DÀI NHẤT, không phải tổng bề rộng. */}
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
