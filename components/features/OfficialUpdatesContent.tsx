"use client";

import ArticleDetail from "@/components/ui/ArticleDetail";
import ArticleNotFound from "@/components/ui/ArticleNotFound";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import TimelineCarousel from "@/components/ui/TimelineCarousel";
import OfficialUpdatesSkeleton from "@/components/ui/skeletons/OfficialUpdatesSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
import { useArticleRoute } from "@/hooks/useArticleRoute";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";

export default function OfficialUpdatesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();
  const { key, open, close } = useArticleRoute();

  if (!data && failed) return <ContentLoadError />;

  const updates = data?.officialUpdates.updates ?? [];
  const labels = data?.officialUpdates.labels["officialUpdates"] ?? {};

  if (data && updates.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:pb-8 md:pt-8">
        <EmptyState data={data} />
      </div>
    );
  }

  const opened = key && data ? updates.find((u) => u.key === key) : undefined;

  // Direct hit on an article link: khung bài viết dựng ngay, `article` để
  // null cho tới khi content.json về — placeholder và bài thật dùng chung
  // <Reveal> bên trong ArticleDetail nên hiệu ứng chỉ chạy một lần.
  if (key && (!data || opened)) {
    // Reading time doesn't apply here the way it does for press releases —
    // an official update is a short status line, not an article meant to be
    // read start to finish, so the estimate would just be noise.
    const { readingTime: _readingTime, ...detailLabels } = labels;
    return (
      <div
        // Below md there's no white card (see press-article-card), so the
        // wrapper itself carries the white background — same mechanism as
        // PressReleasesContent (see that file for the full rationale) —
        // and `flex flex-col flex-1` claims `main`'s leftover space so a
        // short update's white still reaches the footer, with no bottom
        // padding — ArticleDetail's own back bar owns that edge.
        className="relative z-0 flex flex-col flex-1 md:block md:flex-none container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 pb-0"
      >
        <ArticleDetail
          article={opened ?? null}
          locale={locale}
          labels={detailLabels}
          onBack={close}
        />
      </div>
    );
  }

  if (key && data) {
    const t =
      data.common.labels["notFound"] ?? bundledLabels(locale, "notFound");
    return (
      <div className="container-page pt-4 pb-8 md:pt-12 md:pb-8 max-w-3xl mx-auto">
        <ArticleNotFound
          title={t?.["title"]}
          description={t?.["description"]}
          backLabel={labels["back"]}
          onBack={close}
        />
      </div>
    );
  }

  return (
    <div
      className="container-page pt-4 pb-8 md:pt-12 md:pb-8 max-w-3xl mx-auto lg:pl-4"
      {...loadingProps(!data)}
    >
      <Reveal>
        {data ? (
          <TimelineCarousel
            items={updates}
            viewDetailsLabel={labels["viewDetails"]}
            latestLabel={labels["latest"]}
            locale={locale}
            onOpen={open}
          />
        ) : (
          <OfficialUpdatesSkeleton />
        )}
      </Reveal>
    </div>
  );
}
