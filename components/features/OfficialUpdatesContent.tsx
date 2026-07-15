"use client";

import EmptyState from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import TimelineCarousel from "@/components/ui/TimelineCarousel";
import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";

export default function OfficialUpdatesContent() {
  const locale = useLocale();
  const data = useContentData();

  if (!data) return null;

  const updates = data.officialUpdates.updates;
  const labels = data.officialUpdates.labels["officialUpdates"];

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
            locale={locale}
          />
        </Reveal>
      )}
    </div>
  );
}
