"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment, useState, useRef, useEffect } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import {
  DesktopLanguageSelector,
  GlobeIcon,
  useDismissOnOutside,
} from "@/components/layout/LanguageSelector";
import MobileMenu from "@/components/layout/MobileMenu";
import ScrollButton from "@/components/ui/ScrollButton";
import {
  ARTICLE_PARAM,
  clearArticleRoute,
  useArticleKey,
} from "@/hooks/useArticleRoute";
import { useContentData, invalidateContent } from "@/hooks/useContentData";
import { useHorizontalScroll } from "@/hooks/useHorizontalScroll";
import { useLocale } from "@/hooks/useLocale";
import { useNavItems } from "@/hooks/useNavItems";
import { useUnreadUpdate } from "@/hooks/useUnreadUpdate";
import { bundledLabels } from "@/i18n/labels";
import { normalizePath, stripLocale } from "@/i18n/paths";
import { languages as routingLanguages } from "@/i18n/routing";

const FALLBACK_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.svg`;

// Icon menu animate 2 pha 260ms, pha sau bắt đầu ở mốc 110ms => tổng ~370ms.
const MENU_ICON_ANIM_MS = 370;

export default function Navbar({
  logoOnBlack,
  logoOnWhite,
}: {
  logoOnBlack: string | null;
  logoOnWhite: string | null;
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
  const [isMobile, setIsMobile] = useState(false);
  // Shared by the desktop dropdown and the mobile drawer's language
  // sub-view, so a resize between breakpoints keeps the same open state.
  const [langOpen, setLangOpen] = useState(false);
  const [iconAnimating, setIconAnimating] = useState(false);
  const {
    ref: navRef,
    canScrollLeft,
    canScrollRight,
    scrollBy: scrollNavBy,
  } = useHorizontalScroll<HTMLElement>();
  const headerRef = useRef<HTMLElement>(null);
  const iconAnimationTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  // True when the effect below auto-opened `menuOpen` for langOpen, not a
  // real hamburger tap — closing langOpen should then close the drawer too,
  // instead of just backing out to the nav list.
  const menuOpenedByLangSync = useRef(false);

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
    const mql = window.matchMedia("(max-width: 767px)");
    const sync = () => setIsMobile(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, []);

  useEffect(() => {
    if (!menuOpen) setLangOpen(false);
  }, [menuOpen]);

  // Opening langOpen from desktop then resizing down to mobile should reveal
  // the drawer already on the language screen. Gated on `isMobile`, not just
  // langOpen, so opening the desktop dropdown doesn't also trigger the scroll
  // lock below on desktop.
  useEffect(() => {
    if (!isMobile || !langOpen) return;
    setMenuOpen((prev) => {
      if (!prev) menuOpenedByLangSync.current = true;
      return true;
    });
  }, [isMobile, langOpen]);

  useEffect(() => {
    if (!langOpen && menuOpenedByLangSync.current) {
      menuOpenedByLangSync.current = false;
      setMenuOpen(false);
    }
  }, [langOpen]);

  // `isMobile` chứ không chỉ `menuOpen`: kéo cửa sổ rộng ra desktop thì
  // `md:hidden` giấu drawer đi nhưng state vẫn mở, khoá cuộn mà treo lại là
  // trang không cuộn được nữa và cũng chẳng còn nút nào để đóng.
  useEffect(() => {
    if (!menuOpen || !isMobile) return;
    const html = document.documentElement;
    const prev = html.style.cssText;
    html.style.setProperty("overflow", "hidden", "important");
    html.style.setProperty("height", "100%", "important");
    return () => {
      html.style.cssText = prev;
    };
  }, [menuOpen, isMobile]);

  useDismissOnOutside(headerRef, menuOpen, () => setMenuOpen(false));

  const navItems = useNavItems();

  // Switching language mid-article has to land on the same article, so the key
  // rides along. A suffix, not the whole query string, so nothing else leaks.
  const articleKey = useArticleKey();
  const localeSuffix = articleKey
    ? `?${ARTICLE_PARAM}=${encodeURIComponent(articleKey)}`
    : "";

  const pathWithoutLocale = stripLocale(pathname);
  const normalizedPath = normalizePath(pathname);
  const isHomeActive = normalizedPath === `/${locale}`;

  // official_updates arrives sorted `-date`, so [0] is newest. The badge keys
  // off that date, not a count, so unrelated content edits don't trigger it.
  const updatesHref = `/${locale}/official-updates`;
  const hasUnreadUpdate = useUnreadUpdate(
    data?.officialUpdates.updates[0]?.date,
    normalizedPath === updatesHref,
  );

  const scrollNav = (dir: "left" | "right") => scrollNavBy(dir, 120);

  // Drawer mở = header đảo sang nền sáng. Phải kèm `isMobile`: `menuOpen`
  // không tự tắt khi kéo cửa sổ rộng ra desktop (CSS `md:hidden` chỉ ẩn drawer
  // đi), mà logo thì đổi `src` bằng JS nên sẽ kẹt ở bản nền-sáng.
  const lightHeader = menuOpen && isMobile;
  const activeLogo = lightHeader ? logoOnWhite : logoOnBlack;
  const logoSrc = logoBroken ? FALLBACK_LOGO : activeLogo || FALLBACK_LOGO;
  // FALLBACK_LOGO (public/logo.svg) là logo trắng, hợp nền tối — rơi về nó
  // trên nền sáng thì phải `invert`, giống cách Footer.tsx xử lý fallback.
  const logoNeedsInvert = lightHeader && (logoBroken || !activeLogo);

  // The desktop/tablet nav scrolls horizontally once labels overflow (see
  // useHorizontalScroll above) -- without this, landing on a tab that's
  // scrolled out of view (e.g. a deep link straight to Press Releases) never
  // reveals which tab is active until the visitor happens to scroll there.
  const activeLinkRef = useRef<HTMLAnchorElement>(null);
  useEffect(() => {
    activeLinkRef.current?.scrollIntoView({
      inline: "center",
      block: "nearest",
      behavior: "smooth",
    });
  }, [normalizedPath, nav]);

  return (
    <>
      {/* `fixed` from md up only: below that, iOS Safari's URL-bar collapse
          leaves a fixed header painted at a stale offset it never recovers
          from. `sticky` rides the scroller instead.

          `md:` override ở nhánh sáng: `isMobile` đi qua matchMedia -> state nên
          trễ một frame lúc kéo resize, CSS chốt sẵn nền tối ở desktop để không
          kịp loé màu sai. */}
      <header
        ref={headerRef}
        className={`sticky md:fixed top-0 inset-x-0 z-50 w-full transition-colors duration-300 ${
          lightHeader
            ? "bg-page text-gray-900 md:bg-chrome md:text-white"
            : "bg-chrome text-white"
        }`}
      >
        <div className="container-page">
          <div className="flex items-stretch h-12 md:h-14">
            {/* Logo — crossfades with the "Select language" label on mobile
                while the drawer's language sub-screen is open, same slot the
                logo normally owns. Gated on `menuOpen` too, so `langOpen`
                being shared with the desktop dropdown doesn't crossfade the
                logo there. Both layers stay mounted (never unmount) so they
                fade in sync with the drawer instead of snapping. */}
            <div className="relative self-stretch flex items-center flex-shrink-0 mr-2">
              <Link
                href={`/${locale}`}
                // h-full: hit-area khớp chiều cao header, giống các tab bên
                // cạnh, không chỉ khớp khung ảnh — nên ring focus phải vẽ
                // quanh cái logo, không quanh hit-area (focus-ring-inner).
                // transform-gpu: tránh Safari giật lúc crossfade nhanh với
                // span nhãn bên dưới.
                className={`group focus-ring-inner flex items-center h-full transform-gpu transition-opacity ease-out ${
                  langOpen && menuOpen
                    ? "duration-100 opacity-0 pointer-events-none md:duration-300 md:opacity-100 md:pointer-events-auto"
                    : "duration-200 opacity-100"
                }`}
                onClick={(e) => {
                  setMenuOpen(false);
                  e.currentTarget.blur();
                  clearArticleRoute();
                  if (isHomeActive) invalidateContent();
                }}
              >
                <Image
                  src={logoSrc}
                  onError={() => setLogoBroken(true)}
                  alt="SUN PhuQuoc Airways"
                  width={185}
                  height={43}
                  // `rounded-lg` không đổi gì về hình (logo nền trong suốt) —
                  // nó ở đây để vòng focus bám theo được bo góc.
                  className={`h-7 md:h-9 w-auto rounded-lg transition group-hover:drop-shadow-[0_0_9px_rgba(255,255,255,0.35)] ${
                    logoNeedsInvert ? "invert" : ""
                  }`}
                  priority
                />
              </Link>
              {nav?.["selectLanguage"] && (
                <span
                  className={`md:hidden absolute inset-0 flex items-center text-base font-light text-gray-600 transform-gpu transition-opacity ease-out ${
                    langOpen && menuOpen
                      ? "duration-200 opacity-100"
                      : "duration-100 opacity-0 pointer-events-none"
                  }`}
                >
                  {nav["selectLanguage"]}
                </span>
              )}
            </div>

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
                        ref={isActive ? activeLinkRef : undefined}
                        onClick={() => {
                          // Re-clicking the active tab keeps the same pathname,
                          // so the detail view has to be dismissed explicitly.
                          clearArticleRoute();
                          if (isActive) invalidateContent();
                        }}
                        className={`group text-xs whitespace-nowrap px-4 flex items-center relative flex-shrink-0 focus-visible:outline-none ${
                          isActive
                            ? "text-white font-medium bg-white/10"
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
                              <span className="absolute -top-0.5 -right-2 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_3px_1px_rgba(255,255,255,0.5)]" />
                            )}
                            {/* Custom focus ring: the tab's hit-area is the
                                full header height, so the default ring would
                                hug that instead of the label -- draw it here,
                                pill-shaped like the hotline links' ring. */}
                            <span
                              aria-hidden="true"
                              className="pointer-events-none absolute -inset-x-2.5 -inset-y-1.5 rounded-full opacity-0 group-focus-visible:opacity-100 shadow-[0_0_0_2px_var(--focus-ring)]"
                            />
                          </span>
                        </span>
                        {/* White on the gray chrome — the only accent left in a
                            black-and-white palette that still reads as a
                            deliberate marker rather than an artefact. */}
                        {isActive && (
                          <span
                            aria-hidden="true"
                            className="absolute inset-x-0 bottom-0 h-0.5 bg-white"
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
              open={langOpen}
              onOpenChange={setLangOpen}
            />

            <div className="flex md:hidden items-stretch gap-1">
              {/* Cùng vị trí với DesktopLanguageSelector ở size lớn hơn —
                  luôn mounted (không chỉ khi drawer mở) để fade theo cùng
                  nhịp với drawer thay vì bật/tắt đột ngột; pointer-events tắt
                  lúc ẩn nên không bấm/tab vào được. Bấm để chuyển sang màn
                  hình chọn ngôn ngữ full-screen bên trong drawer; bấm lại để
                  quay về danh sách nav. Không đổi icon — chỉ sáng lên khi
                  đang ở màn ngôn ngữ, giống cách tab active sáng hơn tab
                  thường trong menu mobile. */}
              {languageOptions.length > 1 && (
                <button
                  type="button"
                  onClick={() => setLangOpen((v) => !v)}
                  tabIndex={menuOpen ? 0 : -1}
                  aria-hidden={!menuOpen}
                  className={`relative z-50 self-center h-9 min-w-[44px] pl-2.5 pr-3 flex items-center justify-center gap-1.5 rounded-full transition-[opacity,background-color,color] duration-300 ease-out ${
                    menuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                  } ${
                    langOpen
                      ? "bg-gray-900 text-white"
                      : "text-gray-600 hover:text-gray-900 active:text-gray-900"
                  }`}
                  aria-label={nav?.["selectLanguage"]}
                  aria-expanded={langOpen}
                >
                  <GlobeIcon className="w-[18px] h-[18px] flex-shrink-0" />
                  <span className="text-sm font-medium">
                    {currentLanguage?.code.toUpperCase()}
                  </span>
                </button>
              )}
              <button
                type="button"
                onClick={toggleMenu}
                className={`relative focus-ring-inner h-full min-w-[44px] px-2 flex items-center justify-center transition-colors duration-300 ${
                  lightHeader
                    ? "text-gray-700 hover:text-gray-900 active:text-gray-900"
                    : "text-gray-200 hover:text-white active:text-white"
                }`}
                aria-label={a11y["toggleMenu"]}
                aria-expanded={menuOpen}
                aria-controls="mobile-menu"
              >
                {/* Nav tabs are behind this button on mobile, so the unread dot
                    has to surface on the trigger itself. */}
                {hasUnreadUpdate && !menuOpen && (
                  <span
                    aria-hidden="true"
                    className="absolute top-2.5 right-1.5 w-1.5 h-1.5 rounded-full bg-white shadow-[0_0_3px_1px_rgba(255,255,255,0.5)]"
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
          langView={langOpen}
          navItems={navItems}
          normalizedPath={normalizedPath}
          languageOptions={languageOptions}
          pathWithoutLocale={`${pathWithoutLocale}${localeSuffix}`}
          locale={locale}
          onNavigate={() => setMenuOpen(false)}
          unreadHref={hasUnreadUpdate ? updatesHref : null}
        />
      </header>
    </>
  );
}
