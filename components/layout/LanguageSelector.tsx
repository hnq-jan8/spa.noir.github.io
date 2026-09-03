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

// Mở: menu cao dần lên (height, px) — không fade, chỉ một chuyển động để mắt
// bám theo. Đóng: chỉ fade, height đứng yên cho tới khi đã mờ hẳn.
//
// Phải khớp với 100ms trong class fade ở dưới. Không ghép chuỗi class bằng
// hằng số: Tailwind quét source tĩnh nên class dựng bằng template literal sẽ
// không được sinh ra (cùng lý do lib/expandTransition.ts viết literal).
const FADE_MS = 100;

function ChevronDownIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

/** Dùng chung cho trigger desktop và nút ngôn ngữ mobile trong header. */
export function GlobeIcon({ className = "w-3.5 h-3.5 flex-shrink-0" }: { className?: string }) {
  return (
    <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={1.5}
        d="M3.6 9h16.8M3.6 15h16.8M12 3a15 15 0 010 18M12 3a15 15 0 000 18M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
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

  // Chỉ hover, không click-to-toggle.
  //
  // `open` đổi tức thì cả hai chiều: nó điều khiển mọi thứ mắt thấy ngay —
  // trigger đổ nền, menu hiện/mờ. `tall` điều khiển chiều cao menu và chỉ
  // trễ ở chiều đóng, nhờ vậy menu mờ đi ở nguyên chiều cao rồi mới xẹp
  // (lúc đó đã vô hình). Mở thì cả hai set chung một nhịp — cùng một lần
  // render — nên chiều cao bắt đầu chạy đúng frame trigger bắt đầu đổ nền.
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);
  const collapseTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const show = () => {
    if (collapseTimer.current) clearTimeout(collapseTimer.current);
    setOpen(true);
    setTall(true);
  };
  const hide = () => {
    setOpen(false);
    collapseTimer.current = setTimeout(() => setTall(false), FADE_MS);
  };
  useEffect(
    () => () => {
      if (collapseTimer.current) clearTimeout(collapseTimer.current);
    },
    [],
  );

  // Ba phép đo, đều lấy từ phần tử không bao giờ animate. Mọi thứ animate
  // sau đó đều chạy trên số px cố định — không có layout nào phải tính lại
  // theo nội dung ở từng frame.
  //  • `restRef` / `openRef` — hai lớp chữ của trigger (thu gọn và mở), để
  //    lấy bề rộng của chính nó ở mỗi trạng thái.
  //  • `listRef` — danh sách bên trong thẻ menu, lấy chiều cao px để thẻ
  //    animate tới. Đo phần bên trong chứ không đo chính thẻ, vì chiều cao
  //    của thẻ là thứ đang bị điều khiển.
  const restRef = useRef<HTMLSpanElement>(null);
  const openRef = useRef<HTMLSpanElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ rest: number; open: number; h: number } | null>(null);
  useLayoutEffect(() => {
    const measure = () => {
      if (!restRef.current || !openRef.current || !listRef.current) return;
      setSize({
        rest: restRef.current.offsetWidth,
        open: openRef.current.offsetWidth,
        h: listRef.current.offsetHeight,
      });
    };
    measure();
    // Font web về muộn thì chữ đổi bề rộng — đo lại, nếu không pill giữ số
    // px đo bằng font fallback.
    document.fonts?.ready.then(measure).catch(() => {});
    // Component này ẩn bằng `hidden md:flex` (không unmount) dưới breakpoint
    // md, nên offsetWidth đo lúc ẩn luôn ra 0. Resize từ mobile lên desktop
    // không tự trigger effect trên (deps chỉ đổi theo options/locale), nút
    // liền kẹt ở width 0 — vô hình — cho tới khi reload. Đo lại mỗi lần
    // resize để bắt đúng thời điểm nó hiện trở lại.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [options, locale]);

  // Menu liệt kê mọi ngôn ngữ trừ ngôn ngữ hiện tại (nó đã nằm trên trigger
  // rồi), nên bản build một ngôn ngữ sẽ mở ra một panel rỗng.
  const rest = options.filter((lang) => lang.code !== locale);
  if (rest.length === 0) return null;

  return (
    <div
      data-fallback-desktop-only
      onMouseEnter={show}
      onMouseLeave={hide}
      className="hidden md:flex relative items-stretch flex-shrink-0 ml-6 lg:ml-2 w-max"
    >
      {/* Vùng đệm hover quanh trigger: nới rộng ra ngoài mép nút. Nằm ngoài
          nút (nút đã `overflow-hidden` nên bỏ trong đó sẽ bị cắt), nhưng vẫn
          là con của vùng nghe hover — rê chuột trượt qua mép vẫn tính là còn
          hover, và di qua lại giữa nó với nút không làm rời vùng nghe. */}
      <span aria-hidden className="absolute -inset-3" />

      <button
        type="button"
        aria-label={selectLanguageLabel}
        aria-haspopup="menu"
        aria-expanded={open}
        // Chỉ `width` (px đo sẵn) và màu nền animate. Chữ KHÔNG chạy theo:
        // hai lớp chữ dưới đây đứng nguyên vị trí cuối của mình và chỉ mờ
        // vào/mờ ra. Trước đây bề rộng chạy bằng track grid `0fr→1fr`, tức
        // mỗi frame phải dựng lại layout của chữ — Safari đuối ở đúng chỗ đó
        // và cái lộ ra là chữ giật. Giờ chữ đứng yên, nút chỉ nở ra và
        // `overflow-hidden` xén phần chưa tới.
        //
        // Lúc nghỉ: không nền, đọc như các tab nav bên cạnh. Lúc hover: đổ
        // nền trắng thành viên pill — cùng cách xử lý với nút ngôn ngữ ở
        // mobile. `self-center` + chiều cao cố định giữ hộp không đổi kích
        // thước dọc. `justify-end` neo nội dung vào mép phải, mép đứng yên
        // khi nút nở sang trái, nên lớp chữ trong luồng cũng không xê dịch.
        style={{ width: size ? (open ? size.open : size.rest) : undefined }}
        className={`relative self-center flex items-center justify-end h-9 rounded-full overflow-hidden text-xs font-medium transition-[width,background-color] duration-200 delay-[-25ms] ease-[cubic-bezier(0.32,0.72,0,1)] ${
          open ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        {/* Lớp thu gọn: nằm trong luồng nên nó là bề rộng mặc định của nút
            trước khi đo xong (và cũng là thứ được đo). */}
        <span
          ref={restRef}
          className={`flex items-center gap-1.5 px-3 whitespace-nowrap text-gray-200 transition-opacity duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-0" : "opacity-100"
          }`}
        >
          <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {locale.toUpperCase()}
        </span>

        {/* Lớp mở: `absolute` neo phải, ra khỏi luồng — bề rộng nút đổi bao
            nhiêu nó cũng không xê dịch một pixel nào. */}
        <span
          ref={openRef}
          aria-hidden
          className={`absolute inset-y-0 right-0 flex items-center gap-1.5 pl-2.5 pr-3 whitespace-nowrap text-black transition-opacity duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-100" : "opacity-0"
          }`}
        >
          <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {/* Mọi label chồng trong một ô grid, chỉ label đang chọn là hiện:
              ô rộng bằng label dài nhất, nên bề rộng pill (và menu bên dưới,
              vốn lấy theo nó) đủ chỗ cho mọi ngôn ngữ, không nhảy số khi đổi
              ngôn ngữ. Label ngắn hơn thì tự căn giữa trong ô (button mặc
              định `text-align: center`).

              `px-2` là chỗ dư cho chính label *dài nhất*: không có nó thì ô
              vừa khít label đó, dư 0px, nên riêng nó không căn giữa được và
              trông lệch hẳn sang trái so với các ngôn ngữ khác. */}
          <span className="grid px-2">
            {options.map((lang) => (
              <span
                key={lang.code}
                className={`col-start-1 row-start-1 whitespace-nowrap ${
                  lang.code === locale ? "" : "invisible"
                }`}
              >
                {lang.label}
              </span>
            ))}
          </span>
          <ChevronDownIcon />
        </span>
      </button>

      <div
        // Khung tĩnh: chỉ lo vị trí, bề rộng và vùng đệm hover — không
        // animate gì, nên không có gì ở đây giật được. Không `overflow-hidden`
        // để shadow của thẻ toả tự do ra phần padding.
        // `box-content` cho `width` tính đúng phần nội dung: thẻ trắng rộng
        // đúng bằng trigger, padding nằm ngoài phép đo. `-right-5` bù đúng
        // `px-5` nên mép phải thẻ thẳng hàng mép phải trigger. `pt-2` vừa là
        // khe hở tới trigger vừa là cầu nối hover qua khe đó.
        style={{ width: size?.open }}
        className={`absolute top-full -right-5 box-content px-5 pt-2 pb-5 z-50 ${
          open
            ? "visible opacity-100 [transition:opacity_0s,visibility_0s]"
            : "invisible opacity-0 pointer-events-none [transition:opacity_100ms_ease-in,visibility_0s_linear_100ms]"
        }`}
      >
        {/* Chính thẻ này co giãn — không phải một lớp mask trượt qua nó. Nhờ
            vậy bo góc dưới và shadow luôn hiện, chạy xuống theo thẻ, thay vì
            đáy bị cắt phẳng suốt lúc animate. `overflow-hidden` để danh sách
            bên trong bị thẻ cắt theo bo góc.

            Delay âm −62ms (¼ của 250ms) là mẹo của FAQ accordion
            (lib/expandTransition.ts, ở đó dùng ½): trình duyệt vào transition
            ở trạng thái đã chạy sẵn ¼ đường cong, nên bỏ qua đoạn đầu và bớt
            được chừng ấy lần tính lại layout — đỡ cảm giác ì lúc bắt đầu. */}
        <div
          style={{ height: tall && size ? size.h : 0 }}
          className="overflow-hidden rounded-[20px] bg-white shadow-[0_0_24px_rgba(0,0,0,0.18)] [transition:height_250ms_cubic-bezier(0.32,0.72,0,1)_-62ms]"
        >
          <div ref={listRef}>
            {rest.map((lang, index) => (
              <Link
                key={lang.code}
                href={`/${lang.code}${pathWithoutLocale}`}
                className={`flex items-center h-11 px-4 text-sm text-gray-700 whitespace-nowrap hover:bg-gray-50 active:bg-gray-50 ${
                  index !== rest.length - 1 ? "border-b border-gray-100" : ""
                }`}
              >
                {lang.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
