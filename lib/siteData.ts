export interface TimelineItem {
  title: string;
  description: string;
  date: string;
}

export const timelineItems: TimelineItem[] = [
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "09/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "07/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "05/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "03/06/2026",
  },
  {
    title: "Lorem ipsum",
    description:
      "Lorem ipsum dolor sit amet, consectetuer adipiscing elit, sed diam nonummy nibh euismod tincidunt ut laoreet dolore magna aliquam erat volutpat.",
    date: "01/06/2026",
  },
];

export interface SupportContact {
  key: "passengerHotline" | "familyHotline" | "supportEmail" | "mediaContact";
  value: string;
}

export const supportContacts: SupportContact[] = [
  { key: "passengerHotline", value: "0123 456 789" },
  { key: "familyHotline", value: "0123 456 789" },
  { key: "supportEmail", value: "loremipsum@gmail.com" },
  { key: "mediaContact", value: "loremipsum@gmail.com" },
];

export function getBuildTimestamp(locale: string) {
  const now = new Date();
  const intlLocale = locale === "vi" ? "vi-VN" : "en-US";
  const datePart = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Asia/Ho_Chi_Minh",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(now);
  const timePart = new Intl.DateTimeFormat(intlLocale, {
    timeZone: "Asia/Ho_Chi_Minh",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(now);
  return `${datePart} · ${timePart} GMT+7`;
}
