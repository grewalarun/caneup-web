import type { ReactNode, SVGProps } from "react";

/* ------------------------------ icons ------------------------------ */
// Decorative by default (aria-hidden); meaning is always carried by adjacent text.

type IconProps = SVGProps<SVGSVGElement>;
const base = {
  width: 18,
  height: 18,
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2.2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
  "aria-hidden": true,
  focusable: false,
};

export const IconCheck = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m5 12.5 4.5 4.5L19 7.5" />
  </svg>
);
export const IconClock = (p: IconProps) => (
  <svg {...base} {...p}>
    <circle cx="12" cy="12" r="9" />
    <path d="M12 7v5l3 2" />
  </svg>
);
export const IconX = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 6 12 12M18 6 6 18" />
  </svg>
);
export const IconChevron = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="m6 9 6 6 6-6" />
  </svg>
);
export const IconBookmark = ({
  filled,
  ...p
}: IconProps & { filled?: boolean }) => (
  <svg {...base} {...p} fill={filled ? "currentColor" : "none"}>
    <path d="M7 4h10a1 1 0 0 1 1 1v15l-6-4-6 4V5a1 1 0 0 1 1-1Z" />
  </svg>
);
export const IconSwap = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M7 7h12l-3-3M17 17H5l3 3" />
  </svg>
);
export const IconAlert = (p: IconProps) => (
  <svg {...base} {...p}>
    <path d="M12 4 3 20h18L12 4Z" />
    <path d="M12 10v4M12 17.5v.01" />
  </svg>
);

export function Spinner({ className = "" }: { className?: string }) {
  return (
    <span
      aria-hidden
      className={`inline-block size-4 animate-spin rounded-full border-2 border-current border-t-transparent ${className}`}
    />
  );
}

/* ------------------------------ buttons ------------------------------ */

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "quiet";
};

const BUTTON_BASE =
  "inline-flex min-h-12 items-center justify-center gap-2 rounded-[10px] px-5 text-base font-semibold transition-colors disabled:cursor-not-allowed disabled:opacity-45";
const BUTTON_VARIANT = {
  primary: "bg-brand text-brand-ink hover:brightness-110 active:brightness-95",
  secondary:
    "border border-line bg-surface text-ink hover:bg-brand-soft hover:border-brand",
  quiet: "text-brand hover:bg-brand-soft",
} as const;

export function Button({
  variant = "primary",
  className = "",
  type = "button",
  ...rest
}: ButtonProps) {
  return (
    <button
      type={type}
      className={`${BUTTON_BASE} ${BUTTON_VARIANT[variant]} ${className}`}
      {...rest}
    />
  );
}

