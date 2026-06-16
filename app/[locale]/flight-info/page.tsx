import { useTranslations } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import FlightTable from "@/components/FlightTable";

export default function FlightInfo({ params }: { params: { locale: string } }) {
  setRequestLocale(params.locale);
  const t = useTranslations("flightInfo");

  const rows = [
    {
      no: 1,
      type: "Type 1",
      capacity: 50,
      flightNo: "123",
      route: "Route A",
      srtd: "08:00",
      atd: "08:15",
      note: "On Time",
    },
    {
      no: 2,
      type: "Type 2",
      capacity: 60,
      flightNo: "456",
      route: "Route B",
      srtd: "09:00",
      atd: "09:30",
      note: "Delayed",
    },
    {
      no: "–",
      type: "–",
      capacity: "–",
      flightNo: "–",
      route: "–",
      srtd: "–",
      atd: "–",
      note: "–",
    },
  ];

  return (
    <div className="container-page pt-16 pb-8 md:py-8">
      <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
        <FlightTable
          title={t("title")}
          rows={rows}
          headers={{
            no: t("no"),
            type: t("type"),
            capacity: t("capacity"),
            flightNo: t("flightNo"),
            route: t("route"),
            srtd: t("srtd"),
            atd: t("atd"),
            note: t("note"),
          }}
        />
        <div className="mt-10">
          <h2 className="section-title">{t("policy")}</h2>
          <p className="text-sm text-gray-700 leading-relaxed max-w-3xl">
            {t("policyContent")}
          </p>
        </div>
      </div>
    </div>
  );
}
