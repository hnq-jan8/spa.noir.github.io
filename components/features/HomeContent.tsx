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
import {
  AsOfPillSkeleton,
  BrowseCardSkeleton,
  BrowseRowSkeleton,
  BrowseWideCardSkeleton,
  HotlinesSkeleton,
  LatestUpdateSkeleton,
  SectionLabelSkeleton,
} from "@/components/ui/skeletons/HomeSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
import Reveal from "@/components/ui/Reveal";
import { CardLink } from "@/components/ui/Card";

export default function HomeContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();

  if (!data && failed) return <ContentLoadError />;

  // `?? {}`: assembleContentPayload drops a namespace with no ui_labels rows.
  // Cũng là cái đỡ cho lúc chưa có data — mỗi khối tự chọn placeholder của
  // mình bên dưới, không nhánh nào đọc phải nhãn rỗng.
  const nav = data?.common.labels["nav"] ?? {};
  const home = data?.home.labels["home"] ?? {};
  const support = data?.common.labels["support"] ?? {};
  // Same record the timeline shows at the top, so the two can't drift apart.
  const latestUpdate = data?.officialUpdates.updates[0] ?? null;
  const asOf = data ? formatTimestamp(data.generatedAt, locale) : "";

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

  // Placeholder đứng đúng số chỗ của bản thật, và `key` phải giữ nguyên qua
  // lần bàn giao (dùng chỉ số, không dùng href): đổi key là React tháo thẻ
  // <Reveal> cũ dựng thẻ mới, hiệu ứng chạy lại từ đầu — đúng thứ cần tránh.
  const contacts = data
    ? Object.entries(data.common.contacts).filter(([, value]) => value)
    : [];

  return (
    <div
      className="container-page pb-8 md:pt-3 md:pb-11 max-w-3xl mx-auto"
      {...loadingProps(!data)}
    >
      {/* As-of timestamp. Extra bottom margin at md+ — with no outline on
          either element, the pill sits too close to the card below it. */}
      <div className="sticky top-12 md:top-14 z-10 pt-4 mb-4 md:mb-6">
        <div className="absolute inset-x-0 top-0 h-12 md:h-14 bg-gradient-to-t from-transparent to-page pointer-events-none" />
        {data ? (
          <div className="relative flex items-center gap-2 text-gray-500 text-xs border border-gray-200 px-3 py-1 rounded-full bg-white/60 backdrop-blur-md">
            {/* `aspect-square`, not `h-1.5` — with both width and height set
                independently, fractional browser zoom can round them to
                different physical pixel counts even though they're the same
                declared value (width settles via flex distribution, height
                via cross-axis sizing — two separate computations). Deriving
                height from the already-rounded width in the same layout pass
                guarantees a perfect circle at any zoom level. */}
            <span className="w-1.5 aspect-square rounded-full bg-gray-900 flex-shrink-0 animate-pulse-glow" />
            <p className="flex flex-wrap items-center min-h-[24px] gap-x-1">
              <span>{home["asOf"]}:</span>
              <span className="whitespace-nowrap">{asOf}</span>
            </p>
          </div>
        ) : (
          <AsOfPillSkeleton />
        )}
      </div>

      {/* Latest official update */}
      <Reveal className="mb-4">
        {!data ? (
          <LatestUpdateSkeleton />
        ) : latestUpdate ? (
          <CardLink
            href={`/${locale}/official-updates`}
            // Vạch trái là ngoại lệ cố ý của quy tắc card không viền: nó là
            // điểm nhấn, không phải đường bao, cho thẻ phải thắng cái nhìn đầu
            // tiên. Nền trắng và hover vẫn y hệt mọi card khác.
            className="block border-l-4 border-l-gray-900 pt-5 pb-4"
          >
            <p className="flex items-center gap-1.5 text-gray-500 text-xs font-semibold uppercase tracking-wide mb-3">
              <Megaphone className="w-4 h-4" strokeWidth={2} />
              {home["officialUpdateBadge"]}
            </p>
            <h2 className="font-bold text-lg mb-2 text-balance">
              {titleOf(latestUpdate)}
            </h2>
            {/* Shown whole: the editor already writes this short, so clipping
                it only cut a sentence that was sized to fit. */}
            <p className="text-sm text-gray-600 mb-2">
              {excerptOf(latestUpdate)}
            </p>
            <div className="flex items-center justify-between text-xs mt-5">
              <span className="text-gray-500">
                {latestUpdate.date &&
                  formatTimestamp(latestUpdate.date, locale)}
              </span>
              <span className="text-gray-600 font-semibold inline-flex items-center gap-1">
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
            // Exception to the no-lines card rule: the dashed outline is what
            // reads as an empty slot. Silent on hover despite retrying on tap —
            // an affordance here would promise content that isn't there.
            className="w-full flex items-center gap-2 bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl px-6 py-4 text-gray-400 text-left"
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
        {data ? (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 mt-6 pl-1.5">
            {home["supportSection"]}
          </p>
        ) : (
          <SectionLabelSkeleton width="w-24" />
        )}
      </Reveal>
      <Reveal delay={50} className="relative mb-4">
        {data ? (
          <>
            <div className="relative z-[2] bg-surface rounded-2xl p-6 card-shadow border border-gray-200">
              <div className="grid grid-cols-1 min-[550px]:grid-cols-2 gap-5">
                {contacts.map(([key, value]) => {
                  const isEmail = value.includes("@");
                  const href = isEmail
                    ? `mailto:${value}`
                    : `tel:${value.replace(/[^+\d]/g, "")}`;
                  return (
                    <div key={key}>
                      <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                        {support[key]}
                      </p>
                      <a
                        href={href}
                        className="text-sm font-semibold text-gray-900 hover:text-gray-600 active:text-gray-600"
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
          </>
        ) : (
          <HotlinesSkeleton hasNotice />
        )}
      </Reveal>

      {/* Browse: flight info / FAQs / press releases. The eyebrow groups
          these as one "look something up" set, separating them from the
          urgent update and the hotlines above. */}
      <Reveal delay={100}>
        {data ? (
          <p className="text-xs text-gray-500 uppercase tracking-wide mb-2 mt-6 pl-1.5">
            {home["browseSection"]}
          </p>
        ) : (
          <SectionLabelSkeleton width="w-20" />
        )}
      </Reveal>

      {/* Below 800px: one grouped surface with hairline-divided rows, iOS
          Settings-style, instead of three separate cards with gaps between
          them. */}
      <Reveal delay={100} className="min-[800px]:hidden mb-4">
        <div className="bg-white rounded-2xl divide-y divide-gray-100 overflow-hidden card-shadow">
          {browseItems.map((item, index) =>
            data ? (
              <Link
                key={index}
                href={item.href}
                className="group flex items-center gap-4 px-4 py-3.5 sm:px-6 hover:bg-cardHover active:bg-cardHover"
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
            ) : (
              <BrowseRowSkeleton key={index} twoLineDesc={index === 0} />
            ),
          )}
        </div>
      </Reveal>

      {/* 800px+: flight info / FAQs as a 2-col grid, press releases as its
          own full-width card below — unchanged from before the mobile
          grouped list existed. */}
      <div className="hidden min-[800px]:block">
        <div className="grid grid-cols-2 gap-4 mb-4">
          {gridPages.map((page, index) => (
            <Reveal key={index} delay={100 + index * 50}>
              {data ? (
                <CardLink
                  href={page.href}
                  className="flex items-center justify-between gap-4 pb-4"
                >
                  <div className="flex flex-col items-start gap-0">
                    <page.Icon
                      className="w-6 h-6 text-gray-400 flex-shrink-0 mb-3"
                      strokeWidth={2}
                    />
                    <div>
                      <h2 className="font-semibold text-lg">{page.label}</h2>
                      <p className="text-sm text-gray-500">{page.desc}</p>
                    </div>
                  </div>
                  <ChevronRight
                    className="w-5 h-5 text-gray-300 flex-shrink-0 transition-transform group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                    strokeWidth={2}
                  />
                </CardLink>
              ) : (
                <BrowseCardSkeleton />
              )}
            </Reveal>
          ))}
        </div>

        <Reveal delay={200}>
          {data ? (
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
                  <h2 className="font-semibold text-lg">
                    {nav["pressReleases"]}
                  </h2>
                  <p className="text-sm text-gray-500">
                    {home["pressReleasesDesc"]}
                  </p>
                </div>
              </div>
              <ChevronRight
                className="w-5 h-5 text-gray-300 flex-shrink-0 transition-transform group-hover:text-gray-400 group-hover:translate-x-1 group-active:text-gray-400 group-active:translate-x-1"
                strokeWidth={2}
              />
            </CardLink>
          ) : (
            <BrowseWideCardSkeleton />
          )}
        </Reveal>
      </div>
    </div>
  );
}
