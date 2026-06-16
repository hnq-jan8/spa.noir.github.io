import { setRequestLocale } from "next-intl/server";
import TimelineCarousel from "@/components/TimelineCarousel";

const timelineItems = [
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "09/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "07/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "05/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "03/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "01/06/2026",
  },
];

export default function OfficialUpdates({
  params,
}: {
  params: { locale: string };
}) {
  setRequestLocale(params.locale);
  return (
    <div className="container-page pt-12 pb-8 md:py-8">
      <div className="mx-1 sm:mx-1.5 lg:mx-2">
        <TimelineCarousel items={timelineItems} />
      </div>
    </div>
  );
}
