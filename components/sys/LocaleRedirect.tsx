"use client";

import { useEffect } from "react";
import { routing } from "@/i18n/routing";
import { getSavedLocale } from "@/i18n/preference";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

// Múi giờ Việt Nam ("Asia/Saigon" là alias cũ trên một số hệ điều hành)
const VIETNAM_TIMEZONES = ["Asia/Ho_Chi_Minh", "Asia/Saigon"];

function detectLocale(): string {
  const locales = routing.locales as readonly string[];

  // 1. Lựa chọn user đã lưu từ lần truy cập trước
  const saved = getSavedLocale();
  if (saved && locales.includes(saved)) {
    return saved;
  }

  // 2. Timezone: người Việt hay dùng browser tiếng Anh,
  //    nên timezone đáng tin hơn browser language để nhận diện "vi"
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  if (VIETNAM_TIMEZONES.includes(timeZone) && locales.includes("vi")) {
    return "vi";
  }

  // 3. Ngôn ngữ trình duyệt
  for (const lang of navigator.languages ?? [navigator.language]) {
    const code = lang.toLowerCase().split("-")[0];
    if (locales.includes(code)) {
      return code;
    }
  }

  // 4. Mặc định
  return routing.defaultLocale;
}

export default function LocaleRedirect() {
  useEffect(() => {
    window.location.replace(`${basePath}/${detectLocale()}/`);
  }, []);

  return (
    <noscript>
      <a href={`${basePath}/vi/`}>Tiếng Việt</a> |{" "}
      <a href={`${basePath}/en/`}>English</a>
    </noscript>
  );
}
