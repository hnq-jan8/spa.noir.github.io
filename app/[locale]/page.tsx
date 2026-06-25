import { getTranslations, setRequestLocale } from "next-intl/server";
import Link from "next/link";
import {
  Megaphone,
  Phone,
  PlaneTakeoff,
  HelpCircle,
  FileText,
  ChevronRight,
} from "lucide-react";
import {
  getOfficialUpdates,
  getSupportContacts,
  t as tr,
} from "@/lib/directus";
import { getBuildTimestamp } from "@/lib/siteData";

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const [tHome, tNav, tSupport] = await Promise.all([
    getTranslations({ locale, namespace: "home" }),
    getTranslations({ locale, namespace: "nav" }),
    getTranslations({ locale, namespace: "support" }),
  ]);

  const [updates, contacts] = await Promise.all([
    getOfficialUpdates(),
    getSupportContacts(),
  ]);

  const latestUpdate = updates[0];
  const latestTr = latestUpdate ? tr(latestUpdate, locale) : null;
  const asOf = getBuildTimestamp(locale);

  const gridPages = [
    {
      href: `/${locale}/flight-info`,
      label: tNav("flightInfo"),
      desc: tHome("flightInfoDesc"),
      Icon: PlaneTakeoff,
    },
    {
      href: `/${locale}/faqs`,
      label: tNav("faqs"),
      desc: tHome("faqsDesc"),
      Icon: HelpCircle,
    },
  ];

  return (
    <div className="container-page py-8 md:py-11 max-w-3xl mx-auto">
      {/* As-of timestamp */}
      <div className="flex items-start gap-2 text-sm text-gray-500 bg-white border border-gray-200 rounded-2xl px-4 py-3 mb-4">
        <span className="w-2 h-2 rounded-full bg-red-500 flex-shrink-0 mt-1.5" />
        <p className="flex flex-wrap gap-x-1">
          <span>{tHome("asOf")}:</span>
          <span className="whitespace-nowrap">{asOf}</span>
        </p>
      </div>

      {/* Official update preview */}
      {latestUpdate && latestTr && (
        <Link
          href={`/${locale}/official-updates`}
          className="block bg-white border-l-4 border-l-amber-600 border border-gray-200 rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow mb-4"
        >
          <p className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">
            <Megaphone className="w-4 h-4" strokeWidth={2} />
            {tHome("officialUpdateBadge")}
          </p>
          <h2 className="font-bold text-lg mb-2">{latestTr.title}</h2>
          <p className="text-sm text-gray-600 leading-relaxed mb-4">
            {latestTr.description}
          </p>
          <div className="flex items-center justify-between text-xs">
            <span className="text-gray-400">{latestUpdate.date}</span>
            <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
              {tHome("viewAll")}
              <ChevronRight className="w-3.5 h-3.5" strokeWidth={2} />
            </span>
          </div>
        </Link>
      )}

      {/* Support hotlines */}
      <div className="bg-gray-100 border border-gray-200 rounded-2xl shadow-sm p-6 mb-4">
        <p className="flex items-center gap-1.5 text-gray-700 text-xs font-semibold uppercase tracking-wide mb-4">
          <Phone className="w-4 h-4" strokeWidth={2} />
          {tHome("supportTitle")}
        </p>
        <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-5">
          {contacts.map((contact) => (
            <div key={contact.key}>
              <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                {tSupport(contact.key)}
              </p>
              <p className="text-sm font-semibold text-gray-900">
                {contact.value}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* 2-up grid: flight info / faqs */}
      <div className="grid grid-cols-1 min-[800px]:grid-cols-2 gap-4 mb-4">
        {gridPages.map((page) => (
          <Link
            key={page.href}
            href={page.href}
            className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
          >
            <div className="flex items-center gap-4 min-[800px]:flex-col min-[800px]:items-start min-[800px]:gap-0">
              <page.Icon
                className="w-6 h-6 text-gray-400 flex-shrink-0 min-[800px]:mb-3"
                strokeWidth={2}
              />
              <div>
                <h2 className="font-bold text-lg min-[800px]:mb-1">
                  {page.label}
                </h2>
                <p className="text-sm text-gray-500">{page.desc}</p>
              </div>
            </div>
            <ChevronRight
              className="w-5 h-5 text-gray-300 flex-shrink-0"
              strokeWidth={2}
            />
          </Link>
        ))}
      </div>

      {/* Press releases */}
      <Link
        href={`/${locale}/press-releases`}
        className="flex items-center justify-between gap-4 bg-white border border-gray-200 rounded-2xl shadow-sm hover:shadow-md transition-shadow p-6"
      >
        <div className="flex items-center gap-4">
          <FileText
            className="w-6 h-6 text-gray-400 flex-shrink-0"
            strokeWidth={2}
          />
          <div>
            <h2 className="font-bold text-lg">{tNav("pressReleases")}</h2>
            <p className="text-sm text-gray-500">
              {tHome("pressReleasesDesc")}
            </p>
          </div>
        </div>
        <ChevronRight
          className="w-5 h-5 text-gray-300 flex-shrink-0"
          strokeWidth={2}
        />
      </Link>
    </div>
  );
}
