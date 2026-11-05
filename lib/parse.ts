/**
 * Pure parsers for the Cane UP (e-Ganna) text formats.
 * Formats were derived from the Android app v6.3; fields marked "best effort"
 * are not fully confirmed — the raw fields are always returned alongside.
 */

export type Option = { code: string; name: string; extra?: string };

const clean = (s: string | undefined) => (s ?? "").trim();

/** `47 | Aligarh#62 | Ambedkar Nagar#` -> options */
export function parseCodeNameList(text: string): Option[] {
  return text
    .split("#")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => {
      const i = row.indexOf("|");
      return i < 0
        ? { code: row, name: row }
        : { code: clean(row.slice(0, i)), name: clean(row.slice(i + 1)) };
    })
    .filter((o) => o.code);
}

/** `2026-2027#` -> `{code:"2026", name:"2026-2027"}` */
export function parseSeasons(text: string): Option[] {
  return text
    .split("#")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((name) => ({ code: name.split("-")[0].trim(), name }));
}

/** `803| Bagpat!803| N|@@31-OCT-2030#` */
export function parseFactories(text: string): Option[] {
  return text
    .split("#")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => {
      const [main, expiry] = row.split("@@");
      const bar = main.indexOf("|");
      const bang = main.indexOf("!");
      const code = clean(main.slice(0, bar < 0 ? undefined : bar));
      const name = clean(main.slice(bar + 1, bang < 0 ? undefined : bang));
      return { code, name, extra: clean(expiry) || undefined };
    })
    .filter((o) => o.code);
}

export type Grower = {
  /** the code to send to the server */
  code: string;
  name: string;
  /** text after the code: relation marker + father/husband name */
  relation: string;
  raw: string;
};

/**
 * The server appends the UGC to the grower row as `274$32111747310113`. Only the part before the `$`
 * is the grower code; the UGC is shown on the Overview and never sent back to the server.
 */
export function splitGrowerCode(v: string): { code: string; ugc: string } {
  const [code = "", ugc = ""] = v.split("$");
  return { code: code.trim(), ugc: ugc.trim() };
}

/**
 * Same extraction the app does: the grower code is everything from the first
 * digit to the last digit of the row; the name is what precedes it (minus the
 * `$` separator) and the father/husband name is what follows it.
 */
