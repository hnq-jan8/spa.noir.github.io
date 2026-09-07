"use client";

import { ArrowRight, Plane } from "lucide-react";

import { formatFlightDate, TIME_ZONE_LABEL } from "@/lib/siteData";

export interface FlightRow {
  no: number | string;
  /** Date-only từ CMS ("2026-08-27"); hiển thị dạng ddMMM. */
  date: string | null;
  flightNo: string;
  departure: string;
  arrival: string;
  srtd: string;
  atd: string;
  note: string;
}

interface FlightHeaders {
  no: string;
  date: string;
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
  date: "Date",
  flightNo: "Flight No",
  route: "Route",
  srtd: "SRTD",
  atd: "ATD",
  note: "Note",
};

/** Nhãn dài hơn ngưỡng này (vd "Scheduled Time of Departure") không vừa một
 *  phần ba thẻ mobile: card đổi sang xếp dọc nhãn–giá trị. */
const STACK_LABEL_MAX_LENGTH = 12;

/** Giờ kèm múi giờ; `stack` đẩy múi giờ xuống dòng riêng để các giờ đậm
 *  thẳng cột. */
function TimeValue({
  value,
  stack,
  align = "center",
}: {
  value: string;
  stack?: boolean;
  align?: "center" | "end";
}) {
  if (!stack) {
    return (
      <span className="inline-flex items-baseline gap-1">
        <span className="font-medium text-gray-900">{value || "–"}</span>
        {value ? (
          <span className="text-[11px] font-normal text-gray-400">
            {TIME_ZONE_LABEL}
          </span>
        ) : null}
      </span>
    );
  }
  return (
    <span
      className={`inline-flex flex-col ${
        align === "end" ? "items-end" : "items-center"
      }`}
    >
      <span className="font-medium text-gray-900">{value || "–"}</span>
      <span
        className={`text-[11px] font-normal text-gray-400${value ? "" : " invisible"}`}
      >
        {TIME_ZONE_LABEL}
      </span>
    </span>
  );
}

