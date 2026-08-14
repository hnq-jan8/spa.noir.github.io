"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import ArticleDetail from "@/components/ui/ArticleDetail";
import ArticleNotFound from "@/components/ui/ArticleNotFound";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import { useArticleRoute } from "@/hooks/useArticleRoute";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { useMatchMainHeight } from "@/hooks/useMatchMainHeight";
import { bundledLabels } from "@/i18n/labels";

export default function PressReleasesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();
  const { key, open, close } = useArticleRoute();
  const wrapperRef = useMatchMainHeight<HTMLDivElement>();

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
        ref={wrapperRef}
        // Below md there's no white card (see press-article-card), so the
        // wrapper itself carries the white background — otherwise the page's
        // off-white bg-page would show through where a card used to be. The
        // mobile breadcrumb (see Navbar) sits sticky right above this, with
        // its own padding that would otherwise show that same gray as a
        // stray strip. Rather than painting that strip from the breadcrumb
        // side — which either leaves the strip gray (nothing to reveal at
        // rest) or, if opaque, hard-clips this wrapper's own content as it
        // scrolls up behind the pinned breadcrumb — this wrapper's own white
        // background is pulled up to reach it directly: negative margin
        // shifts the box up, equal padding keeps the actual content (title,
        // meta) sitting exactly where it was. It renders behind the
        // breadcrumb (z-0 vs its z-10), so the pill stays on top, and once
        // scrolled, only the pill itself — small and already translucent —
        // ever crosses over this content, not a full-width opaque bar.
        // Both variants share the same `md:max-w-6xl` reading width — a
        // titled article's ~68ch text column would strand in a sea of white
        // at the full 7xl container, and a mismatched width between the two
        // reads as an inconsistency when switching between articles.
        // min-height is set imperatively by useMatchMainHeight to exactly
        // reach `main`'s own bottom on a short article — see that hook for
        // why a CSS-only min-height doesn't work here.
        className={`relative z-0 container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 ${
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
