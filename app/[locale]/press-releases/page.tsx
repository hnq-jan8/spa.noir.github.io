import { setRequestLocale } from "next-intl/server";
import PressReleasesContent from "@/components/features/PressReleasesContent";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = navMetadata("pressReleases");

export default async function PressReleases({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <PressReleasesContent />;
}
