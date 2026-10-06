#!/usr/bin/env node
/**
 * Fetches i18n config from Directus (single source of truth for which
 * locales the site supports — superset gồm cả ngôn ngữ đang tắt) + the UI label catalog) and writes:
 *   - i18n/locales.generated.json   (locales, defaultLocale, language meta)
 *   - messages/{code}.json          (one file per locale, next-intl format)
 * Runs before `next dev` / `next build` — i18n/routing.ts and lib/contentData.ts
 * read the generated output instead of hardcoding locales/labels.
 *
 * Usage: node scripts/generate-i18n.mjs
 * Env:   DIRECTUS_URL, DIRECTUS_STATIC_TOKEN,
 *        NEXT_PUBLIC_SITE_URL (chỉ dùng cho fallback khi CMS lỗi, xem bên dưới)
 */
import { writeFileSync, mkdirSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import { ALL_LANGUAGES_QUERY, UI_LABELS_QUERY } from "./directus-queries.mjs";
import { directusGet } from "./directus-fetch.mjs";
import { fetchLiveContent, labelRowsFromContent } from "./live-content.mjs";

const __dirname = dirname(fileURLToPath(import.meta.url));
const root = resolve(__dirname, "..");

// Process Node riêng, Next.js không nạp .env giúp — tự nạp ở đây (bỏ qua nếu
// không có, vd trên CI đã có sẵn trong env thật).
try {
  process.loadEnvFile(resolve(root, ".env.local"));
} catch {}

const BASE = process.env.DIRECTUS_URL ?? "http://localhost:8055";
const TOKEN = process.env.DIRECTUS_STATIC_TOKEN ?? "";

const get = (path) => directusGet(BASE, path, { token: TOKEN });

// ─── Fallback: content.json của site đang live ───────────────────────────────
// Cùng lưới an toàn lib/buildContentPayload.ts dùng (scripts/live-content.mjs).
// Ở đây cần hơn ở đó: bước này quyết định build ra những locale nào, nuốt lỗi
// rồi đi tiếp là export ra site không có route nào. Trên CI cũng không có bản
// sinh lần trước để xài lại — layout-pipeline.yml xoá i18n/*.generated và
// messages/ mỗi lượt (cố ý, để locale vừa tắt không tồn dư).
//
// Đánh đổi: locale/label lấy về là của lần deploy gần nhất. Vừa tắt một ngôn
// ngữ mà CMS lại sập đúng lúc thì nó sống lại một lượt — vẫn hơn là hỏng cả
// deploy, và lượt build sau CMS tỉnh là đúng ngay.

let languageRows;
let labelRows;
try {
  [languageRows, labelRows] = await Promise.all([
    get(ALL_LANGUAGES_QUERY),
    get(UI_LABELS_QUERY),
  ]);
  if (!languageRows.some((r) => r.status))
    throw new Error("Directus languages collection has no active language");
} catch (err) {
  const live = await fetchLiveContent();
  // Không có locale nào thì fallback vô dụng — trả lại lỗi gốc của CMS, vì đó
  // mới là thứ đáng đọc trong log.
  if (!live?.common.languages?.length) throw err;
  // content.json chỉ có ngôn ngữ đang bật → mất phần superset (route của ngôn
  // ngữ tắt) ở lượt build này; lượt sau CMS tỉnh là đủ lại.
  languageRows = live.common.languages.map((l) => ({ ...l, status: true }));
  labelRows = labelRowsFromContent(live);
  console.warn(
    `⚠ Directus i18n fetch failed (${err instanceof Error ? err.message : err}) — dùng lại content.json của ${process.env.NEXT_PUBLIC_SITE_URL}; locale/label là của lần deploy gần nhất.`,
  );
}

// `code` becomes a filename (messages/${code}.json) and a route segment
// ([locale]) further down the pipeline — a row that slipped past CMS
// validation (or predates it) with something like `<h1>...` in `code` would
// otherwise crash the whole build over one bad language instead of just
// dropping it.
const VALID_LOCALE_CODE = /^[a-z]{2,3}$/;
const validLanguageRows = languageRows.filter((r) => VALID_LOCALE_CODE.test(r.code));
for (const r of languageRows) {
  if (!VALID_LOCALE_CODE.test(r.code)) {
    console.warn(`⚠ Bỏ qua language có code không hợp lệ: ${JSON.stringify(r.code)}`);
  }
}
if (!validLanguageRows.length) {
  throw new Error("No language row has a valid code after filtering");
}

// Superset: route/messages sinh cho MỌI ngôn ngữ chưa xoá. Chỉ ngôn ngữ
// status=true là "active" (hiện trong selector, là default, được redirect tới);
// ngôn ngữ tắt vẫn có route nhưng LocaleGate trả 404 cho tới khi content.json
// báo nó bật.
const languages = validLanguageRows.map((r) => ({
  code: r.code,
  name: r.name,
  active: Boolean(r.status),
}));
const activeLanguages = languages.filter((l) => l.active);
if (!activeLanguages.length) {
  throw new Error("No active language after filtering");
}

const localesPayload = {
  // mọi locale có route tĩnh (superset)
  locales: languages.map((l) => l.code),
  // tập đang bật tại thời điểm build — default là ngôn ngữ active đầu tiên
  activeLocales: activeLanguages.map((l) => l.code),
  defaultLocale: activeLanguages[0].code,
  // chỉ ngôn ngữ active, cùng shape cũ ({code,name}) cho selector/noscript
  languages: activeLanguages.map(({ code, name }) => ({ code, name })),
};

writeFileSync(
  resolve(root, "i18n/locales.generated.json"),
  JSON.stringify(localesPayload, null, 2),
);
console.log(
  `✓ i18n/locales.generated.json  (locales: ${localesPayload.locales.join(", ")}, active: ${localesPayload.activeLocales.join(", ")}, default: ${localesPayload.defaultLocale})`,
);

// ─── messages/{code}.json — namespace → key → value, theo từng locale ────────

const messagesDir = resolve(root, "messages");
mkdirSync(messagesDir, { recursive: true });

for (const { code } of languages) {
  const messages = {};
  for (const row of labelRows) {
    const value = row.translations.find((t) => t.languages_code === code)?.value ?? "";
    messages[row.namespace] ??= {};
    messages[row.namespace][row.key] = value;
  }
  writeFileSync(resolve(messagesDir, `${code}.json`), JSON.stringify(messages, null, 2));
  console.log(`✓ messages/${code}.json  (${labelRows.length} keys)`);
}

// ─── i18n/messages.generated.ts — bundle label catalog vào client bundle ────
// Import tĩnh để Navbar/Footer có label ngay first paint; content.json (mới
// hơn) ghi đè khi fetch xong.
const importLines = languages
  .map(({ code }, i) => `import m${i} from "@/messages/${code}.json";`)
  .join("\n");
const mapEntries = languages.map(({ code }, i) => `  "${code}": m${i},`).join("\n");
writeFileSync(
  resolve(root, "i18n/messages.generated.ts"),
  `// AUTO-GENERATED by scripts/generate-i18n.mjs — DO NOT EDIT.
${importLines}

export const bundledMessages: Record<
  string,
  Record<string, Record<string, string>>
> = {
${mapEntries}
};
`,
);
console.log("✓ i18n/messages.generated.ts");
