"use client";

import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import TimelineCarousel from "@/components/ui/TimelineCarousel";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";

export default function OfficialUpdatesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : null;

  const updates = data.officialUpdates.updates;
  const labels = data.officialUpdates.labels["officialUpdates"];
  const a11y = data.common.labels["a11y"] ?? {};

  return (
    <div
      className={`container-page pt-4 pb-8 md:pb-8 md:pt-8 ${updates.length === 0 ? "" : "px-3"}`}
    >
      {updates.length === 0 ? (
        <EmptyState data={data} />
      ) : (
        <Reveal className="mx-1 sm:mx-1.5 lg:mx-2 md:mt-6">
          <TimelineCarousel
            items={updates}
            viewDetailsLabel={labels["viewDetails"]}
            collapseLabel={labels["collapse"]}
            a11y={a11y}
            locale={locale}
          />
        </Reveal>
      )}
    </div>
  );
}
