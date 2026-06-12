import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

// Chỉ bật basePath khi build production (GitHub Pages serve dưới subpath).
// Dev tắt đi để né bug redirect loop của Next khi basePath + trailingSlash.
const isProd = process.env.NODE_ENV === "production";
const basePath = isProd ? "/spa.noir.github.io" : "";

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  env: {
    NEXT_PUBLIC_BASE_PATH: basePath,
  },
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
