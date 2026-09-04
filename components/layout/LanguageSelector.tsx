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

// Mở: menu cao dần lên (height, px) — không fade, chỉ một chuyển động để mắt
// bám theo. Đóng: chỉ fade, height đứng yên cho tới khi đã mờ hẳn.
//
// Phải khớp với 100ms trong class fade ở dưới. Không ghép chuỗi class bằng
// hằng số: Tailwind quét source tĩnh nên class dựng bằng template literal sẽ
// không được sinh ra (cùng lý do lib/expandTransition.ts viết literal).
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

  // Chỉ hover, không click-to-toggle.
  //
  // `open` đổi tức thì cả hai chiều: nó điều khiển mọi thứ mắt thấy ngay —
  // trigger đổ nền, menu hiện/mờ. `tall` điều khiển chiều cao menu và chỉ
  // trễ ở chiều đóng, nhờ vậy menu mờ đi ở nguyên chiều cao rồi mới xẹp
  // (lúc đó đã vô hình). Mở thì cả hai set chung một nhịp — cùng một lần
  // render — nên chiều cao bắt đầu chạy đúng frame trigger bắt đầu đổ nền.
  const [open, setOpen] = useState(false);
  const [tall, setTall] = useState(false);
  // Ngôn ngữ đang được rê chuột tới trong danh sách — chữ trên pill đổi
  // theo tức thời, rời khỏi dòng nào (hoặc đóng menu) thì rơi về lại tên
  // ngôn ngữ hiện tại (không phải nhãn "select language" nữa).
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
  // Bản sao ẩn của danh sách, riêng cho việc đo bề rộng — không bao giờ bị
  // gán `width` cố định như thẻ dropdown thật. Lý do cần bản sao riêng:
  // lần đo đầu (trước khi font web tải xong) có thể ra một số nhỏ hơn thật,
  // rồi bị khoá vào `style width` của thẻ dropdown; từ đó `listRef` — nằm
  // bên trong thẻ đã bị khoá — không còn phản ánh bề rộng tự nhiên nữa, nên
  // lần đo lại sau khi font sẵn sàng (`document.fonts.ready`) chỉ đọc lại
  // đúng cái số đã khoá (không thể lớn hơn), làm menu vĩnh viễn hẹp hơn nội
  // dung thật — check icon ở dòng ngôn ngữ dài nhất bị tràn ra ngoài mép.
  const measureListRef = useRef<HTMLDivElement>(null);
  // Bản sao ẩn liệt kê nhãn "select language" của MỌI ngôn ngữ (không chỉ
  // trang hiện tại) — pill giờ đổi chữ này theo ngôn ngữ đang rê chuột tới
  // (xem `pillLabel`), nên bề rộng phải đủ cho bản dịch dài nhất trong TẤT
  // CẢ ngôn ngữ, không riêng bản dịch của trang đang mở. Thiếu bản sao này,
  // mỗi trang tự đo theo đúng bản dịch của chính nó — trang "en" (chữ
  // "Select language" dài) ra pill rộng hơn hẳn trang "vi"/"kr", pill và
  // dropdown lệch bề rộng nhau giữa các ngôn ngữ dù thiết kế muốn chúng
  // giống hệt nhau trên toàn site.
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
      // Pill lúc mở và thẻ dropdown phải luôn cùng một bề rộng, và bề rộng
      // đó phải giống hệt nhau trên mọi trang locale — lấy max giữa nhãn
      // "select language" dài nhất trong mọi ngôn ngữ và label ngôn ngữ dài
      // nhất trong danh sách (đều đo qua bản sao không bao giờ bị ràng buộc
      // bề rộng ở trên), rồi dùng chung một số cho cả hai chỗ.
      //
      // `GLOBE_CLEARANCE` là khoảng cách tối thiểu từ mép trái nút tới chữ
      // (`left-3` + rộng `w-3.5` + đệm an toàn 4px) — globe giờ neo trái độc
      // lập, không còn nằm trong nhóm chữ được đo. Chữ giờ căn giữa cả nút
      // (`justify-center`) nên mép trái của nó cách đều mép nút một khoảng
      // bằng nửa phần dư ra `(open - text) / 2` — muốn khoảng đó không nhỏ
      // hơn `GLOBE_CLEARANCE`, bề rộng nút tối thiểu phải là text + 2×clearance.
      // Đệm an toàn giữ ở mức tối thiểu (4px, không phải 8px) vì pill đang
      // rộng hơn cần thiết.
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
    // Component này ẩn bằng `hidden md:flex` (không unmount) dưới breakpoint
    // md, nên offsetWidth đo lúc ẩn luôn ra 0. Resize từ mobile lên desktop
    // không tự trigger effect trên (deps chỉ đổi theo options/locale), nút
    // liền kẹt ở width 0 — vô hình — cho tới khi reload. Đo lại mỗi lần
    // resize để bắt đúng thời điểm nó hiện trở lại.
    window.addEventListener("resize", measure);
    return () => window.removeEventListener("resize", measure);
  }, [options, locale, selectLanguageLabel]);

  // Menu liệt kê mọi ngôn ngữ, kể cả ngôn ngữ hiện tại (đánh dấu bằng icon
  // check tròn) — trigger giờ chỉ hiện chữ "select language" nên không còn
  // lý do giấu ngôn ngữ đang chọn khỏi danh sách.
  if (options.length <= 1) return null;

  // Chữ hiển thị trên pill lúc mở vẫn là nhãn "select language" — không
  // phải tên ngôn ngữ — nhưng đổi theo NGÔN NGỮ đang rê chuột tới: rê vào
  // "English" thì hiện "Select language", rê vào dòng tiếng Hàn thì hiện
  // bản tiếng Hàn của chính nhãn đó. Không rê vào dòng nào thì rơi về nhãn
  // của ngôn ngữ hiện tại (`selectLanguageLabel`, lấy theo CMS đang tải).
  //
  // Component chỉ có sẵn bản dịch nhãn của TRANG hiện tại (`selectLanguageLabel`
  // — từ CMS, có thể mới hơn bundle build-time). Các ngôn ngữ khác không có
  // nội dung CMS đang tải cho trang này, nên tra theo `bundledLabels` — cùng
  // catalog build-time mà Navbar dùng làm fallback trước khi content.json về.
  const pillLabel =
    hoveredCode && hoveredCode !== locale
      ? (bundledLabels(hoveredCode, "nav")["selectLanguage"] ??
        selectLanguageLabel)
      : selectLanguageLabel;

  // Mọi bản dịch có thể xuất hiện trên pill — dùng để đo bề rộng tối thiểu
  // cần thiết (xem `measureSelectLabelRef`), không riêng bản dịch của trang
  // đang mở.
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
        // Delay âm chỉ áp cho `width` (mẹo vào giữa đường cong, đỡ ì lúc bắt
        // đầu nở) — `background-color` phải fade đúng nhịp bấm chuột, không
        // ăn theo delay đó, nên tách hai property ra hai khai báo transition
        // riêng thay vì gộp chung `transition-[width,background-color]`.
        className={`relative self-center flex items-center justify-end h-9 rounded-full overflow-hidden text-xs font-medium [transition:width_200ms_cubic-bezier(0.32,0.72,0,1)_-100ms,background-color_200ms_cubic-bezier(0.32,0.72,0,1)] ${
          open ? "bg-gray-100" : "bg-transparent"
        }`}
      >
        {/* Lớp thu gọn: nằm trong luồng nên nó là bề rộng mặc định của nút
            trước khi đo xong (và cũng là thứ được đo). */}
        <span
          ref={restRef}
          // Thêm dịch trái nhẹ (`-translate-x-1`) song song với fade — trôi
          // cùng chiều với pill đang nở sang trái, thay vì đứng yên một chỗ
          // rồi chỉ mờ đi. Transform không ảnh hưởng layout/đo đạc (không
          // đổi offsetWidth) nên không đụng tới phép tính bề rộng ở trên.
          className={`flex items-center gap-1.5 px-3 whitespace-nowrap text-gray-200 transition-[opacity,transform] duration-150 ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "opacity-0 -translate-x-2" : "opacity-100 translate-x-0"
          }`}
        >
          <GlobeIcon className="w-3.5 h-3.5 flex-shrink-0" />
          {locale.toUpperCase()}
        </span>

        {/* Lớp mở — chỉ chữ: căn giữa cả nút, không kéo chevron theo (chevron
            đứng riêng, neo phải như cũ — xem lớp bên dưới). `left-1/2
            -translate-x-1/2` (thay vì `inset-0`) để span vẫn co theo đúng
            bề rộng nội dung của nó — `inset-0` (đặt cả 4 cạnh) buộc span
            giãn full bề rộng nút, khiến `offsetWidth` đo ra bằng bề rộng
            nút thay vì bề rộng chữ, làm phép tính bên dưới sai lệch. */}
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

        {/* Chevron của lớp mở: đứng riêng, neo phải cố định — không theo
            chữ căn giữa ở trên. Cùng nhịp ẩn-ngay-lúc-đóng với chữ. */}
        <span
          aria-hidden
          className={`absolute inset-y-0 right-0 flex items-center pr-3 text-black transition-opacity ease-[cubic-bezier(0.32,0.72,0,1)] ${
            open ? "duration-150 opacity-100" : "duration-0 opacity-0"
          }`}
        >
          <ChevronDownIcon />
        </span>

        {/* Globe của lớp mở: neo trái theo chính nút (không theo nhóm chữ ở
            trên), nên khi nút nở/co theo chiều rộng đo được, icon luôn bám
            sát mép trái — không bị kéo xa mép khi nhóm chữ bên phải hẹp hơn
            bề rộng nút (trường hợp ngôn ngữ dài nhất trong danh sách quyết
            định bề rộng, chứ không phải chữ "select language"). Cùng nhịp
            ẩn-ngay-lúc-đóng với chữ. */}
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
        // Khung tĩnh: chỉ lo vị trí và bề rộng — không animate gì, nên không
        // có gì ở đây giật được. Không `overflow-hidden` để shadow của thẻ
        // toả tự do ra phần padding.
        // `box-content` cho `width` tính đúng phần nội dung, padding nằm
        // ngoài phép đo. Dùng chung `size.open` với pill — đã lấy max với
        // label ngôn ngữ dài nhất — nên lúc mở, pill và thẻ dropdown luôn
        // cùng một bề rộng. `-right-5` bù đúng `px-5` nên mép phải thẻ thẳng
        // hàng mép phải trigger. `pt-1` là khe hở nhỏ giữa header và thẻ —
        // sát hẳn (pt-0) nhìn không ổn, nhưng cũng không lùi xa như trước.
        //
        // `pointer-events-none` luôn luôn (không chỉ lúc đóng) — phần
        // `px-5` (đệm hai bên) chỉ để chừa chỗ cho shadow toả ra, không
        // phải vùng hover: rê chuột ra khỏi pill/thẻ trắng vào đúng dải đệm
        // này phải đóng menu ngay, không giữ mở nhờ đứng trong div cha.
        // Thẻ trắng bên trong tự bật lại `pointer-events-auto` để nhận
        // hover/click. Riêng khe hở phía trên (`pt-1`, giữa pill và thẻ)
        // là lối đi bắt buộc khi rê chuột thẳng xuống — span cầu nối ngay
        // dưới bật lại `pointer-events-auto` cho riêng dải đó để không bị
        // rớt hover giữa chừng.
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
                {/* Mọi dòng đều render icon (chỉ đổi opacity) — chứ không
                    chỉ dòng đang active mới có. Trước đây chỉ dòng active
                    có icon trong DOM, nên bề rộng "tự nhiên" của mỗi dòng
                    khác nhau tuỳ ngôn ngữ nào đang active, khiến việc đo bề
                    rộng cả danh sách (`measureListRef`) nhạy với đúng dòng
                    nào có icon — sai một nhịp là icon bị hụt chỗ. Giờ icon
                    luôn chiếm chỗ ở mọi dòng nên bề rộng đo được luôn ổn
                    định, không phụ thuộc ngôn ngữ nào đang active. */}
                <CircledCheckIcon active={lang.code === locale} />
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Bản sao ẩn chỉ để đo — xem giải thích ở khai báo `measureListRef`.
          `invisible` (không phải `hidden`) để vẫn tham gia layout/đo được,
          `absolute` + `-z-10` để không chiếm chỗ hay chặn tương tác. Padding
          ngang (`px-4`) và `gap-3` phải khớp y hệt danh sách thật ở trên,
          nếu không số đo ra sẽ lệch. */}
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

      {/* Bản sao ẩn chỉ để đo — xem giải thích ở khai báo `measureSelectLabelRef`.
          Mỗi bản dịch một dòng riêng (`block`, không `whitespace-nowrap`
          chung một hàng) để bề rộng đo ra là bản dịch DÀI NHẤT, không phải
          tổng bề rộng của tất cả cộng lại. `px-1` khớp padding của chữ thật
          trên pill. */}
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
