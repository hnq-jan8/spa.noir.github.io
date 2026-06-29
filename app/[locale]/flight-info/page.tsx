import { getTranslations, setRequestLocale } from "next-intl/server";
import FlightTable from "@/components/FlightTable";
import { getFlights, getSiteConfig, t as tr } from "@/lib/directus";
import { getBuildMode } from "@/lib/buildMode";

function formatTime(time: string | null): string {
  if (!time) return "–";
  return time.slice(0, 5);
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "nav" });
  return { title: t("flightInfo") };
}

export default async function FlightInfo({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const { active } = await getBuildMode();
  if (!active) return null;

  const [t, flights, config] = await Promise.all([
    getTranslations({ locale, namespace: "flightInfo" }),
    getFlights(),
    getSiteConfig(),
  ]);

  const rows = flights.map((f, i) => ({
    no: i + 1,
    type: f.aircraft_type ?? "–",
    capacity: f.capacity ?? "–",
    flightNo: f.flight_no,
    departure: f.dep ?? "–",
    arrival: f.arr ?? "–",
    srtd: formatTime(f.srtd),
    atd: formatTime(f.atd),
    note: f.note ?? "–",
  }));

  const flightPolicy = tr(config, locale).flight_policy ?? "";

  return (
    <div className="container-page pt-4 pb-8 md:py-8">
      <div className="md:bg-white md:border md:border-gray-200 md:rounded-2xl md:shadow-sm md:p-6">
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
          <p className="text-sm text-gray-700 leading-relaxed max-w-3xl whitespace-pre-line">
            {flightPolicy}
          </p>
        </div>
      </div>
    </div>
  );
}
