import { Plane, Tag, Users } from "lucide-react";

export interface FlightRow {
  no: number | string;
  type: string;
  capacity: number | string;
  flightNo: string;
  route: string;
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
          const [origin, destination] = row.route
            .split("-")
            .map((part) => part.trim());

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

                {origin && destination ? (
                  <div className="flex items-center justify-between gap-3 pt-4 pb-6 mb-1 border-b border-gray-200">
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {origin}
                    </span>
                    <div className="flex-1 flex items-center gap-2">
                      <div className="flex-1 border-t border-dashed border-gray-300" />
                      <Plane
                        className="w-4 h-4 text-gray-400 flex-shrink-0 rotate-45"
                        strokeWidth={2}
                      />
                      <div className="flex-1 border-t border-dashed border-gray-300" />
                    </div>
                    <span className="text-2xl font-extrabold text-gray-900 tracking-tight">
                      {destination}
                    </span>
                  </div>
                ) : (
                  <p className="text-sm font-medium text-gray-700 py-4 mb-3 border-b-2 border-gray-200">
                    {row.route}
                  </p>
                )}
              </div>

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm text-center py-2">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.srtd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.srtd}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.atd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.atd}</p>
                </div>
              </div>

              <div className="mx-4 border-b border-gray-200" />

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm py-4">
                <div className="flex items-center justify-center gap-2">
                  <Tag
                    className="w-4 h-4 text-gray-400 flex-shrink-0"
                    strokeWidth={2}
                  />
                  <div>
                    <p className="text-gray-400 text-xs">{h.type}</p>
                    <p className="font-medium text-gray-700">{row.type}</p>
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
                    <p className="font-medium text-gray-700">{row.capacity}</p>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Desktop / tablet: table */}
      <div className="hidden md:block overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead>
            <tr className="border-b border-gray-200">
              {[
                h.no,
                h.type,
                h.capacity,
                h.flightNo,
                h.route,
                h.srtd,
                h.atd,
                h.note,
              ].map((label) => (
                <th key={label} className="py-2 pr-8 font-bold text-gray-900">
                  {label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} className="border-b border-gray-100">
                <td className="py-3 pr-8 text-gray-600">{row.no}</td>
                <td className="py-3 pr-8 text-gray-600">{row.type}</td>
                <td className="py-3 pr-8 text-gray-600">{row.capacity}</td>
                <td className="py-3 pr-8 text-gray-600">{row.flightNo}</td>
                <td className="py-3 pr-8 text-gray-600">{row.route}</td>
                <td className="py-3 pr-8 text-gray-600">{row.srtd}</td>
                <td className="py-3 pr-8 text-gray-600">{row.atd}</td>
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
