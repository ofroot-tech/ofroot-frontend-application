# Render Auto Wake Configuration

To reduce cold-start latency when the Laravel API is hosted on Render's **free** tier, the frontend now includes a small helper that pings the API once per server start.

## How it works

- `app/lib/wakeRenderApi.ts` checks the deployment environment when the server runtime boots (wired through `instrumentation.ts`).
- If the frontend is running in production (Vercel) **and** the API base URL points at `*.onrender.com`, a quick `GET /public/blog-posts?limit=1` request wakes the Render app.
- Paid Render tiers or non-Render hosts skip this wake-up automatically so we do not waste requests.

## Environment variables

| Variable | Required | Value | Purpose |
| --- | --- | --- | --- |
| `RENDER_API_PLAN` | Optional | `free` | Explicitly mark that the Render service is on the free tier. When set to anything else (e.g. `starter`, `pro`) the wake-up is disabled. |
| `RENDER_WAKE_FORCE` | Optional | `true` | Override switch when you want the wake-up even if `RENDER_API_PLAN` is not `free`. Leave unset in paid environments. |
| `RENDER_WAKE_TIMEOUT_MS` | Optional | e.g. `5000` | Milliseconds to wait before giving up on the warm-up request. |

Set these only in the production environment (e.g. Vercel project settings). Locally you should continue using the Laravel server at `http://127.0.0.1:8000/api`, so the wake logic never fires.

## Deployment checklist

1. In Vercel → Project → Environment Variables, add:
   - `RENDER_API_PLAN=free`
   - `RENDER_WAKE_TIMEOUT_MS=5000` (optional)
2. Redeploy the frontend. On the first cold start you should see a log entry similar to `[wakeRenderApi] Non-200 response 200` or success output in the Vercel logs, indicating the warm-up ran.
3. Remove `RENDER_API_PLAN` (or set it to `starter`) once you upgrade the Render service so the warm-up stops automatically.
