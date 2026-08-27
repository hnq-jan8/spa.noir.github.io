"use client";

import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import FlightTable from "@/components/ui/FlightTable";
import MarkdownContent from "@/components/ui/MarkdownContent";
import Reveal from "@/components/ui/Reveal";
import FlightInfoSkeleton from "@/components/ui/skeletons/FlightInfoSkeleton";
import { useContentState } from "@/hooks/useContentData";

export default function FlightInfoContent() {
  const { data, failed } = useContentState();

  if (!data) return failed ? <ContentLoadError /> : <FlightInfoSkeleton />;

  const fi = data.flightInfo.labels["flightInfo"] ?? {};
  const flights = data.flightInfo.flights;

  if (flights.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  return (
    <div className="container-page pt-4 pb-8 md:py-8 md:max-w-6xl md:mx-auto">
      <div className="md:bg-white md:rounded-2xl md:p-6 md:card-shadow">
        <Reveal>
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
        </Reveal>
        <Reveal delay={50} className="mt-10">
          <h2 className="section-title">{fi["policy"]}</h2>
          <MarkdownContent
            content={data.flightInfo.flightPolicy}
            className="text-sm text-gray-700 max-w-3xl"
          />
        </Reveal>
      </div>
    </div>
  );
}
