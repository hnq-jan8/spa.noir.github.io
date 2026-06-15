"use client";
import Image from "next/image";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");
  const ts = useTranslations("support");

  const contacts = [
    { label: ts("passengerHotline"), value: "0123 456 789" },
    { label: ts("familyHotline"), value: "0123 456 789" },
    { label: ts("supportEmail"), value: "loremipsum@gmail.com" },
    { label: ts("mediaContact"), value: "loremipsum@gmail.com" },
  ];

  return (
    <footer className="bg-[#707070] text-white mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* Logo */}
        <div className="mb-8">
          <Image
            src="/logo.png"
            alt="Sun Phu Quoc Airways"
            width={180}
            height={60}
            className="object-contain"
          />
        </div>

        {/* Contact info */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {contacts.map((card) => (
            <div key={card.label}>
              <p className="text-xs text-gray-300 mb-1 uppercase tracking-wide">
                {card.label}
              </p>
              <p className="text-sm font-semibold text-white">{card.value}</p>
            </div>
          ))}
        </div>

        {/* Bottom bar */}
        <div className="mt-10 pt-6 border-t border-white/20 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-gray-300">
            © {new Date().getFullYear()} Sun Phu Quoc Airways
          </p>
          <a
            href="https://www.sunphuquocairways.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 bg-[#AC1423] hover:bg-[#a2101f] transition-colors text-white text-sm font-semibold px-5 py-2.5 rounded-xl shadow-sm"
          >
            {t("officialSite")}
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
          </a>
        </div>
      </div>
    </footer>
  );
}
