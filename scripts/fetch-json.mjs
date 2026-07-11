#!/usr/bin/env node
/**
 * Fetches fresh content from Directus and writes content.json + status.json
 * into the `out/` directory. Runs without a Next.js build step.
 *
 * Usage: node scripts/fetch-json.mjs
 * Env:   DIRECTUS_URL, DIRECTUS_STATIC_TOKEN, NEXT_PUBLIC_BASE_PATH
 */
import { writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { assembleContentPayload } from "./content-payload.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

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

function assetUrl(id) {
  return id ? `${BASE}/assets/${id}` : null;
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
    "/items/official_updates?fields=date,translations.languages_code,translations.title,translations.description&sort=-date&filter[status][_eq]=published&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/flights?fields=flight_no,aircraft_type,capacity,dep,arr,srtd,atd,note&sort=sort&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/faqs?fields=translations.languages_code,translations.question,translations.answer&sort=sort&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/press_releases?fields=translations.languages_code,translations.title,translations.body&sort=sort&filter[status][_eq]=published&filter[deleted_at][_null]=true",
  ),
  get(
    "/items/site_config/1?fields=passenger_hotline,family_hotline,support_email,media_contact,logo_on_black,logo_on_white,social_facebook,social_instagram,social_linkedin,social_youtube,social_tiktok,translations.languages_code,translations.flight_policy",
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
  assetUrl,
});

// ─── Write output ─────────────────────────────────────────────────────────────

const outDir = resolve(root, "out");
writeFileSync(resolve(outDir, "content.json"), JSON.stringify(contentPayload));
writeFileSync(resolve(outDir, "status.json"), JSON.stringify({ active }));

console.log(`✓ content.json  (generatedAt: ${contentPayload.generatedAt})`);
console.log(`✓ status.json   (active: ${active})`);
