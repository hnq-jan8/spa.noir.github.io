"use client";

import { useEffect, useRef, useState } from "react";

export interface TimelineItem {
  title: string;
  description: string;
  date?: string;
}

// Collapsed preview height (px) before content is considered truncated —
// tall enough that a typical medium-length update shows in full, only
// genuinely long content gets truncated with "Xem chi tiết". This is a cap,
// not a fixed size — shorter descriptions keep their own natural (shorter)
// height instead of being stretched to match it.
export const COLLAPSED_HEIGHT = 350;

// Nút tròn mờ dùng chung cho mũi tên trái/phải của carousel và nút cuộn xuống
// của modal — vị trí (left/right/bottom) thêm riêng ở từng chỗ.
export const CIRCLE_BUTTON =
  "flex items-center justify-center w-8 h-8 text-black/40 hover:text-black/70 bg-gray-400/25 backdrop-blur-sm border border-white/10 rounded-full";

export function useOverflowMeasure(description: string) {
  const [overflowing, setOverflowing] = useState(false);
  const innerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = innerRef.current;
    if (!el) return;
    // ResizeObserver (not just a mount-time measurement) so this stays correct
    // when the element starts out display:none (e.g. the desktop/mobile
    // layout that isn't active at the current breakpoint) and later becomes
    // visible after a viewport resize.
    const measure = () =>
      setOverflowing(el.scrollHeight > COLLAPSED_HEIGHT + 1);
    measure();
    const observer = new ResizeObserver(measure);
    observer.observe(el);
    return () => observer.disconnect();
  }, [description]);

  return { innerRef, overflowing };
}
