"use client";

import EmptyState from "@/components/ui/EmptyState";
import FlightTable from "@/components/ui/FlightTable";
import MarkdownContent from "@/components/ui/MarkdownContent";
import { useContentData } from "@/hooks/useContentData";

export default function FlightInfoContent() {
  const data = useContentData();

  if (!data) return null;

  const fi = data.flightInfo.labels["flightInfo"];
  const flights = data.flightInfo.flights;

  if (flights.length === 0) {
    const es = data.common.labels["emptyState"];
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState title={es?.["title"]} description={es?.["description"]} />
      </div>
    );
  }

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-6">
        <FlightTable
          title={fi["title"]}
          rows={flights}
          headers={{
            no: fi["no"],
            type: fi["type"],
            capacity: fi["capacity"],
            flightNo: fi["flightNo"],
            route: fi["route"],
            srtd: fi["srtd"],
            atd: fi["atd"],
            note: fi["note"],
          }}
        />
        <div className="mt-10">
          <h2 className="section-title">{fi["policy"]}</h2>
          <MarkdownContent
            content={data.flightInfo.flightPolicy}
            className="text-sm text-gray-700 max-w-3xl"
          />
        </div>
      </div>
    </div>
  );
}
