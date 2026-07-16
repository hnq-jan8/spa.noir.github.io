import type { ContentPayload } from "../lib/contentData";
import type {
  OfficialUpdate,
  Flight,
  Faq,
  PressRelease,
  SiteConfig,
  Language,
  UiLabel,
} from "../lib/directus";

// Kiểu cho content-payload.mjs. Input shape lấy thẳng từ lib/directus.ts (đúng
// dữ liệu getX() trả về), output là ContentPayload trong lib/contentData.ts —
// không khai báo lại ở đây để tránh drift khi thêm/sửa field. File này chỉ tsc
// đọc lúc `next build` (checkout đầy đủ); runtime deploy-content không đụng tới.

export declare const LABEL_NAMESPACES: {
  common: string[];
  home: string[];
  flightInfo: string[];
  officialUpdates: string[];
};

export declare function formatTime(time: string | null): string;

export declare function buildLabels(
  languageCodes: string[],
  labelRows: UiLabel[],
): Record<string, Record<string, Record<string, string>>>;

export declare function assembleContentPayload(input: {
  generatedAt: string;
  officialUpdates: OfficialUpdate[];
  flights: Flight[];
  faqs: Faq[];
  pressReleases: PressRelease[];
  siteConfig: SiteConfig;
  languages: Language[];
  labelRows: UiLabel[];
  resolveLogo: (id: string | null) => string | null;
}): ContentPayload;
