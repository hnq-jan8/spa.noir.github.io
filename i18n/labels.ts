import { bundledMessages } from "./messages.generated";
import { routing } from "./routing";

// Label catalog sinh lúc build từ Directus ui_labels (qua generate-i18n.mjs),
// dùng làm fallback hiển thị tức thì khi content.json chưa fetch xong.
export function bundledLabels(locale: string, ns: string): Record<string, string> {
  return (
    bundledMessages[locale]?.[ns] ??
    bundledMessages[routing.defaultLocale]?.[ns] ??
    {}
  );
}
