import type { ContentPayload } from "../lib/contentData";

export declare const LABEL_NAMESPACES: {
  common: string[];
  home: string[];
  flightInfo: string[];
};

export declare function formatTime(time: string | null): string;

export declare function buildLabels(
  languageCodes: string[],
  labelRows: {
    namespace: string;
    key: string;
    translations: { languages_code: string; value: string }[];
  }[],
): Record<string, Record<string, Record<string, string>>>;

export declare function assembleContentPayload(input: {
  generatedAt: string;
  officialUpdates: {
    date: string;
    translations: { languages_code: string; title: string; description: string }[];
  }[];
  flights: {
    flight_no: string;
    aircraft_type: string | null;
    capacity: number | null;
    dep: string | null;
    arr: string | null;
    srtd: string | null;
    atd: string | null;
    note: string | null;
  }[];
  faqs: {
    translations: { languages_code: string; question: string; answer: string }[];
  }[];
  pressReleases: {
    translations: { languages_code: string; title: string; body: string }[];
  }[];
  siteConfig: {
    passenger_hotline: string;
    family_hotline: string;
    support_email: string;
    media_contact: string;
    logo_on_black: string | null;
    logo_on_white: string | null;
    social_facebook: string | null;
    social_instagram: string | null;
    social_linkedin: string | null;
    social_youtube: string | null;
    social_tiktok: string | null;
    translations: { languages_code: string; flight_policy: string }[];
  };
  languages: { code: string; name: string }[];
  labelRows: {
    namespace: string;
    key: string;
    translations: { languages_code: string; value: string }[];
  }[];
  resolveLogo: (id: string | null) => string | null;
}): ContentPayload;
