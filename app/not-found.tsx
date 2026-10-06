import type { Metadata } from "next";
import NotFoundContent from "@/components/features/NotFoundContent";
import SiteShell from "@/components/layout/SiteShell";

export const metadata: Metadata = {
  robots: { index: false },
};

// 404 gốc (404.html tĩnh): nằm ngoài [locale] nên tự dựng khung site; locale
// hiển thị theo ngôn ngữ user đã lưu (xem useLocale).
export default function NotFound() {
  return (
    <SiteShell>
      <div className="container-page">
        <NotFoundContent />
      </div>
    </SiteShell>
  );
}
