export const PREFERRED_LOCALE_KEY = "preferred-locale";

export function getSavedLocale(): string | null {
  try {
    return window.localStorage.getItem(PREFERRED_LOCALE_KEY);
  } catch {
    return null;
  }
}

export function saveLocale(locale: string) {
  try {
    window.localStorage.setItem(PREFERRED_LOCALE_KEY, locale);
  } catch {
    // localStorage bị chặn (chế độ riêng tư) — bỏ qua, sẽ detect lại lần sau
  }
}
