import type { FarmerData, Grower, Option } from "./parse";

export type Lang = "en" | "hi";

async function getJson<T>(url: string, signal?: AbortSignal): Promise<T> {
  const res = await fetch(url, { signal });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(body.error ?? `Request failed (${res.status})`);
  return body.data as T;
}

const qs = (p: Record<string, string | undefined>) =>
  new URLSearchParams(
    Object.entries(p).filter(([, v]) => v) as [string, string][],
  ).toString();

export const api = {
  seasons: (s?: AbortSignal) => getJson<Option[]>("/api/lookup/seasons", s),
  districts: (s?: AbortSignal) => getJson<Option[]>("/api/lookup/districts", s),
  factories: (district: string, lang: Lang, s?: AbortSignal) =>
    getJson<Option[]>(`/api/lookup/factories?${qs({ district, lang })}`, s),
  villages: (factory: string, season: string, lang: Lang, s?: AbortSignal) =>
    getJson<Option[]>(
      `/api/lookup/villages?${qs({ factory, season, lang })}`,
      s,
    ),
  growers: (
    factory: string,
    village: string,
    season: string,
    lang: Lang,
    s?: AbortSignal,
  ) =>
    getJson<Grower[]>(
      `/api/lookup/growers?${qs({ factory, village, season, lang })}`,
      s,
    ),
  async farmer(
    params: {
      season: string;
      factory: string;
      village: string;
      grower: string;
    },
    signal?: AbortSignal,
  ): Promise<FarmerData> {
    const res = await fetch("/api/farmer", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(params),
      signal,
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok)
      throw new Error(body.error ?? `Request failed (${res.status})`);
    return body.data as FarmerData;
  },
};
