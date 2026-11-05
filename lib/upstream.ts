import "server-only";

const BASE =
  process.env.CANEUP_BASE_URL ?? "http://mobileapp.caneup.in/ServiceCy.svc";

/** App version string the Android client reports (dots replaced by `$`). */
export const APP_VERSION = process.env.CANEUP_APP_VERSION ?? "6$3";

/** Status codes the server returns as a bare body instead of data. */
const ERROR_CODES: Record<string, string> = {
  "101": "Server is not responding",
  "102": "This season's data is not connected to the factory database yet",
  "103": "Query error on the server",
  "104": "Unexpected server error",
  "105": "Server is not responding",
  "106": "No data found",
  "107": "No matching data",
};

export class UpstreamError extends Error {
  constructor(
    message: string,
    public status = 502,
    public code?: string,
  ) {
    super(message);
  }
}

/** Path segments are interpolated into the upstream URL, so keep them boring. */
const SEGMENT = /^[A-Za-z0-9$_\-.]{1,64}$/;

export function assertSegment(name: string, value: unknown): string {
  if (
    typeof value !== "string" ||
    !SEGMENT.test(value) ||
    value === "." ||
    value === ".."
  ) {
    throw new UpstreamError(`Invalid ${name}`, 400);
  }
  return value;
}

/**
 * GET <base>/<segments…> and return the text body with XML tags stripped
 * (the same `<(.|\n)*?>` strip the Android app does).
 * Returns "" for `nodata`; throws UpstreamError for the numeric status codes.
 */
/** Server-side hiccups worth retrying (it intermittently answers 101/103/104/105 or 5xx). */
const TRANSIENT_CODES = new Set(["101", "103", "104", "105"]);
const ATTEMPTS = 3;
const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

/**
 * All upstream calls are idempotent GETs, so transient failures are retried
 * with a short backoff before an error is surfaced to the user.
 */
export async function upstream(
  segments: string[],
  opts: { timeoutMs?: number; allowEmpty?: boolean } = {},
): Promise<string> {
  let lastError: UpstreamError | undefined;
  for (let attempt = 1; attempt <= ATTEMPTS; attempt++) {
    try {
      return await upstreamOnce(segments, opts);
    } catch (e) {
      if (!(e instanceof UpstreamError)) throw e;
      lastError = e;
      const transient =
        e.status >= 500 &&
        (e.code === undefined || TRANSIENT_CODES.has(e.code));
      console.warn(
        `[upstream] ${segments[0]} attempt ${attempt}/${ATTEMPTS} failed: ${e.message}` +
          `${e.code ? ` (code ${e.code})` : ""}${transient ? "" : " – not retrying"}`,
      );
      if (!transient || attempt === ATTEMPTS) break;
      await sleep(400 * attempt);
    }
  }
  throw lastError!;
}

async function upstreamOnce(
  segments: string[],
  opts: { timeoutMs?: number; allowEmpty?: boolean },
): Promise<string> {
  const url = `${BASE}/${segments.join("/")}`;
  let res: Response;
  try {
    res = await fetch(url, {
      signal: AbortSignal.timeout(opts.timeoutMs ?? 30_000),
      cache: "no-store",
      headers: { Accept: "application/xml, text/plain, */*" },
    });
  } catch {
    throw new UpstreamError("Could not reach the Cane UP server", 504);
  }
  if (!res.ok) {
    throw new UpstreamError(`Cane UP server returned ${res.status}`, 502);
  }
  const text = (await res.text())
    .replace(/<[^>]*>/g, "")
    .replace(/[\r\n]+/g, "")
    .trim();

  if (text === "nodata" || text === "") {
    if (opts.allowEmpty) return "";
    throw new UpstreamError("No data found", 404, "nodata");
  }
  const first = text.split("#")[0].trim();
  if (text in ERROR_CODES) {
    throw new UpstreamError(
      ERROR_CODES[text],
      text === "107" ? 404 : 502,
      text,
    );
  }
  if (first === "102") {
    throw new UpstreamError(ERROR_CODES["102"], 404, "102");
  }
  if (/resource you are looking for has been removed/i.test(text)) {
    throw new UpstreamError("The Cane UP server rejected this request", 502);
  }
  return text;
}
