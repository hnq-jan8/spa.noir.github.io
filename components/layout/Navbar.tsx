"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight, FileText, Megaphone } from "lucide-react";
import {
  DesktopLanguageSelector,
  useDismissOnOutside,
} from "@/components/layout/LanguageSelector";
import MobileMenu from "@/components/layout/MobileMenu";
import ScrollButton from "@/components/ui/ScrollButton";
import {
  ARTICLE_PARAM,
  clearArticleRoute,
  useArticleKey,
} from "@/hooks/useArticleRoute";
import { useBreadcrumbHidden } from "@/hooks/useBreadcrumbVisibility";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { useLocale } from "@/hooks/useLocale";
import { useUnreadUpdate } from "@/hooks/useUnreadUpdate";
import { bundledLabels } from "@/i18n/labels";
import { normalizePath, stripLocale } from "@/i18n/paths";
import { languages as routingLanguages } from "@/i18n/routing";

const FALLBACK_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.svg`;

// Icon menu animate 2 pha 260ms, pha sau bắt đầu ở mốc 110ms => tổng ~370ms.
const MENU_ICON_ANIM_MS = 370;

export default function Navbar({
  logoOnBlack,
}: {
  logoOnBlack: string | null;
}) {
  const locale = useLocale();
  const pathname = usePathname();
  const data = useContentData();
  const [logoBroken, setLogoBroken] = useState(false);
  // Fallback về label bundle lúc build để nav hiện ngay first paint,
  // không chờ content.json; bản trong content.json ghi đè khi về.
  const nav = data?.common.labels["nav"] ?? bundledLabels(locale, "nav");
  const a11y = data?.common.labels["a11y"] ?? bundledLabels(locale, "a11y");
  // The desktop selector shows the code at rest and the full name on hover.
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

  // Switching language mid-article has to land on the same article, so the key
  // rides along. A suffix, not the whole query string, so nothing else leaks.
  const articleKey = useArticleKey();
  const localeSuffix = articleKey
    ? `?${ARTICLE_PARAM}=${encodeURIComponent(articleKey)}`
    : "";

  const pathWithoutLocale = stripLocale(pathname);
  const normalizedPath = normalizePath(pathname);
  const activeItem = navItems.find((item) => item.href === normalizedPath);
  const isHomeActive = normalizedPath === `/${locale}`;
  const breadcrumbHidden = useBreadcrumbHidden();

  // official_updates arrives sorted `-date`, so [0] is newest. The badge keys
  // off that date, not a count, so unrelated content edits don't trigger it.
  const updatesHref = `/${locale}/official-updates`;
  const hasUnreadUpdate = useUnreadUpdate(
    data?.officialUpdates.updates[0]?.date,
    normalizedPath === updatesHref,
  );

  // Third crumb: only the two listing pages open a detail view, and only while
  // active — articleKey lingers briefly during a cross-tab nav.
  const pressReleasesHref = `/${locale}/press-releases`;
  const openedArticle =
    articleKey &&
    (normalizedPath === updatesHref || normalizedPath === pressReleasesHref)
      ? (data?.officialUpdates.updates.find((u) => u.key === articleKey) ??
        data?.pressReleases.releases.find((r) => r.key === articleKey) ??
        null)
      : null;
  // Same glyphs the home cards use for these two sections.
  const ArticleIcon = normalizedPath === updatesHref ? Megaphone : FileText;

  const scrollNav = (dir: "left" | "right") => scrollNavBy(dir, 120);

  return (
    <>
      {/* `fixed` from md up only: below that, iOS Safari's URL-bar collapse
          leaves a fixed header painted at a stale offset it never recovers
          from. `sticky` rides the scroller instead. */}
      <header
        ref={headerRef}
        className="sticky md:fixed top-0 inset-x-0 z-50 w-full bg-chrome text-white"
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
                clearArticleRoute();
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
                    const showDot =
                      item.href === updatesHref && hasUnreadUpdate;
                    return (
                      <Link
                        key={item.href}
                        href={item.href}
                        onClick={() => {
                          // Re-clicking the active tab keeps the same pathname,
                          // so the detail view has to be dismissed explicitly.
                          clearArticleRoute();
                          if (isActive) invalidateContent();
                        }}
                        className={`text-xs whitespace-nowrap px-4 flex items-center relative flex-shrink-0 ${
                          isActive
                            ? "text-white font-medium bg-black/15"
                            : "text-gray-200 hover:text-white hover:font-medium active:text-white active:font-medium"
                        }`}
                      >
                        <span
                          className="invisible font-medium"
                          aria-hidden="true"
                        >
                          {item.label}
                        </span>
                        <span className="absolute inset-0 flex items-center justify-center px-4">
                          {/* Relative wrapper so the dot sits as a
                              superscript on the label's top-right corner
                              rather than centred beside it — matches the
                              mobile menu. Steady glow, no pulse. */}
                          <span className="relative">
                            {item.label}
                            {showDot && (
                              <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_3px_1px_rgba(239,68,68,0.5)]" />
                            )}
                          </span>
                        </span>
                        {/* Amber, matching the site's single accent. White
                            read as an artefact of the chrome against the page
                            below it rather than as a deliberate marker. */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-amber-500"
                          />
                        )}
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
                      label={
                        a11y[side === "left" ? "scrollLeft" : "scrollRight"]
                      }
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
              pathWithoutLocale={`${pathWithoutLocale}${localeSuffix}`}
              languages={languageOptions}
              selectLanguageLabel={nav?.["selectLanguage"]}
            />

            <div className="flex md:hidden items-stretch gap-1">
              <button
                type="button"
                onClick={toggleMenu}
                className="relative h-full min-w-[44px] px-2 flex items-center justify-center text-gray-200 hover:text-white active:text-white"
                aria-label={a11y["toggleMenu"]}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {/* Nav tabs are behind this button on mobile, so the unread dot
                    has to surface on the trigger itself. */}
                {hasUnreadUpdate && !menuOpen && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 right-1.5 w-1.5 h-1.5 rounded-full bg-red-500 shadow-[0_0_3px_1px_rgba(239,68,68,0.5)]"
                  />
                )}
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
          pathWithoutLocale={`${pathWithoutLocale}${localeSuffix}`}
          locale={locale}
          onNavigate={() => setMenuOpen(false)}
          unreadHref={hasUnreadUpdate ? updatesHref : null}
        />
      </header>

      {/* `invisible`, not unmounted, when a page needs this row for something
          else (FAQs search capsule) — keeps its layout space and is more
          reliable than masking it (hooks/useBreadcrumbVisibility.ts). */}
      {activeItem && (
        <div
          className={`md:hidden sticky top-12 z-10 px-4 pt-4 pb-6 ${breadcrumbHidden ? "invisible" : ""}`}
        >
          <div
            className="relative inline-flex items-center gap-1.5 px-3 py-1 rounded-full overflow-hidden whitespace-nowrap
                    bg-white/75 backdrop-blur-md border border-gray-200 text-xs text-black max-w-full"
          >
            <Link
              href={`/${locale}`}
              onClick={() => clearArticleRoute()}
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
              onClick={() => {
                // Same as the tab bar: close the detail view (its query param is
                // invisible to Next's router) and refresh the list.
                clearArticleRoute();
                invalidateContent();
              }}
              // With an article open, "you are here" moves to the icon crumb and
              // this one drops back to a plain link.
              className={`inline-flex items-center min-h-[24px] truncate hover:text-gray-600 active:text-gray-600 ${
                openedArticle
                  ? "text-gray-700 hover:text-gray-950 active:text-gray-950"
                  : "font-medium"
              }`}
            >
              {activeItem.label}
            </Link>
            {openedArticle && (
              <>
                <ChevronRight
                  className="w-3 h-3 text-gray-400 flex-shrink-0"
                  strokeWidth={2}
                />
                {/* Icon-only: a headline would blow out the pill's width or
                    truncate to nothing. The title still reaches screen readers. */}
                <span
                  aria-current="page"
                  className="inline-flex items-center min-h-[24px] text-gray-900 flex-shrink-0"
                >
                  <ArticleIcon className="w-3.5 h-3.5" strokeWidth={2.5} aria-hidden="true" />
                  <span className="sr-only">
                    {openedArticle.title ?? activeItem.label}
                  </span>
                </span>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
