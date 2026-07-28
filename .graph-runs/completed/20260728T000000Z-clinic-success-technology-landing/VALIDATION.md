# Validation

- `git diff --check` — passed.
- `npm run lint` — passed with four pre-existing warnings outside the changed surface.
- `npx tsc --noEmit` — passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — stalled under Turbopack and was safely interrupted with exit 130; the direct standard Next build then passed with approved network access.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 ./node_modules/.bin/next build` — passed with exit 0; `/clinic-success` generated as a static route.
- Local Next dev server on `127.0.0.1:4017` — passed: `/clinic-success`, `/sitemap.xml`, `/llms.txt`, and `/llms-full.txt` returned 200.
- Metadata, canonical, structured data, data-boundary copy, desktop screenshot, and 390 px viewport screenshot — passed.
- Production: commit `631be92` pushed to `origin/main`; Vercel deployment `dpl_4zK8thhUo6oPZ9cGmk6vK1tHLWdH` Ready; canonical page, sitemap, and `llms.txt` returned 200 with expected route and metadata content.
