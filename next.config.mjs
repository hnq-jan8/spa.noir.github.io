import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig = {
  output: "export",
  trailingSlash: true,
  basePath: "/spa.noir.github.io",
  images: {
    unoptimized: true,
  },
};

export default withNextIntl(nextConfig);
