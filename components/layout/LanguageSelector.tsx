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

function ChevronDownIcon() {
  return (
    <svg className="w-3 h-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
    </svg>
  );
}

function LanguageDropdownLinks({
  locale,
  pathWithoutLocale,
  compact = false,
  onSelect,
  itemClassName = "py-3",
}: {
  locale: string;
  pathWithoutLocale: string;
  compact?: boolean;
  onSelect?: () => void;
  itemClassName?: string;
}) {
  return (
    <>
      {languages
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
  locale,
  compact = false,
  className,
}: {
  locale: string;
  compact?: boolean;
  className?: string;
}) {
  const current = languages.find((lang) => lang.code === locale)!;
  return (
    <span className={className}>
      <span className={compact ? "flex-1 text-left font-medium" : "flex-1 text-left whitespace-nowrap"}>
        {compact ? locale.toUpperCase() : current.label}
      </span>
      <ChevronDownIcon />
    </span>
  );
}

function LanguageWidthSizer({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <span className={`invisible grid text-xs ${className ?? ""}`} aria-hidden="true">
      {languages.map((lang) => (
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
}

export function DesktopLanguageSelector({ locale, pathWithoutLocale }: LanguageSelectorProps) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(containerRef, open, () => setOpen(false));

  return (
    <div ref={containerRef} className="hidden md:flex relative items-stretch flex-shrink-0 ml-2 group w-max">
      <button
        aria-label="Language"
        onClick={() => setOpen((o) => !o)}
        className="relative flex items-center px-2 lg:px-3 text-xs text-gray-200 hover:text-white hover:bg-black/10 transition-colors h-full w-full"
      >
        <LanguageWidthSizer compact className="lg:hidden" />
        <LanguageWidthSizer className="hidden lg:grid" />
        <LanguageTriggerContent locale={locale} compact className="absolute inset-0 flex items-center gap-1.5 px-2 lg:hidden" />
        <LanguageTriggerContent locale={locale} className="absolute inset-0 hidden lg:flex items-center gap-1.5 px-3" />
      </button>
      <div
        className={`absolute top-full left-0 w-full bg-chrome-panelHover shadow-lg transition-all duration-150 z-50 ${
          open ? "opacity-100 visible" : "opacity-0 invisible group-hover:opacity-100 group-hover:visible"
        }`}
      >
        <div className="lg:hidden">
          <LanguageDropdownLinks locale={locale} pathWithoutLocale={pathWithoutLocale} compact itemClassName="h-14" onSelect={() => setOpen(false)} />
        </div>
        <div className="hidden lg:block">
          <LanguageDropdownLinks locale={locale} pathWithoutLocale={pathWithoutLocale} itemClassName="h-14" onSelect={() => setOpen(false)} />
        </div>
      </div>
    </div>
  );
}

export function MobileLanguageSelector({
  locale,
  pathWithoutLocale,
  open,
  onToggle,
  onClose,
}: LanguageSelectorProps & { open: boolean; onToggle: () => void; onClose: () => void }) {
  const containerRef = useRef<HTMLDivElement>(null);
  useDismissOnOutside(containerRef, open, onClose);

  return (
    <div ref={containerRef} className="relative w-max flex items-stretch">
      <button
        onClick={onToggle}
        className="relative flex items-center gap-1 px-2 h-full text-xs text-gray-200 hover:text-white"
        aria-label="Language"
      >
        <LanguageWidthSizer compact />
        <LanguageTriggerContent locale={locale} compact className="absolute inset-0 flex items-center gap-1 px-2" />
      </button>
      {open && (
        <div className="absolute top-full right-0 w-full bg-chrome-panel shadow-lg z-50">
          <LanguageDropdownLinks locale={locale} pathWithoutLocale={pathWithoutLocale} compact onSelect={onClose} />
        </div>
      )}
    </div>
  );
}
