import type { Metadata } from "next";
import { getBuildMode } from "@/lib/buildMode";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export const metadata: Metadata = {
  title: "Sun PhuQuoc Airways",
  description: "Official information from Sun PhuQuoc Airways",
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { officialSiteUrl } = await getBuildMode();

  // Synchronous XHR blocks the HTML parser before any content renders.
  // If status.json says active=false, redirect immediately — no flash.
  const earlyRedirectScript = `(function(){try{var x=new XMLHttpRequest();x.open('GET','${basePath}/status.json',false);x.send(null);if(x.status===200){var s=JSON.parse(x.responseText);if(s.active===false){window.location.replace(${JSON.stringify(officialSiteUrl)});}}}catch(e){}})();`;

  return (
    <html>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyRedirectScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
