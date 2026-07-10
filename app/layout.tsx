import type { Metadata } from "next";
import { getBuildMode } from "@/lib/buildMode";
import { routing } from "@/i18n/routing";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription, favicon } = await getBuildMode();
  return {
    title: seoTitle[routing.defaultLocale],
    description: seoDescription[routing.defaultLocale],
    icons: favicon ? { icon: favicon } : undefined,
  };
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { officialSiteUrl } = await getBuildMode();

  // Synchronous XHR blocks the HTML parser before any content renders.
  // If status.json says active=false, redirect immediately — no flash.
  const earlyRedirectScript = `(function(){try{var x=new XMLHttpRequest();x.open('GET','${basePath}/status.json?_='+Date.now(),false);x.setRequestHeader('Cache-Control','no-cache, no-store');x.setRequestHeader('Pragma','no-cache');x.send(null);if(x.status===200){var s=JSON.parse(x.responseText);if(s.active===false){window.location.replace(${JSON.stringify(officialSiteUrl)});}}}catch(e){}})();`;

  return (
    <html lang={routing.defaultLocale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyRedirectScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
