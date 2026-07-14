/**
 * Tải các file ảnh CMS (hiện tại: logo_on_black / logo_on_white) về đĩa lúc
 * build, thay vì để trình duyệt gọi thẳng URL Directus sống lúc runtime.
 *
 * Lý do: site export tĩnh (GitHub Pages) nhưng ảnh CMS trước đây được ref
 * bằng URL tuyệt đối trỏ vào Directus server (thường chạy local qua tunnel
 * ngrok) — nếu server đó offline lúc người dùng xem trang thì ảnh vỡ. Tải
 * bytes về ghi vào output dir lúc build giúp static site không phụ thuộc
 * Directus còn sống sau khi deploy.
 *
 * Dùng chung bởi:
 *   - scripts/fetch-cms-assets.mjs (prebuild, ghi vào public/ — deploy-layout)
 *   - scripts/fetch-json.mjs       (content-only refresh, ghi vào out/ — deploy-content)
 */
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";

const EXT_BY_CONTENT_TYPE = {
  "image/svg+xml": "svg",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/gif": "gif",
};

/**
 * @param {{ base: string, token: string, ids: (string|null|undefined)[], destDir: string }} opts
 * @returns {Promise<Record<string, string>>} map assetId -> filename (vd "abc123.svg")
 */
export async function downloadCmsAssets({ base, token, ids, destDir }) {
  const uniqueIds = [...new Set(ids.filter(Boolean))];
  const cmsAssetsDir = resolve(destDir, "cms-assets");

  let manifest = {};
  try {
    manifest = JSON.parse(readFileSync(resolve(cmsAssetsDir, "manifest.json"), "utf-8"));
  } catch {}

  if (uniqueIds.length === 0) return manifest;

  mkdirSync(cmsAssetsDir, { recursive: true });

  await Promise.all(
    uniqueIds.map(async (id) => {
      const res = await fetch(`${base}/assets/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
          "ngrok-skip-browser-warning": "true",
        },
      });
      if (!res.ok) {
        throw new Error(`Directus asset ${id} → ${res.status}`);
      }
      const contentType = res.headers.get("content-type")?.split(";")[0]?.trim();
      const ext = EXT_BY_CONTENT_TYPE[contentType] ?? "bin";
      const filename = `${id}.${ext}`;
      const bytes = Buffer.from(await res.arrayBuffer());
      writeFileSync(resolve(cmsAssetsDir, filename), bytes);
      manifest[id] = filename;
    }),
  );

  writeFileSync(
    resolve(cmsAssetsDir, "manifest.json"),
    JSON.stringify(manifest),
  );

  return manifest;
}

/**
 * Suy ra basePath giống hệt logic trong next.config.mjs, để đường dẫn
 * /cms-assets/... khớp với site deploy dưới subpath (GitHub Pages project page).
 */
export function resolveBasePath() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "https://hnq-jan8.github.io/spa.noir.github.io"
  ).replace(/\/$/, "");
  return new URL(siteUrl).pathname.replace(/\/$/, "");
}
