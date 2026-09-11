#!/usr/bin/env node
/**
 * Prebuild step (chạy trước `next build`): tải logo + favicon CMS về
 * public/cms-assets/ để static export copy theo public/ → out/.
 * Xem scripts/cms-assets.mjs.
 *
 * Usage: node scripts/fetch-cms-assets.mjs
 * Env:   DIRECTUS_URL, DIRECTUS_STATIC_TOKEN, NEXT_PUBLIC_SITE_URL
 */
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { downloadCmsAssets } from "./cms-assets.mjs";
import { directusGet } from "./directus-fetch.mjs";
import { SITE_ASSETS_QUERY } from "./directus-queries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Process Node riêng, Next.js không nạp .env giúp — xem scripts/generate-i18n.mjs.
try {
  process.loadEnvFile(resolve(root, ".env.local"));
} catch {}

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

// CMS hỏng KHÔNG được làm chết bước này: logo/favicon là trang trí, thiếu thì
// buildMode rơi về URL Directus rồi Navbar/Footer rơi tiếp về public/logo.svg.
// Hỏng cả deploy vì cái logo là lỗ vốn — nội dung và i18n mới đáng, và hai bước
// đó đã có lưới riêng.
const publicDir = resolve(root, "public");

let manifest = {};
try {
  const assets = await directusGet(BASE, SITE_ASSETS_QUERY, {
    token: TOKEN,
  });
  manifest = await downloadCmsAssets({
    base: BASE,
    token: TOKEN,
    ids: [assets.logo_on_black, assets.logo_on_white, assets.favicon],
    destDir: publicDir,
  });
} catch (err) {
  // `ids` rỗng = chỉ đọc lại manifest.json trên đĩa, không gọi mạng nữa. Trên
  // agent self-hosted, public/cms-assets/ sống qua các lượt chạy (nằm trong
  // .gitignore, ngoài bước Clean) nên ảnh lượt trước vẫn dùng lại nguyên vẹn.
  manifest = await downloadCmsAssets({
    base: BASE,
    token: TOKEN,
    ids: [],
    destDir: publicDir,
  });
  console.warn(
    `⚠ cms-assets fetch failed (${err instanceof Error ? err.message : err}) — ${
      Object.keys(manifest).length > 0
        ? "dùng lại ảnh đã tải ở lượt build trước"
        : "không có ảnh cũ để dùng, site rơi về fallback trong public/"
    }.`,
  );
}

console.log(
  Object.keys(manifest).length > 0
    ? `✓ cms-assets  (${Object.values(manifest).join(", ")})`
    : "✓ cms-assets  (not found, use fallbacks in public/)",
);
