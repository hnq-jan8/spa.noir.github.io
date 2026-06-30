import { getTranslations, setRequestLocale } from "next-intl/server";
import FaqsContent from "@/components/features/FaqsContent";

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("faqs") };
}

export default async function Faqs({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqsContent />;
}
