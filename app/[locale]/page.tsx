import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import Link from "next/link";

export default function Home({ params }: { params: { locale: string } }) {
  const { locale } = params;
  setRequestLocale(locale);

  const t = useTranslations("home");
  const tn = useTranslations("nav");

  const pages = [
    {
      href: `/${locale}/official-updates`,
      label: tn("officialUpdates"),
      desc: t("officialUpdatesDesc"),
    },
    {
      href: `/${locale}/press-releases`,
      label: tn("pressReleases"),
      desc: t("pressReleasesDesc"),
    },
    {
      href: `/${locale}/flight-info`,
      label: tn("flightInfo"),
      desc: t("flightInfoDesc"),
    },
    {
      href: `/${locale}/faqs`,
      label: tn("faqs"),
      desc: t("faqsDesc"),
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{t("title")}</h1>
        <p className="text-gray-600 text-lg">{t("subtitle")}</p>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-3xl mx-auto">
        {pages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="block border-[1.5px] border-gray-200 rounded-lg p-6 hover:border-gray-400 hover:shadow-sm transition-all"
          >
            <h2 className="font-bold text-lg mb-1">{page.label}</h2>
            <p className="text-sm text-gray-500">{page.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  );
}
