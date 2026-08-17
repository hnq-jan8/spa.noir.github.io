"use client";

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
              className="bg-white rounded-2xl overflow-hidden"
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

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm text-center pt-3">
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.srtd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.srtd}</p>
                </div>
                <div className="flex flex-col justify-center">
                  <p className="text-xs text-gray-400 mb-1">{h.atd}</p>
                  <p className="text-lg font-bold text-gray-900">{row.atd}</p>
                </div>
              </div>

              <div className="mx-4 border-b pt-3 border-gray-200" />

              <div className="grid grid-cols-2 divide-x divide-gray-200 text-sm py-3 min-h-[74px]">
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

      {/* Desktop / tablet, single flight: rotated — one field per row instead
          of one column per field. An 8-column table for a single line of
          data is a header row looking for the rest of its rows; turning the
          columns into rows keeps it a plain <table> (no card chrome of its
          own — it sits directly in FlightInfoContent's card) while reading
          as a short fact list instead of a stretched-out grid. No/STT is
          dropped (it only ever numbered rows against each other); Flight No
          pairs with Route, and Type pairs with Capacity, on one row each. */}
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
                  {/* py-2, not py-3 like the other rows: the badge's own
                      py-1 already adds height on top of the shared 20px line
                      box, so matching the other rows' py-3 here would make
                      this row visibly taller than the rest. py-2 makes the
                      total (badge height + padding) come out equal.
                      Both spans share `leading-5` so their line boxes are the
                      same height despite the 14px/12px font-size difference —
                      centering two mismatched line-heights with items-center
                      (or aligning their baselines, which differ by font metric
                      even at matched line-height) is what read as "the badge
                      sits lower" before; equal line-height makes items-center
                      exact regardless of font metrics. */}
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
                  {h.type} / {h.capacity}
                </th>
                <td className="py-3 font-medium text-gray-900">
                  {rows[0].type} · {rows[0].capacity}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.srtd}
                </th>
                <td className="py-3 font-medium text-gray-900">
                  {rows[0].srtd}
                </td>
              </tr>
              <tr>
                <th
                  scope="row"
                  className="py-3 pr-8 font-medium text-gray-500 align-top whitespace-nowrap"
                >
                  {h.atd}
                </th>
                <td className="py-3 font-medium text-gray-900">
                  {rows[0].atd}
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
          {/* `clip` rather than `auto`: it is not a scrolling value, so this
              box never becomes a scroll container and the sticky header below
              keeps resolving against the viewport at every width. It still
              stops an unusually wide row from spilling outside the card. No
              height cap either, so the page is the only thing that scrolls
              vertically. */}
          <div className="overflow-x-clip px-6">
            {/* Tighter column gaps below lg (see pr-4) drop the natural width
                to ~591px, inside the ~672px available at 768px — that is what
                lets the table fit without a scroll container in the first
                place. */}
            <table className="w-full text-sm text-left whitespace-nowrap">
              {/* Offset by the fixed navbar (h-14 from md up, and the table
                  only renders from md), since the scrollport here is the
                  viewport. */}
              <thead className="sticky top-14 bg-white z-10">
                {/* The divider is an inset shadow on each th, not `border-b`
                    on the tr: under `border-collapse: collapse` a row border
                    is painted by the table grid, so it stays behind when the
                    thead sticks. A shadow is painted by the th itself and
                    travels. */}
                <tr>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb] text-center">
                    {h.no}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb]">
                    {h.type}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb]">
                    {h.capacity}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb]">
                    {h.flightNo}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb]">
                    {h.route}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb] text-center">
                    {h.srtd}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb] text-center">
                    {h.atd}
                  </th>
                  <th className="py-2 pr-4 lg:pr-8 font-bold text-gray-900 shadow-[inset_0_-1px_0_#e5e7eb]">
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
                      {row.type}
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 text-gray-600">
                      {row.capacity}
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
                    <td className="py-3 pr-4 lg:pr-8 text-gray-600 text-center">
                      {row.srtd}
                    </td>
                    <td className="py-3 pr-4 lg:pr-8 text-gray-600 text-center">
                      {row.atd}
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
