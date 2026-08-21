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
import {
  LANGUAGES_QUERY,
  UI_LABELS_QUERY,
  OFFICIAL_UPDATES_QUERY,
  FLIGHTS_QUERY,
  FAQS_QUERY,
  PRESS_RELEASES_QUERY,
  SITE_CONFIG_QUERY,
  APP_SETTING_QUERY,
} from "./directus-queries.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Process Node riêng, Next.js không nạp .env giúp — xem scripts/generate-i18n.mjs.
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
    `${BASE}${APP_SETTING_QUERY}&_=${nonce}`,
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
  get(OFFICIAL_UPDATES_QUERY),
  get(FLIGHTS_QUERY),
  get(FAQS_QUERY),
  get(PRESS_RELEASES_QUERY),
  get(SITE_CONFIG_QUERY),
  getActive(),
  get(LANGUAGES_QUERY),
  get(UI_LABELS_QUERY),
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

// buildId chỉ đổi khi có full rebuild — deploy content-only phải giữ nguyên
// giá trị trong out/status.json, không tự sinh mới. Xem lib/buildMode.ts.
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
