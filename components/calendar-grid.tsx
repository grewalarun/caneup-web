"use client";

import { useState } from "react";
import type {
  Calendar,
  CalendarCell,
  CalendarGroup,
  CalendarKind,
  CalendarSet,
} from "@/lib/parse";
import type { Lang } from "@/lib/client-api";
import { t, type LabelKey } from "@/lib/i18n";
import { EmptyState, Segmented } from "./ui";

const KIND_BG: Record<CalendarKind, string> = {
  early: "bg-cal-early",
  general: "bg-cal-general",
  rejected: "bg-cal-rejected",
};
const DAY_HEADERS = Array.from({ length: 15 }, (_, i) =>
  String(i + 1).padStart(2, "0"),
);

function cellBg(c: CalendarCell, kind: CalendarKind) {
  if (c.flag === "delivered") return "bg-cal-delivered";
  if (c.flag === "overweight") return "bg-cal-overweight";
  return KIND_BG[kind];
}

/** Marker glyphs so a flagged slot is identifiable without relying on colour. */
function Cell({ c, lang }: { c: CalendarCell; lang: Lang }) {
  if (!c.text) return null;
  return (
    <span className="inline-flex items-baseline justify-end gap-0.5">
      {c.flag === "delivered" && (
        <>
          <span aria-hidden className="text-[0.7em] font-bold">
            ✓
          </span>
          <span className="sr-only">{t("supplied", lang)}:</span>
        </>
      )}
      {c.flag === "overweight" && (
        <>
          <span aria-hidden className="text-[0.6em] font-bold">
            ▲
          </span>
          <span className="sr-only">{t("overweight", lang)}:</span>
        </>
      )}
      {c.text}
    </span>
  );
}

