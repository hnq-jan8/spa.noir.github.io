/**
 * Tải ảnh CMS (logo_on_black / logo_on_white) về đĩa lúc build, để site tĩnh
 * không phụ thuộc Directus còn sống sau khi deploy — ảnh trước đây ref bằng
 * URL tuyệt đối vào Directus, server tắt là ảnh vỡ.
 *
 * Dùng chung bởi scripts/fetch-cms-assets.mjs (prebuild → public/) và
 * scripts/fetch-json.mjs (content-only → out/).
 */
import { writeFileSync, mkdirSync, readFileSync } from "fs";
import { resolve } from "path";
import { directusFetch } from "./directus-fetch.mjs";

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
      const res = await directusFetch(`${base}/assets/${id}`, {
        token,
        label: `asset ${id}`,
      });
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
 * Bản chụp site_metadata của lượt prebuild gần nhất, để `next build` còn cái mà
 * dùng khi CMS chết (xem lib/buildMode.ts). Để cạnh manifest.json vì cùng vòng
 * đời: cùng do prebuild ghi, cùng sống qua các lượt chạy, cùng mất nếu ai đó
 * dọn sạch public/cms-assets/.
 */
const METADATA_SNAPSHOT = "site-metadata.json";

export function saveMetadataSnapshot(destDir, metadata) {
  const dir = resolve(destDir, "cms-assets");
  mkdirSync(dir, { recursive: true });
  writeFileSync(resolve(dir, METADATA_SNAPSHOT), JSON.stringify(metadata));
}

/** @returns {any|null} null nếu chưa có bản chụp nào. */
export function readMetadataSnapshot(destDir) {
  try {
    return JSON.parse(
      readFileSync(resolve(destDir, "cms-assets", METADATA_SNAPSHOT), "utf-8"),
    );
  } catch {
    return null;
  }
}

/**
 * Suy ra basePath giống hệt logic trong next.config.mjs, để đường dẫn
 * /cms-assets/... khớp với site deploy dưới subpath (GitHub Pages project page).
 */
export function resolveBasePath() {
  const siteUrl = (
    process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
  ).replace(/\/$/, "");
  return new URL(siteUrl).pathname.replace(/\/$/, "");
}
