"use client";

import { useId, useRef, useState, useSyncExternalStore } from "react";
import type {
  FarmerData,
  PaymentDetail,
  PaymentSheet,
  SupplyTicket,
} from "@/lib/parse";
import type { Lang } from "@/lib/client-api";
import { t, type LabelKey } from "@/lib/i18n";
import { CalendarSection } from "./calendar-grid";
import { TicketDialog, type TicketLine } from "./ticket-dialog";
import { SurveyTable } from "./survey-table";
import {
  Button,
  DataTable,
  DefList,
  EmptyState,
  IconBookmark,
  IconSwap,
  SectionTitle,
  StatusBadge,
  type Column,
} from "./ui";

type Pair = { en: string; hi: string };
const pick = (p: Pair, lang: Lang) =>
  (lang === "hi" ? p.hi || p.en : p.en || p.hi) || "—";
const dash = (s: string) => s || "—";
const num = (s: string) => {
  const n = Number(String(s).replace(/,/g, ""));
  return Number.isFinite(n) ? n : 0;
};
const money = new Intl.NumberFormat("en-IN", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

/* ---------------- tab ↔ URL hash (deep-linkable, SSR-safe) ---------------- */

const TABS = [
  { id: "overview", label: "tabOverview" },
  { id: "supply", label: "tabSupply" },
  { id: "payments", label: "tabPayments" },
  { id: "survey", label: "tabSurvey" },
  { id: "calendar", label: "tabCalendar" },
  { id: "more", label: "tabMore" },
] as const satisfies readonly { id: string; label: LabelKey }[];
type TabId = (typeof TABS)[number]["id"];

const HASH_EVENT = "caneup:hash";
const subscribeHash = (cb: () => void) => {
  window.addEventListener("hashchange", cb);
  window.addEventListener("popstate", cb);
  window.addEventListener(HASH_EVENT, cb);
  return () => {
    window.removeEventListener("hashchange", cb);
    window.removeEventListener("popstate", cb);
    window.removeEventListener(HASH_EVENT, cb);
  };
};
const readHash = () => window.location.hash.slice(1);

function useTab(): [TabId, (t: TabId) => void] {
  const hash = useSyncExternalStore(subscribeHash, readHash, () => "");
  const tab = (TABS.find((x) => x.id === hash)?.id ?? "overview") as TabId;
  const set = (next: TabId) => {
    window.history.replaceState(null, "", `#${next}`);
    window.dispatchEvent(new Event(HASH_EVENT));
  };
  return [tab, set];
}

/* ---------------- view ---------------- */

export function FarmerView({
  data,
  lang,
  saved,
  onToggleSave,
  onChange,
  codes,
}: {
  codes: { village: string; grower: string; ugc: string };
  data: FarmerData;
  lang: Lang;
  saved: boolean;
  onToggleSave: () => void;
  onChange: () => void;
}) {
  const [tab, setTab] = useTab();
  const baseId = useId();
  const tabRefs = useRef<Record<string, HTMLButtonElement | null>>({});
  const p = data.profile;

  function select(id: TabId) {
    setTab(id);
    tabRefs.current[id]?.scrollIntoView({ inline: "center", block: "nearest" });
  }
  function onTabKey(e: React.KeyboardEvent, i: number) {
    const dir =
      e.key === "ArrowRight"
        ? 1
        : e.key === "ArrowLeft"
          ? -1
          : e.key === "Home"
            ? -99
            : e.key === "End"
              ? 99
              : 0;
    if (!dir) return;
    e.preventDefault();
    const next =
      dir === -99
        ? 0
        : dir === 99
          ? TABS.length - 1
          : (i + dir + TABS.length) % TABS.length;
    select(TABS[next].id);
    tabRefs.current[TABS[next].id]?.focus();
  }

  return (
    <article
      aria-labelledby={`${baseId}-name`}
      className="overflow-hidden rounded-[18px] border border-line bg-surface shadow-sheet"
    >
      <header className="flex flex-wrap items-start justify-between gap-x-6 gap-y-4 p-5 sm:p-7">
        <div className="min-w-0">
          <h2
            id={`${baseId}-name`}
            className="break-words font-display text-2xl font-extrabold leading-tight sm:text-3xl"
          >
            {pick(p.farmerName, lang)}{" "}
            <span className="tabular font-bold text-muted">
              ({codes.grower})
            </span>
          </h2>
          <dl className="mt-2 space-y-0.5 text-muted">
            <div className="flex gap-2">
              <dt>{t("village", lang)}:</dt>
              <dd className="font-medium text-ink">
                {pick(p.village, lang)}{" "}
                <span className="tabular">({codes.village})</span>
              </dd>
            </div>
            <div className="flex gap-2">
              <dt>{t("factory", lang)}:</dt>
              <dd className="font-medium text-ink">{pick(p.factory, lang)}</dd>
            </div>
          </dl>
          {(data.updatedAt.date || data.updatedAt.time) && (
            <p className="mt-2 text-sm text-muted">
              {t("updated", lang)}:{" "}
              <span className="tabular">
                {data.updatedAt.date}&nbsp;{data.updatedAt.time}
              </span>
            </p>
          )}
        </div>
        <div className="no-print flex flex-wrap gap-2">
          <Button
            variant={saved ? "primary" : "secondary"}
            aria-pressed={saved}
            onClick={onToggleSave}
          >
            <IconBookmark filled={saved} />
            {saved ? t("saved", lang) : t("saveFarmer", lang)}
          </Button>
          <Button variant="secondary" onClick={onChange}>
            <IconSwap />
            {t("changeFarmer", lang)}
          </Button>
        </div>
      </header>

      <div
        role="tablist"
        aria-label={t("tabsLabel", lang)}
        className="no-print flex gap-1 overflow-x-auto overscroll-x-contain border-y border-line px-3 [scrollbar-width:none] sm:px-5 [&::-webkit-scrollbar]:hidden"
      >
        {TABS.map((tb, i) => {
          const on = tab === tb.id;
          return (
            <button
              key={tb.id}
              ref={(el) => {
                tabRefs.current[tb.id] = el;
              }}
              role="tab"
              type="button"
              id={`${baseId}-tab-${tb.id}`}
              aria-selected={on}
              aria-controls={`${baseId}-panel-${tb.id}`}
              tabIndex={on ? 0 : -1}
              onClick={() => select(tb.id)}
              onKeyDown={(e) => onTabKey(e, i)}
              className={`-mb-px min-h-12 shrink-0 border-b-[3px] px-4 text-base font-semibold transition-colors ${
                on
                  ? "border-brand text-brand"
                  : "border-transparent text-muted hover:text-ink"
              }`}
            >
              {t(tb.label, lang)}
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id={`${baseId}-panel-${tab}`}
        aria-labelledby={`${baseId}-tab-${tab}`}
        tabIndex={0}
        className="p-5 sm:p-7"
      >
        {tab === "overview" && (
          <Overview data={data} lang={lang} ugc={codes.ugc} />
        )}
        {tab === "supply" && <Supply data={data} lang={lang} codes={codes} />}
        {tab === "payments" && <Payments data={data} lang={lang} />}
        {tab === "survey" && <SurveyTable survey={data.survey} lang={lang} />}
        {tab === "calendar" && (
          <CalendarSection calendars={data.calendars} lang={lang} />
        )}
        {tab === "more" && <More data={data} lang={lang} />}
      </div>
    </article>
  );
}

/* ------------------------------ overview ------------------------------ */

function Overview({
  data,
  lang,
  ugc,
}: {
  data: FarmerData;
  lang: Lang;
  ugc: string;
}) {
  const p = data.profile;
  const unit = (u: LabelKey) => (
    <span className="ml-1.5 font-sans text-base font-medium text-muted">
      {t(u, lang)}
    </span>
  );
  return (
    <div className="space-y-8">
      <section
        aria-label={t("basicQuota", lang)}
        className="flex flex-wrap items-end gap-x-14 gap-y-6 rounded-[14px] bg-brand-soft p-5 sm:p-7"
      >
        <div>
          <p className="font-semibold text-muted">{t("basicQuota", lang)}</p>
          <p className="font-display text-5xl font-extrabold leading-tight tabular text-brand">
            {dash(p.basicQuota)}
            {p.basicQuota && unit("qtl")}
          </p>
        </div>
        <dl className="grid grid-cols-1 gap-x-10 gap-y-3 sm:grid-cols-3">
          {(
            [
              ["generalQuota", p.generalQuota, "qtl"],
              ["totalBonding", p.totalBonding, "qtl"],
              ["cultivable", p.cultivableLand, "ha"],
            ] as [LabelKey, string, LabelKey][]
          ).map(([k, v, u]) => (
            <div key={k}>
              <dt className="text-muted">{t(k, lang)}</dt>
              <dd className="font-display text-2xl font-bold tabular">
                {dash(v)}
                {v && unit(u)}
              </dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="grid gap-x-14 gap-y-8 md:grid-cols-2">
        <section>
          <SectionTitle>{t("aboutFarmer", lang)}</SectionTitle>
          <DefList
            items={[
              { label: t("father", lang), value: pick(p.fatherName, lang) },
              ...(ugc
                ? [
                    {
                      label: t("ugc", lang),
                      value: <span className="tabular">{ugc}</span>,
                    },
                  ]
                : []),
              { label: t("society", lang), value: pick(p.society, lang) },
              { label: t("centre", lang), value: pick(p.centre, lang) },
              { label: t("supplyMode", lang), value: pick(p.supplyMode, lang) },
            ]}
          />
        </section>
        <div className="space-y-8">
          <section>
            <SectionTitle>{t("bankContact", lang)}</SectionTitle>
            <DefList
              items={[
                { label: t("bank", lang), value: pick(p.bank, lang) },
                {
                  label: t("account", lang),
                  value: (
                    <span className="tabular" translate="no">
                      {dash(p.accountMasked)}
                    </span>
                  ),
                },
                {
                  label: t("mobile", lang),
                  value: (
                    <span className="tabular" translate="no">
                      {dash(p.mobileMasked)}
                    </span>
                  ),
                },
              ]}
            />
            <p className="mt-2 text-sm text-muted">{t("maskedNote", lang)}</p>
          </section>
          <section>
            <SectionTitle>{t("bondingTitle", lang)}</SectionTitle>
            <DefList
              items={[
                {
                  label: t("basicBonding", lang),
                  value: (
                    <span className="tabular">{dash(p.basicBonding)}</span>
                  ),
                },
                {
                  label: t("addBonding", lang),
                  value: (
                    <span className="tabular">{dash(p.additionalBonding)}</span>
                  ),
                },
                {
                  label: t("loanBonding", lang),
                  value: <span className="tabular">{dash(p.loanBonding)}</span>,
                },
                {
                  label: t("secondBonding", lang),
                  value: (
                    <span className="tabular">{dash(p.secondBonding)}</span>
                  ),
                },
              ]}
            />
          </section>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------ supply ------------------------------ */

const SPECIAL_KEY: Record<string, LabelKey> = {
  "0": "specGeneral",
  "1": "specAdjust",
  "5": "specAdjust",
  "2": "specBurnt",
  "3": "specCrop",
  "6": "specCancelled",
  "9": "specLoan",
};

const STATUS_KEY = {
  Weighed: "weighed",
  "Not weighed": "notWeighed",
  Cancelled: "cancelled",
  Unknown: "unknown",
} as const;

/** The same nine lines the Android app shows in its ticket popup. */
function ticketLines(
  r: SupplyTicket,
  lang: Lang,
  who: { name: string; village: string; grower: string },
): TicketLine[] {
  return [
    { label: t("growerName", lang), value: who.name },
    { label: t("growerCode", lang), value: `${who.village}/${who.grower}` },
    {
      label: `${t("ticketNumber", lang)} / ${t("purchyNo", lang)}`,
      value: dash(r.ticketNo),
    },
    {
      label: t("issuedType", lang),
      value: r.category ? t(r.category, lang) : "—",
    },
    { label: t("fortnight", lang), value: dash(r.fortnight) },
    { label: t("status", lang), value: t(STATUS_KEY[r.status], lang) },
    { label: t("issued", lang), value: dash(r.issueDate) },
    { label: t("dispatch", lang), value: dash(r.dispatchDate) },
    {
      label: t("specDesc", lang),
      value: SPECIAL_KEY[r.specialCode]
        ? t(SPECIAL_KEY[r.specialCode], lang)
        : "—",
    },
    { label: t("mode", lang), value: dash(lang === "hi" ? r.modeHi : r.mode) },
    {
      label: t("calKind", lang),
      value: t(r.calendar === "normal" ? "calNormal" : "calAdditional", lang),
    },
  ];
}

function Supply({
  data,
  lang,
  codes,
}: {
  data: FarmerData;
  lang: Lang;
  codes: { village: string; grower: string; ugc: string };
}) {
  const rows = data.supplyTickets;
  const [open, setOpen] = useState<SupplyTicket | null>(null);
  const who = {
    name: pick(data.profile.farmerName, lang),
    village: codes.village,
    grower: codes.grower,
  };
  if (!rows.length)
    return (
      <div className="space-y-4">
        <EmptyState>{t("noTickets", lang)}</EmptyState>
      </div>
    );

  const columns: Column<SupplyTicket>[] = [
    {
      id: "ticket",
      header: t("ticket", lang),
      cell: (r) => (
        <button
          type="button"
          onClick={() => setOpen(r)}
          aria-haspopup="dialog"
          aria-label={t("viewTicket", lang, { no: r.ticketNo })}
          className="tabular -my-2 inline-block py-2 font-semibold text-brand underline decoration-2 underline-offset-4"
        >
          {dash(r.ticketNo)}
        </button>
      ),
      lead: true,
    },
    {
      id: "issued",
      header: t("issued", lang),
      cell: (r) => <span className="tabular">{dash(r.issueDate)}</span>,
    },
    {
      id: "dispatch",
      header: t("dispatch", lang),
      cell: (r) => <span className="tabular">{dash(r.dispatchDate)}</span>,
    },
    {
      id: "status",
      header: t("status", lang),
      cell: (r) =>
        r.status === "Weighed" ? (
          <StatusBadge tone="good">{t("weighed", lang)}</StatusBadge>
        ) : r.status === "Not weighed" ? (
          <StatusBadge tone="wait">{t("notWeighed", lang)}</StatusBadge>
        ) : r.status === "Cancelled" ? (
          <StatusBadge tone="bad">{t("cancelled", lang)}</StatusBadge>
        ) : (
          <StatusBadge tone="neutral">{t("unknown", lang)}</StatusBadge>
        ),
    },
    {
      id: "type",
      header: t("type", lang),
      cell: (r) =>
        SPECIAL_KEY[r.specialCode] ? t(SPECIAL_KEY[r.specialCode], lang) : "—",
    },
    {
      id: "mode",
      header: t("mode", lang),
      cell: (r) => dash(lang === "hi" ? r.modeHi : r.mode),
    },
  ];

  return (
    <div className="space-y-4">
      <DataTable caption={t("tabSupply", lang)} columns={columns} rows={rows} />
      {open && (
        <TicketDialog
          title={t("ticketDetails", lang)}
          lines={ticketLines(open, lang, who)}
          lang={lang}
          onClose={() => setOpen(null)}
        />
      )}
      <details className="rounded-[12px] border border-line px-4 py-3 text-sm">
        <summary className="min-h-8 cursor-pointer font-semibold text-brand">
          {t("rawFields", lang)}
        </summary>
        <p className="mt-2 text-muted">{t("rawFieldsNote", lang)}</p>
        <pre
          className="mt-3 overflow-x-auto rounded-[10px] bg-surface-2 p-3 font-mono text-xs leading-relaxed"
          lang="en"
        >
          {rows
            .map(
              (r, i) =>
                `${i + 1}: ${r.fields.map((f, j) => `[${j}]${f}`).join("  ")}`,
            )
            .join("\n")}
        </pre>
      </details>
    </div>
  );
}

/* ------------------------------ payments ------------------------------ */

function Payments({ data, lang }: { data: FarmerData; lang: Lang }) {
  const { rows: sheets, total } = data.paymentSheets;
  const details = data.paymentDetails.rows;
  if (!sheets.length && !details.length)
    return <EmptyState>{t("noPayments", lang)}</EmptyState>;

  const sum = (k: "netWeight" | "purchyAmount" | "loanAmount" | "paidAmount") =>
    money.format(details.reduce((a, r) => a + num(r[k]), 0));

  const sheetCols: Column<PaymentSheet>[] = [
    {
      id: "no",
      header: t("sheetNo", lang),
      cell: (r) => <span className="tabular">{dash(r.sheetNo)}</span>,
      lead: true,
    },
    {
      id: "date",
      header: t("date", lang),
      cell: (r) => <span className="tabular">{dash(r.date)}</span>,
    },
    {
      id: "amount",
      header: t("amountRs", lang),
      cell: (r) => dash(r.amount),
      numeric: true,
    },
  ];
  const detailCols: Column<PaymentDetail>[] = [
    {
      id: "no",
      header: t("purchyNo", lang),
      cell: (r) => <span className="tabular">{dash(r.purchyNo)}</span>,
      lead: true,
    },
    {
      id: "date",
      header: t("date", lang),
      cell: (r) => <span className="tabular">{dash(r.date)}</span>,
    },
    {
      id: "wt",
      header: t("netWt", lang),
      cell: (r) => dash(r.netWeight),
      numeric: true,
    },
    {
      id: "amount",
      header: t("amountRs", lang),
      cell: (r) => dash(r.purchyAmount),
      numeric: true,
    },
    {
      id: "loan",
      header: t("loanRs", lang),
      cell: (r) => dash(r.loanAmount),
      numeric: true,
    },
    {
      id: "paid",
      header: t("paidRs", lang),
      cell: (r) => dash(r.paidAmount),
      numeric: true,
    },
  ];

  return (
    <div className="space-y-10">
      {sheets.length > 0 && (
        <section>
          <SectionTitle>{t("paymentSheets", lang)}</SectionTitle>
          <DataTable
            caption={t("paymentSheets", lang)}
            columns={sheetCols}
            rows={sheets}
            footer={
              total
                ? { label: t("total", lang), values: { amount: total } }
                : undefined
            }
          />
        </section>
      )}
      {details.length > 0 && (
        <section>
          <SectionTitle>{t("paymentDetails", lang)}</SectionTitle>
          <DataTable
            caption={t("paymentDetails", lang)}
            columns={detailCols}
            rows={details}
            footer={{
              label: t("total", lang),
              values: {
                wt: sum("netWeight"),
                amount: sum("purchyAmount"),
                loan: sum("loanAmount"),
                paid: sum("paidAmount"),
              },
            }}
          />
        </section>
      )}
    </div>
  );
}

/* ------------------------------ everything else ------------------------------ */

const RAW_LABEL: Record<string, LabelKey> = {
  survey: "secSurvey",
  calendar: "secCalendar",
  advanceCalendar: "secAdvance",
  calendar1: "secCal1",
  calendar2: "secCal2",
  nextDue: "secNextDue",
  receipts: "secReceipts",
};
const SURVEY_KEYS = new Set(["survey"]);
const CALENDAR_KEYS = new Set([
  "calendar",
  "advanceCalendar",
  "calendar1",
  "calendar2",
]);

/** Make the server's delimiters readable without pretending to decode them. */
const readable = (s: string) =>
  s
    .replace(/@@@AKS|@@@@@|aks#stop|#-/g, "\n")
    .replace(/#/g, "   |   ")
    .trim();

function More({ data, lang }: { data: FarmerData; lang: Lang }) {
  // Survey & calendars have their own tabs; only fall back to raw text if they failed to decode.
  const surveyDecoded = data.survey.plots.length > 0;
  const calendarDecoded = data.calendars.some((c) => c.normal || c.additional);
  const entries = Object.entries(data.raw).filter(
    ([k, v]) =>
      v &&
      v !== "nodata" &&
      v !== "103" &&
      !(SURVEY_KEYS.has(k) && surveyDecoded) &&
      !(CALENDAR_KEYS.has(k) && calendarDecoded),
  );
  if (!entries.length) return <EmptyState>{t("moreEmpty", lang)}</EmptyState>;
  return (
    <div className="space-y-4">
      <p className="rounded-[12px] bg-gud-soft px-4 py-3 text-gud">
        {t("moreNote", lang)}
      </p>
      {entries.map(([key, value]) => (
        <details key={key} className="rounded-[12px] border border-line">
          <summary className="min-h-12 cursor-pointer px-4 py-3 font-semibold">
            {RAW_LABEL[key] ? t(RAW_LABEL[key], lang) : key}
          </summary>
          <pre
            lang="en"
            className="max-h-96 overflow-auto whitespace-pre-wrap break-words border-t border-line p-4 font-mono text-xs leading-relaxed"
          >
            {readable(value)}
          </pre>
        </details>
      ))}
    </div>
  );
}
