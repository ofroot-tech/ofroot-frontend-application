# OfRoot Signal: news hub plan

Prepared October 27, 2026. Product route: `/news`. Structural wireframe: [`public/news-wireframe.svg`](../public/news-wireframe.svg).

## Product decision

Make OfRoot Signal a useful repository of **news references**, with a fast path to the original publisher. Cover artificial intelligence, integrations, healthcare startups, technology policy, and cybersecurity. Start with permitted metadata from approved feeds and APIs. A publisher's RSS feed is a delivery mechanism; its presence does not establish unrestricted reuse rights.

The first screen should answer three questions: what changed, who published it, and how current is this index? Readers can filter, search, save a reference locally, then open the original source. Do not fill coverage gaps with fabricated stories or dates.

## Research and design decisions

| Reference | Observed pattern | Application to OfRoot Signal |
| --- | --- | --- |
| [Techmeme: about](https://www.techmeme.com/about) | Software and editorial selection; related coverage and a stream of updates | Keep an ordered news stream. A later phase can cluster independently reported coverage, with individual source links preserved. |
| [Hacker News](https://news.ycombinator.com/) | Compact linked headlines; domain, time, and separate new/top views | Make publisher attribution visible at the point of reading. Default to latest, with explicit ranking rules. |
| [The Verge](https://www.theverge.com/) | Strong lead hierarchy, topic navigation, and a news stream | Use one clear lead area, five topic filters, then a dense chronological stream. Do not reuse its photographs or layout assets. |
| [Feedly: deduplication](https://docs.feedly.com/article/218-how-does-deduplication-work) and [navigation](https://feedly.com/new-features/posts/meet-your-new-sidebar-less-clutter-more-personalization) | Feed deduplication, folders, and saved collections | Remove exact duplicates before display; let readers filter and save references without creating an account. |

These are pattern references, not content suppliers or endorsements. Screens and terms can change; check each source again before activation or commercial reuse.

## Information architecture

- `/news`: live index, latest-first ordering, search, topic filters, saved view, status and freshness.
- Source directory: publisher names, covered topics, rights basis, terms URL, activation state, and last successful fetch. The interface may expose this as an in-page panel or a dedicated route.
- Methodology: aggregation rules, source selection, research/company-release labels, corrections, and takedown contact.
- `/api/news`: public read endpoint returning a sanitized cached snapshot; no arbitrary feed URL input.
- Refresh endpoint or job: authenticated ingestion only, with a single bounded allowlist of sources. Do not expose privileged refresh to browsers.

Keep OfRoot's existing site navigation and footer. Add a visible News entry so this is discoverable without replacing the existing consulting homepage or insights library. Keep externally published news distinct from OfRoot-authored insights.

## Desktop wireframe

1. Existing dark OfRoot navigation.
2. Signal masthead: wordmark, Source directory, How it works, and Saved references.
3. Date and truthful freshness line: last check, last successful refresh, and partial/stale/error state when applicable.
4. Editorial introduction: “Stay ahead of what's next.” with a short description of the five beats.
5. Lead area: newest eligible item with source name, item kind, publication date, headline, and a prominent “Read at source” link. A topic watch panel supplies useful navigation and explains gaps without inventing coverage.
6. Five horizontally arranged topic filters plus an All view. Active filter is clear by shape and contrast as well as color.
7. Latest stream: search input, visible result count, ordering control where supported, and story rows. Each row shows topic, headline, source, item kind, publication time or “Date unavailable,” save control, and direct source link.
8. Secondary rail: source coverage and aggregation explanation. Put source health details in the directory, keeping the reading screen focused.
9. Footer: methodology, source directory, rights/corrections contact, and existing OfRoot links.

Use warm white (`#F7F6F2`), ink (`#111C2B`), muted gray, and OfRoot orange (`#FF9312`). A larger editorial serif headline can sit alongside the existing clear sans-serif interface. Use borders and whitespace to establish hierarchy. Publisher photos, logos, and article-body excerpts are absent until their specific reuse permissions have been recorded.

## Mobile behavior and accessibility

Stack the lead and topic watch panel. Keep search full width. Topic chips scroll horizontally inside their own container, with the page itself fitting the viewport. Story titles wrap; source metadata can wrap to a second line. A saved control remains at least 44 pixels in its target area. Direct source links describe their destination.

Maintain semantic headings, a single page `h1`, visible focus styles, labeled controls, and clear selected states. Announce updated result counts politely without repeatedly interrupting reading. Show a stable publication timestamp alongside relative time when available. Apply reduced-motion preferences. Saved references stay on this device in browser storage; make that scope clear.

## Ethical aggregation model

| Material | Default behavior |
| --- | --- |
| Headline and canonical source URL | Display only under a recorded approved feed/API/metadata reuse basis. Preserve exact wording when the source terms require it. |
| Publisher name, item date, author, category, and item kind | Retain provenance; store only fields permitted by the approved source contract. A classification assigned by OfRoot is clearly an OfRoot label. |
| Full article, feed body, abstract, or summary | Excluded by default. Approve separately under publisher permission, a suitable license, or an explicit source-specific reuse basis. |
| Publisher images, logos, and video | Excluded by default; approval and attribution requirements are separate from headline permissions. |
| Paywalled content | Link to the publisher. Do not bypass the paywall or turn an excerpt into a substitute article. |
| AI-generated explanation | Not required for launch. Any future original synthesis must be accurate, labeled, source-linked, and based on material authorized for that use. Do not imply an AI rewrite removes copyright obligations. |
| Research paper | Label “Research”; do not frame a preprint as a verified clinical or commercial outcome. |
| Company announcement | Label “Company release” or “Release”; distinguish a company's claims from independent reporting. |
| Policy item | Distinguish proposed rule, final rule, notice, and guidance when the source provides those fields. Link to authoritative records. |
| Cybersecurity item | Label advisory/catalog entry; avoid implying a vulnerability listing means a reader's system is compromised. |

Provide `communications@ofroot.technology` for corrections, source removal, licensing, and publisher opt-out requests. A production takedown removes the item from active storage and all caches and records a suppression key so the next ingestion cannot re-add it. Keep an audit trail of rights changes and removals.

## Initial source review

Activation needs both a recorded permission basis and runtime validation. The source registry records the current selection; the source directory reports actual fetch health. A source being enabled does not establish that a given refresh succeeded.

| Source | Primary evidence | Safe initial scope and limits |
| --- | --- | --- |
| arXiv via DataCite | [arXiv API terms](https://info.arxiv.org/help/api/tou.html), [DataCite metadata policy](https://support.datacite.org/docs/datacite-data-file-use-policy) | Enabled for CC0 descriptive metadata through DataCite. Papers retain their separate licenses. The launch view retains title, author/date and canonical record link. The legacy arXiv API has a separate guideline of one request per three seconds, one connection; the implemented DataCite path avoids that legacy endpoint. |
| FTC | [Website policy](https://www.ftc.gov/policy-notices/website-policy), [RSS directory](https://www.ftc.gov/stay-connected/rss) | Most agency work is public domain; attribute FTC, exclude marked third-party material, and do not imply endorsement. The candidate feed returned 404 during validation, so this source remains disabled until a working official endpoint is verified. |
| FDA | [Website policies](https://www.fda.gov/about-fda/about-website/website-policies), [press release feed](https://www.fda.gov/about-fda/contact-fda/stay-informed/rss-feeds/press-releases/rss.xml) | Government work is generally public domain unless noted; FDA prefers links because material changes. Medical-device announcements and regulatory records add context but do not substitute for independent startup funding/reporting coverage. |
| CISA | [Known Exploited Vulnerabilities catalog](https://www.cisa.gov/known-exploited-vulnerabilities-catalog) | Use the official machine-readable catalog and source links after runtime validation and rights review. A research-time RSS request returned 403, so do not assume every CISA feed is reachable. |
| TechCrunch | [RSS terms](https://techcrunch.com/rss-terms-of-use/) | Enabled feeds cover AI, healthcare, and integration-related enterprise headlines. Display feed-supplied complete headlines, source and author attribution when supplied, dates, and original links unchanged in this ad-free index. No summaries, article bodies, feed advertising, or publisher images. These source-specific feed terms do not establish a general full-article reuse license. Review again before changing the business context or adding ads. |
| The Verge and other commercial publishers | Publisher-specific agreement or current reuse terms needed | Candidate sources only until reviewed. Public availability, robots permission, an RSS URL, or an article in a search result does not by itself clear republication. |
| Integration vendors and open-source project releases | Source-specific API terms plus explicit content rights | Candidate sources until checked. A public repository's code license is not automatically a license for every brand asset, announcement, or externally embedded item. |

TechCrunch feeds add publisher reporting to the agency and research metadata. Coverage is still bounded by the approved feeds and their actual availability. If a beat has no current eligible items, show an honest empty state and source coverage status. FDA announcements should not be relabeled as startup funding news, and old research should not be made to look like breaking news.

## Update logic

```text
Source registry: enabled flag + permission basis + terms URL + approved fields
  -> approve source for this use and fixed endpoint
  -> bounded server fetch from approved HTTPS host
  -> validate response, item dates, URLs, and supported content shape
  -> normalize permitted text metadata; discard article bodies and images
  -> canonicalize source URLs and remove tracking parameters
  -> apply persistent publisher/item suppression list
  -> exact deduplication by source identifier and canonical URL
  -> assign transparent topic and item-kind labels
  -> sort by valid publication timestamp, keeping undated items explicit
  -> atomically store the new snapshot and per-source health
  -> cached read endpoint -> interface polls -> accessible update notice
```

Start with a 15-minute server refresh interval. Browser polling can check the cached index every 60 seconds while the tab is visible; it should not cause a fresh publisher fetch on every reader request. Respect each source's longer interval or tighter rate limit. Use conditional requests with ETag/Last-Modified where supported. The page can show a clearly labeled older cached index if a refresh fails, with both last attempt and last success visible. A failure must never advance the successful refresh timestamp.

Use latest-first as the launch ranking rule. Do not label this “trending” or “most important” without a defensible measurement. Exact deduplication is a launch safeguard; cross-publisher story clustering requires a separate phase and must preserve each report's provenance. Do not invent a corroboration count from a loose title match.

Fetch only allowlisted endpoints, reject unapproved redirects and URL schemes, bound response size and time, and treat all feed text as untrusted data. Render text, not publisher-supplied HTML. Do not let a feed or article supply application instructions.

## Implemented foundation and remaining production setup

The responsive `/news` index, `/news/sources` directory, `/news/methodology`, source registry, metadata ingestion, normalization, exact deduplication, visible source health, in-process cache, and public `/api/news` read endpoint are implemented. Browser polling checks the cached index every 60 seconds while the page is visible; an “Update view” control lets the reader choose when new records enter the stream. Search, topic/source filters, chronological ordering, and local saved references are part of this foundation. This plan and the SVG remain structural design documentation; actual runtime verification is a separate check.

The implementation supports an **optional Postgres archive** using server-side `DATABASE_URL` or `DIRECT_URL`. Successful ingestion creates news-owned item and latest-snapshot tables and upserts permitted metadata. The active index is bounded to 500 items. When no database is configured, or the database fails, it serves its memory cache and exposes the storage limitation. Database connectivity and table creation in a deployed environment still need verification; the existence of this adapter is not evidence that a production archive is connected.

`/api/news/refresh` accepts an authenticated request with `Authorization: Bearer <CRON_SECRET>` and rejects requests when the server secret is missing or incorrect. A local in-flight guard prevents overlapping refresh work within one server process. Automatic reads refresh after the 15-minute cache window; **the deployment and a production scheduler have not been activated by this implementation**. A closed, unvisited site needs a deployed scheduler calling that protected endpoint to continue ingesting.

`NEWS_BLOCKED_ARTICLE_IDS` can suppress specific item IDs, and disabling a source stops its metadata from being served even from an older snapshot. These controls apply on read and refresh. Production operations should additionally define archival deletion, cache invalidation beyond the current server, retention, and an audit trail for removals. A display suppression is not a claim that archived records have been permanently deleted.

Before announcing unattended production coverage:

1. Verify approved endpoints on the deployment host, dates and direct links, malformed response handling, source rights gates, stale-state behavior, and attribution (including author fields where required).
2. Connect and verify Postgres if a lasting repository is required. Define retention and purge behavior for the archive separately from the 500-item reading index.
3. Deploy the application and set `CRON_SECRET` in server configuration. Configure the production scheduler with its authentication, 15-minute interval, source-specific backoff, overlap protection across instances, and last-success monitoring. These hosting actions remain separate from source-code completion.
4. Re-review source terms before broader commercial use, feed advertising, summaries, images, or full-article syndication. Keep sources without a suitable reuse basis disabled.

Credentials and refresh tokens stay server-side and never appear in the public news snapshot. The source directory must reflect actual storage and fetch health, without claiming live production operation based only on this code.
