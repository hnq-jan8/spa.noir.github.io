#!/usr/bin/env node
/**
 * Fetches fresh content from Directus and writes content.json + status.json
 * into the `out/` directory. Runs without a Next.js build step.
 *
 * Usage: node scripts/fetch-json.mjs
 * Env:   DIRECTUS_URL, DIRECTUS_STATIC_TOKEN, NEXT_PUBLIC_SITE_URL
 */
import { writeFileSync, readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { assembleContentPayload } from "./content-payload.mjs";
import { downloadCmsAssets, resolveBasePath } from "./cms-assets.mjs";
import { collectAssetIds } from "./asset-url.mjs";
import {
  LANGUAGES_QUERY,
  UI_LABELS_QUERY,
  OFFICIAL_UPDATES_QUERY,
  FLIGHTS_QUERY,
  FAQS_QUERY,
  PRESS_RELEASES_QUERY,
  SITE_CONFIG_QUERY,
  SITE_METADATA_QUERY,
  APP_SETTING_QUERY,
} from "./directus-queries.mjs";
import { directusFetch, directusGet } from "./directus-fetch.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Process Node riêng, Next.js không nạp .env giúp — xem scripts/generate-i18n.mjs.
try {
  process.loadEnvFile(resolve(root, ".env.local"));
} catch {}

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

// ─── Directus helpers ────────────────────────────────────────────────────────

const get = (path) => directusGet(BASE, path, { token: TOKEN });

async function getActive() {
  const nonce = Date.now().toString();
  const res = await directusFetch(`${BASE}${APP_SETTING_QUERY}&_=${nonce}`, {
    token: TOKEN,
    // Không để nonce lọt vào thông báo lỗi, mỗi lần chạy lại ra một chuỗi khác.
    label: "app_setting",
  });
  return Boolean((await res.json()).data.active);
}

// ─── Fetch all data in parallel ──────────────────────────────────────────────

const [
  rawUpdates,
  flights,
  faqs,
  releases,
  config,
  metadata,
  active,
  languageRows,
  labelRows,
] = await Promise.all([
  get(OFFICIAL_UPDATES_QUERY),
  get(FLIGHTS_QUERY),
  get(FAQS_QUERY),
  get(PRESS_RELEASES_QUERY),
  get(SITE_CONFIG_QUERY),
  get(SITE_METADATA_QUERY),
  getActive(),
  get(LANGUAGES_QUERY),
  get(UI_LABELS_QUERY),
]);

// ─── Build content.json payload (dùng chung scripts/content-payload.mjs) ──────

// ─── Bake ảnh bài về out/cms-assets/ (incremental) ───────────────────────────

// Content-only local: tải ảnh bài (preview_image + inline) về out/cms-assets/
// rồi trỏ content.json sang /cms-assets/ — khớp với CMS endpoint (prod) và full
// build. Logo/favicon đã có trong out/ từ full build trước; downloadCmsAssets
// merge vào manifest sẵn có.
const outDir = resolve(root, "out");
const assetManifest = await downloadCmsAssets({
  base: BASE,
  token: TOKEN,
  ids: collectAssetIds({
    officialUpdates: rawUpdates,
    pressReleases: releases,
    siteConfig: config,
  }),
  destDir: outDir,
});

const contentPayload = assembleContentPayload({
  generatedAt: new Date().toISOString(),
  officialUpdates: rawUpdates,
  flights,
  faqs,
  pressReleases: releases,
  siteConfig: config,
  siteMetadata: metadata,
  languages: languageRows,
  labelRows,
  directusUrl: BASE,
  assetManifest,
  assetBasePath: resolveBasePath(),
});

// ─── Write output ─────────────────────────────────────────────────────────────

// buildId chỉ đổi khi có full rebuild — deploy content-only phải giữ nguyên
// giá trị trong out/status.json, không tự sinh mới. Xem lib/buildMode.ts.
let buildId = "dev";
try {
  buildId = JSON.parse(readFileSync(resolve(outDir, "status.json"), "utf-8")).buildId ?? "dev";
} catch {}

writeFileSync(resolve(outDir, "content.json"), JSON.stringify(contentPayload));
writeFileSync(
  resolve(outDir, "status.json"),
  JSON.stringify({ active, since: contentPayload.generatedAt, buildId }),
);

console.log(`✓ content.json  (generatedAt: ${contentPayload.generatedAt})`);
console.log(`✓ status.json   (active: ${active})`);
