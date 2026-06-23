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
      <div className="md:hidden grid grid-cols-1 min-[400px]:grid-cols-2 gap-3">
        {rows.map((row, idx) => (
          <div
            key={idx}
            className="border border-gray-200 rounded-2xl bg-white shadow-sm p-4"
          >
            <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-200">
              <span className="font-semibold text-gray-900">
                {row.flightNo}
              </span>
              <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded">
                {row.note}
              </span>
            </div>
            <dl className="space-y-1.5 text-sm">
              {[
                [h.type, row.type],
                [h.capacity, row.capacity],
                [h.srtd, row.srtd],
                [h.atd, row.atd],
                [h.route, row.route],
              ].map(([label, value]) => (
                <div key={label} className="flex items-center justify-between">
                  <dt className="text-gray-400">{label}</dt>
                  <dd className="text-gray-700 font-medium">{value}</dd>
                </div>
              ))}
            </dl>
          </div>
        ))}
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
