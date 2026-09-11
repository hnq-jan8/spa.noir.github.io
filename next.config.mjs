import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// URL công khai đầy đủ của site (origin + subpath). Nguồn duy nhất — basePath
// suy ra từ đây. Lên môi trường thật chỉ cần set NEXT_PUBLIC_SITE_URL=<domain>.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"
).replace(/\/$/, "");
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  // Mặc định 60s, ngắn hơn chuỗi retry của scripts/directus-fetch.mjs: lúc CMS
  // treo, Next bắn SIGTERM giữa chừng nên trang không bao giờ tới được bước rơi
  // về fallback, worker mới lại đếm từ đầu, ba vòng rồi fail cả build. Nới cho
  // chuỗi đó chạy trọn; trang lành vẫn render trong vài trăm ms.
  staticPageGenerationTimeout: 180,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
