import { getTranslations, setRequestLocale } from "next-intl/server";
import TimelineCarousel from "@/components/TimelineCarousel";
import { getOfficialUpdates, t as tr } from "@/lib/directus";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("officialUpdates") };
}

export default async function OfficialUpdates({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const updates = await getOfficialUpdates();
  const items = updates.map((u) => {
    const translation = tr(u, locale);
    return {
      title: translation.title,
      description: translation.description,
      date: u.date,
    };
  });

  return (
    <div className="container-page pt-12 pb-8 md:py-8">
      <div className="mx-1 sm:mx-1.5 lg:mx-2">
        <TimelineCarousel items={items} />
      </div>
    </div>
  );
}
