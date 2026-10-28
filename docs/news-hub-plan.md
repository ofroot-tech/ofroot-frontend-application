# OfRoot Signal: news hub plan

Prepared October 27, 2026; visual direction updated October 28, 2026. Product route: `/news`. The [original October 27 wireframe](../public/news-wireframe.svg) is a historical structure reference; its cream/green styling and ordering are superseded by the current implementation described below. Current production infrastructure and verification are recorded in [news operations](news-operations.md).

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

Keep OfRoot's existing site navigation and footer. The newsroom's own publication bar links the index, source directory, and methodology. Broader global-navigation discoverability can be reviewed separately without replacing the consulting homepage or insights library. Keep externally published news distinct from OfRoot-authored insights.

## Current desktop structure

1. Existing dark OfRoot navigation.
2. Compact Signal publication bar: wordmark, The latest, Our sources, and How it works.
3. Compact editorial hero: “Stay ahead. Read the source.” with a short description of the five beats, a link to the latest stream, and a secondary methodology link. A restrained information plane shows beat, feed, and index counts on larger screens.
4. Date and truthful source-status line immediately below the hero. Refresh health can indicate delayed checks or partially unavailable sources; the source directory holds detailed last-check and last-success records.
5. Five topic-filter cells before the highlights. Each uses an icon, mono number, topic name, and short explanation. Active selection has a contrasting surface and an accent rule; selecting it again clears the topic.
6. Lead area: newest eligible item with source name, item kind, publication date, complete headline, and a prominent direct source link. A short list shows the next three items in the same chronological order.
7. Latest stream: search input, visible result count, ordering control where supported, and story rows. Each row shows topic, headline, source, item kind, publication time or “Date unavailable,” save control, and direct source link.
8. Secondary rail: source coverage and aggregation explanation. Put source health details in the directory, keeping the reading screen focused.
9. Footer: methodology, source directory, rights/corrections contact, and existing OfRoot links.

Use the current public site's dark plum (`#17141f`) foundation, off-white (`#faf9fc`) type, restrained lavender surfaces and rules, lavender (`#b4a0ef`) details, and peach (`#ffb78f`) accents. Geist Sans carries headlines and reading text; Geist Mono carries small uppercase labels, dates, and counts. Match the public site's 1600-pixel maximum shell, responsive gutters, tight large headings, flat rectangular planes, and thin borders. Keep green/amber for actual source-status meaning. Publisher photos, logos, and article-body excerpts remain absent until their specific reuse permissions have been recorded.

The rationale is continuity with OfRoot's redesigned public site while retaining a clear reading hierarchy. Shared `HeroShimmer` and `MotionText` provide the existing bounded hero animation and static heading reveals, including reduced-motion behavior. Live publisher headlines remain stable when the index is checked. The implementation is the current visual reference: [Newsroom.tsx](../app/news/Newsroom.tsx), [news.module.css](../app/news/news.module.css), and [SignalHeader.tsx](../app/news/SignalHeader.tsx), aligned with [ApprovedHome.module.css](../components/growth/ApprovedHome.module.css) and [PublicPage.module.css](../components/growth/PublicPage.module.css). Source and methodology pages use the same newsroom styles and shared heading motion.

## Mobile behavior and accessibility

Stack the highlights and reading layout, and hide the supplementary hero information plane on smaller screens. Keep search full width. Show all five topic cells in a wrapping mobile grid rather than a horizontally scrolling strip, so every beat remains discoverable and the page fits the viewport. Story titles and source metadata wrap. Controls and saved buttons retain at least 44-pixel target areas. Direct source links describe their destination.

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

## Original foundation and production checklist (October 27)

The following architecture and setup notes record the original implementation stage. Subsequent database connection, scheduler activation, and deployment verification are documented in [news operations](news-operations.md); these historical setup notes are not the current production status. The October 28 redesign changes presentation, not ingestion or scheduling.

The responsive `/news` index, `/news/sources` directory, `/news/methodology`, source registry, metadata ingestion, normalization, exact deduplication, visible source health, in-process cache, and public `/api/news` read endpoint are implemented. Browser polling checks the cached index every 60 seconds while the page is visible; an “Update view” control lets the reader choose when new records enter the stream. Search, topic/source filters, chronological ordering, and local saved references are part of this foundation. The original SVG documents the initial design only; the current UI source files above supersede its visual treatment and ordering. Actual runtime verification is a separate check.

The implementation supports an **optional Postgres archive** using server-side `DATABASE_URL` or `DIRECT_URL`. Successful ingestion creates news-owned item and latest-snapshot tables and upserts permitted metadata. The active index is bounded to 500 items. When no database is configured, or the database fails, it serves its memory cache and exposes the storage limitation. Database connectivity and table creation in a deployed environment still need verification; the existence of this adapter is not evidence that a production archive is connected.

`/api/news/refresh` accepts an authenticated request with `Authorization: Bearer <CRON_SECRET>` and rejects requests when the server secret is missing or incorrect. A local in-flight guard prevents overlapping refresh work within one server process. Automatic reads refresh after the 15-minute cache window; **the deployment and a production scheduler have not been activated by this implementation**. A closed, unvisited site needs a deployed scheduler calling that protected endpoint to continue ingesting.

`NEWS_BLOCKED_ARTICLE_IDS` can suppress specific item IDs, and disabling a source stops its metadata from being served even from an older snapshot. These controls apply on read and refresh. Production operations should additionally define archival deletion, cache invalidation beyond the current server, retention, and an audit trail for removals. A display suppression is not a claim that archived records have been permanently deleted.

Before announcing unattended production coverage:

1. Verify approved endpoints on the deployment host, dates and direct links, malformed response handling, source rights gates, stale-state behavior, and attribution (including author fields where required).
2. Connect and verify Postgres if a lasting repository is required. Define retention and purge behavior for the archive separately from the 500-item reading index.
3. Deploy the application and set `CRON_SECRET` in server configuration. Configure the production scheduler with its authentication, 15-minute interval, source-specific backoff, overlap protection across instances, and last-success monitoring. These hosting actions remain separate from source-code completion.
4. Re-review source terms before broader commercial use, feed advertising, summaries, images, or full-article syndication. Keep sources without a suitable reuse basis disabled.

Credentials and refresh tokens stay server-side and never appear in the public news snapshot. The source directory must reflect actual storage and fetch health, without claiming live production operation based only on this code.
