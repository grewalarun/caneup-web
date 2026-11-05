import type { NextRequest } from "next/server";
import { APP_VERSION, assertSegment, upstream, UpstreamError } from "@/lib/upstream";
import { parseFarmerBlob } from "@/lib/parse";

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
    if (!body) throw new UpstreamError("Invalid request", 400);

    const season = assertSegment("season", body.season);
    const factory = assertSegment("factory", body.factory);
    const village = assertSegment("village", body.village);
    const grower = assertSegment("grower", body.grower);

    // Same call the Android app makes; imei is "0" when no device id is available.
    const text = await upstream(
      ["FetchGrowerData5", season, factory, village, grower, "0", APP_VERSION],
      { timeoutMs: 60_000 },
    );

    const data = parseFarmerBlob(text, factory);

    // The server answers unknown codes with a valid but empty record.
    if (!data.profile.farmerName.en && !data.profile.farmerName.hi) {
      throw new UpstreamError(
        "No farmer found for these codes for this season. Check the season, village and grower.",
        404,
        "empty",
      );
    }
    return Response.json(
      {
        data,
        // Unmasked upstream text – local development only, never in production.
        ...(body.debug === true && process.env.NODE_ENV !== "production"
          ? { rawBlob: text }
          : {}),
      },
      { headers: { "Cache-Control": "private, no-store" } },
    );
  } catch (e) {
    if (e instanceof UpstreamError) {
      return Response.json({ error: e.message, code: e.code }, { status: e.status });
    }
    return Response.json({ error: "Could not read farmer data" }, { status: 502 });
  }
}
