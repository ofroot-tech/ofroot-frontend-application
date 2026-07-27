# Changed files

## Application changes
- `app/config/site.ts`: defines the www canonical host.
- `app/lib/growth-content.ts`, `app/layout.tsx`, `app/sitemap.ts`, and `app/robots.ts`: consume the shared host for metadata and discovery output.
- `app/lib/schemas.ts` and `app/consulting/book/page.tsx`: remove explicit naked-host URLs.
- `__tests__/canonicalHost.test.ts`: future dependency-complete test contract.

## Workflow changes
- `.graph/` and this run directory record decisions and validation evidence.