export function parseGrowers(text: string): Grower[] {
  return text
    .split(/\s*#\s*/)
    .map((r) => r.trim())
    .filter(Boolean)
    .flatMap((raw) => {
      const first = raw.search(/\d/);
      if (first < 0) return [];
      let last = raw.length - 1;
      while (last >= 0 && !/\d/.test(raw[last])) last--;
      const code = raw.slice(first, last + 1);
      const name = raw
        .slice(0, Math.max(first - 1, 0))
        .replace(/\$/g, " ")
        .trim();
      const relation = raw
        .slice(last + 1)
        .split("$")
        .map((p) => p.trim())
        .filter(Boolean)
        .join(" ");
      return [{ code, name, relation, raw }];
    });
}

/* ------------------------------------------------------------------ */
/* FetchGrowerData5                                                    */
/* ------------------------------------------------------------------ */

export const SECTION_DELIMITER = "AKSAmity@@@@@@@@@@Software";

const mask = (v: string, keep = 4) =>
  !v || v === "0"
    ? ""
    : `${"•".repeat(Math.max(v.length - keep, 0))}${v.slice(-keep)}`;

/** Hide any 10-digit run (mobile numbers) except the last 4 digits. */
export const maskPhones = (t: string) =>
  t.replace(/(?<!\d)(\d{6})(\d{4})(?!\d)/g, "••••••$2");

export type Profile = {
  farmerName: { en: string; hi: string };
  fatherName: { en: string; hi: string };
  village: { en: string; hi: string };
  supplyMode: { en: string; hi: string };
  society: { en: string; hi: string };
  centre: { en: string; hi: string };
  bank: { en: string; hi: string };
  factory: { en: string; hi: string };
  modeWeight: string;
  generalQuota: string;
  basicQuota: string;
  basicBonding: string;
  additionalBonding: string;
  totalBonding: string;
  loanBonding: string;
  secondBonding: string;
  cultivableLand: string;
  accountMasked: string;
  mobileMasked: string;
};

export function parseProfile(section: string): Profile {
  const f = section
    .replace(/[\r\n]/g, "")
    .split("#")
    .map((s) => s.trim());
  const g = (i: number) => f[i] ?? "";
  const pair = (en: number, hi: number) => ({ en: g(en), hi: g(hi) });
  return {
    farmerName: pair(0, 2),
    village: pair(3, 5),
    supplyMode: pair(6, 8),
    fatherName: pair(10, 12),
    bank: pair(22, 24),
    // society/centre: index order is (HI, EN) / (HI, EN) in the app
    society: { en: g(29), hi: g(28) },
    centre: { en: g(33), hi: g(31) },
    factory: pair(39, 40),
    modeWeight: g(9),
    generalQuota: g(13),
    basicQuota: g(14),
    basicBonding: g(15),
    additionalBonding: g(16),
    cultivableLand: g(17),
    totalBonding: g(34),
    loanBonding: g(35),
    secondBonding: g(36),
    accountMasked: mask(g(18)),
    mobileMasked: mask(g(20)),
  };
}

export type SupplyTicket = {
  /** Field 0; */
  ticketNo: string;
  /** Field 1, e.g. "1/1". */
  fortnight: string;
  /** Field 9 ranges: 11-20 early, 21-30 general, 31-40 rejected. */
  category: "early" | "general" | "rejected" | "";
  /** Field 4: "0" is the normal calendar, anything else the additional (satta) calendar. */
  calendar: "normal" | "additional";
  issueDate: string;
  dispatchDate: string;
  statusCode: string;
  status: "Not weighed" | "Weighed" | "Cancelled" | "Unknown";
  specialCode: string;
  special: string;
  mode: string;
  /** Hindi screens use field 5 and fall back to field 10, as the app does. */
  modeHi: string;
  fields: string[];
};

const nz = (s: string | undefined) => (s && s !== "NULL" ? s.trim() : "");

const SPECIAL: Record<string, string> = {
  "0": "General",
  "1": "Additional weight adjustment",
  "5": "Additional weight adjustment",
  "2": "Burnt",
  "3": "Crop cutting",
  "6": "Cancelled ticket",
  "9": "Loan ticket",
};

export function parseSupplyTickets(section: string): SupplyTicket[] {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (!text || text === "nodata" || text === "103") return [];
  return text
    .split("aks#stop")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => {
      const p = row.split("#").map((s) => s.trim());
      const statusCode = p[6] ?? "";
      const cat = parseInt(p[9] ?? "", 10);
      return {
        ticketNo: nz(p[0]),
        fortnight: nz(p[1]),
        category:
          cat >= 11 && cat <= 20
            ? "early"
            : cat >= 21 && cat <= 30
              ? "general"
              : cat >= 31 && cat <= 40
                ? "rejected"
                : "",
        calendar: (p[4] ?? "0") === "0" ? "normal" : "additional",
        issueDate: nz(p[2]),
        dispatchDate: nz(p[3]),
        statusCode,
        status:
          statusCode === "0"
            ? "Not weighed"
            : statusCode === "5"
              ? "Weighed"
              : statusCode === "6"
                ? "Cancelled"
                : "Unknown",
        specialCode: p[7] ?? "",
        special: SPECIAL[p[7] ?? ""] ?? "",
        mode: nz(p[10]),
        modeHi: nz(p[5]) || nz(p[10]),
        fields: p,
      } satisfies SupplyTicket;
    });
}

export type PaymentSheet = { sheetNo: string; date: string; amount: string };
export type PaymentDetail = {
  purchyNo: string;
  date: string;
  netWeight: string;
  purchyAmount: string;
  loanAmount: string;
  paidAmount: string;
};
export type Loan = {
  sNo: string;
  type: string;
  amount: string;
  deduction: string;
};

const empty = (t: string) => !t || t === "nodata" || t === "103";

/** `#-` separated rows; the final row carries the total in field [4]. */
export function parsePaymentSheets(section: string): {
  rows: PaymentSheet[];
  total: string;
} {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (empty(text)) return { rows: [], total: "" };
  const parts = text.split("#-");
  const total = (parts[parts.length - 1].split("#")[4] ?? "").trim();
  const rows = parts.slice(0, -1).map((r) => {
    const p = r.split("#").map((s) => s.trim());
    return { sheetNo: p[0] ?? "", date: p[1] ?? "", amount: p[4] ?? "" };
  });
  return { rows, total };
}

