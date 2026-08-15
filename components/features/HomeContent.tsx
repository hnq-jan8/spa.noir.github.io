"use client";

import Link from "next/link";
import {
  Megaphone,
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
import { excerptOf, titleOf } from "@/components/ui/ArticleCard";
import Reveal from "@/components/ui/Reveal";
import { CardLink } from "@/components/ui/Card";

export default function HomeContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : null;

  const nav = data.common.labels["nav"];
  const home = data.home.labels["home"];
  const support = data.common.labels["support"];
  // Same record the Official Updates timeline shows at the top, so the home
  // card and the list can't drift apart in wording or truncation.
  const latestUpdate = data.officialUpdates.updates[0] ?? null;
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

  const browseItems = [
    ...gridPages,
    {
      href: `/${locale}/press-releases`,
      label: nav["pressReleases"],
      desc: home["pressReleasesDesc"],
      Icon: FileText,
    },
  ];

  return (
    <div className="container-page pb-8 md:pt-3 md:pb-11 max-w-3xl mx-auto">
      {/* As-of timestamp */}
      <div className="sticky top-12 md:top-14 z-10 pt-4 mb-4">
        <div className="absolute inset-x-0 top-0 h-12 md:h-14 bg-gradient-to-t from-transparent to-page pointer-events-none" />
        <div className="relative flex items-center gap-2 text-gray-500 text-xs border border-gray-200 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md">
          <span className="w-1.5 h-1.5 rounded-full bg-red-500 flex-shrink-0 animate-pulse-glow" />
          <p className="flex flex-wrap items-center min-h-[24px] gap-x-1">
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
            // Warm tint on the surface itself, not just the left rule — this
            // is the one card on the page that must win the first glance, and
            // against five other white cards a 4px edge wasn't carrying it.
            className="block border-l-4 border-l-amber-600 !bg-[#fffdf6] hover:!bg-gray-100 active:!bg-gray-100 pb-4"
          >
            <p className="flex items-center gap-1.5 text-amber-700 text-xs font-semibold uppercase tracking-wide mb-2">
              <Megaphone className="w-4 h-4" strokeWidth={2} />
              {home["officialUpdateBadge"]}
            </p>
            <h2 className="font-bold text-lg mb-2 text-balance">
              {titleOf(latestUpdate)}
            </h2>
            {/* The CMS preview excerpt, shown whole. It is already written
                short by the editor, so clipping it behind a fade only hid the
                end of a sentence that was sized to fit in the first place. */}
            <p className="text-sm text-gray-600 mb-2">
              {excerptOf(latestUpdate)}
            </p>
            <div className="flex items-center justify-between text-xs mt-5">
              <span className="text-gray-400">
                {latestUpdate.date &&
                  formatTimestamp(latestUpdate.date, locale)}
              </span>
              <span className="text-amber-700 font-semibold inline-flex items-center gap-1">
                {home["viewAll"]}
                <ChevronRight
                  className="w-3.5 h-4 pt-[0.06rem] transition-transform group-hover:translate-x-1 group-active:translate-x-1"
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

      {/* Support hotlines. The eyebrow shares the card's Reveal delay so the
          label and the block it introduces fade in as one unit, instead of
          the heading arriving first and reading as a separate element. */}
      <Reveal delay={50}>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 mt-6 pl-1.5">
          {home["supportSection"]}
        </p>
      </Reveal>
      <Reveal delay={50} className="relative mb-4">
        <div className="relative z-[2] bg-surface border border-gray-200 rounded-2xl p-6">
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

      {/* Browse: flight info / FAQs / press releases. The eyebrow groups
          these as one "look something up" set, separating them from the
          urgent update and the hotlines above. */}
      <Reveal delay={100}>
        <p className="text-xs text-gray-400 uppercase tracking-wide mb-2 mt-6 pl-1.5">
          {home["browseSection"]}
        </p>
      </Reveal>

      {/* Below 800px: one grouped surface with hairline-divided rows, iOS
          Settings-style, instead of three separate cards with gaps between
          them. */}
      <Reveal delay={100} className="min-[800px]:hidden mb-4">
        <div className="bg-white border border-gray-100 rounded-2xl divide-y divide-gray-100 overflow-hidden">
          {browseItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="group flex items-center gap-4 px-4 py-3.5 sm:px-6 hover:bg-gray-100 active:bg-gray-100 transition-colors"
            >
              <item.Icon
                className="w-5 h-5 text-gray-400 flex-shrink-0 mr-1 sm:mr-2"
                strokeWidth={2}
              />
              <div className="flex-1 min-w-0">
                <h2 className="font-semibold text-base">{item.label}</h2>
                <p className="text-sm text-gray-500">{item.desc}</p>
              </div>
              <ChevronRight
                className="w-5 h-5 text-gray-300 flex-shrink-0 transition-transform group-hover:translate-x-1 group-active:translate-x-1"
                strokeWidth={2}
              />
            </Link>
          ))}
        </div>
      </Reveal>

      {/* 800px+: flight info / FAQs as a 2-col grid, press releases as its
          own full-width card below — unchanged from before the mobile
          grouped list existed. */}
      <div className="hidden min-[800px]:block">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {gridPages.map((page, index) => (
            <Reveal key={page.href} delay={100 + index * 50}>
              <CardLink
                href={page.href}
                className="flex items-center justify-between gap-4"
              >
                <div className="flex flex-col items-start gap-0">
                  <page.Icon
                    className="w-6 h-6 text-gray-400 flex-shrink-0 mb-3"
                    strokeWidth={2}
                  />
                  <div>
                    <h2 className="font-semibold text-lg mb-1">
                      {page.label}
                    </h2>
                    <p className="text-sm text-gray-500">{page.desc}</p>
                  </div>
                </div>
                <ChevronRight
                  className="w-5 h-5 text-gray-300 flex-shrink-0 transition-all group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                  strokeWidth={2}
                />
              </CardLink>
            </Reveal>
          ))}
        </div>

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
                <h2 className="font-semibold text-lg">{nav["pressReleases"]}</h2>
                <p className="text-sm text-gray-500">
                  {home["pressReleasesDesc"]}
                </p>
              </div>
            </div>
            <ChevronRight
              className="w-5 h-5 text-gray-300 flex-shrink-0 transition-all group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
              strokeWidth={2}
            />
          </CardLink>
        </Reveal>
      </div>
    </div>
  );
}