/** Two-or-more option switch. Each option is a real button with aria-pressed. */
export function Segmented<T extends string>({
  label,
  value,
  options,
  onChange,
  onBand = false,
}: {
  label: string;
  value: T;
  options: { value: T; label: string; lang?: string }[];
  onChange: (v: T) => void;
  onBand?: boolean;
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={`inline-flex rounded-[12px] p-1 ${onBand ? "bg-white/10" : "border border-line bg-surface-2"}`}
    >
      {options.map((o) => {
        const on = value === o.value;
        return (
          <button
            key={o.value}
            type="button"
            lang={o.lang}
            aria-pressed={on}
            onClick={() => onChange(o.value)}
            className={`min-h-11 rounded-[9px] px-4 text-base font-semibold transition-colors ${
              on
                ? onBand
                  ? "bg-white text-band"
                  : "bg-brand text-brand-ink"
                : onBand
                  ? "text-band-ink hover:bg-white/15"
                  : "text-muted hover:text-ink"
            }`}
          >
            {o.label}
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------ status ------------------------------ */

const TONE = {
  good: "bg-leaf-soft text-leaf",
  wait: "bg-gud-soft text-gud",
  bad: "bg-chilli-soft text-chilli",
  neutral: "bg-surface-2 text-muted",
} as const;

/** Status is never colour alone: always an icon and a word. */
export function StatusBadge({
  tone,
  children,
}: {
  tone: keyof typeof TONE;
  children: ReactNode;
}) {
  const Icon =
    tone === "good"
      ? IconCheck
      : tone === "wait"
        ? IconClock
        : tone === "bad"
          ? IconX
          : null;
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-sm font-semibold ${TONE[tone]}`}
    >
      {Icon && <Icon width={15} height={15} />}
      {children}
    </span>
  );
}

/* ------------------------------ text ------------------------------ */

export function SectionTitle({
  children,
  id,
}: {
  children: ReactNode;
  id?: string;
}) {
  return (
    <h3
      id={id}
      className="mb-3 font-display text-xl font-bold leading-snug text-accent"
    >
      {children}
    </h3>
  );
}

export function DefList({
  items,
}: {
  items: { label: string; value: ReactNode }[];
}) {
  return (
    <dl className="grid gap-x-8 gap-y-4 border-t-[3px] border-brand pt-4 sm:grid-cols-2">
      {items.map((it) => (
        <div key={it.label} className="min-w-0">
          <dt className="text-sm font-bold text-ink">{it.label}</dt>
          <dd className="break-words text-muted">{it.value}</dd>
        </div>
      ))}
    </dl>
  );
}

export function EmptyState({ children }: { children: ReactNode }) {
  return (
    <p className="rounded-[14px] border border-dashed border-line bg-surface-2 px-6 py-10 text-center text-muted">
      {children}
    </p>
  );
}

/* ------------------------------ data table ------------------------------ */

export type Column<T> = {
  id: string;
  header: string;
  cell: (row: T) => ReactNode;
  /** right-align + tabular numerals */
  numeric?: boolean;
  /** first/identifying column: becomes the heading of each stacked slip on phones */
  lead?: boolean;
};

/**
 * One semantic <table> that reads as a normal table from `sm` up and collapses into
 * stacked "slips" (label : value) on phones, so nothing needs sideways scrolling.
 */
export function DataTable<T>({
  caption,
  columns,
  rows,
  footer,
}: {
  caption: string;
  columns: Column<T>[];
  rows: T[];
  footer?: { label: string; values: Record<string, ReactNode> };
}) {
  const numeric = "text-right tabular";
  return (
    <div className="sm:overflow-x-auto sm:rounded-[14px] sm:border sm:border-line sm:bg-surface">
      <table className="w-full text-left max-sm:block">
        <caption className="sr-only">{caption}</caption>
        <thead className="max-sm:sr-only">
          <tr className="bg-surface-2 text-sm text-muted">
            {columns.map((c) => (
              <th
                key={c.id}
                scope="col"
                className={`px-4 py-3 font-semibold ${c.numeric ? "text-right" : ""}`}
              >
                {c.header}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="max-sm:block">
          {rows.map((row, i) => (
            <tr
              key={i}
              className="border-t border-line max-sm:mb-3 max-sm:block max-sm:overflow-hidden max-sm:rounded-[14px] max-sm:border max-sm:bg-surface max-sm:shadow-sheet"
            >
              {columns.map((c) => (
                <td
                  key={c.id}
                  className={`px-4 py-3 sm:align-top max-sm:flex max-sm:items-baseline max-sm:justify-between max-sm:gap-4 max-sm:border-b max-sm:border-line max-sm:py-2.5 max-sm:last:border-b-0 ${
                    c.numeric ? numeric : ""
                  } ${c.lead ? "font-semibold max-sm:bg-surface-2 max-sm:text-lg" : ""}`}
                >
                  <span className="shrink-0 text-sm font-normal text-muted sm:hidden">
                    {c.header}
                  </span>
                  <span className="min-w-0 break-words max-sm:text-right">
                    {c.cell(row)}
                  </span>
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        {footer && (
          <tfoot className="max-sm:block">
            <tr className="border-t-2 border-line bg-brand-soft font-semibold max-sm:block max-sm:overflow-hidden max-sm:rounded-[14px] max-sm:border-2">
              {columns.map((c, i) => {
                if (i === 0) {
                  return (
                    <th
                      key={c.id}
                      scope="row"
                      className="px-4 py-3 text-left max-sm:block max-sm:pb-1"
                    >
                      {footer.label}
                    </th>
                  );
                }
                const v = footer.values[c.id];
                if (v === undefined)
                  return <td key={c.id} className="max-sm:hidden" />;
                return (
                  <td
                    key={c.id}
                    className={`px-4 py-3 ${c.numeric ? numeric : ""} max-sm:flex max-sm:justify-between max-sm:gap-4 max-sm:py-1.5`}
                  >
                    <span className="text-sm font-normal text-muted sm:hidden">
                      {c.header}
                    </span>
                    <span>{v}</span>
                  </td>
                );
              })}
            </tr>
          </tfoot>
        )}
      </table>
    </div>
  );
}
