"use client";

import {
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { api, type Lang } from "@/lib/client-api";
import Image from "next/image";
import { splitGrowerCode, type FarmerData } from "@/lib/parse";
import { t } from "@/lib/i18n";
import { Combobox, type ComboStrings } from "./combobox";
import { FarmerView } from "./farmer-view";
import { Button, IconAlert, IconBookmark, Segmented, Spinner } from "./ui";

/* ---------------- tiny async hook (abortable, keyed) ---------------- */

function useAsync<T>(
  key: string | null,
  fn: (signal: AbortSignal) => Promise<T>,
) {
  const [state, setState] = useState<{
    key: string | null;
    data?: T;
    error?: string;
  }>({ key: null });
  useEffect(() => {
    if (!key) return;
    const ac = new AbortController();
    fn(ac.signal)
      .then((data) => setState({ key, data }))
      .catch((e: Error) => {
        if (!ac.signal.aborted) setState({ key, error: e.message });
      });
    return () => ac.abort();
    // `fn` is fully described by `key`.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [key]);
  const ready = state.key === key;
  return {
    data: ready ? state.data : undefined,
    error: ready ? state.error : undefined,
    loading: key !== null && !ready,
  };
}

/* ---------------- saved farmers (localStorage, SSR-safe) ---------------- */

type Params = {
  season: string;
  factory: string;
  village: string;
  grower: string;
};
type Saved = Params & { label: string };
const STORE_KEY = "caneup.saved";
const listeners = new Set<() => void>();

const subscribe = (cb: () => void) => {
  listeners.add(cb);
  window.addEventListener("storage", cb);
  return () => {
    listeners.delete(cb);
    window.removeEventListener("storage", cb);
  };
};
const readStore = () => {
  try {
    return localStorage.getItem(STORE_KEY) ?? "[]";
  } catch {
    return "[]";
  }
};
function writeStore(list: Saved[]) {
  try {
    localStorage.setItem(STORE_KEY, JSON.stringify(list));
  } catch {
    /* storage unavailable (private mode): saving just won't persist */
  }
  listeners.forEach((l) => l());
}
const sameFarmer = (a: Params, b: Params) =>
  a.season === b.season &&
  a.factory === b.factory &&
  a.village === b.village &&
  a.grower === b.grower;

function useSaved() {
  const raw = useSyncExternalStore(subscribe, readStore, () => "[]");
  return useMemo<Saved[]>(() => {
    try {
      const v = JSON.parse(raw);
      return Array.isArray(v) ? v : [];
    } catch {
      return [];
    }
  }, [raw]);
}

/* ---------------- component ---------------- */

export function FarmerApp() {
  const [lang, setLang] = useState<Lang>("en");
  const [seasonSel, setSeasonSel] = useState("");
  const [district, setDistrict] = useState("");
  const [factory, setFactory] = useState("");
  const [village, setVillage] = useState("");
  const [grower, setGrower] = useState("");
  const [finderOpen, setFinderOpen] = useState(true);

  const seasons = useAsync("seasons", (s) => api.seasons(s));
  const districts = useAsync("districts", (s) => api.districts(s));
  const season = seasonSel || seasons.data?.[0]?.code || "";

  const factories = useAsync(district ? `f:${district}:${lang}` : null, (s) =>
    api.factories(district, lang, s),
  );
  const villages = useAsync(
    factory && season ? `v:${factory}:${season}:${lang}` : null,
    (s) => api.villages(factory, season, lang, s),
  );
  const growers = useAsync(
    factory && village && season
      ? `g:${factory}:${village}:${season}:${lang}`
      : null,
    (s) => api.growers(factory, village, season, lang, s),
  );

  const growerOptions = useMemo(() => {
    const seen = new Set<string>();
    return (growers.data ?? [])
      .filter((g) => (seen.has(g.code) ? false : (seen.add(g.code), true)))
      .map((g) => ({
        value: g.code,
        label: g.name || g.code,
        hint: [g.relation, splitGrowerCode(g.code).code]
          .filter(Boolean)
          .join(" · "),
      }));
  }, [growers.data]);

  /* ----- farmer data ----- */
  const [farmer, setFarmer] = useState<{
    params?: Params;
    data?: FarmerData;
    error?: string;
    loading?: boolean;
  }>({});
  const abortRef = useRef<AbortController | null>(null);
  const finderRef = useRef<HTMLElement>(null);
  const resultRef = useRef<HTMLDivElement>(null);

  async function load(params: Params) {
    abortRef.current?.abort();
    const ac = new AbortController();
    abortRef.current = ac;
    setFarmer({ params, loading: true });
    try {
      const data = await api.farmer(
        { ...params, grower: splitGrowerCode(params.grower).code },
        ac.signal,
      );
      setFarmer({ params, data });
      setFinderOpen(false);
      requestAnimationFrame(() =>
        resultRef.current?.scrollIntoView({ block: "start" }),
      );
    } catch (e) {
      if (!ac.signal.aborted)
        setFarmer({ params, error: (e as Error).message });
    }
  }

  function openFinder() {
    setFinderOpen(true);
    requestAnimationFrame(() =>
      finderRef.current?.scrollIntoView({ block: "start" }),
    );
  }

  const saved = useSaved();
  const current = farmer.params;
  const isSaved = !!current && saved.some((s) => sameFarmer(s, current));

  function toggleSave() {
    if (!current || !farmer.data) return;
    if (isSaved)
      return writeStore(saved.filter((s) => !sameFarmer(s, current)));
    const p = farmer.data.profile;
    const name = p.farmerName.en || p.farmerName.hi;
    const place = p.village.en || p.village.hi;
    writeStore([
      ...saved,
      {
        ...current,
        label:
          [name, place].filter(Boolean).join(", ") ||
          splitGrowerCode(current.grower).code,
      },
    ]);
  }

  const [formError, setFormError] = useState("");

  /** Keep the button enabled; if something is missing, say what and move focus there. */
  function submit() {
    const missing = (
      [
        ["district", district, t("district", lang)],
        ["factory", factory, t("factory", lang)],
        ["village", village, t("village", lang)],
        ["grower", grower, t("grower", lang)],
      ] as const
    ).find(([, v]) => !v);
    if (missing) {
      setFormError(t("pickField", lang, { field: missing[2] }));
      document.getElementsByName(missing[0])[0]?.focus();
      return;
    }
    setFormError("");
    if (!farmer.loading) load({ season, factory, village, grower });
  }

  const baseStrings: Omit<ComboStrings, "empty"> = {
    select: t("select", lang),
    loading: t("loading", lang),
    noMatches: t("noMatches", lang),
    showing: (n, total) => t("showingOf", lang, { n, total }),
  };

  return (
    <div
      lang={lang}
      className="min-h-dvh bg-[linear-gradient(var(--teal)_0,var(--teal)_15rem,var(--bg)_15rem)] sm:px-6 sm:pb-10 sm:pt-8"
    >
      <div className="mx-auto max-w-5xl overflow-hidden bg-surface shadow-sheet sm:rounded-[6px]">
        <a
          href="#main"
          className="absolute left-3 top-3 z-50 -translate-y-24 rounded-[10px] bg-brand px-4 py-3 font-semibold text-brand-ink focus:translate-y-0"
        >
          {t("skip", lang)}
        </a>

        <header className="on-band bg-band text-band-ink">
          <div className="flex flex-wrap items-center gap-x-5 gap-y-4 px-4 pb-6 pt-[max(1.5rem,env(safe-area-inset-top))] sm:px-8 sm:pt-7">
            <Image
              src="/logo.jpg"
              alt=""
              width={64}
              height={64}
              priority
              className="size-16 shrink-0 rounded-[6px] bg-white"
            />
            <div className="min-w-0 flex-1 basis-64">
              <h1 className="font-display text-2xl font-bold uppercase leading-tight tracking-wide sm:text-4xl">
                {t("appTitle", lang)}
              </h1>
              <p className="mt-1 max-w-2xl text-pretty text-band-ink/90">
                {t("appSub", lang)}
              </p>
            </div>
            <Segmented
              onBand
              label={t("language", lang)}
              value={lang}
              onChange={setLang}
              options={[
                { value: "en", label: "English", lang: "en" },
                { value: "hi", label: "हिन्दी", lang: "hi" },
              ]}
            />
          </div>
        </header>
        <div aria-hidden className="perforation mt-4" />

        <main id="main" className="space-y-6 px-4 py-7 sm:px-8">
          {saved.length > 0 && (
            <section aria-labelledby="saved-h">
              <h2
                id="saved-h"
                className="mb-2.5 font-display text-xl font-bold text-accent"
              >
                {t("savedTitle", lang)}
              </h2>
              <ul className="flex flex-wrap gap-2">
                {saved.map((s) => (
                  <li key={`${s.season}-${s.factory}-${s.village}-${s.grower}`}>
                    <button
                      type="button"
                      onClick={() => load(s)}
                      className="inline-flex min-h-12 items-center gap-2 rounded-full border border-line bg-surface px-4 text-base font-medium transition-colors hover:border-brand hover:bg-brand-soft"
                    >
                      <IconBookmark
                        width={16}
                        height={16}
                        className="text-brand"
                        filled
                      />
                      {s.label}
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {finderOpen && (
            <section
              ref={finderRef}
              aria-labelledby="finder-h"
              className="border-t-[3px] border-brand pt-5"
            >
              <h2
                id="finder-h"
                className="mb-5 font-display text-xl font-bold text-accent"
              >
                {t("finderTitle", lang)}
              </h2>
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  submit();
                }}
              >
                <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                  <Combobox
                    label={t("season", lang)}
                    name="season"
                    value={season}
                    options={(seasons.data ?? []).map((s) => ({
                      value: s.code,
                      label: s.name,
                    }))}
                    onChange={(v) => {
                      setSeasonSel(v);
                      setVillage("");
                      setGrower("");
                    }}
                    loading={seasons.loading}
                    error={seasons.error}
                    strings={{ ...baseStrings, empty: t("loading", lang) }}
                  />
                  <Combobox
                    label={t("district", lang)}
                    name="district"
                    value={district}
                    options={(districts.data ?? []).map((d) => ({
                      value: d.code,
                      label: d.name,
                      hint: d.code,
                    }))}
                    onChange={(v) => {
                      setDistrict(v);
                      setFormError("");
                      setFactory("");
                      setVillage("");
                      setGrower("");
                    }}
                    loading={districts.loading}
                    error={districts.error}
                    strings={{ ...baseStrings, empty: t("loading", lang) }}
                  />
                  <Combobox
                    label={t("factory", lang)}
                    name="factory"
                    value={factory}
                    disabled={!district}
                    options={(factories.data ?? []).map((f) => ({
                      value: f.code,
                      label: f.name,
                      hint: f.code,
                    }))}
                    onChange={(v) => {
                      setFactory(v);
                      setVillage("");
                      setGrower("");
                    }}
                    loading={factories.loading}
                    error={factories.error}
                    strings={{ ...baseStrings, empty: t("noFactories", lang) }}
                  />
                  <Combobox
                    label={t("village", lang)}
                    name="village"
                    value={village}
                    disabled={!factory}
                    options={(villages.data ?? []).map((v) => ({
                      value: v.code,
                      label: v.name,
                      hint: v.code,
                    }))}
                    onChange={(v) => {
                      setVillage(v);
                      setGrower("");
                    }}
                    loading={villages.loading}
                    error={villages.error}
                    strings={{ ...baseStrings, empty: t("noVillages", lang) }}
                  />
                  <div className="sm:col-span-2">
                    <Combobox
                      label={t("grower", lang)}
                      name="grower"
                      value={grower}
                      disabled={!village}
                      options={growerOptions}
                      onChange={setGrower}
                      loading={growers.loading}
                      error={growers.error}
                      placeholder={t("searchGrower", lang)}
                      strings={{ ...baseStrings, empty: t("noGrowers", lang) }}
                    />
                  </div>
                </div>

                <div className="mt-6 flex flex-wrap items-center gap-x-5 gap-y-3">
                  <Button
                    type="submit"
                    disabled={farmer.loading}
                    className="min-w-44"
                  >
                    {farmer.loading ? (
                      <>
                        <Spinner /> {t("fetching", lang)}
                      </>
                    ) : (
                      t("viewData", lang)
                    )}
                  </Button>
                  <p className="text-sm text-muted">{t("liveNote", lang)}</p>
                </div>
                {formError && (
                  <p role="alert" className="mt-3 font-semibold text-chilli">
                    {formError}
                  </p>
                )}
              </form>
            </section>
          )}

          <p role="status" className="sr-only">
            {farmer.loading
              ? t("fetchingLong", lang)
              : farmer.data
                ? t("loadedFor", lang, {
                    name:
                      farmer.data.profile.farmerName.en ||
                      farmer.data.profile.farmerName.hi,
                  })
                : ""}
          </p>
          <div
            ref={resultRef}
            aria-busy={!!farmer.loading}
            className="scroll-mt-4"
          >
            {farmer.loading && (
              <p className="flex items-center gap-3 rounded-[14px] border border-line bg-surface px-5 py-8 text-muted">
                <Spinner className="text-brand" />
                {t("fetchingLong", lang)}
              </p>
            )}
            {farmer.error && (
              <div
                role="alert"
                className="rounded-[14px] border border-chilli/40 bg-chilli-soft p-5 text-chilli"
              >
                <p className="flex items-center gap-2 font-display text-lg font-bold">
                  <IconAlert />
                  {t("errorTitle", lang)}
                </p>
                <p className="mt-2 font-medium">{farmer.error}</p>
                <p className="mt-1 text-ink">{t("errorFix", lang)}</p>
                {current && (
                  <Button
                    variant="secondary"
                    className="mt-4"
                    onClick={() => load(current)}
                  >
                    {t("tryAgain", lang)}
                  </Button>
                )}
              </div>
            )}
            {farmer.data && (
              <FarmerView
                codes={{
                  village: current?.village ?? "",
                  grower: splitGrowerCode(current?.grower ?? "").code,
                  ugc: splitGrowerCode(current?.grower ?? "").ugc,
                }}
                data={farmer.data}
                lang={lang}
                saved={isSaved}
                onToggleSave={toggleSave}
                onChange={openFinder}
              />
            )}
          </div>
        </main>

        <footer className="on-band bg-band px-4 py-6 pb-[max(1.5rem,env(safe-area-inset-bottom))] text-center text-sm text-band-ink sm:px-8">
          {t("footer", lang)}{" "}
          <a
            href="tel:18001213203"
            className="whitespace-nowrap font-semibold text-white underline underline-offset-2"
          >
            1800-121-3203
          </a>
        </footer>
      </div>
    </div>
  );
}
