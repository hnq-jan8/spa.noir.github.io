"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type ReactNode, type RefObject } from "react";
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

function LanguageDropdownLinks({
  languages: options,
  locale,
  pathWithoutLocale,
  onSelect,
  itemClassName = "py-3",
}: {
  languages: LanguageOption[];
  locale: string;
  pathWithoutLocale: string;
  onSelect?: () => void;
  itemClassName?: string;
}) {
  return (
    <>
      {options
        .filter((lang) => lang.code !== locale)
        .map((lang) => (
          <Link
            key={lang.code}
            href={`/${lang.code}${pathWithoutLocale}`}
            onClick={onSelect}
            className={`flex items-center px-3 text-xs text-gray-200 hover:text-white hover:font-medium active:text-white active:font-medium ${itemClassName}`}
          >
            <span>{lang.label}</span>
          </Link>
        ))}
    </>
  );
}

/**
 * One half of the trigger's label swap: the grid `0fr`/`1fr` track animates a
 * content-sized width without measuring anything in JS — the FAQ accordion's
 * technique (lib/expandTransition.ts), turned sideways.
 */
function SwapText({ shown, children }: { shown: boolean; children: ReactNode }) {
  return (
    <span
      style={{ gridTemplateColumns: shown ? "1fr" : "0fr" }}
      className="grid transition-[grid-template-columns] duration-200 ease-out"
    >
      <span
        className={`overflow-hidden min-w-0 whitespace-nowrap transition-opacity duration-200 ${
          shown ? "opacity-100" : "opacity-0"
        }`}
      >
        {children}
      </span>
    </span>
  );
}

function LanguageTriggerContent({
  languages: options,
  locale,
  expanded,
  className,
}: {
  languages: LanguageOption[];
  locale: string;
  expanded: boolean;
  className?: string;
}) {
  const current = options.find((lang) => lang.code === locale) ?? options[0];
  // No `gap` between the two halves — one of them is always collapsed to
  // zero width, and a gap would still reserve space around it.
  return (
    <span className={`relative ${className ?? ""}`}>
      {/* Globe nằm ngoài luồng nên không thêm một track phải tính lại mỗi
          frame — chỉ trượt theo mép trái đang chạy rồi mờ đi bằng
          opacity + transform. */}
      <span
        aria-hidden
        className={`absolute right-full mr-1.5 flex items-center transition-[opacity,transform] duration-200 ease-out ${
          expanded ? "opacity-0 -translate-x-1" : "opacity-100 translate-x-0"
        }`}
      >
        <GlobeIcon />
      </span>
      <SwapText shown={!expanded}>{locale.toUpperCase()}</SwapText>
      <SwapText shown={expanded}>
        {/* Mọi label chồng trong một ô grid, chỉ label đang chọn là hiện: ô
            rộng bằng label dài nhất nên trigger khi mở khớp đúng bề rộng panel
            (`w-full`). `pr-6` giữ chỗ cho chevron, vốn đã ra khỏi luồng. */}
        <span className="grid pr-6">
          {options.map((lang) => (
            <span
              key={lang.code}
              aria-hidden={lang.code !== current.code}
              className={`col-start-1 row-start-1 whitespace-nowrap ${
                lang.code === current.code ? "" : "invisible"
              }`}
            >
              {lang.label}
            </span>
          ))}
        </span>
      </SwapText>
      {/* Nút nở sang trái (mép phải đứng yên), nên chevron neo `right-0` đứng
          im — chỉ fade, không trượt ngang. */}
      <span
        aria-hidden
        className={`absolute inset-y-0 right-0 flex items-center transition-opacity duration-200 ease-out ${
          expanded ? "opacity-100" : "opacity-0"
        }`}
      >
        <ChevronDownIcon />
      </span>
    </span>
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

export function DesktopLanguageSelector({ locale, pathWithoutLocale, languages: liveLanguages, selectLanguageLabel }: LanguageSelectorProps) {
  const options = liveLanguages ?? languages;
  const [open, setOpen] = useState(false);
  // Hover tracked in JS too: the inline style guarding the hidden state
  // out-specificities `group-hover:*`, which would otherwise disable hover.
  const [hovered, setHovered] = useState(false);
  const visible = open || hovered;
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(containerRef, open, () => setOpen(false));

  // The dropdown lists every language except the current one, so a
  // single-language build would open an empty panel.
  if (options.length <= 1) return null;

  return (
    <div
      ref={containerRef}
      data-fallback-desktop-only
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      // Globe nằm ngoài hộp nút nên nó ăn vào margin trái này. Dưới `lg` navbar
      // có nút cuộn với icon tròn sát mép phải, `ml-2` là globe đè lên nó.
      className="hidden md:flex relative items-stretch flex-shrink-0 ml-6 lg:ml-2 group w-max"
    >
      <button
        type="button"
        aria-label={selectLanguageLabel}
        aria-haspopup="menu"
        aria-expanded={visible}
        onClick={() => setOpen((o) => !o)}
        // Cùng nền với panel khi mở để đọc thành một khối liền. Chữ không đổi
        // màu: đây là ngôn ngữ đang chọn, không phải một lựa chọn bấm được.
        className={`relative flex items-center px-2 lg:px-3 text-xs text-left text-gray-200 h-full group-hover:bg-chrome-panelHover ${
          visible ? "bg-chrome-panelHover" : ""
        }`}
      >
        <LanguageTriggerContent
          languages={options}
          locale={locale}
          expanded={visible}
          className="flex items-center font-medium"
        />
      </button>
      <div
        // Đổ xuống bằng grid-template-rows 0fr→1fr, timing khớp
        // EXPAND_GRID_TRANSITION_CLASS (thêm opacity/visibility nên không dùng
        // lại hằng đó nguyên vẹn). Inline style giữ trạng thái ẩn để panel
        // không hiện thường trực nếu stylesheet lỗi.
        style={{
          gridTemplateRows: visible ? "1fr" : "0fr",
          ...(visible ? null : { opacity: 0, visibility: "hidden" as const }),
        }}
        className={`absolute top-full right-0 w-full grid transition-[grid-template-rows,opacity,visibility] duration-300 delay-[-150ms] ease-out z-50 ${
          visible ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        {/* overflow-hidden là nửa còn lại của kỹ thuật 0fr/1fr. Nền + shadow
            nằm trên lớp này để lúc đóng không còn vệt shadow của hộp cao 0px. */}
        <div className="overflow-hidden bg-chrome-panelHover shadow-lg">
          <LanguageDropdownLinks
            languages={options}
            locale={locale}
            pathWithoutLocale={pathWithoutLocale}
            itemClassName="h-14 whitespace-nowrap"
            onSelect={() => setOpen(false)}
          />
        </div>
      </div>
    </div>
  );
}
