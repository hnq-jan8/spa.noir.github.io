"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DesktopLanguageSelector,
  useDismissOnOutside,
} from "@/components/layout/LanguageSelector";
import MobileMenu from "@/components/layout/MobileMenu";
import ScrollButton from "@/components/ui/ScrollButton";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";
import { normalizePath, stripLocale } from "@/i18n/paths";
import { languages as routingLanguages } from "@/i18n/routing";

const FALLBACK_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.svg`;

// Icon menu animate 2 pha 260ms, pha sau bắt đầu ở mốc 110ms => tổng ~370ms.
const MENU_ICON_ANIM_MS = 370;

export default function Navbar({ logoOnBlack }: { logoOnBlack: string | null }) {
  const locale = useLocale();
  const pathname = usePathname();
  const data = useContentData();
  const [logoBroken, setLogoBroken] = useState(false);
  // Fallback về label bundle lúc build để nav hiện ngay first paint,
  // không chờ content.json; bản trong content.json ghi đè khi về.
  const nav = data?.common.labels["nav"] ?? bundledLabels(locale, "nav");
  const a11y = data?.common.labels["a11y"] ?? bundledLabels(locale, "a11y");
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
  const [iconAnimating, setIconAnimating] = useState(false);
  const {
    ref: navRef,
    canScrollLeft,
    canScrollRight,
    scrollBy: scrollNavBy,
  } = useHorizontalScroll<HTMLElement>();
  const headerRef = useRef<HTMLElement>(null);
  const iconAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const toggleMenu = () => {
    if (iconAnimating) return;
    setMenuOpen((o) => !o);
    setIconAnimating(true);
    clearTimeout(iconAnimationTimeoutRef.current);
    iconAnimationTimeoutRef.current = setTimeout(
      () => setIconAnimating(false),
      MENU_ICON_ANIM_MS,
    );
  };

  useEffect(() => {
    return () => clearTimeout(iconAnimationTimeoutRef.current);
  }, []);

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

  const pathWithoutLocale = stripLocale(pathname);
  const normalizedPath = normalizePath(pathname);
  const activeItem = navItems.find((item) => item.href === normalizedPath);
  const isHomeActive = normalizedPath === `/${locale}`;

  const scrollNav = (dir: "left" | "right") => scrollNavBy(dir, 120);

  return (
    <>
      {/* Spacer to compensate for the fixed header being taken out of flow */}
      <div className="h-12 md:h-14" aria-hidden />
      <header
        ref={headerRef}
        className="fixed top-0 inset-x-0 z-50 w-full bg-chrome text-white"
      >
        <div className="container-page">
          <div className="flex items-stretch h-12 md:h-14">
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
                src={logoBroken ? FALLBACK_LOGO : logoOnBlack || FALLBACK_LOGO}
                onError={() => setLogoBroken(true)}
                alt="SUN PhuQuoc Airways"
                width={185}
                height={43}
                className="h-7 md:h-9 w-auto transition group-hover:drop-shadow-[0_0_9px_#202020]"
                priority
              />
            </Link>

            {/* Tablet + Desktop nav */}
            <div
              data-fallback-desktop-only
              className="hidden md:flex items-stretch flex-1 min-w-0 relative self-stretch ml-2"
            >
              <div className="relative flex-1 min-w-0 self-stretch">
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
                            ? "text-white font-medium bg-black/30"
                            : "text-gray-200 hover:text-white hover:bg-black/20 active:text-white active:bg-black/20"
                        }`}
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
                {(
                  [
                    { side: "left", active: canScrollLeft, Icon: ChevronLeft },
                    {
                      side: "right",
                      active: canScrollRight,
                      Icon: ChevronRight,
                    },
                  ] as const
                ).map(({ side, active, Icon }) => (
                  <Fragment key={side}>
                    <div
                      className={`absolute top-0 bottom-0 w-16 from-chrome to-transparent z-10 pointer-events-none lg:hidden transition-opacity duration-200 ${
                        side === "left"
                          ? "left-0 bg-gradient-to-r"
                          : "right-0 bg-gradient-to-l"
                      } ${active ? "opacity-100" : "opacity-0"}`}
                    />
                    <ScrollButton
                      active={active}
                      onClick={() => scrollNav(side)}
                      label={a11y[side === "left" ? "scrollLeft" : "scrollRight"]}
                      Icon={Icon}
                      className={`absolute top-0 bottom-0 w-24 flex items-center justify-center text-black/50 hover:text-black/80 active:text-black/80 z-20 lg:hidden ${
                        side === "left" ? "left-0" : "right-0"
                      }`}
                      iconClassName={`absolute ${
                        side === "left" ? "left-0.5" : "right-0.5"
                      } w-4 h-4 bg-gray-100 border border-white/10 rounded-full shadow-sm`}
                    />
                  </Fragment>
                ))}
              </div>
            </div>

            <div className="flex-1 md:hidden" />

            <DesktopLanguageSelector
              locale={locale}
              pathWithoutLocale={pathWithoutLocale}
              languages={liveLanguages}
              selectLanguageLabel={nav?.["selectLanguage"]}
            />

            <div className="flex md:hidden items-stretch gap-1">
              <button
                type="button"
                onClick={toggleMenu}
                className="h-full min-w-[44px] px-2 flex items-center justify-center text-gray-200 hover:text-white active:text-white"
                aria-label={a11y["toggleMenu"]}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                <span className="relative w-4 h-4 flex items-center justify-center ml-1">
                  {(
                    [
                      { rest: "-translate-y-[3px]", open: "rotate-45" },
                      { rest: "translate-y-[3px]", open: "-rotate-45" },
                    ] as const
                  ).map(({ rest, open }) => (
                    <span
                      key={open}
                      className={`absolute w-4 h-[1.5px] transition-transform duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                        menuOpen
                          ? "translate-y-0 delay-0"
                          : `${rest} delay-[110ms]`
                      }`}
                    >
                      <span
                        className={`block w-full h-full bg-current rounded-full transition-transform duration-[260ms] ease-[cubic-bezier(0.4,0,0.2,1)] ${
                          menuOpen
                            ? `${open} scale-x-[1.2] delay-[110ms]`
                            : "rotate-0 scale-x-100 delay-0"
                        }`}
                      />
                    </span>
                  ))}
                </span>
              </button>
            </div>
          </div>
        </div>

        {/* Mobile full-screen menu */}
        <MobileMenu
          open={menuOpen}
          navItems={navItems}
          normalizedPath={normalizedPath}
          nav={nav}
          currentLanguage={currentLanguage}
          languageOptions={languageOptions}
          pathWithoutLocale={pathWithoutLocale}
          locale={locale}
          onNavigate={() => setMenuOpen(false)}
        />
      </header>

      {/* Mobile breadcrumb */}
      {activeItem && (
        <div className="md:hidden sticky top-12 z-10 px-4 pt-4 pb-6">
          <div
            className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden whitespace-nowrap
                    bg-gray-300/60 backdrop-blur-md border border-white/10 text-xs text-black max-w-full
                      shadow-[0_0_24px_14px_rgba(255,255,255,0.8)]"
          >
            <Link
              href={`/${locale}`}
              className="inline-flex items-center min-h-[24px] text-gray-700 hover:text-gray-950 active:text-gray-950"
            >
              {nav?.["home"]}
            </Link>
            <ChevronRight
              className="w-3 h-3 text-gray-400 flex-shrink-0"
              strokeWidth={2}
            />
            <Link
              href={activeItem.href}
              onClick={() => invalidateContent()}
              className="inline-flex items-center min-h-[24px] font-medium truncate"
            >
              {activeItem.label}
            </Link>
          </div>
        </div>
      )}
    </>
  );
}
