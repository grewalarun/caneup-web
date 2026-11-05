import type { FarmerData, SurveyPlot } from "@/lib/parse";
import type { Lang } from "@/lib/client-api";
import { t } from "@/lib/i18n";
import { DataTable, EmptyState, type Column } from "./ui";

const dash = (s: string) => s || "—";
const fmtArea = (n: number) => n.toFixed(4).replace(/\.?0+$/, "") || "0";

export function SurveyTable({
  survey,
  lang,
}: {
  survey: FarmerData["survey"];
  lang: Lang;
}) {
  const { plots, totalArea } = survey;
  if (!plots.length) return <EmptyState>{t("noSurvey", lang)}</EmptyState>;

  const columns: Column<SurveyPlot>[] = [
    {
      id: "sn",
      header: t("sn", lang),
      cell: (p) => <span className="tabular">{dash(p.sn)}</span>,
      lead: true,
    },
    {
      id: "plot",
      header: t("plotSrNo", lang),
      cell: (p) => (
        <span className="font-semibold tabular">{dash(p.plotSrNo)}</span>
      ),
    },
    {
      id: "village",
      header: t("plotVillage", lang),
      cell: (p) =>
        dash(
          (lang === "hi"
            ? p.village.hi || p.village.en
            : p.village.en || p.village.hi) ?? "",
        ),
    },
    { id: "variety", header: t("variety", lang), cell: (p) => dash(p.variety) },
    {
      id: "east",
      header: t("east", lang),
      cell: (p) => dash(p.east),
      numeric: true,
    },
    {
      id: "west",
      header: t("west", lang),
      cell: (p) => dash(p.west),
      numeric: true,
    },
    {
      id: "north",
      header: t("north", lang),
      cell: (p) => dash(p.north),
      numeric: true,
    },
    {
      id: "south",
      header: t("south", lang),
      cell: (p) => dash(p.south),
      numeric: true,
    },
    {
      id: "area",
      header: t("area", lang),
      cell: (p) => <span className="font-semibold">{dash(p.area)}</span>,
      numeric: true,
    },
  ];

  return (
    <div className="space-y-5">
      <dl className="flex flex-wrap gap-x-10 gap-y-3">
        <div>
          <dt className="text-muted">{t("plots", lang)}</dt>
          <dd className="font-display text-3xl font-extrabold tabular">
            {plots.length}
          </dd>
        </div>
        <div>
          <dt className="text-muted">{t("caneArea", lang)}</dt>
          <dd className="font-display text-3xl font-extrabold tabular">
            {fmtArea(totalArea)}
            <span className="ml-1.5 font-sans text-base font-medium text-muted">
              {t("ha", lang)}
            </span>
          </dd>
        </div>
      </dl>
      <DataTable
        caption={t("tabSurvey", lang)}
        columns={columns}
        rows={plots}
        footer={{
          label: t("caneArea", lang),
          values: { area: fmtArea(totalArea) },
        }}
      />
    </div>
  );
}