/** The pakhwara (fortnight) grid: 15 day columns, early/general/rejected rows, fortnight totals. */
export function CalendarGrid({
  calendar,
  lang,
}: {
  calendar: Calendar;
  lang: Lang;
}) {
  const { totals } = calendar;
  const head =
    "border border-cal-line/40 bg-cal-head px-2 py-2.5 text-left text-base font-bold text-cal-head-ink";
  const cell =
    "border border-cal-line/40 px-2 py-2.5 text-right text-lg tabular";

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-3">
        {(["early", "general", "rejected"] as const).map((k) => (
          <div
            key={k}
            className={`flex items-baseline justify-between rounded-[12px] px-4 py-3.5 ${KIND_BG[k]}`}
          >
            <span className="font-semibold">
              {k === "early" ? t("earlyVariety", lang) : t(k, lang)}
            </span>
            <span className="font-display text-3xl font-extrabold tabular">
              {totals[k]}
            </span>
          </div>
        ))}
      </div>

      <ul className="flex flex-wrap gap-x-6 gap-y-1.5 text-sm text-muted">
        {(
          [
            ["total", totals.all, null],
            ["supplied", totals.delivered, "✓"],
            ["overweight", totals.overweight, "▲"],
            ["remaining", totals.remaining, null],
          ] as [LabelKey, number, string | null][]
        ).map(([k, n, mark]) => (
          <li key={k} className="inline-flex items-center gap-2">
            {mark && (
              <span
                aria-hidden
                className={`grid size-5 place-items-center rounded-[4px] border border-cal-line/40 text-[0.65rem] font-bold text-ink ${
                  k === "supplied" ? "bg-cal-delivered" : "bg-cal-overweight"
                }`}
              >
                {mark}
              </span>
            )}
            <span>
              {t(k, lang)}: <strong className="tabular text-ink">{n}</strong>
            </span>
          </li>
        ))}
      </ul>

      <p className="text-sm text-muted">{t("calendarHelp", lang)}</p>

      <div
        className="overflow-x-auto overscroll-x-contain rounded-[12px] border border-cal-line/40"
        tabIndex={0}
        role="region"
        aria-label={t("calendar", lang)}
      >
        <table className="w-full min-w-[900px] border-collapse">
          <caption className="sr-only">
            {t("fortnight", lang)}: {t("early", lang)}, {t("general", lang)},{" "}
            {t("rejected", lang)}
          </caption>
          <thead>
            <tr>
              <th
                scope="col"
                className={`${head} sticky left-0 z-10 w-12 min-w-12 px-1 text-center sm:w-16 sm:min-w-16 sm:px-2 sm:text-left`}
              >
                <span className="sm:hidden">{t("fortnightShort", lang)}</span>
                <span className="hidden sm:inline">{t("fortnight", lang)}</span>
              </th>
              <th
                scope="col"
                className={`${head} sticky left-12 z-10 w-[4.75rem] min-w-[4.75rem] px-1 sm:left-16 sm:w-28 sm:min-w-28 sm:px-2`}
              >
                {t("type", lang)}
              </th>
              {DAY_HEADERS.map((d) => (
                <th
                  key={d}
                  scope="col"
                  className={`${head} text-right tabular`}
                >
                  {d}
                </th>
              ))}
              <th
                scope="col"
                className={`${head} whitespace-nowrap text-right`}
              >
                {t("fortnightTotal", lang)}
              </th>
            </tr>
          </thead>
          <tbody>
            {calendar.pakhwaras.map((p, pi) =>
              p.rows.map((row, ri) => (
                <tr key={`${pi}-${ri}`}>
                  {ri === 0 && (
                    <th
                      scope="rowgroup"
                      rowSpan={p.rows.length}
                      className="sticky left-0 z-10 w-12 min-w-12 border border-cal-line/40 bg-surface text-center font-display text-xl font-bold tabular sm:w-16 sm:min-w-16"
                    >
                      {p.no}
                    </th>
                  )}
                  <th
                    scope="row"
                    className={`sticky left-12 z-10 w-[4.75rem] min-w-[4.75rem] whitespace-nowrap border border-cal-line/40 px-1 py-2.5 text-center text-sm font-semibold sm:left-16 sm:w-28 sm:min-w-28 sm:px-2 sm:text-base ${KIND_BG[row.kind]}`}
                  >
                    {t(row.kind, lang)}
                  </th>
                  {row.cells.map((c, ci) => (
                    <td key={ci} className={`${cell} ${cellBg(c, row.kind)}`}>
                      <Cell c={c} lang={lang} />
                    </td>
                  ))}
                  <td className={`${cell} font-bold ${KIND_BG[row.kind]}`}>
                    {row.total}
                  </td>
                </tr>
              )),
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

const GROUPS: CalendarGroup[] = ["all", "basic", "extra"];

/** Calendar tab: pick quota group (factories 22/33 only) and normal vs additional (satta) calendar. */
export function CalendarSection({
  calendars,
  lang,
}: {
  calendars: CalendarSet[];
  lang: Lang;
}) {
  const groups = GROUPS.filter((g) => calendars.some((c) => c.group === g));
  const [group, setGroup] = useState<CalendarGroup>("all");
  const [kind, setKind] = useState<"normal" | "additional">("normal");

  const set = calendars.find((c) => c.group === group) ?? calendars[0];
  const calendar = set?.[kind] ?? null;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        {groups.length > 1 && (
          <Segmented
            label={t("quotaGroup", lang)}
            value={group}
            onChange={setGroup}
            options={groups.map((g) => ({ value: g, label: t(g, lang) }))}
          />
        )}
        <Segmented
          label={t("calendarType", lang)}
          value={kind}
          onChange={setKind}
          options={[
            { value: "normal", label: t("calendar", lang) },
            { value: "additional", label: t("additional", lang) },
          ]}
        />
      </div>
      {calendar ? (
        <CalendarGrid calendar={calendar} lang={lang} />
      ) : (
        <EmptyState>{t("noCalendar", lang)}</EmptyState>
      )}
    </div>
  );
}