/** `@@@@@` separated rows; the final row carries totals. */
export function parsePaymentDetails(section: string): {
  rows: PaymentDetail[];
  totals: string[];
} {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (empty(text)) return { rows: [], totals: [] };
  const parts = text.split("@@@@@");
  const rows = parts.slice(0, -1).map((r) => {
    const p = r.split("#").map((s) => s.trim());
    return {
      purchyNo: p[0] ?? "",
      date: p[1] ?? "",
      netWeight: p[2] ?? "",
      purchyAmount: p[5] ?? "",
      loanAmount: p[6] ?? "",
      paidAmount: p[8] ?? "",
    };
  });
  return {
    rows,
    totals: parts[parts.length - 1].split("#").map((s) => s.trim()),
  };
}

export function parseLoans(section: string): {
  rows: Loan[];
  totalAmount: string;
  totalDeduction: string;
} {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (empty(text)) return { rows: [], totalAmount: "", totalDeduction: "" };
  const parts = text.split("@@@@@");
  const last = parts[parts.length - 1].split("#").map((s) => s.trim());
  return {
    rows: parts.slice(0, -1).map((r) => {
      const p = r.split("#").map((s) => s.trim());
      return {
        sNo: p[0] ?? "",
        type: p[1] ?? "",
        amount: p[2] ?? "",
        deduction: p[3] ?? "",
      };
    }),
    totalAmount: last[2] ?? "",
    totalDeduction: last[3] ?? "",
  };
}

/* ------------------------------------------------------------------ */
/* Survey                                                              */
/* ------------------------------------------------------------------ */

export type SurveyPlot = {
  sn: string;
  plotSrNo: string;
  village: { en: string; hi: string };
  variety: string;
  east: string;
  west: string;
  north: string;
  south: string;
  /** hectares */
  area: string;
};

/** Rows are split on `##`, fields on `#` (layout from the app's CaneSurvey screen). */
export function parseSurvey(section: string): {
  plots: SurveyPlot[];
  totalArea: number;
} {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (empty(text)) return { plots: [], totalArea: 0 };
  const plots = text
    .split("##")
    .map((r) => r.trim())
    .filter(Boolean)
    .map((row) => {
      const p = row.split("#").map((s) => s.trim());
      return {
        sn: p[0] ?? "",
        plotSrNo: p[1] ?? "",
        village: { en: p[2] ?? "", hi: p[3] ?? "" },
        variety: p[4] ?? "",
        east: p[5] ?? "",
        west: p[6] ?? "",
        north: p[7] ?? "",
        south: p[8] ?? "",
        area: p[9] ?? "",
      } satisfies SurveyPlot;
    });
  const totalArea = plots.reduce(
    (a, p) => a + (Number(p.area.replace(/,/g, "")) || 0),
    0,
  );
  return { plots, totalArea };
}

/* ------------------------------------------------------------------ */
/* Calendar (pakhwara grid)                                            */
/* ------------------------------------------------------------------ */

export type CalendarKind = "early" | "general" | "rejected";
const KINDS: CalendarKind[] = ["early", "general", "rejected"];

export type CalendarCell = {
  /** what to display (markers stripped) */
  text: string;
  value: number;
  /** `*` in the source = supplied against this slot, `^` = over-weight */
  flag: "" | "delivered" | "overweight";
};
export type CalendarRow = {
  kind: CalendarKind;
  cells: CalendarCell[];
  total: number;
};
export type Pakhwara = { no: string; rows: CalendarRow[] };
export type Calendar = {
  pakhwaras: Pakhwara[];
  totals: {
    early: number;
    general: number;
    rejected: number;
    all: number;
    delivered: number;
    overweight: number;
    remaining: number;
  };
};

const DAYS = 15;

/**
 * Rows are split on `-`, cells on `#`. Each row has 18 cells:
 * [0] pakhwara no. (only on the first row of a group), [1] type label (ignored – derived from
 * position), [2..16] the 15 day slots, [17] fortnight total. Every 3 consecutive rows are one
 * pakhwara: early, general, rejected.
 */
