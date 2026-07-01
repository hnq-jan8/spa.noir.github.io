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
  const res = await fetch(`${BASE}/items/app_setting?fields=active&_=${nonce}`, {
    headers: {
      Authorization: `Bearer ${TOKEN}`,
      "ngrok-skip-browser-warning": "true",
    },
  });
  if (!res.ok) throw new Error(`Directus app_setting → ${res.status}`);
  return Boolean((await res.json()).data.active);
}

// ─── Build labels từ Directus `ui_labels` (không cần messages/*.json / next-intl) ──

function buildLabels(languages, labelRows) {
  const labels = {};
  for (const row of labelRows) {
    labels[row.namespace] ??= {};
    labels[row.namespace][row.key] = Object.fromEntries(
      languages.map((code) => [
        code,
        row.translations.find((t) => t.languages_code === code)?.value ?? "",
      ]),
    );
  }
  return labels;
}

// ─── Fetch all data in parallel ──────────────────────────────────────────────

const [rawUpdates, contacts, flights, faqs, releases, config, active, languageRows, labelRows] =
  await Promise.all([
    get("/items/official_updates?fields=*,translations.*&sort=-date&filter[status][_eq]=published"),
    get("/items/support_contacts?sort=id&filter[status][_eq]=published"),
    get("/items/flights?sort=sort&filter[status][_eq]=published"),
    get("/items/faqs?fields=*,translations.*&sort=sort&filter[status][_eq]=published"),
    get("/items/press_releases?fields=*,translations.*&sort=sort&filter[status][_eq]=published"),
    get("/items/site_config/1?fields=*,translations.*"),
    getActive(),
    get("/items/languages?fields=code&sort=sort"),
    get("/items/ui_labels?fields=namespace,key,translations.languages_code,translations.value&limit=-1"),
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
        title: Object.fromEntries(latestRelease.translations.map((t) => [t.languages_code, t.title])),
        body: Object.fromEntries(latestRelease.translations.map((t) => [t.languages_code, t.body])),
      }
    : null,
  flightPolicy: Object.fromEntries(config.translations.map((t) => [t.languages_code, t.flight_policy])),
  labels: buildLabels(languageRows.map((l) => l.code), labelRows),
};

// ─── Write output ─────────────────────────────────────────────────────────────

const outDir = resolve(root, "out");
writeFileSync(resolve(outDir, "content.json"), JSON.stringify(contentPayload));
writeFileSync(resolve(outDir, "status.json"), JSON.stringify({ active }));

console.log(`✓ content.json  (generatedAt: ${contentPayload.generatedAt})`);
console.log(`✓ status.json   (active: ${active})`);
