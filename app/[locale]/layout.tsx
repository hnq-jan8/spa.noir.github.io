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
import "../globals.css";

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

  const { officialSiteUrl } = await getBuildMode();

  return (
    <html lang={locale}>
      <body>
        <RememberLocale />
        <ActivePoller officialSiteUrl={officialSiteUrl} />
        <div className="flex flex-col min-h-screen bg-page">
          <div className="flex flex-col flex-1">
            <Navbar />
            <main className="flex-1">{children}</main>
          </div>
          <Footer />
        </div>
      </body>
    </html>
  );
}
