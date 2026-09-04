"use client";

import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FlightTable from "@/components/ui/FlightTable";
import MarkdownContent from "@/components/ui/MarkdownContent";
import Reveal from "@/components/ui/Reveal";
import {
  FlightPolicySkeleton,
  FlightTableSkeleton,
} from "@/components/ui/skeletons/FlightInfoSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
import { useContentState } from "@/hooks/useContentData";

export default function FlightInfoContent() {
  const { data, failed } = useContentState();

  if (!data && failed) return <ContentLoadError />;

  const fi = data?.flightInfo.labels["flightInfo"] ?? {};
  const flights = data?.flightInfo.flights ?? [];

  if (data && flights.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  return (
    <div
      className="container-page pt-4 pb-8 md:py-8 md:max-w-6xl md:mx-auto"
      {...loadingProps(!data)}
    >
      <div className="md:bg-white md:rounded-2xl md:p-6 md:card-shadow">
        {/* Placeholder nằm chung <Reveal> với bảng thật: đổi ruột giữa chừng,
            hiệu ứng vào trang không chạy lại (xem Reveal.tsx). */}
        <Reveal>
          {data ? (
            <FlightTable
              title={fi["title"]}
              rows={flights}
              headers={{
                no: fi["no"],
                date: fi["date"],
                flightNo: fi["flightNo"],
                route: fi["route"],
                srtd: fi["srtd"],
                atd: fi["atd"],
                note: fi["note"],
              }}
            />
          ) : (
            <FlightTableSkeleton />
          )}
        </Reveal>
        <Reveal delay={50} className="mt-10">
          {data ? (
            <>
              <h2 className="section-title">{fi["policy"]}</h2>
              <MarkdownContent
                content={data.flightInfo.flightPolicy}
                className="text-sm text-gray-700 max-w-3xl"
              />
            </>
          ) : (
            <FlightPolicySkeleton />
          )}
        </Reveal>
      </div>
    </div>
  );
}