export function parseCalendar(section: string): Calendar | null {
  const text = section.replace(/[\r\n]/g, "").trim();
  if (empty(text)) return null;
  // Keep only well-formed rows (18 cells); anything else is not a calendar.
  const rows = text
    .split("-")
    .map((r) => r.trim())
    .filter((r) => r.split("#").length >= 18);
  if (!rows.length) return null;

  const totals = {
    early: 0,
    general: 0,
    rejected: 0,
    all: 0,
    delivered: 0,
    overweight: 0,
    remaining: 0,
  };
  const pakhwaras: Pakhwara[] = [];

  rows.forEach((row, i) => {
    const f = row.split("#").map((s) => s.trim());
    const kind = KINDS[i % 3];
    const cells = Array.from({ length: DAYS }, (_, d): CalendarCell => {
      const raw = f[2 + d] ?? "";
      const digits = raw.replace(/[^0-9]/g, "");
      const value = digits ? parseInt(digits, 10) : 0;
      const flag = raw.includes("*")
        ? "delivered"
        : raw.includes("^")
          ? "overweight"
          : "";
      if (flag === "delivered") totals.delivered += value;
      if (flag === "overweight") totals.overweight += value;
      return { text: digits, value, flag };
    });
    const total = parseInt((f[17] ?? "").replace(/[^0-9]/g, ""), 10) || 0;
    totals[kind] += total;
    totals.all += total;

    if (i % 3 === 0)
      pakhwaras.push({ no: f[0] || String(pakhwaras.length + 1), rows: [] });
    pakhwaras[pakhwaras.length - 1].rows.push({ kind, cells, total });
  });

  totals.remaining = totals.all - totals.delivered - totals.overweight;
  return { pakhwaras, totals };
}

export type CalendarGroup = "all" | "basic" | "extra";
export type CalendarSet = {
  group: CalendarGroup;
  normal: Calendar | null;
  /** "additional" (satta) calendar */
  additional: Calendar | null;
};

/** A calendar section may hold `normal@@@AKSadditional`. */
function parseCalendarPair(
  section: string,
  additionalSection?: string,
): Omit<CalendarSet, "group"> {
  const [normal = "", additional = ""] = section.split("@@@AKS");
  return {
    normal: parseCalendar(normal),
    additional: parseCalendar(additionalSection ?? additional),
  };
}

export type FarmerData = {
  updatedAt: { date: string; time: string; plotSurveyStatus: string };
  profile: Profile;
  supplyTickets: SupplyTicket[];
  paymentSheets: ReturnType<typeof parsePaymentSheets>;
  paymentDetails: ReturnType<typeof parsePaymentDetails>;
  loans: ReturnType<typeof parseLoans>;
  survey: ReturnType<typeof parseSurvey>;
  /** "all" always; "basic" (basic quota) and "extra" (extra bond) only for factories 22 & 33. */
  calendars: CalendarSet[];
  /** Sections not decoded into structured data (and raw copies for fallback), verbatim. */
  raw: Record<string, string>;
};

/**
 * Factories 22 and 33 return two extra calendar sections (indexes 5 and 6),
 * which shifts every later section by 2.
 */
export function parseFarmerBlob(blob: string, factory: string): FarmerData {
  const s = blob
    .split(SECTION_DELIMITER)
    .map((x) => x.replace(/\n/g, "").trim());
  if (s.length < 12) throw new Error("Unexpected response from server");
  const o = factory === "22" || factory === "33" ? 2 : 0;
  const [plotSurveyStatus = "", date = "", time = ""] = (s[1] ?? "").split("@");

  const raw: Record<string, string> = {
    survey: s[2] ?? "",
    calendar: s[3] ?? "",
    advanceCalendar: s[4] ?? "",
    nextDue: s[6 + o] ?? "",
    receipts: s[7 + o] ?? "",
  };
  if (o) {
    raw.calendar1 = s[5] ?? "";
    raw.calendar2 = s[6] ?? "";
  }

  const calendars: CalendarSet[] = [
    { group: "all", ...parseCalendarPair(s[3] ?? "", s[4] ?? "") },
  ];
  if (o) {
    calendars.push({ group: "basic", ...parseCalendarPair(s[5] ?? "") });
    calendars.push({ group: "extra", ...parseCalendarPair(s[6] ?? "") });
  }

  return {
    survey: parseSurvey(s[2] ?? ""),
    calendars,
    updatedAt: { date, time, plotSurveyStatus },
    profile: parseProfile(s[0] ?? ""),
    supplyTickets: parseSupplyTickets(s[5 + o] ?? ""),
    paymentSheets: parsePaymentSheets(s[9 + o] ?? ""),
    paymentDetails: parsePaymentDetails(s[10 + o] ?? ""),
    loans: parseLoans(s[11 + o] ?? ""),
    raw,
  };
}
