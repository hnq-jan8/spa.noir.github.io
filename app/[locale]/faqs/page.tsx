import { setRequestLocale } from "next-intl/server";
import FaqsContent from "@/components/features/FaqsContent";
import { navMetadata } from "@/i18n/metadata";

export const generateMetadata = navMetadata("faqs");

export default async function Faqs({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  return <FaqsContent />;
}
