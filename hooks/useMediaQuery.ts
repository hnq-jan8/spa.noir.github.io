"use client";

import { useEffect, useState } from "react";

/** `false` ở lượt render đầu (khớp HTML tĩnh), đồng bộ ngay sau khi mount. */
export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(false);
  useEffect(() => {
    const mql = window.matchMedia(query);
    const sync = () => setMatches(mql.matches);
    sync();
    mql.addEventListener("change", sync);
    return () => mql.removeEventListener("change", sync);
  }, [query]);
  return matches;
}
