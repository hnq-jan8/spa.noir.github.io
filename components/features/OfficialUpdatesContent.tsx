"use client";

import ArticleDetail from "@/components/ui/ArticleDetail";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import TimelineCarousel from "@/components/ui/TimelineCarousel";
import { useArticleRoute } from "@/hooks/useArticleRoute";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { useMatchMainHeight } from "@/hooks/useMatchMainHeight";

export default function OfficialUpdatesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();
  const { key, open, close } = useArticleRoute();
  const wrapperRef = useMatchMainHeight<HTMLDivElement>();

  if (!data) return failed ? <ContentLoadError /> : null;

  const updates = data.officialUpdates.updates;
  const labels = data.officialUpdates.labels["officialUpdates"];

  if (updates.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:pb-8 md:pt-8">
        <EmptyState data={data} />
      </div>
    );
  }

  const opened = key ? updates.find((u) => u.key === key) : undefined;

  if (opened) {
    // Reading time doesn't apply here the way it does for press releases —
    // an official update is a short status line, not an article meant to be
    // read start to finish, so the estimate would just be noise.
    const { readingTime: _readingTime, ...detailLabels } = labels;
    // Below md there's no white card (see press-article-card), so the
    // wrapper itself carries the white background — same mechanism as
    // PressReleasesContent, otherwise the page's off-white bg-page would
    // show through where a card used to be, and the mobile breadcrumb sits
    // sticky right above this, so the wrapper's white is pulled up to reach
    // it directly rather than leaving a gray strip.
    const isFullBleed = !opened.title || opened.title.trim().length === 0;
    return (
      <div
        ref={wrapperRef}
        // Below md there's no white card (see press-article-card), so the
        // wrapper itself carries the white background — otherwise the
        // page's off-white bg-page would show through where a card used to
        // be. min-height is set imperatively by useMatchMainHeight to
        // exactly reach `main`'s own bottom on a short update — see that
        // hook for why a CSS-only min-height doesn't work here.
        className={`relative z-0 container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 ${
          isFullBleed ? "pb-0" : "pb-8"
        }`}
      >
        <ArticleDetail
          article={opened}
          locale={locale}
          labels={detailLabels}
          onBack={close}
        />
      </div>
    );
  }

  return (
    <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
      <Reveal>
        <TimelineCarousel
          items={updates}
          viewDetailsLabel={labels["viewDetails"]}
          latestLabel={labels["latest"]}
          locale={locale}
          onOpen={open}
        />
      </Reveal>
    </div>
  );
}
