import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import ContactCards from "@/components/ContactCards";

export default function Support({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations("support");

  const cards = [
    { label: t("passengerHotline"), value: "0123 456 789" },
    { label: t("familyHotline"), value: "0123 456 789" },
    { label: t("supportEmail"), value: "loremipsum@gmail.com" },
    { label: t("mediaContact"), value: "loremipsum@gmail.com" },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-8 md:py-8">
      <ContactCards cards={cards} />
    </div>
  );
}
