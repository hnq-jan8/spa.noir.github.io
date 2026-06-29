import type { Metadata, Viewport } from "next";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import RememberLocale from "@/components/RememberLocale";
import RedirectToOfficial from "@/components/RedirectToOfficial";
import ActivePoller from "@/components/ActivePoller";
import { COLORS } from "@/lib/theme-colors";
import { getBuildMode } from "@/lib/buildMode";
import "../globals.css";

export const metadata: Metadata = {
  title: {
    default: "Sun PhuQuoc Airways",
    template: "%s | Sun PhuQuoc Airways",
  },
  description: "Official information from Sun PhuQuoc Airways",
};

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

  // Required for static export: tells next-intl locale without reading headers()
  setRequestLocale(locale);

  const { active, officialSiteUrl } = await getBuildMode();
  if (!active) {
    return (
      <html lang={locale}>
        <head>
          <meta httpEquiv="refresh" content={`0;url=${officialSiteUrl}`} />
        </head>
        <body>
          <RedirectToOfficial url={officialSiteUrl} />
        </body>
      </html>
    );
  }

  const messages = (await import(`../../messages/${locale}.json`)).default;

  return (
    <html lang={locale}>
      <body>
        <NextIntlClientProvider locale={locale} messages={messages}>
          <RememberLocale locale={locale} />
          <ActivePoller officialSiteUrl={officialSiteUrl} />
          <div className="flex flex-col min-h-screen bg-page">
            <div className="flex flex-col flex-1">
              <Navbar locale={locale} />
              <main className="flex-1">{children}</main>
            </div>
            <Footer />
          </div>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
