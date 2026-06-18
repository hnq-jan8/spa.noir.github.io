import { getTranslations, setRequestLocale } from "next-intl/server";
import ArticleContent from "@/components/ArticleContent";
import { getPressReleases, t as tr } from "@/lib/directus";

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

  const releases = await getPressReleases();
  const latest = releases[0];

  if (!latest) return null;

  const translation = tr(latest, locale);
  const body = translation.body
    ? translation.body.split(/\n\n+/).filter(Boolean)
    : [];

  return (
    <div className="container-page pt-16 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-8">
        <ArticleContent
          title={translation.title}
          body={body}
          imageSrc={`${basePath}/images/airplane.jpg`}
          imageAlt={translation.image_alt ?? "Sun PhuQuoc Airways airplane"}
        />
      </div>
    </div>
  );
}
