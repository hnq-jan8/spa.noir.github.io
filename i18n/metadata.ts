import { getTranslations } from "next-intl/server";

/**
 * `generateMetadata` cho các trang con: tiêu đề tab lấy đúng nhãn `nav` của
 * trang đó, nên tab và tab nav trên header không bao giờ lệch chữ nhau.
 *
 * Trang chủ không dùng — title của nó là tên site, đặt ở app/layout.tsx.
 */
export function navMetadata(key: string) {
  return async function generateMetadata({
    params,
  }: {
    params: Promise<{ locale: string }>;
  }) {
    const { locale } = await params;
    const t = await getTranslations({ locale, namespace: "nav" });
    return { title: t(key) };
  };
}
