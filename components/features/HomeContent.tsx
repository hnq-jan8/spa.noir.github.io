"use client";

import {
  Megaphone,
  Phone,
  PlaneTakeoff,
  HelpCircle,
  FileText,
  ChevronRight,
  Info,
} from "lucide-react";
import { useContentState, invalidateContent } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { formatTimestamp } from "@/lib/siteData";
import { ContentLoadError } from "@/components/ui/EmptyState";
import MarkdownContent from "@/components/ui/MarkdownContent";
import Reveal from "@/components/ui/Reveal";
import { CardLink } from "@/components/ui/Card";

export default function HomeContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : null;

  const nav = data.common.labels["nav"];
  const home = data.home.labels["home"];
  const support = data.common.labels["support"];
  const latestUpdate = data.home.latestUpdate;
  const asOf = formatTimestamp(data.generatedAt, locale);

  const gridPages = [
    {
      href: `/${locale}/flight-info`,
      label: nav["flightInfo"],
      desc: home["flightInfoDesc"],
      Icon: PlaneTakeoff,
    },
    {
      href: `/${locale}/faqs`,
      label: nav["faqs"],
      desc: home["faqsDesc"],
      Icon: HelpCircle,
    },
  ];

  return (
    <div className="container-page pb-8 md:pt-3 md:pb-11 max-w-3xl mx-auto">
      {/* As-of timestamp */}
      <div className="sticky top-12 md:top-14 z-10 pt-4 mb-4">
        <div className="absolute inset-x-0 top-0 h-12 md:h-14 bg-gradient-to-t from-transparent to-page pointer-events-none" />
        <div className="relative flex items-center gap-2 text-gray-500 text-xs border border-gray-200 px-3 py-1.5 rounded-xl bg-white/80 backdrop-blur-sm shadow-md shadow-gray-200/50">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse [animation-duration:1s]" />
          <p className="flex flex-wrap gap-x-1">
            <span>{home["asOf"]}:</span>
            <span className="whitespace-nowrap">{asOf}</span>
          </p>
        </div>
      </div>

      {/* Latest official update */}
      <Reveal className="mb-4">
        {latestUpdate ? (
          <CardLink
            href={`/${locale}/official-updates`}
            className="block border-l-4 border-l-amber-600"
          >
            <p className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">
              <Megaphone className="w-4 h-4" strokeWidth={2} />
              {home["officialUpdateBadge"]}
            </p>
            <h2 className="font-bold text-lg mb-2">{latestUpdate.title}</h2>
            <div className="relative max-h-[83px] overflow-hidden mb-2">
              <MarkdownContent
                content={latestUpdate.description}
                className="text-sm text-gray-600"
              />
              <div className="h-2" />
              <div className="absolute inset-x-0 bottom-0 h-4 bg-gradient-to-t from-white to-transparent pointer-events-none" />
            </div>
            <div className="flex items-center justify-between text-xs mt-3">
              <span className="text-gray-400">
                {formatTimestamp(latestUpdate.date, locale)}
              </span>
              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                {home["viewAll"]}
                <ChevronRight
                  className="w-3.5 h-4 pt-[0.06rem] transition-transform group-hover:translate-x-1"
                  strokeWidth={2}
                />
              </span>
            </div>
          </CardLink>
        ) : (
          <button
            type="button"
            className="w-full flex items-center gap-2 bg-gray-50 border border-dashed border-gray-200 rounded-2xl px-6 py-4 text-gray-400 text-left hover:bg-gray-100 active:bg-gray-100 transition-colors"
            onClick={() => invalidateContent()}
          >
            <Megaphone className="w-4 h-4 flex-shrink-0" strokeWidth={2} />
            <p className="text-sm">{home["noOfficialUpdate"]}</p>
          </button>
        )}
      </Reveal>

      {/* Support hotlines */}
      <Reveal delay={50} className="relative mb-4">
        <div className="relative z-[2] bg-gray-100 border border-gray-200 rounded-2xl p-6">
          <p className="flex items-center gap-1.5 text-gray-700 text-xs font-semibold uppercase tracking-wide mb-4">
            <Phone className="w-4 h-4" strokeWidth={2} />
            {home["supportTitle"]}
          </p>
          <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-5">
            {Object.entries(data.common.contacts).map(([key, value]) => {
              const isEmail = value.includes("@");
              const href = isEmail
                ? `mailto:${value}`
                : `tel:${value.replace(/[^+\d]/g, "")}`;
              return (
                <div key={key}>
                  <p className="text-xs text-gray-400 mb-1 uppercase tracking-wide">
                    {support[key]}
                  </p>
                  <a
                    href={href}
                    className="text-sm font-semibold text-gray-900 hover:text-amber-700 active:text-amber-700 transition-colors"
                  >
                    {value}
                  </a>
                </div>
              );
            })}
          </div>
        </div>
        {home["mediaNotice"] && (
          <div className="relative z-[1] -mt-3.5 rounded-b-2xl bg-gray-200 px-6 pt-5 pb-2.5 flex gap-2.5 items-center">
            <Info
              className="w-4 h-4 text-gray-600 flex-shrink-0 mt-0.5"
              strokeWidth={2}
            />
            <p className="text-xs text-gray-600 leading-relaxed mt-[4px]">
              {home["mediaNotice"]}
            </p>
          </div>
        )}
      </Reveal>

      {/* Grid: flight info / faqs */}
      <div className="grid grid-cols-1 min-[800px]:grid-cols-2 gap-4 mb-4">
        {gridPages.map((page, index) => (
          <Reveal key={page.href} delay={100 + index * 50}>
            <CardLink
              href={page.href}
              className="flex items-center justify-between gap-4"
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
                className="w-5 h-5 text-gray-300 flex-shrink-0 transition-all group-hover:text-gray-400 group-hover:translate-x-1"
                strokeWidth={2}
              />
            </CardLink>
          </Reveal>
        ))}
      </div>

      {/* Press releases */}
      <Reveal delay={200}>
        <CardLink
          href={`/${locale}/press-releases`}
          className="flex items-center justify-between gap-4"
        >
          <div className="flex items-center gap-4">
            <FileText
              className="w-6 h-6 text-gray-400 flex-shrink-0"
              strokeWidth={2}
            />
            <div>
              <h2 className="font-bold text-lg">{nav["pressReleases"]}</h2>
              <p className="text-sm text-gray-500">
                {home["pressReleasesDesc"]}
              </p>
            </div>
          </div>
          <ChevronRight
            className="w-5 h-5 text-gray-300 flex-shrink-0 transition-all group-hover:text-gray-400 group-hover:translate-x-1"
            strokeWidth={2}
          />
        </CardLink>
      </Reveal>
    </div>
  );
}
