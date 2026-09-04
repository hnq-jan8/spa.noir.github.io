import { setRequestLocale } from "next-intl/server";
import OfficialUpdatesContent from "@/components/features/OfficialUpdatesContent";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = navMetadata("officialUpdates");

export default async function OfficialUpdates({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <OfficialUpdatesContent />;
}
