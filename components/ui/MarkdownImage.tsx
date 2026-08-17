"use client";

import { useEffect, useRef, useState } from "react";
import { ImageOff } from "lucide-react";

// Height held for an image that has not painted yet, and the exact height of
// the failed-load placeholder — one constant on purpose. A broken image is the
// case this component exists for, so the swap from <img> to placeholder has to
// cost no reflow; that only holds while the two heights are identical, which is
// too easy to break by accident if each side carries its own number.
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
    // The page is a static export, so an image referencing a host that is gone
    // usually fails while the HTML is still parsing — before hydration attaches
    // onError, which then never fires. Re-check on mount: a request that is
    // finished (complete) but produced no pixels (naturalWidth 0) has failed.
    const el = ref.current;
    if (el?.complete && el.naturalWidth === 0) setFailed(true);
  }, []);

  if (failed) {
    // Dropping the <img> entirely also makes this terminal: nothing is left to
    // re-request, so the height cannot flip back and forth with the load state.
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
      // Without this an image that has not painted is 0px tall, so it would
      // jump the moment it resolves either way. Holding the placeholder's
      // height instead makes the failure path — the common one here — a
      // straight swap at the same size. A spread, so an author who sized the
      // image by hand still wins.
      style={{ minHeight: RESERVED_HEIGHT, ...style }}
      onError={() => setFailed(true)}
      // object-contain rather than cover: with an author-supplied width/height
      // the box can disagree with the image's own ratio, and cover would crop
      // the overflow away silently.
      className={`rounded object-contain ${
        width !== undefined || style !== undefined ? "max-w-full" : "w-full"
      }`}
    />
  );
}
