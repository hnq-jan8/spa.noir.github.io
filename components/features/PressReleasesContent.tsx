"use client";

import ArticleCard from "@/components/ui/ArticleCard";
import ArticleDetail from "@/components/ui/ArticleDetail";
import ArticleNotFound from "@/components/ui/ArticleNotFound";
import EmptyState, { ContentLoadError } from "@/components/ui/EmptyState";
import Reveal from "@/components/ui/Reveal";
import PressReleasesSkeleton from "@/components/ui/skeletons/PressReleasesSkeleton";
import { loadingProps } from "@/components/ui/Skeleton";
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
 * Chia hàng `size` nhưng đẩy hàng lẻ lên ĐẦU: hàng chia đôi/rộng rơi ngay sau
 * 3 mục đầu, mọi hàng dưới nó đều đặn. `chunk()` thường để hàng lẻ lủng lẳng
 * ở cuối.
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

  if (!data && failed) return <ContentLoadError />;

  const releases = data?.pressReleases.releases ?? [];
  const labels = data?.pressReleases.labels["pressReleases"] ?? {};

  if (data && releases.length === 0) {
    return (
      <div className="container-page pt-4 pb-8 md:py-8">
        <EmptyState data={data} />
      </div>
    );
  }

  const opened = key && data ? releases.find((r) => r.key === key) : undefined;

  // `key` set before the content lands means a direct hit on an article link:
  // dựng ngay khung bài viết với `article` null, placeholder và bài thật
  // dùng chung <Reveal> bên trong ArticleDetail (xem Reveal.tsx).
  if (key && (!data || opened)) {
    return (
      <div
        // Dưới md không có card nên chính wrapper mang nền trắng: kéo lên sau
        // breadcrumb sticky (margin âm + padding bằng, z-0 dưới z-10 của nó) và
        // `flex flex-col flex-1` để chiếm phần cao còn thừa của main — bài ngắn
        // vẫn phủ trắng tới footer. Không padding đáy: thanh back của
        // ArticleDetail giữ mép đó (xem mt-auto của nó).
        // max-xs:pt-[108px]: breadcrumb ở mobile nhỏ không còn pb-6 đệm phía dưới
        // (xem Breadcrumb.tsx), bù 12px để dòng meta không dính sát dải đó.
        className="relative z-0 flex flex-col flex-1 md:block md:flex-none container-page md:py-8 md:max-w-6xl md:mx-auto bg-white md:bg-transparent -mt-24 pt-24 max-xs:pt-[108px] md:mt-0 pb-0"
      >
        <ArticleDetail
          article={opened ?? null}
          locale={locale}
          labels={labels}
          onBack={close}
        />
      </div>
    );
  }

  if (key && data) {
    const t =
      data.common.labels["notFound"] ?? bundledLabels(locale, "notFound");
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
  // the lead card is simply the most recent one.
  const [latest, ...rest] = releases;
  // Vị trí 2–3 giữ kiểu list full-width; từ vị trí 4 gom thành hàng 3. Hàng lẻ
  // (dư 1 → full width, dư 2 → chia 2/1) đứng ngay sau top 3.
  const listItems = rest.slice(0, 2);
  const gridRows = chunkRemainderFirst(rest.slice(2), 3);

  return (
    <div
      // Mobile nhỏ: cả trang trắng như trang xem bài — cùng mẹo kéo nền lên
      // sau breadcrumb (-mt-24 + pt-24, z-0) và flex-1 phủ tới footer. Card
      // trắng trên nền trắng nên ngăn nhau bằng viền đáy (ArticleCard), không
      // còn khe 1px.
      className="container-page pt-4 max-xs:relative max-xs:z-0 max-xs:flex-1 max-xs:bg-white max-xs:-mt-24 max-xs:pt-24 pb-8 max-xs:pb-0 md:py-8 max-w-3xl mx-auto"
      {...loadingProps(!data)}
    >
      <Reveal>
        {!data ? (
          <PressReleasesSkeleton />
        ) : (
          <>
            <ArticleCard
              article={latest}
              locale={locale}
              onOpen={() => open(latest.key)}
              readMoreLabel={labels["readMore"]}
              badge={labels["latest"]}
              featured
            />
            {listItems.length > 0 && (
              <div className="mt-4 space-y-3 max-xs:mt-0 max-xs:space-y-0">
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
              <div key={row[0].key} className="mt-3 max-xs:mt-0">
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
                    <div className="space-y-3 max-xs:space-y-0 md:hidden">
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
                        // Hàng 2 mục: mục đầu chiếm 2 slot và chuyển sang layout
                        // list rộng, mục sau 1 slot dạng tile. Hàng 3 mục: chia
                        // đều, toàn tile compact.
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
          </>
        )}
      </Reveal>
    </div>
  );
}
