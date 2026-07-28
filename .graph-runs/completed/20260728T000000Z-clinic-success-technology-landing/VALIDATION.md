# Validation

- `git diff --check` — passed.
- `npm run lint` — passed with four pre-existing warnings outside the changed surface.
- `npx tsc --noEmit` — passed.
- `NEXT_PUBLIC_API_BASE_URL=http://127.0.0.1:8002 npm run build` — blocked: no progress after four minutes, safely interrupted with exit 130.
- Local Next dev server on `127.0.0.1:4017` — passed: `/clinic-success`, `/sitemap.xml`, `/llms.txt`, and `/llms-full.txt` returned 200.
- Metadata, canonical, structured data, data-boundary copy, desktop screenshot, and 390 px viewport screenshot — passed.
