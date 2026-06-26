import { ArrowRight, Plane, Tag, Users } from "lucide-react";

export interface FlightRow {
  no: number | string;
  type: string;
  capacity: number | string;
  flightNo: string;
  departure: string;
  arrival: string;
  srtd: string;
  atd: string;
  note: string;
}

interface FlightHeaders {
  no: string;
  type: string;
  capacity: string;
  flightNo: string;
  route: string;
  srtd: string;
  atd: string;
  note: string;
}

interface FlightTableProps {
  title?: string;
  rows: FlightRow[];
  headers?: FlightHeaders;
}

const defaultHeaders: FlightHeaders = {
  no: "No",
  type: "Type",
  capacity: "Capacity",
  flightNo: "Flight No",
  route: "Route",
  srtd: "SRTD",
  atd: "ATD",
  note: "Note",
};

export default function FlightTable({
  title = "Flight Information",
  rows,
  headers = defaultHeaders,
}: FlightTableProps) {
  const h = headers;

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      {/* Mobile: stacked cards, one card per flight; 2 cards per row when wide enough */}
      <div className="md:hidden grid grid-cols-1 min-[520px]:grid-cols-2 gap-3">
        {rows.map((row, idx) => {
          return (
            <div
              key={idx}
              className="border border-gray-200 rounded-2xl bg-white shadow-sm overflow-hidden"
            >
              <div className="px-4 pt-4">
                <div className="flex items-center justify-between mb-3">
                  <span className="flex items-center gap-1.5 font-semibold text-gray-900">
                    <Plane className="w-4 h-4 text-gray-400" strokeWidth={2} />
                    {row.flightNo}
                  </span>
                  <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                    {row.note}
                  </span>
                </div>

                <div className="flex gap-3 max-w-xs px-2 py-3 mx-auto items-center justify-center">
                  <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                    {row.departure}
                  </span>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                    <Plane
                      className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-45"
                      strokeWidth={2}
                    />
                    <div className="flex-1 border-t border-dashed border-gray-300" />
                  </div>
                  <span className="text-3xl font-semibold text-gray-900 tracking-tight">
                    {row.arrival}
                  </span>
                </div>
              </div>

              <div className="mx-4 border-b pt-4 border-gray-200" />

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm text-center pt-4">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.srtd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.srtd}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.atd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.atd}</p>
                </div>
              </div>

              <div className="mx-4 border-b pt-4 border-gray-200" />

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm py-4 min-h-[72px]">
                <div className="flex items-center justify-center gap-2">
                  <Tag
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-gray-400 text-xs">{h.type}</p>
                    <p className="font-medium text-gray-900">{row.type}</p>
                  </div>
                  <div className="w-3 flex-shrink-0" aria-hidden="true" />
                </div>
                <div className="flex items-center justify-center gap-2">
                  <Users
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-gray-400 text-xs">{h.capacity}</p>
                    <p className="font-medium text-gray-900">{row.capacity}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet: table */}
      <div className="hidden md:block -mx-6 overflow-x-auto max-h-[70vh] px-6">
        <table className="w-full min-w-[760px] text-sm text-left whitespace-nowrap">
          <thead className="sticky top-0 bg-white z-10">
            <tr className="border-b border-gray-200">
              <th className="py-2 pr-8 font-bold text-gray-900 text-center">
                {h.no}
              </th>
              <th className="py-2 pr-8 font-bold text-gray-900">{h.type}</th>
              <th className="py-2 pr-8 font-bold text-gray-900">
                {h.capacity}
              </th>
              <th className="py-2 pr-8 font-bold text-gray-900">
                {h.flightNo}
              </th>
              <th className="py-2 pr-8 font-bold text-gray-900">{h.route}</th>
              <th className="py-2 pr-8 font-bold text-gray-900 text-center">
                {h.srtd}
              </th>
              <th className="py-2 pr-8 font-bold text-gray-900 text-center">
                {h.atd}
              </th>
              <th className="py-2 pr-8 font-bold text-gray-900">{h.note}</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 pr-8 text-gray-600 text-center">
                  {row.no}
                </td>
                <td className="py-3 pr-8 text-gray-600">{row.type}</td>
                <td className="py-3 pr-8 text-gray-600">{row.capacity}</td>
                <td className="py-3 pr-8 font-semibold text-gray-700">
                  {row.flightNo}
                </td>
                <td className="py-3 pr-8">
                  <span className="inline-flex items-center gap-2 text-xs bg-gray-100 px-2 py-1 rounded">
                    <Plane
                      className="w-3.5 h-3.5 text-gray-400 flex-shrink-0"
                      strokeWidth={2}
                    />
                    <span className="font-semibold text-gray-700">
                      {row.departure}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span className="font-semibold text-gray-700">
                      {row.arrival}
                    </span>
                  </span>
                </td>
                <td className="py-3 pr-8 text-gray-600 text-center">
                  {row.srtd}
                </td>
                <td className="py-3 pr-8 text-gray-600 text-center">
                  {row.atd}
                </td>
                <td className="py-3 pr-8 text-gray-500">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {row.note}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
