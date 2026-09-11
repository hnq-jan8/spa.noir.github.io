import type { ContentPayload } from "../lib/contentData";

export declare function fetchLiveContent(): Promise<ContentPayload | null>;

export declare function fetchLiveStatus(): Promise<{
  active: boolean;
  /** Mốc nội dung của bản đang live — chính là `generatedAt` của content.json. */
  since?: string;
} | null>;

export declare function labelRowsFromContent(payload: ContentPayload): {
  namespace: string;
  key: string;
  translations: { languages_code: string; value: string }[];
}[];
