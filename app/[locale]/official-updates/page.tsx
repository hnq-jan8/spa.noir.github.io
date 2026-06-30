import { getTranslations, setRequestLocale } from "next-intl/server";
import OfficialUpdatesContent from "@/components/features/OfficialUpdatesContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("officialUpdates") };
}

export default async function OfficialUpdates({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OfficialUpdatesContent />;
}
