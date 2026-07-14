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

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Chạy trước `next build` như 1 process Node riêng, nên không được Next.js tự
// nạp .env.local giúp — tự nạp ở đây (bỏ qua nếu file không tồn tại, vd trên
// CI thì DIRECTUS_URL/DIRECTUS_STATIC_TOKEN đã có sẵn trong env thật). Xem
// scripts/generate-i18n.mjs — cùng pattern.
try {
  process.loadEnvFile(resolve(root, ".env.local"));
} catch {}

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

async function get(path) {
  const res = await fetch(`${BASE}${path}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error(`Directus ${path} → ${res.status}`);
  return (await res.json()).data;
}

const [config, metadata] = await Promise.all([
  get("/items/site_config/1?fields=logo_on_black,logo_on_white"),
  get("/items/site_metadata/1?fields=favicon"),
]);
const manifest = await downloadCmsAssets({
  base: BASE,
  token: TOKEN,
  ids: [config.logo_on_black, config.logo_on_white, metadata.favicon],
  destDir: resolve(root, "public"),
});

console.log(
  Object.keys(manifest).length > 0
    ? `✓ cms-assets  (${Object.values(manifest).join(", ")})`
    : "✓ cms-assets  (không có logo/favicon CMS, dùng fallback local)",
);
