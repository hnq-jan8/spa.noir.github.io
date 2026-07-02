"use client";

import TimelineCarousel from "@/components/ui/TimelineCarousel";
import { useContentData } from "@/hooks/useContentData";

export default function OfficialUpdatesContent() {
  const data = useContentData();

  if (!data) return null;

  return (
    <div className="container-page pt-4 pb-8 md:pb-8 md:pt-14">
      <div className="mx-1 sm:mx-1.5 lg:mx-2">
        <TimelineCarousel items={data.officialUpdates.updates} />
      </div>
    </div>
  );
}
