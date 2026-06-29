import { getTranslations, setRequestLocale } from "next-intl/server";
import TimelineCarousel from "@/components/TimelineCarousel";
import { getOfficialUpdates, t as tr } from "@/lib/directus";
import { getBuildMode } from "@/lib/buildMode";

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

  const { active } = await getBuildMode();
  if (!active) return null;

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
    <div className="container-page pt-4 pb-8 md:pb-8 md:pt-14">
      <div className="mx-1 sm:mx-1.5 lg:mx-2">
        <TimelineCarousel items={items} />
      </div>
    </div>
  );
}
