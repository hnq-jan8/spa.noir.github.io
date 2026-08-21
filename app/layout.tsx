import type { Metadata } from "next";
import { getBuildMode } from "@/lib/buildMode";
import { routing } from "@/i18n/routing";
import "./globals.css";

const basePath = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const ogImage = `${process.env.NEXT_PUBLIC_SITE_URL}/og-image.png`;

export async function generateMetadata(): Promise<Metadata> {
  const { seoTitle, seoDescription, favicon } = await getBuildMode();
  const title = seoTitle[routing.defaultLocale];
  const description = seoDescription[routing.defaultLocale];
  return {
    title,
    description,
    icons: favicon ? { icon: favicon } : undefined,
    openGraph: {
      title,
      description,
      images: [{ url: ogImage, width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogImage],
    },
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

  // A tab left open across a deploy can reference a hashed CSS bundle that no
  // longer exists, leaving the page unstyled. globals.css sets
  // --app-css-loaded only once it applied, so its absence after load means the
  // stylesheet 404'd — recover with one guarded hard reload.
  const cssRecoveryScript = `(function(){function check(){try{var v=getComputedStyle(document.documentElement).getPropertyValue('--app-css-loaded').trim();if(v!=='1'){var KEY='darksite-css-recovery-ts';var last=sessionStorage.getItem(KEY);var now=Date.now();if(!last||now-parseInt(last,10)>15000){sessionStorage.setItem(KEY,String(now));window.location.reload();}}}catch(e){}}if(document.readyState==='complete'){check();}else{window.addEventListener('load',check);}})();`;

  // Same problem for JS chunks: a bfcache-restored page imports a chunk hash
  // the new deploy overwrote. The thrown error varies too much to pattern-match
  // (ChunkLoadError, or a minified React error from a hydration retry), so
  // catch it at the source — a failing _next/static <script>/<link> fires a
  // non-bubbling 'error' event, visible only to a capture-phase listener — plus
  // `pageshow` with persisted:true for the restore itself. Message matching
  // stays as a fallback.
  const chunkRecoveryScript = `(function(){function reload(){try{var KEY='darksite-chunk-recovery-ts';var last=sessionStorage.getItem(KEY);var now=Date.now();if(!last||now-parseInt(last,10)>15000){sessionStorage.setItem(KEY,String(now));window.location.reload();}}catch(e){}}window.addEventListener('pageshow',function(e){if(e.persisted)reload();});function isChunkError(x){var msg=(x&&x.message)||(x&&x.reason&&x.reason.message)||'';var name=(x&&x.error&&x.error.name)||(x&&x.reason&&x.reason.name)||'';return name==='ChunkLoadError'||/loading chunk [\\w.-]+ failed/i.test(msg)||/loading css chunk/i.test(msg)||/minified react error #4(18|19|22|23|25)/i.test(msg);}window.addEventListener('error',function(e){var t=e&&e.target;if(t&&(t.tagName==='SCRIPT'||t.tagName==='LINK')&&/\\/_next\\/static\\//.test(t.src||t.href||'')){reload();return;}if(isChunkError(e))reload();},true);window.addEventListener('unhandledrejection',function(e){if(isChunkError(e))reload();});})();`;

  return (
    <html lang={routing.defaultLocale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyRedirectScript }} />
        <script dangerouslySetInnerHTML={{ __html: cssRecoveryScript }} />
        <script dangerouslySetInnerHTML={{ __html: chunkRecoveryScript }} />
        {/* Inlined so it can't 404 like the hashed Tailwind bundle: without
            this, a failed stylesheet leaves the unconditionally-rendered
            desktop nav/language markup stacked on top of the mobile ones. */}
        <style
          dangerouslySetInnerHTML={{
            __html: `@media (max-width:767px){[data-fallback-desktop-only]{display:none !important;}}`,
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
