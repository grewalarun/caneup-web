import type { NextRequest } from "next/server";
import { assertSegment, upstream, UpstreamError } from "@/lib/upstream";
import {
  parseCodeNameList,
  parseFactories,
  parseGrowers,
  parseSeasons,
} from "@/lib/parse";

// Reference data changes rarely; let browsers/CDNs hold it for a while.
const CACHE = "public, max-age=300, s-maxage=3600, stale-while-revalidate=86400";

export async function GET(req: NextRequest, ctx: RouteContext<"/api/lookup/[kind]">) {
  const { kind } = await ctx.params;
  const q = req.nextUrl.searchParams;
  const hi = q.get("lang") === "hi";

  try {
    let data: unknown;
    switch (kind) {
      case "seasons":
        data = parseSeasons(await upstream(["Fill_RadioSeason"]));
        break;
      case "districts":
        data = parseCodeNameList(await upstream(["Fill_District"]));
        break;
      case "factories": {
        const district = assertSegment("district", q.get("district"));
        data = parseFactories(
          await upstream([hi ? "Fill_Factory_Hindi1" : "Fill_Factory1", district], {
            allowEmpty: true,
          }),
        );
        break;
      }
      case "villages": {
        const factory = assertSegment("factory", q.get("factory"));
        const season = assertSegment("season", q.get("season"));
        data = parseCodeNameList(
          await upstream(
            [hi ? "Fill_Village_Hindi" : "Fill_Village", factory, "0", "0", season],
            { allowEmpty: true },
          ),
        );
        break;
      }
      case "growers": {
        const factory = assertSegment("factory", q.get("factory"));
        const village = assertSegment("village", q.get("village"));
        const season = assertSegment("season", q.get("season"));
        data = parseGrowers(
          await upstream(
            [hi ? "Fill_Grower_Hindi" : "Fill_Grower", factory, "0", "0", village, season],
            { allowEmpty: true, timeoutMs: 60_000 },
          ),
        );
        break;
      }
      default:
        return Response.json({ error: "Unknown lookup" }, { status: 404 });
    }
    return Response.json({ data }, { headers: { "Cache-Control": CACHE } });
  } catch (e) {
    if (e instanceof UpstreamError) {
      return Response.json({ error: e.message, code: e.code }, { status: e.status });
    }
    return Response.json({ error: "Unexpected error" }, { status: 500 });
  }
}
