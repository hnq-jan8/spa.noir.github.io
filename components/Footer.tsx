"use client";
import { useTranslations } from "next-intl";

export default function Footer() {
  const t = useTranslations("footer");

  const columns = [
    { title: t("contact"), content: t("placeholder") },
    { title: t("office"), content: t("placeholder") },
    { title: t("agent"), content: t("placeholder") },
  ];

  return (
    <footer className="border-t border-gray-200 mt-16 py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-center">
          {columns.map((col) => (
            <div key={col.title}>
              <h3 className="text-xl font-bold mb-4">{col.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{col.content}</p>
            </div>
          ))}
        </div>
      </div>
    </footer>
  );
}
