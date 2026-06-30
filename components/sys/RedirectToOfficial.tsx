"use client";

import { useEffect } from "react";

export default function RedirectToOfficial({ url }: { url: string }) {
  useEffect(() => {
    window.location.replace(url);
  }, [url]);

  return (
    <noscript>
      <a href={url}>{url}</a>
    </noscript>
  );
}
