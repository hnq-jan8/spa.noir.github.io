"use client";

import Image from "next/image";
import { usePathname } from "next/navigation";
import { useContentData } from "@/hooks/useContentData";
import { routing } from "@/i18n/routing";

const homePathPattern = new RegExp(`^/(${routing.locales.join("|")})/?$`);

export default function Footer() {
  const pathname = usePathname();
  const isHome = homePathPattern.test(pathname);
  const data = useContentData();
  const footer = data?.common.labels["footer"];
  const support = data?.common.labels["support"];

  return (
    <footer className="bg-surface text-gray-900">
      <div className={`container-page ${isHome ? "py-8" : "pb-8 pt-10"}`}>
        <div className={isHome ? "mb-6" : "mb-8"}>
          <Image
            src={
              data?.common.logoOnWhite ||
              `${process.env.NEXT_PUBLIC_BASE_PATH ?? ""}/logo.png`
            }
            alt="Sun Phu Quoc Airways"
            width={180}
            height={60}
            className={`object-contain opacity-80 ${data?.common.logoOnWhite ? "" : "invert"}`}
          />
        </div>

        {/* Contact info — chỉ hiện ở các trang con, trang chủ đã có riêng */}
        {!isHome && data && support && (
          <div className="grid grid-cols-1 min-[510px]:grid-cols-2 lg:grid-cols-4 gap-6">
            {Object.entries(data.common.contacts).map(([key, value]) => (
              <div key={key}>
                <p className="text-xs text-gray-500 mb-1 uppercase tracking-wide">
                  {support[key]}
                </p>
                <p className="text-sm font-semibold text-gray-900">{value}</p>
              </div>
            ))}
          </div>
        )}

        <div
          className={`${
            isHome ? "mt-0" : "mt-10 pt-6 border-t border-black/10"
          } flex flex-col items-start min-[400px]:flex-row min-[400px]:items-center justify-between gap-4`}
        >
          <p className="text-xs text-gray-500">
            © {new Date().getFullYear()} Sun Phu Quoc Airways
          </p>
          <a
            href="https://www.sunphuquocairways.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-black/5 hover:bg-black/10 border border-black/15 transition-colors text-gray-900 text-sm px-5 py-2 rounded-xl shadow-sm"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
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
