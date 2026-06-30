import { getTranslations, setRequestLocale } from "next-intl/server";
import PressReleasesContent from "@/components/features/PressReleasesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("pressReleases") };
}

export default async function PressReleases({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PressReleasesContent />;
}
