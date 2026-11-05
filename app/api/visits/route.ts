import "server-only";
import { connection } from "next/server";

/**
 * Total visits from the GoatCounter API. The read-only token stays on the server
 * (set GOATCOUNTER_TOKEN in Netlify); the browser only ever sees the number.
 */
const SITE = "https://caneup.goatcounter.com";

export async function GET() {
  await connection(); // read the env token per request, never bake it in at build time
  const token = process.env.GOATCOUNTER_TOKEN;
  const headers = {
    "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=86400",
  };
  if (!token) return Response.json({ count: "" }, { headers });
  try {
    const url = `${SITE}/api/v0/stats/total?start=2026-01-01T00:00:00Z&end=${encodeURIComponent(new Date().toISOString().slice(0, 13) + ":00:00Z")}`;
    const r = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      signal: AbortSignal.timeout(8000),
    });
    if (!r.ok) return Response.json({ count: "" }, { headers });
    const j = (await r.json()) as { total?: number };
    const count =
      typeof j.total === "number"
        ? new Intl.NumberFormat("en-IN").format(j.total)
        : "";
    return Response.json({ count }, { headers });
  } catch {
    return Response.json({ count: "" }, { headers });
  }
}
