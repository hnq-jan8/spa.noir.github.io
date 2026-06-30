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
