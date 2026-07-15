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

  // A stale browser-cached HTML page (e.g. a tab left open across a deploy)
  // can reference a hashed CSS/JS bundle that a later deploy overwrote,
  // 404ing that asset and leaving the page unstyled. globals.css sets
  // --app-css-loaded on <html> only once it has actually applied, so once
  // the window is done loading we can detect that failure and recover with
  // a single hard reload (guarded so it can't loop if the failure persists).
  const cssRecoveryScript = `(function(){function check(){try{var v=getComputedStyle(document.documentElement).getPropertyValue('--app-css-loaded').trim();if(v!=='1'){var KEY='darksite-css-recovery-ts';var last=sessionStorage.getItem(KEY);var now=Date.now();if(!last||now-parseInt(last,10)>15000){sessionStorage.setItem(KEY,String(now));window.location.reload();}}}catch(e){}}if(document.readyState==='complete'){check();}else{window.addEventListener('load',check);}})();`;

  // If the site was redeployed (e.g. status.json flips back to active=false
  // -> true) while this tab was away, the browser can restore this page from
  // bfcache on "back" navigation instead of re-fetching it. The restored JS
  // then tries to dynamically import a chunk whose hash no longer exists
  // (overwritten by the new deploy) -> ChunkLoadError -> uncaught -> Next's
  // generic "Application error" crash. `pageshow` with `persisted:true` is
  // the standard signal for a bfcache restore; force a real reload so the
  // page always re-fetches current HTML/JS instead of running stale code.
  // The chunk/css error listeners below are a fallback for any chunk-load
  // failure that reaches this far regardless of cause.
  const chunkRecoveryScript = `(function(){function reload(){try{var KEY='darksite-chunk-recovery-ts';var last=sessionStorage.getItem(KEY);var now=Date.now();if(!last||now-parseInt(last,10)>15000){sessionStorage.setItem(KEY,String(now));window.location.reload();}}catch(e){}}window.addEventListener('pageshow',function(e){if(e.persisted)reload();});function isChunkError(x){var msg=(x&&x.message)||(x&&x.reason&&x.reason.message)||'';var name=(x&&x.error&&x.error.name)||(x&&x.reason&&x.reason.name)||'';return name==='ChunkLoadError'||/loading chunk [\\w.-]+ failed/i.test(msg)||/loading css chunk/i.test(msg);}window.addEventListener('error',function(e){if(isChunkError(e))reload();});window.addEventListener('unhandledrejection',function(e){if(isChunkError(e))reload();});})();`;

  return (
    <html lang={routing.defaultLocale}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: earlyRedirectScript }} />
        <script dangerouslySetInnerHTML={{ __html: cssRecoveryScript }} />
        <script dangerouslySetInnerHTML={{ __html: chunkRecoveryScript }} />
        {/*
          Inlined (not linked) CSS, so it is part of the HTML response itself
          and can't 404 the way the hashed Tailwind bundle can. Navbar/
          LanguageSelector render desktop-only markup unconditionally and
          normally rely on `hidden md:flex` (from the linked stylesheet) to
          keep it off-screen on mobile. If that stylesheet fails to load,
          this is the safety net that still hides it, instead of showing the
          duplicated desktop nav/language list on top of the mobile ones.
        */}
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
