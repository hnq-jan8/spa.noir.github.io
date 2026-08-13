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

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Process Node riêng, không được Next.js tự nạp .env.local — tự nạp ở đây
// (bỏ qua nếu không có, vd trên CI đã có sẵn trong env thật). Xem
// scripts/generate-i18n.mjs — cùng pattern.
try {
  process.loadEnvFile(resolve(root, ".env.local"));
} catch {}

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

// ─── Directus helpers ────────────────────────────────────────────────────────

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

async function getActive() {
  const nonce = Date.now().toString();
  const res = await fetch(
    `${BASE}/items/app_setting?fields=active&_=${nonce}`,
    {
      headers: {
        Authorization: `Bearer ${TOKEN}`,
        "ngrok-skip-browser-warning": "true",
      },
    },
  );
  if (!res.ok) throw new Error(`Directus app_setting → ${res.status}`);
  return Boolean((await res.json()).data.active);
}

// ─── Fetch all data in parallel ──────────────────────────────────────────────

const [
  rawUpdates,
  flights,
  faqs,
  releases,
  config,
  active,
  languageRows,
  labelRows,
] = await Promise.all([
  get(
    "/items/official_updates?fields=id,date,translations.languages_code,translations.title,translations.description,translations.preview_excerpt,translations.preview_image&sort=-date&filter[status][_eq]=published&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/flights?fields=flight_no,aircraft_type,capacity,dep,arr,srtd,atd,note&sort=sort&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/faqs?fields=translations.languages_code,translations.question,translations.answer&sort=sort&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/press_releases?fields=id,slug,published_at,translations.languages_code,translations.title,translations.body,translations.preview_excerpt,translations.preview_image&sort=sort&filter[status][_eq]=published&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/site_config/1?fields=passenger_hotline,family_hotline,support_email,media_contact,social_facebook,social_instagram,social_linkedin,social_youtube,social_tiktok,translations.languages_code,translations.flight_policy",
  ),
  getActive(),
  get(
    "/items/languages?fields=code,name&sort=sort&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/ui_labels?fields=namespace,key,translations.languages_code,translations.value&limit=-1&filter[deleted_at][_null]=true",
  ),
]);

// ─── Build content.json payload (dùng chung scripts/content-payload.mjs) ──────

const contentPayload = assembleContentPayload({
  generatedAt: new Date().toISOString(),
  officialUpdates: rawUpdates,
  flights,
  faqs,
  pressReleases: releases,
  siteConfig: config,
  languages: languageRows,
  labelRows,
  directusUrl: BASE,
});

// ─── Write output ─────────────────────────────────────────────────────────────

// buildId chỉ đổi khi có full rebuild thật (bundle JS/HTML mới) — content-only
// deploy này không chạy `next build` nên phải giữ nguyên giá trị đã build sẵn
// trong out/status.json (artifact của lần deploy-layout gần nhất), không tự
// sinh giá trị mới. Xem lib/buildMode.ts.
const outDir = resolve(root, "out");
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
