import { getTranslations, setRequestLocale } from "next-intl/server";

export async function generateMetadata({ params }: { params: { locale: string } }) {
  const t = await getTranslations({ locale: params.locale, namespace: "nav" });
  return { title: t("officialUpdates") };
}
import TimelineCarousel from "@/components/TimelineCarousel";
import { timelineItems } from "@/lib/siteData";

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
