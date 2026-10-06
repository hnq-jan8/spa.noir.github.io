"use client";

import { useContentState } from "@/hooks/useContentData";
import { useRouteLocale } from "@/hooks/useLocale";
import NotFoundContent from "@/components/features/NotFoundContent";

/**
 * Route của MỌI ngôn ngữ (kể cả đang tắt) được sinh sẵn lúc build — xem
 * i18n/routing.ts. Gate này quyết định trang của một locale có "tồn tại" hay
 * không, theo content.json (runtime) thay vì theo lúc build:
 *   - ngôn ngữ tắt        → trả giao diện 404, kể cả ai gõ thẳng URL
 *   - ngôn ngữ vừa bật    → hiện nội dung ngay sau quick build, không cần build lại route
 *
 * `buildActive` (trạng thái lúc build) là giá trị đầu để HTML tĩnh đúng ngay
 * first paint, không nháy 404 → nội dung; content.json về thì thay bằng sự thật
 * mới nhất. Tải content.json hỏng/rỗng thì giữ giá trị lúc build.
 *
 * Lưu ý: hosting tĩnh luôn trả HTTP 200 cho file này — đây là soft-404, nên
 * layout kèm `robots: noindex` cho locale tắt lúc build.
 */
export default function LocaleGate({
  buildActive,
  children,
}: {
  buildActive: boolean;
  children: React.ReactNode;
}) {
  const locale = useRouteLocale();
  const { data } = useContentState();

  const live = data?.common.languages;
  const active =
    live && live.length > 0 ? live.some((l) => l.code === locale) : buildActive;

  if (!active) {
    return (
      <div className="container-page">
        <NotFoundContent />
      </div>
    );
  }
  return <>{children}</>;
}
