"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import ArticleDetail from "@/components/ui/ArticleDetail";
import ArticleNotFound from "@/components/ui/ArticleNotFound";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import ArticleDetailSkeleton from "@/components/ui/skeletons/ArticleDetailSkeleton";
import PressReleasesSkeleton from "@/components/ui/skeletons/PressReleasesSkeleton";
import { useArticleRoute } from "@/hooks/useArticleRoute";
import { useContentState } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";

function chunk<T>(items: T[], size: number): T[][] {
  const rows: T[][] = [];
  for (let i = 0; i < items.length; i += size) {
    rows.push(items.slice(i, i + size));
  }
  return rows;
}

/**
 * Splits into rows of `size`, but puts the odd-sized (remainder) row FIRST
 * instead of trailing it at the end — the split/wide treatment lands on the
 * row right after the top 3 items, and every row below it is a plain, even,
 * smaller grid. `chunk()` alone would leave the remainder dangling last.
 */
function chunkRemainderFirst<T>(items: T[], size: number): T[][] {
  const remainder = items.length % size;
  if (remainder === 0) return chunk(items, size);
  return [items.slice(0, remainder), ...chunk(items.slice(remainder), size)];
}

export default function PressReleasesContent() {
  const locale = useLocale();
  const { data, failed } = useContentState();
  const { key, open, close } = useArticleRoute();

  // `key` set before the content lands means a direct hit on an article link —
  // skeleton the detail view, not the list it would never show.
  if (!data)
    return failed ? (
      <ContentLoadError />
    ) : key ? (
      <ArticleDetailSkeleton />
    ) : (
      <PressReleasesSkeleton />
    );

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
    return (
      <div
        // Below md there's no card, so this wrapper carries the white itself:
        // pulled up behind the sticky breadcrumb (negative margin + equal
        // padding, z-0 under its z-10) and `flex flex-col flex-1` to claim
        // main's leftover height, so a short article's white still reaches
        // the footer, with no bottom padding — ArticleDetail's own back bar
        // owns that edge (see its mt-auto).
        className="relative z-0 flex flex-col flex-1 md:block md:flex-none container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 md:mt-0 pb-0"
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

  // Releases arrive newest-first (sort=-published_at in the Directus query), so
  // the lead card is simply the most recent one — there's no editor-picked
  // ordering behind it any more.
  const [latest, ...rest] = releases;
  // Positions 2–3 stay the full-width list style; from position 4 on, items
  // are grouped into rows of 3. The remainder row (1 leftover → full width,
  // 2 → 2/1 split) comes first, right after the top 3 — every row after
  // that is a plain, even, smaller grid of 3.
  const listItems = rest.slice(0, 2);
  const gridRows = chunkRemainderFirst(rest.slice(2), 3);

  return (
    <div className="container-page pt-4 pb-8 md:py-8 max-w-3xl mx-auto">
      <Reveal>
        <ArticleCard
          article={latest}
          locale={locale}
          onOpen={() => open(latest.key)}
          readMoreLabel={labels["readMore"]}
          badge={labels["latest"]}
          featured
        />
        {listItems.length > 0 && (
          <div className="mt-4 space-y-3">
            {listItems.map((release) => (
              <ArticleCard
                key={release.key}
                article={release}
                locale={locale}
                onOpen={() => open(release.key)}
              />
            ))}
          </div>
        )}
        {gridRows.map((row) => (
          <div key={row[0].key} className="mt-3">
            {row.length === 1 ? (
              // Lone leftover in this row: full width, same image + title +
              // excerpt treatment as the list items above.
              <ArticleCard
                article={row[0]}
                locale={locale}
                onOpen={() => open(row[0].key)}
              />
            ) : (
              <>
                {/* Below md — the app's own mobile threshold (it's where
                    the navbar switches from the desktop back-button to the
                    mobile breadcrumb, see Navbar.tsx) — a 3-column grid
                    doesn't fit, so every item in the row just stacks as a
                    plain compact card (no excerpt, to save height) instead
                    of splitting into columns. */}
                <div className="space-y-3 md:hidden">
                  {row.map((release) => (
                    <ArticleCard
                      key={release.key}
                      article={release}
                      locale={locale}
                      onOpen={() => open(release.key)}
                      hideExcerpt
                    />
                  ))}
                </div>
                <div className="hidden md:grid grid-cols-3 gap-3">
                  {row.map((release, idx) => {
                    // Two in the row: first takes 2 slots and switches to the
                    // wider list layout (image beside date/title, no
                    // excerpt); second takes 1 slot as the compact
                    // image-overlay tile. Three in the row: even thirds, all
                    // compact tiles.
                    const isWideHalf = row.length === 2 && idx === 0;
                    return (
                      <div
                        key={release.key}
                        className={isWideHalf ? "col-span-2" : "col-span-1"}
                      >
                        <ArticleCard
                          article={release}
                          locale={locale}
                          onOpen={() => open(release.key)}
                          layout={isWideHalf ? "list" : "grid"}
                          hideExcerpt={isWideHalf}
                          compact={isWideHalf}
                        />
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>
        ))}
      </Reveal>
    </div>
  );
}
