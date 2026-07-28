"use client";

import Link from "next/link";
import { useEffect, useRef, useState, type RefObject } from "react";
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

function LanguageDropdownLinks({
  languages: options,
  locale,
  pathWithoutLocale,
  compact = false,
  onSelect,
  itemClassName = "py-3",
}: {
  languages: LanguageOption[];
  locale: string;
  pathWithoutLocale: string;
  compact?: boolean;
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
            className={`flex items-center text-xs text-gray-200 transition-colors hover:bg-black/10 hover:text-white ${
              compact ? "px-2" : "px-3"
            } ${itemClassName}`}
          >
            <span>{compact ? lang.code.toUpperCase() : lang.label}</span>
          </Link>
        ))}
    </>
  );
}

function LanguageTriggerContent({
  languages: options,
  locale,
  compact = false,
  className,
}: {
  languages: LanguageOption[];
  locale: string;
  compact?: boolean;
  className?: string;
}) {
  const current = options.find((lang) => lang.code === locale) ?? options[0];
  return (
    <span className={className}>
      <span className={compact ? "flex-1 text-left font-medium" : "flex-1 text-left whitespace-nowrap"}>
        {compact ? locale.toUpperCase() : current.label}
      </span>
      <ChevronDownIcon />
    </span>
  );
}

function LanguageWidthSizer({
  languages: options,
  compact = false,
  className,
}: {
  languages: LanguageOption[];
  compact?: boolean;
  className?: string;
}) {
  return (
    <span className={`invisible grid text-xs ${className ?? ""}`} aria-hidden="true">
      {options.map((lang) => (
        <span key={lang.code} className="col-start-1 row-start-1 flex items-center gap-1.5 whitespace-nowrap">
          <span>{compact ? lang.code.toUpperCase() : lang.label}</span>
          <ChevronDownIcon />
        </span>
      ))}
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
  // Mirrors the `group-hover` CSS interaction in JS so the dropdown still
  // opens on hover even if the stylesheet fails to load (see `visible`
  // below) — the inline style guarding the default-hidden state would
  // otherwise out-specificity `group-hover:opacity-100` and disable hover.
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
      className="hidden md:flex relative items-stretch flex-shrink-0 ml-2 group w-max"
    >
      <button
        type="button"
        aria-label={selectLanguageLabel}
        aria-haspopup="menu"
        aria-expanded={visible}
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center px-2 lg:px-3 text-xs text-gray-200 hover:text-white hover:bg-black/10 transition-colors h-full w-full"
      >
        <LanguageWidthSizer languages={options} compact className="lg:hidden" />
        <LanguageWidthSizer languages={options} className="hidden lg:grid" />
        <LanguageTriggerContent languages={options} locale={locale} compact className="absolute inset-0 flex items-center gap-1.5 px-2 lg:hidden" />
        <LanguageTriggerContent languages={options} locale={locale} className="absolute inset-0 hidden lg:flex items-center gap-1.5 px-3" />
      </button>
      <div
        // Inline style guards the shown/hidden state with JS state (`visible`)
        // rather than relying solely on the `invisible`/`group-hover` utility
        // classes, so the panel doesn't fall back to always-visible if the
        // stylesheet fails to load — hover is tracked in JS above so this
        // doesn't disable the existing hover-to-open behavior.
        style={visible ? undefined : { opacity: 0, visibility: "hidden" }}
        className={`absolute top-full left-0 w-full bg-chrome-panelHover shadow-lg transition-all duration-150 z-50 ${
          visible ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        <div className="lg:hidden">
          <LanguageDropdownLinks languages={options} locale={locale} pathWithoutLocale={pathWithoutLocale} compact itemClassName="h-14" onSelect={() => setOpen(false)} />
        </div>
        <div className="hidden lg:block">
          <LanguageDropdownLinks languages={options} locale={locale} pathWithoutLocale={pathWithoutLocale} itemClassName="h-14" onSelect={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}
