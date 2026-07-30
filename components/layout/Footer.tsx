"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { useContentData } from "@/hooks/useContentData";
import { useLocale } from "@/hooks/useLocale";
import { bundledLabels } from "@/i18n/labels";
import { isHomePath } from "@/i18n/paths";

const FALLBACK_LOGO = `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.svg`;

const SOCIAL_ICONS = {
  facebook: {
    name: "Facebook",
    viewBox: "-10.02 -61.44 340.03 634.88",
    path: "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z",
  },
  instagram: {
    name: "Instagram",
    viewBox: "-1.92 -1.92 19.84 19.84",
    padX: "px-0",
    path: "M8 0C5.829 0 5.556.01 4.703.048 3.85.088 3.269.222 2.76.42a3.917 3.917 0 0 0-1.417.923A3.927 3.927 0 0 0 .42 2.76C.222 3.268.087 3.85.048 4.7.01 5.555 0 5.827 0 8.001c0 2.172.01 2.444.048 3.297.04.852.174 1.433.372 1.942.205.526.478.972.923 1.417.444.445.89.719 1.416.923.51.198 1.09.333 1.942.372C5.555 15.99 5.827 16 8 16s2.444-.01 3.298-.048c.851-.04 1.434-.174 1.943-.372a3.916 3.916 0 0 0 1.416-.923c.445-.445.718-.891.923-1.417.198-.509.333-1.09.372-1.942C15.99 10.445 16 10.173 16 8s-.01-2.445-.048-3.299c-.04-.851-.174-1.433-.372-1.941a3.926 3.926 0 0 0-.923-1.417A3.911 3.911 0 0 0 13.24.42c-.51-.198-1.092-.333-1.943-.372C10.443.01 10.172 0 7.998 0h.003zm-.717 1.442h.718c2.136 0 2.389.007 3.232.046.78.035 1.204.166 1.486.275.373.145.64.319.92.599.28.28.453.546.598.92.11.281.24.705.275 1.485.039.843.047 1.096.047 3.231s-.008 2.389-.047 3.232c-.035.78-.166 1.203-.275 1.485a2.47 2.47 0 0 1-.599.919c-.28.28-.546.453-.92.598-.28.11-.704.24-1.485.275-.843.039-1.096.047-3.232.047s-2.39-.008-3.233-.047c-.78-.035-1.203-.166-1.485-.275a2.478 2.478 0 0 1-.92-.598 2.48 2.48 0 0 1-.6-.92c-.109-.281-.24-.705-.275-1.485-.038-.843-.046-1.096-.046-3.233 0-2.136.008-2.388.046-3.231.036-.78.166-1.204.276-1.486.145-.373.319-.64.599-.92.28-.28.546-.453.92-.598.282-.11.705-.24 1.485-.276.738-.033 1.024-.043 2.515-.045v.002zm4.988 1.328a.96.96 0 1 0 0 1.92.96.96 0 0 0 0-1.92zm-4.27 1.122a4.109 4.109 0 1 0 0 8.217 4.109 4.109 0 0 0 0-8.217zm0 1.441a2.667 2.667 0 1 1 0 5.334 2.667 2.667 0 0 1 0-5.334z",
  },
  linkedin: {
    name: "Linkedin",
    viewBox: "-53.76 -54.54 555.54 556.39",
    path: "M100.28 448H7.4V148.9h92.88zm-46.44-341c-29.71 0-53.84-24.13-53.84-53.84a53.84 53.84 0 1 1 107.68 0c0 29.71-24.13 53.84-53.84 53.84zM447.9 448h-92.68V302.4c0-34.7-.7-79.3-48.3-79.3-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z",
  },
  youtube: {
    name: "Youtube",
    viewBox: "-2.88 1.52 29.76 20.97",
    size: "h-[17.36px]",
    nudgeY: "translate-y-[1.5px]",
    padX: "px-0",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z",
  },
  tiktok: {
    name: "Tiktok",
    viewBox: "2.28 0.84 19.44 22.32",
    path: "M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z",
  },
} as const;

