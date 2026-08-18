import type { Metadata, Viewport } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import RememberLocale from "@/components/sys/RememberLocale";
import ActivePoller from "@/components/sys/ActivePoller";
import { COLORS } from "@/lib/theme-colors";
import { getBuildMode } from "@/lib/buildMode";

const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const { seoTitle, seoDescription, favicon } = await getBuildMode();
  const title = seoTitle[locale] ?? seoTitle[routing.defaultLocale];
  const description = seoDescription[locale] ?? seoDescription[routing.defaultLocale];
  return {
    title: { default: title, template: `%s | ${title}` },
    description,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      images: [ogImage],
    },
  };
}

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: COLORS.chrome,
};

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!(routing.locales as readonly string[]).includes(locale)) {
    notFound();
  }

  setRequestLocale(locale);

  const { officialSiteUrl, logoOnBlack, logoOnWhite, buildId } = await getBuildMode();

  return (
    <>
      <RememberLocale />
      <ActivePoller officialSiteUrl={officialSiteUrl} buildId={buildId} />
      <div className="flex flex-col min-h-[100dvh] bg-page">
        <Navbar logoOnBlack={logoOnBlack} />
        {/* Navbar's header is `sticky` on mobile (stays in flow, no spacer
            needed) but `fixed` from `md:` up, where it drops out of flow —
            this spacer reserves its md:h-14 there so content below (and
            sticky offsets like `top-12`) sits exactly where it would if the
            header were still in flow. */}
        <div className="hidden md:block md:h-14 flex-shrink-0" aria-hidden="true" />
        {/* flex column so a page can claim leftover height with `flex-1`
            — see PressReleasesContent's article wrapper. */}
        <main className="flex-1 flex flex-col">{children}</main>
        <Footer logoOnWhite={logoOnWhite} />
      </div>
    </>
  );
}
