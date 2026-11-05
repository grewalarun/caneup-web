# caneup (unofficial web viewer)

Next.js 16 app that reads the same backend as the e-Ganna Android app
(`http://mobileapp.caneup.in/ServiceCy.svc`). Pick season → district → factory → village → grower,
then view profile/quota, supply tickets, payments and loans.

```bash
npm install
npm run dev      # http://localhost:3000
npm run build && npm start
```

## How it works
The upstream is HTTP-only and has no CORS, so the browser never calls it directly.
`app/api/lookup/[kind]` and `app/api/farmer` are server-side proxies that validate input,
strip the XML wrapper, parse the text formats (`lib/parse.ts`) and return JSON.

| Layer | File |
|---|---|
| Upstream client + status codes | `lib/upstream.ts` |
| Format parsers | `lib/parse.ts` |
| Lookups (seasons/districts/factories/villages/growers) | `app/api/lookup/[kind]/route.ts` |
| Farmer data | `app/api/farmer/route.ts` (POST `{season,factory,village,grower}`) |
| UI | `components/farmer-app.tsx`, `components/farmer-view.tsx`, `components/combobox.tsx` |

Env (optional): `CANEUP_BASE_URL`, `CANEUP_APP_VERSION` (default `6$3`).

## Known gaps
- Survey and Calendar are decoded into tables / the pakhwara grid. Factories 22 & 33 also expose Basic-quota and Extra-bond calendars.
- Not yet built: the pre-calendar (Kachcha calendar; separate `PreCalenadrData` call with a ~60-field record), and structured views for receipts, SMS log and next-due (shown raw in "Receipts & more").
- Supply-ticket columns are inferred from the Android code; a "raw fields" expander is provided to cross-check.
- Account and mobile numbers are masked server-side. There is **no login**: anyone who can open this app can query any farmer
  whose codes they know, exactly like the Android app. Keep it private (localhost / VPN / auth in front) unless you add auth.
- Saved farmers are stored only in your browser's localStorage (codes + name label).

Parser check (synthetic data): see `lib/parse.ts` header; the formats are documented in `../eganna-api-notes.md`.
