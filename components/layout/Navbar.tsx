"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname, useParams } from "next/navigation";
import { useState, useRef, useEffect, useCallback } from "react";
import {
  DesktopLanguageSelector,
  useDismissOnOutside,
} from "@/components/layout/LanguageSelector";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { routing, languages as routingLanguages } from "@/i18n/routing";

const localeSegmentPattern = new RegExp(`^/(${routing.locales.join("|")})`);

export default function Navbar() {
  const params = useParams();
  const locale = (params?.locale as string) ?? routing.defaultLocale;
  const pathname = usePathname();
  const data = useContentData();
  const nav = data?.common.labels["nav"];
  const liveLanguages = data?.common.languages.map((lang) => ({
    code: lang.code,
    label: lang.code.toUpperCase(),
  }));

  const languageOptions = (data?.common.languages ?? routingLanguages).map(
    (lang) => ({
      code: lang.code,
      label: lang.name,
    }),
  );
  const currentLanguage =
    languageOptions.find((lang) => lang.code === locale) ?? languageOptions[0];

  const [menuOpen, setMenuOpen] = useState(false);
  const [langExpanded, setLangExpanded] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const navRef = useRef<HTMLElement>(null);
  const headerRef = useRef<HTMLElement>(null);
  const drawerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!menuOpen) setLangExpanded(false);
  }, [menuOpen]);

  useEffect(() => {
    if (!menuOpen) return;
    const html = document.documentElement;
    const prev = html.style.cssText;
    html.style.setProperty("overflow", "hidden", "important");
    html.style.setProperty("height", "100%", "important");
    return () => {
      html.style.cssText = prev;
    };
  }, [menuOpen]);

  useDismissOnOutside(headerRef, menuOpen, () => setMenuOpen(false));

  const navItems = nav
    ? [
        { label: nav["officialUpdates"], href: `/${locale}/official-updates` },
        { label: nav["flightInfo"], href: `/${locale}/flight-info` },
        { label: nav["faqs"], href: `/${locale}/faqs` },
        { label: nav["pressReleases"], href: `/${locale}/press-releases` },
      ]
    : [];

  const pathWithoutLocale = pathname.replace(localeSegmentPattern, "") || "/";
  const normalizedPath = pathname.replace(/\/$/, "") || "/";
  const activeItem = navItems.find((item) => item.href === normalizedPath);
  const isHomeActive = normalizedPath === `/${locale}`;

  const updateScrollState = useCallback(() => {
    const el = navRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 0);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 1);
  }, []);

  useEffect(() => {
    const el = navRef.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener("scroll", updateScrollState);
    window.addEventListener("resize", updateScrollState);
    return () => {
      el.removeEventListener("scroll", updateScrollState);
      window.removeEventListener("resize", updateScrollState);
    };
  }, [updateScrollState]);

  const scrollNav = (dir: "left" | "right") => {
    navRef.current?.scrollBy({
      left: dir === "left" ? -120 : 120,
      behavior: "smooth",
    });
  };

  return (
    <>
      {/* Spacer to compensate for the fixed header being taken out of flow */}
      <div className="h-14" aria-hidden />
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-50 w-full bg-chrome text-white"
      >
        <div className="container-page">
          <div className="flex items-stretch h-14">
            {/* Logo */}
            <Link
              href={`/${locale}`}
              className="group flex items-center flex-shrink-0 mr-2 py-1"
              onClick={(e) => {
                setMenuOpen(false);
                e.currentTarget.blur();
                if (isHomeActive) invalidateContent();
              }}
            >
              <Image
                src={
                  data?.common.logoOnBlack ||
                  `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`
                }
                alt="SUN PhuQuoc Airways"
                width={1024}
                height={251}
                className="h-9 w-auto transition group-hover:drop-shadow-[0_0_12px_#000000]"
                priority
              />
            </Link>

            {/* Tablet + Desktop nav */}
            <div className="hidden md:flex items-stretch flex-1 min-w-0 relative self-stretch ml-2">
              <div className="relative flex-1 min-w-0 self-stretch">
                {canScrollLeft && (
                  <>
                    <div className="absolute left-0 top-0 bottom-0 w-16 bg-gradient-to-r from-chrome to-transparent z-10 pointer-events-none lg:hidden" />
                    <button
                      onClick={() => scrollNav("left")}
                      className="absolute left-0 top-0 bottom-0 w-24 flex items-center justify-center text-black/50 hover:text-black/80 z-20 lg:hidden"
                      aria-label="Scroll left"
                    >
                      <svg
                        className="absolute left-0.5 w-4 h-4 bg-gray-100 border border-white/10 rounded-full shadow-sm"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M15 19l-7-7 7-7"
                        />
                      </svg>
                    </button>
                  </>
                )}
                <nav
                  ref={navRef}
                  className="flex items-stretch overflow-x-auto overflow-y-clip scrollbar-hide h-full w-full px-2 scroll-px-5 lg:px-0 lg:scroll-px-0"
                  style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
                >
                  {navItems.map((item) => {
                    const isActive = normalizedPath === item.href;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={
                          isActive ? () => invalidateContent() : undefined
                        }
                        className={`text-xs whitespace-nowrap px-4 flex items-center transition-colors relative flex-shrink-0 ${
                          isActive
                            ? "text-white font-medium before:opacity-100"
                            : "text-gray-200 hover:text-white hover:before:opacity-60"
                        }
                          before:absolute before:inset-0 before:bg-gradient-to-t before:from-black/50
                          before:to-transparent before:opacity-0 before:pointer-events-none
                          before:transition-opacity before:duration-200 `}
                      >
                        <span
                          className="invisible font-medium"
                          aria-hidden="true"
                        >
                          {item.label}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center px-4">
                          {item.label}
                        </span>
                      </Link>
                    );
                  })}
                </nav>
                {canScrollRight && (
                  <>
                    <div className="absolute right-0 top-0 bottom-0 w-16 bg-gradient-to-l from-chrome to-transparent z-10 pointer-events-none lg:hidden" />
                    <button
                      onClick={() => scrollNav("right")}
                      className="absolute right-0 top-0 bottom-0 w-24 flex items-center justify-center text-black/50 hover:text-black/80 z-20 lg:hidden"
                      aria-label="Scroll right"
                    >
                      <svg
                        className="absolute right-0.5 w-4 h-4 bg-gray-100 border border-white/10 rounded-full shadow-sm"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M9 5l7 7-7 7"
                        />
                      </svg>
                    </button>
                  </>
                )}
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <DesktopLanguageSelector
              locale={locale}
              pathWithoutLocale={pathWithoutLocale}
              languages={liveLanguages}
            />

            <div className="flex md:hidden items-stretch gap-1">
              <button
                onClick={() => setMenuOpen((o) => !o)}
                className="h-full px-2 flex items-center text-gray-200 hover:text-white"
                aria-label="Toggle menu"
              >
                {menuOpen ? (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      // d="M4 6h16M4 12h16M4 18h16"
                      d="M4 8h16M4 16h16"
                    />
                  </svg>
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile full-screen menu */}
        <div
          ref={drawerRef}
          className={`md:hidden fixed inset-x-0 top-14 h-[calc(100dvh-3.5rem)] z-40 bg-chrome text-white overflow-y-auto overscroll-contain ${
            menuOpen
              ? "[clip-path:inset(0_0_0_0)] visible pointer-events-auto [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_0s]"
              : "[clip-path:inset(0_0_100%_0)] invisible pointer-events-none [transition:clip-path_500ms_cubic-bezier(0.32,0.72,0,1),visibility_0s_linear_500ms]"
          }`}
          role="dialog"
          aria-modal="true"
        >
          <nav className="flex flex-col mt-1">
            {navItems.map((item) => {
              const isActive = normalizedPath === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => {
                    setMenuOpen(false);
                    if (isActive) invalidateContent();
                  }}
                  className={`px-6 py-4 text-xl transition-colors ${
                    isActive
                      ? "text-white font-semibold bg-black/20"
                      : "text-gray-200 font-medium hover:text-white hover:bg-black/10"
                  }`}
                >
                  {item.label}
                </Link>
              );
            })}
          </nav>

          <div className="mt-1">
            <button
              onClick={() => setLangExpanded((o) => !o)}
              className={`w-full flex items-center gap-3 px-6 py-4 text-base ${langExpanded ? "text-white" : "text-gray-200"} hover:text-white transition-colors`}
              aria-expanded={langExpanded}
            >
              <svg
                className="w-5 h-5 flex-shrink-0"
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
              <span className="flex-1 text-left">
                {langExpanded
                  ? nav?.["selectLanguage"]
                  : currentLanguage?.label}
              </span>
              <svg
                className={`w-4 h-4 flex-shrink-0 transition-transform duration-200 ${langExpanded ? "rotate-90" : ""}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 5l7 7-7 7"
                />
              </svg>
            </button>
            <div
              className={`grid transition-[grid-template-rows] duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] ${
                langExpanded ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
              }`}
            >
              <div className="overflow-hidden">
                {languageOptions.map((lang) => {
                  const isActive = lang.code === locale;
                  return (
                    <Link
                      key={lang.code}
                      href={`/${lang.code}${pathWithoutLocale}`}
                      onClick={() => setMenuOpen(false)}
                      className={`flex items-center justify-between pl-14 pr-6 py-3 text-base transition-colors ${
                        isActive
                          ? "text-white font-semibold"
                          : "text-gray-300 hover:text-white"
                      }`}
                    >
                      <span>{lang.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Mobile breadcrumb */}
      {activeItem && (
        <div className="md:hidden sticky top-14 z-10 px-4 pt-4 pb-6">
          <div className="absolute inset-x-0 top-0 h-14 bg-gradient-to-t from-transparent to-page pointer-events-none" />
          <div className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-gray-300/60 backdrop-blur-md border border-white/10 text-xs text-black max-w-full">
            <Link
              href={`/${locale}`}
              className="text-gray-700 hover:text-gray-950"
            >
              {nav?.["home"]}
            </Link>
            <svg
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 5l7 7-7 7"
              />
            </svg>
            <Link
              href={activeItem.href}
              onClick={() => invalidateContent()}
              className="font-medium truncate"
            >
              {activeItem.label}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
