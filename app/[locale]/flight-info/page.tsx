import { getTranslations, setRequestLocale } from "next-intl/server";
import FlightInfoContent from "@/components/features/FlightInfoContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("flightInfo") };
}

export default async function FlightInfo({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FlightInfoContent />;
}
