"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import ArticleDetail from "@/components/ui/ArticleDetail";
import ArticleNotFound from "@/components/ui/ArticleNotFound";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import { useArticleRoute } from "@/hooks/useArticleRoute";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";

export default function PressReleasesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();
  const { key, open, close } = useArticleRoute();

  if (!data) return failed ? <ContentLoadError /> : null;

  const releases = data.pressReleases.releases;
  const labels = data.pressReleases.labels["pressReleases"] ?? {};

  if (releases.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  const opened = key ? releases.find((r) => r.key === key) : undefined;

  if (opened) {
    // A full-bleed article (blank title) reaches the navbar/footer below md,
    // where there is no card box to sit inside — same handling as before the
    // list existed.
    const isFullBleed = !opened.title || opened.title.trim().length === 0;
    return (
      <div
        // Below md there's no white card (see press-article-card), so the
        // wrapper itself carries the white background — otherwise the page's
        // off-white bg-page would show through where a card used to be. The
        // mobile breadcrumb (see Navbar) sits sticky right above this; the
        // wrapper's white is pulled up to reach it directly (negative margin
        // + equal padding), rendered behind it (z-0 vs z-10) so the pill
        // stays on top. `flex-1` claims `main`'s leftover height (main is a
        // flex column — see the locale layout) so a short article's white
        // still reaches the footer instead of leaving the page's gray
        // showing beneath it. Both variants share `md:max-w-6xl` so the
        // reading width doesn't jump when switching between articles.
        className={`relative z-0 flex-1 md:flex-none container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 ${
          isFullBleed ? "pb-0" : "pb-8"
        }`}
      >
        <ArticleDetail
          article={opened}
          locale={locale}
          labels={labels}
          onBack={close}
        />
      </div>
    );
  }

  if (key) {
    const t = data.common.labels["notFound"] ?? bundledLabels(locale, "notFound");
    return (
      <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
        <ArticleNotFound
          title={t?.["title"]}
          description={t?.["description"]}
          backLabel={labels["back"]}
          onBack={close}
        />
      </div>
    );
  }

  const [featured, ...rest] = releases;

  return (
    <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
      <Reveal>
        <ArticleCard
          article={featured}
          locale={locale}
          onOpen={() => open(featured.key)}
          readMoreLabel={labels["readMore"]}
          badge={labels["featured"]}
          featured
        />
        {rest.length > 0 && (
          <div className="mt-4 space-y-3">
            {rest.map((release) => (
              <ArticleCard
                key={release.key}
                article={release}
                locale={locale}
                onOpen={() => open(release.key)}
              />
            ))}
          </div>
        )}
      </Reveal>
    </div>
  );
}
