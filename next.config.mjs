import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const isProd = process.env.NODE_ENV === "production";

// URL công khai đầy đủ của site (origin + subpath). Nguồn duy nhất — basePath
// suy ra từ đây. Lên môi trường thật chỉ cần set NEXT_PUBLIC_SITE_URL=<domain>.
const siteUrl = (
  process.env.NEXT_PUBLIC_SITE_URL ||
  (isProd
    ? "https://hnq-jan8.github.io/spa.noir.github.io"
    : "http://localhost:3000")
).replace(/\/$/, "");
const basePath = new URL(siteUrl).pathname.replace(/\/$/, "");

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
    NEXT_PUBLIC_SITE_URL: siteUrl,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
