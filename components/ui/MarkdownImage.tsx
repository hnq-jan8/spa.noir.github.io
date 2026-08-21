"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

// One constant for both the unpainted <img> and the failure placeholder: the
// swap between them only costs no reflow while the two heights are identical.
const RESERVED_HEIGHT = "26px";

interface MarkdownImageProps {
  src?: string;
  alt?: string;
  width?: string | number;
  height?: string | number;
  style?: React.CSSProperties;
}

// Split out of MarkdownContent (a server component) because recovering from a
// failed load needs an onError handler and client state.
export default function MarkdownImage({
  src,
  alt,
  width,
  height,
  style,
}: MarkdownImageProps) {
  const [failed, setFailed] = useState(false);
  const ref = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // On a static export the image usually fails while the HTML is still
    // parsing, before hydration attaches onError — so re-check on mount:
    // complete with naturalWidth 0 means it failed.
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    // Dropping the <img> makes this terminal: nothing is left to re-request.
    return (
      <span
        style={{ height: RESERVED_HEIGHT }}
        className="inline-flex items-center gap-1.5 align-middle rounded border border-gray-200 bg-gray-50 px-2 text-gray-500 my-1"
        {...(alt
          ? { role: "img", "aria-label": alt }
          : { "aria-hidden": true })}
      >
        <ImageOff className="w-4 h-4 shrink-0" aria-hidden="true" />
        {alt ? <span className="text-xs">{alt}</span> : null}
      </span>
    );
  }

  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      ref={ref}
      src={src}
      alt={alt ?? ""}
      width={width}
      height={height}
      // An unpainted image is 0px tall and would jump on resolve; holding the
      // placeholder's height makes the failure path a same-size swap. Spread so
      // an author-supplied size still wins.
      style={{ minHeight: RESERVED_HEIGHT, ...style }}
      onError={() => setFailed(true)}
      // contain, not cover: an author-supplied box can disagree with the
      // image's ratio, and cover would crop it silently.
      className={`rounded object-contain ${
        width !== undefined || style !== undefined ? "max-w-full" : "w-full"
      }`}
    />
  );
}
