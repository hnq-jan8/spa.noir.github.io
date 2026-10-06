import type { Metadata, Viewport } from "next";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing, activeLocales } from "@/i18n/routing";
import SiteShell from "@/components/layout/SiteShell";
import RememberLocale from "@/components/sys/RememberLocale";
import ActivePoller from "@/components/sys/ActivePoller";
import LocaleGate from "@/components/sys/LocaleGate";
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
    // Locale tắt lúc build vẫn có file HTML (superset) → đừng cho index.
    robots: activeLocales.includes(locale) ? undefined : { index: false },
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

  const { officialSiteUrl, buildId } = await getBuildMode();

  return (
    <>
      <RememberLocale />
      <ActivePoller officialSiteUrl={officialSiteUrl} buildId={buildId} />
      <SiteShell>
        <LocaleGate buildActive={activeLocales.includes(locale)}>
          {children}
        </LocaleGate>
      </SiteShell>
    </>
  );
}
