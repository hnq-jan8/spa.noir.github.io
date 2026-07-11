"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { routing } from "@/i18n/routing";

const homePathPattern = new RegExp(`^/(${routing.locales.join("|")})/?$`);

const SOCIAL_ICONS = {
  facebook: {
    name: "Facebook",
    viewBox: "0 0 320 512",
    size: "h-3.5",
    path: "M279.14 288l14.22-92.66h-88.91v-60.13c0-25.35 12.42-50.06 52.24-50.06h40.42V6.26S260.43 0 225.36 0c-73.22 0-121.08 44.38-121.08 124.72v70.62H22.89V288h81.39v224h100.17V288z",
  },
  instagram: {
    name: "Instagram",
    path: "M12 2c2.717 0 3.056.01 4.122.06 1.065.05 1.79.217 2.428.465.66.256 1.216.6 1.772 1.153a4.908 4.908 0 0 1 1.153 1.772c.248.637.415 1.363.465 2.428.05 1.066.06 1.405.06 4.122s-.01 3.056-.06 4.122c-.05 1.065-.217 1.79-.465 2.428a4.908 4.908 0 0 1-1.153 1.772 4.908 4.908 0 0 1-1.772 1.153c-.637.248-1.363.415-2.428.465-1.066.05-1.405.06-4.122.06s-3.056-.01-4.122-.06c-1.065-.05-1.79-.217-2.428-.465a4.908 4.908 0 0 1-1.772-1.153 4.908 4.908 0 0 1-1.153-1.772c-.248-.637-.415-1.363-.465-2.428C2.01 15.056 2 14.717 2 12s.01-3.056.06-4.122c.05-1.065.217-1.79.465-2.428a4.908 4.908 0 0 1 1.153-1.772A4.908 4.908 0 0 1 5.45 2.525c.637-.248 1.363-.415 2.428-.465C8.944 2.01 9.283 2 12 2Zm0 1.802c-2.67 0-2.986.01-4.04.059-.976.045-1.505.207-1.858.344-.467.182-.8.4-1.15.75-.35.35-.567.683-.75 1.15-.137.353-.3.882-.344 1.858-.05 1.054-.059 1.37-.059 4.04s.01 2.986.059 4.04c.045.976.207 1.505.344 1.858.182.467.4.8.75 1.15.35.35.683.567 1.15.75.353.137.882.3 1.858.344 1.053.05 1.37.059 4.04.059s2.987-.01 4.04-.059c.976-.045 1.506-.207 1.858-.344.467-.182.8-.4 1.15-.75.35-.35.568-.683.75-1.15.138-.353.3-.882.344-1.858.05-1.054.06-1.37.06-4.04s-.01-2.986-.06-4.04c-.045-.976-.206-1.505-.344-1.858a3.09 3.09 0 0 0-.75-1.15 3.09 3.09 0 0 0-1.15-.75c-.352-.137-.882-.3-1.858-.344-1.053-.05-1.37-.059-4.04-.059Zm0 3.064a5.134 5.134 0 1 1 0 10.268 5.134 5.134 0 0 1 0-10.268Zm0 1.802a3.332 3.332 0 1 0 0 6.664 3.332 3.332 0 0 0 0-6.664Zm5.338-1.965a1.2 1.2 0 1 1-2.4 0 1.2 1.2 0 0 1 2.4 0Z",
  },
  linkedin: {
    name: "Linkedin",
    viewBox: "0 0 448 512",
    path: "M100.28 448H7.4V148.9h92.88zm-46.44-341c-29.71 0-53.84-24.13-53.84-53.84a53.84 53.84 0 1 1 107.68 0c0 29.71-24.13 53.84-53.84 53.84zM447.9 448h-92.68V302.4c0-34.7-.7-79.3-48.3-79.3-48.3 0-55.7 37.7-55.7 76.7V448h-92.8V148.9h89.1v40.8h1.3c12.4-23.5 42.7-48.3 87.9-48.3 94 0 111.3 61.9 111.3 142.3V448z",
  },
  youtube: {
    name: "Youtube",
    path: "M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814ZM9.545 15.568V8.432L15.818 12l-6.273 3.568Z",
  },
  tiktok: {
    name: "Tiktok",
    size: "h-[18px]",
    path: "M16.6 5.82s.51.5 0 0A4.278 4.278 0 0 1 15.54 3h-3.09v12.4a2.592 2.592 0 0 1-2.59 2.5c-1.42 0-2.6-1.16-2.6-2.6 0-1.72 1.66-3.01 3.37-2.48V9.66c-3.45-.46-6.47 2.22-6.47 5.64 0 3.33 2.76 5.7 5.69 5.7 3.14 0 5.69-2.55 5.69-5.7V9.01a7.35 7.35 0 0 0 4.3 1.38V7.3s-1.88.09-3.24-1.48Z",
  },
} as const;

export default function Footer() {
  const pathname = usePathname();
  const isHome = homePathPattern.test(pathname);
  const data = useContentData();
  const footer = data?.common.labels["footer"];
  const support = data?.common.labels["support"];
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
            src={
              data?.common.logoOnWhite ||
              `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`
            }
            alt="Sun PhuQuoc Airways"
            width={180}
            height={60}
            className={`object-contain opacity-80 ${data?.common.logoOnWhite ? "" : "invert"}`}
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
                    className="text-sm font-semibold text-gray-900 hover:text-amber-700 transition-colors"
                  >
                    {value}
                  </a>
                </div>
              );
            })}
          </div>
        )}

        <div className="mt-8">
          <p className="text-xs text-gray-500 mb-3 uppercase tracking-wide">
            {footer?.["connectWithUs"]}
          </p>
          <div className="flex items-center gap-2">
            {socialLinks.map((social) => (
              <a
                key={social.name}
                href={social.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={social.name}
                className="flex h-8 w-8 items-center justify-center rounded-full bg-black/5 text-gray-900 hover:bg-black/10 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className={`w-auto ${"size" in social ? social.size : "h-4"}`}
                  viewBox={"viewBox" in social ? social.viewBox : "0 0 24 24"}
                  fill="currentColor"
                  aria-hidden="true"
                >
                  <path d={social.path} />
                </svg>
              </a>
            ))}
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-black/10 flex flex-col items-start min-[400px]:flex-row min-[400px]:items-center justify-between gap-4">
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sun PhuQuoc Airways
          </p>
          <a
            href="https://www.sunphuquocairways.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 transition-colors text-gray-900 text-sm px-5 py-2 rounded-xl"
          >
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
            >
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
              <polyline points="15 3 21 3 21 9" />
              <line x1="10" y1="14" x2="21" y2="3" />
            </svg>
            {footer?.["officialSite"]}
          </a>
        </div>
      </div>
    </footer>
  );
}
