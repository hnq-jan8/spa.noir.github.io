"use client";

import EmptyState from "@/components/ui/EmptyState";
import TimelineCarousel from "@/components/ui/TimelineCarousel";
import { useContentData } from "@/hooks/useContentData";

export default function OfficialUpdatesContent() {
  const data = useContentData();

  if (!data) return null;

  const updates = data.officialUpdates.updates;
  const es = data.common.labels["emptyState"];

  return (
    <div className="container-page pt-4 pb-8 md:pb-8 md:pt-14">
      {updates.length === 0 ? (
        <EmptyState title={es["title"]} description={es["description"]} />
      ) : (
        <div className="mx-1 sm:mx-1.5 lg:mx-2">
          <TimelineCarousel items={updates} />
        </div>
      )}
    </div>
  );
}