export default function Footer({ logoOnWhite }: { logoOnWhite: string | null }) {
  const pathname = usePathname();
  const isHome = isHomePath(pathname);
  const data = useContentData();
  const [logoBroken, setLogoBroken] = useState(false);
  const locale = useLocale();
  // Fallback về label bundle lúc build — hiện ngay, content.json ghi đè khi về.
  const footer =
    data?.common.labels["footer"] ?? bundledLabels(locale, "footer");
  const support =
    data?.common.labels["support"] ?? bundledLabels(locale, "support");
  const socialLinks = data
    ? (Object.keys(SOCIAL_ICONS) as (keyof typeof SOCIAL_ICONS)[])
        .map((key) => ({ ...SOCIAL_ICONS[key], href: data.common.social[key] }))
        .filter((social): social is typeof social & { href: string } =>
          Boolean(social.href),
        )
    : [];

  return (
    <footer className="bg-surface text-gray-900">
      <div className="container-page py-8">
        <div className="mb-8">
          <Image
            src={logoBroken ? FALLBACK_LOGO : logoOnWhite || FALLBACK_LOGO}
            onError={() => setLogoBroken(true)}
            alt="Sun PhuQuoc Airways"
            width={185}
            height={43}
            className={`object-contain opacity-80 ${logoOnWhite && !logoBroken ? "" : "invert"}`}
          />
        </div>

        {/* Contact info — chỉ hiện ở các trang con, trang chủ đã có riêng */}
        {!isHome && data && support && (
          <div className="grid grid-cols-1 min-[510px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data.common.contacts).map(([key, value]) => {
              const isEmail = value.includes("@");
              const href = isEmail
                ? `mailto:${value}`
                : `tel:${value.replace(/[^+\d]/g, "")}`;
              return (
                <div key={key}>
                  <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                    {support[key]}
                  </p>
                  <a
                    href={href}
                    className="inline-flex items-center text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors"
                  >
                    {value}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        {/* Social links */}
        {socialLinks.length > 0 && (
          <div className="mt-8">
            <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
              {footer?.["connectWithUs"]}
            </p>
            <div className="flex items-center gap-3 -ml-1">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={social.name}
                  className={`flex items-center justify-center py-1 ${"padX" in social ? social.padX : "px-1"} text-gray-900 hover:text-amber-700 transition-colors`}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-auto ${"size" in social ? social.size : "h-[19.84px]"} ${"nudgeY" in social ? social.nudgeY : ""}`}
                    viewBox={social.viewBox}
                    fill="currentColor"
                    aria-hidden="true"
                  >
                    <path d={social.path} />
                  </svg>
                </a>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 pt-6 border-t border-black/10 flex flex-col items-start min-[400px]:flex-row min-[400px]:items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sun PhuQuoc Airways
          </p>
          <a
            href="https://www.sunphuquocairways.com"
            className="group relative inline-flex items-center gap-2 overflow-hidden bg-black/5 hover:bg-[#811721] transition-colors duration-300 text-gray-900 hover:text-gray-50 text-sm px-5 py-2 rounded-xl"
          >
            <span
              aria-hidden="true"
              className="pointer-events-none absolute -top-10 -right-8 h-32 w-32 rotate-[12deg] bg-contain bg-no-repeat opacity-0 mix-blend-soft-light transition-[transform,opacity] duration-300 ease-out
                        group-hover:rotate-[30deg] group-hover:opacity-100"
              style={{
                backgroundImage: `url(${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/images/ic_flower.png)`,
              }}
            />
            <span className="relative z-10">{footer?.["officialSite"]}</span>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="14"
              height="14"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="relative z-10 transition-transform duration-300 ease-out translate-y-[0.02rem] group-hover:translate-x-1.5"
            >
              <line x1="5" y1="12" x2="19" y2="12" />
              <polyline points="12 5 19 12 12 19" />
            </svg>
          </a>
        </div>
      </div>
    </footer>
  );
}
