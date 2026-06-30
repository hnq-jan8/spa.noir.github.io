#!/usr/bin/env node
/**
 * Fetches fresh content from Directus and writes content.json + status.json
 * into the `out/` directory. Runs without a Next.js build step.
 *
 * Usage: node scripts/fetch-json.mjs
 * Env:   DIRECTUS_URL, DIRECTUS_STATIC_TOKEN, NEXT_PUBLIC_BASE_PATH
 */
import { readFileSync, writeFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";
const BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

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
  const res = await fetch(`${BASE}/items/app_setting?fields=active&_=${nonce}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error(`Directus app_setting → ${res.status}`);
  return Boolean((await res.json()).data.active);
}

// ─── Build labels từ messages/*.json (không cần next-intl) ──────────────────

function buildLabels() {
  const vi = JSON.parse(readFileSync(resolve(root, "messages/vi.json"), "utf8"));
  const en = JSON.parse(readFileSync(resolve(root, "messages/en.json"), "utf8"));
  const localeMap = { vi, en };
  const labels = {};
  for (const ns of Object.keys(vi)) {
    labels[ns] = {};
    for (const key of Object.keys(vi[ns])) {
      labels[ns][key] = Object.fromEntries(
        Object.entries(localeMap).map(([locale, msgs]) => [locale, msgs[ns]?.[key] ?? ""])
      );
    }
  }
  return labels;
}

// ─── Fetch all data in parallel ──────────────────────────────────────────────

const [rawUpdates, contacts, flights, faqs, releases, config, active] = await Promise.all([
  get("/items/official_updates?fields=*,translations.*&sort=-date&filter[status][_eq]=published"),
  get("/items/support_contacts?sort=id&filter[status][_eq]=published"),
  get("/items/flights?sort=sort&filter[status][_eq]=published"),
  get("/items/faqs?fields=*,translations.*&sort=sort&filter[status][_eq]=published"),
  get("/items/press_releases?fields=*,translations.*&sort=sort&filter[status][_eq]=published"),
  get("/items/site_config/1?fields=*,translations.*"),
  getActive(),
]);

// ─── Build content.json payload (mirrors lib/contentData.ts) ─────────────────

function formatTime(time) {
  return time ? time.slice(0, 5) : "–";
}

const latestRelease = releases[0];

const contentPayload = {
  generatedAt: new Date().toISOString(),
  contacts: contacts.map((c) => ({ key: c.key, value: c.value })),
  flights: flights.map((f, i) => ({
    no: i + 1,
    type: f.aircraft_type ?? "–",
    capacity: f.capacity ?? "–",
    flightNo: f.flight_no,
    departure: f.dep ?? "–",
    arrival: f.arr ?? "–",
    srtd: formatTime(f.srtd),
    atd: formatTime(f.atd),
    note: f.note ?? "–",
  })),
  updates: rawUpdates.map((u) => ({
    date: u.date,
    title: Object.fromEntries(u.translations.map((t) => [t.languages_code, t.title])),
    description: Object.fromEntries(u.translations.map((t) => [t.languages_code, t.description])),
  })),
  faqs: faqs.map((faq) => ({
    question: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.question])),
    answer: Object.fromEntries(faq.translations.map((t) => [t.languages_code, t.answer])),
  })),
  pressRelease: latestRelease
    ? {
        imageSrc: latestRelease.cover_image
          ? `${BASE}/assets/${latestRelease.cover_image}`
          : `${BASE_PATH}/images/airplane.jpg`,
        title: Object.fromEntries(latestRelease.translations.map((t) => [t.languages_code, t.title])),
        body: Object.fromEntries(latestRelease.translations.map((t) => [t.languages_code, t.body])),
        imageAlt: Object.fromEntries(
          latestRelease.translations.map((t) => [t.languages_code, t.image_alt ?? ""])
        ),
      }
    : null,
  flightPolicy: Object.fromEntries(config.translations.map((t) => [t.languages_code, t.flight_policy])),
  labels: buildLabels(),
};

// ─── Write output ─────────────────────────────────────────────────────────────

const outDir = resolve(root, "out");
writeFileSync(resolve(outDir, "content.json"), JSON.stringify(contentPayload));
writeFileSync(resolve(outDir, "status.json"), JSON.stringify({ active }));

console.log(`✓ content.json  (generatedAt: ${contentPayload.generatedAt})`);
console.log(`✓ status.json   (active: ${active})`);
