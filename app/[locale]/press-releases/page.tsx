import { getTranslations, setRequestLocale } from "next-intl/server";
import ArticleContent from "@/components/ArticleContent";
import { getPressReleases, getAssetUrl, t as tr } from "@/lib/directus";
import { getBuildMode } from "@/lib/buildMode";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("pressReleases") };
}

export default async function PressReleases({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { active } = await getBuildMode();
  if (!active) return null;

  const releases = await getPressReleases();
  const latest = releases[0];

  if (!latest) return null;

  const translation = tr(latest, locale);
  const body = translation.body
    ? translation.body.split(/\n\n+/).filter(Boolean)
    : [];
  const imageSrc =
    getAssetUrl(latest.cover_image) ?? `${basePath}/images/airplane.jpg`;

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-8">
        <ArticleContent
          title={translation.title}
          body={body}
          imageSrc={imageSrc}
          imageAlt={translation.image_alt ?? "alt text"}
        />
      </div>
    </div>
  );
}