export default function FlightTable({
  title = "Flight Information",
  rows,
  headers = defaultHeaders,
}: FlightTableProps) {
  const h = headers;
  const stackFields = [h.date, h.srtd, h.atd].some(
    (label) => (label?.length ?? 0) > STACK_LABEL_MAX_LENGTH,
  );

  return (
    <div>
      <h2 className="text-xl md:text-2xl font-bold mb-4">{title}</h2>

      {/* Mobile: stacked cards, one card per flight; 2 cards per row when wide enough */}
      <div className="md:hidden grid grid-cols-1 min-[570px]:grid-cols-2 gap-3">
        {rows.map((row, idx) => {
          return (
            <div
              key={idx}
              className="bg-white rounded-2xl overflow-hidden card-shadow"
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

                <div className="flex gap-3 max-w-xs px-4 py-3 mx-auto items-center justify-center">
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

              {stackFields ? (
                /* Nhãn dài: mỗi trường một dòng, nhãn trái – giá trị phải. */
                <div className="divide-y divide-gray-100 border-t border-gray-100 mt-4 text-sm">
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <p className="text-xs text-gray-500">{h.date}</p>
                    <p className="font-medium text-gray-900">
                      {formatFlightDate(row.date) || "–"}
                    </p>
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <p className="text-xs text-gray-500">{h.srtd}</p>
                    <TimeValue value={row.srtd} stack align="end" />
                  </div>
                  <div className="flex items-center justify-between gap-4 px-4 py-2.5">
                    <p className="text-xs text-gray-500">{h.atd}</p>
                    <TimeValue value={row.atd} stack align="end" />
                  </div>
                </div>
              ) : (
                /* Date joins the two times as even thirds — one date and two
                    times balance in a way the old type/capacity pair needed its
                    own row and second divider for. */
                <div className="grid grid-cols-3 divide-x divide-gray-200 text-sm text-center pt-4 pb-3">
                  {/* Nhãn ở trên cùng để ba nhãn thẳng hàng; giá trị chiếm
                      phần còn lại và canh giữa. */}
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 mb-1">{h.date}</p>
                    {/* -3px: canh giữa hình học thì ngày trông trũng xuống. */}
                    <div className="flex-1 flex items-center justify-center -translate-y-[3px]">
                      <span className="font-medium text-gray-900">
                        {formatFlightDate(row.date) || "–"}
                      </span>
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 mb-1">{h.srtd}</p>
                    <div className="flex-1 flex items-center justify-center">
                      <TimeValue value={row.srtd} stack />
                    </div>
                  </div>
                  <div className="flex flex-col">
                    <p className="text-xs text-gray-500 mb-1">{h.atd}</p>
                    <div className="flex-1 flex items-center justify-center">
                      <TimeValue value={row.atd} stack />
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Single flight, md+: rotated to one field per row — an 8-column table
          for one line of data reads as a header looking for its rows. No/STT is
          dropped, since it only numbered rows against each other. */}
      {rows.length === 1 ? (
        <div className="hidden md:block">
          <table className="w-full max-w-2xl text-sm text-left">
            <tbody className="divide-y divide-gray-100">
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.flightNo}
                </th>
                <td className="py-2">
                  {/* py-2, not py-3: the badge's own py-1 already adds height,
                      so this row would end up taller than the others. Both spans
                      share `leading-5` so their line boxes match despite the
                      font-size difference — otherwise items-center reads as the
                      badge sitting low. */}
                  <span className="inline-flex items-center gap-3">
                    <span className="font-medium text-gray-900 leading-5">
                      {rows[0].flightNo}
                    </span>
                    <span className="inline-flex items-center gap-2 text-xs leading-5 bg-gray-100 px-2 py-1 rounded">
                      <span className="font-semibold text-gray-700">
                        {rows[0].departure}
                      </span>
                      <ArrowRight className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span className="font-semibold text-gray-700">
                        {rows[0].arrival}
                      </span>
                    </span>
                  </span>
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.date}
                </th>
                <td className="py-3 font-medium text-gray-900">
                  {formatFlightDate(rows[0].date) || "–"}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.srtd}
                </th>
                <td className="py-3">
                  <TimeValue value={rows[0].srtd} />
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.atd}
                </th>
                <td className="py-3">
                  <TimeValue value={rows[0].atd} />
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.note}
                </th>
                <td className="py-3">
                  <span className="text-xs bg-gray-100 px-2 py-1 rounded">
                    {rows[0].note}
                  </span>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      ) : (
        <div className="hidden md:block -mx-6">
          {/* `clip`, not `auto`: it never becomes a scroll container, so the
              sticky header below keeps resolving against the viewport while a
              too-wide row still can't spill out of the card. */}
          <div className="overflow-x-clip px-6">
            {/* Tighter gaps below lg (pr-4) keep the natural width inside the
                space available at 768px, so no scroll container is needed; hai
                tiêu đề giờ được xuống dòng (whitespace-normal) cũng vì vậy. */}
            <table className="w-full text-sm text-left whitespace-nowrap">
              {/* Offset by the fixed navbar (h-14 from md up, and the table
                  only renders from md), since the scrollport here is the
                  viewport. */}
              <thead className="sticky top-14 bg-white z-10">
                {/* Inset shadow, not `border-b`: under border-collapse a row
                    border is painted by the table grid and stays behind when
                    the thead sticks. A shadow travels with the th. */}
                <tr>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5] text-center">
                    {h.no}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5]">
                    {h.date}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5]">
                    {h.flightNo}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5]">
                    {h.route}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5] text-center whitespace-normal">
                    {h.srtd}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5] text-center whitespace-normal">
                    {h.atd}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e5e5]">
                    {h.note}
                  </th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr key={idx} className="border-b border-gray-100">
                    <td className="py-3 pr-4 lg:pr-8 text-gray-600 text-center">
                      {row.no}
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 text-gray-600">
                      {formatFlightDate(row.date) || "–"}
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 font-semibold text-gray-700">
                      {row.flightNo}
                    </td>
                    <td className="py-3 pr-4 lg:pr-8">
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
                    <td className="py-3 pr-4 lg:pr-8 text-center">
                      <TimeValue value={row.srtd} />
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 text-center">
                      <TimeValue value={row.atd} />
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 text-gray-500">
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
      )}
    </div>
  );
}
