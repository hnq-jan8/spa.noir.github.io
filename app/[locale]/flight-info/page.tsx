import { setRequestLocale } from "next-intl/server";
import FlightInfoContent from "@/components/features/FlightInfoContent";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = navMetadata("flightInfo");

export default async function FlightInfo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FlightInfoContent />;
}
