import { getTranslations, setRequestLocale } from "next-intl/server";
import FaqAccordion from "@/components/FaqAccordion";
import { getFaqs, t as tr } from "@/lib/directus";
import { getBuildMode } from "@/lib/buildMode";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("faqs") };
}

export default async function Faqs({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { active } = await getBuildMode();
  if (!active) return null;

  const faqs = await getFaqs();
  const items = faqs.map((faq) => {
    const translation = tr(faq, locale);
    return { question: translation.question, answer: translation.answer };
  });

  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 pt-4 pb-12 md:py-8">
      <FaqAccordion items={items} />
    </div>
  );
}
