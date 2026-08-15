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
            className={`flex items-center px-3 text-xs text-gray-200 transition-colors hover:text-white hover:font-medium active:text-white active:font-medium ${itemClassName}`}
          >
            <span>{lang.label}</span>
          </Link>
        ))}
    </>
  );
}

/**
 * One half of the trigger's label swap. The grid `0fr`/`1fr` track is the
 * same technique the FAQ accordion uses vertically — it animates a real
 * content-sized width without measuring anything in JS, so the code and the
 * full language name can trade places smoothly instead of the button
 * snapping between two widths.
 */
function SwapText({ shown, children }: { shown: boolean; children: string }) {
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
    <span className={className}>
      <SwapText shown={!expanded}>{locale.toUpperCase()}</SwapText>
      <SwapText shown={expanded}>{current.label}</SwapText>
      {/* Wider gap once the full name is showing — a two-letter code sits
          comfortably close to the chevron, a word needs room to breathe. */}
      <span
        className={`flex items-center transition-[margin] duration-200 ease-out ${
          expanded ? "ml-3" : "ml-1.5"
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
        className="relative flex items-center px-2 lg:px-3 text-xs text-gray-200 hover:text-white active:text-white transition-colors h-full"
      >
        <LanguageTriggerContent
          languages={options}
          locale={locale}
          expanded={visible}
          className="flex items-center font-medium"
        />
      </button>
      <div
        // Inline style guards the shown/hidden state with JS state (`visible`)
        // rather than relying solely on the `invisible`/`group-hover` utility
        // classes, so the panel doesn't fall back to always-visible if the
        // stylesheet fails to load — hover is tracked in JS above so this
        // doesn't disable the existing hover-to-open behavior.
        style={visible ? undefined : { opacity: 0, visibility: "hidden" }}
        className={`absolute top-full left-0 min-w-full w-max bg-chrome-panelHover shadow-lg transition-all duration-150 z-50 ${
          visible ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        {/* The trigger is expanded to the full language name whenever this
            panel is open, so the options match it instead of falling back to
            two-letter codes. */}
        <LanguageDropdownLinks
          languages={options}
          locale={locale}
          pathWithoutLocale={pathWithoutLocale}
          itemClassName="h-14 whitespace-nowrap"
          onSelect={() => setOpen(false)}
        />
      </div>
    </div>
  );
}
