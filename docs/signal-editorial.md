# Signal selection and source review

The chronological index retains source headlines and dates. `app/lib/news/editorial.ts` supplies a separate, deterministic featured selection: dated references from the past fourteen days, ordered by recency, explicit technology relevance, primary-record type, and then topic/publisher diversity. A publisher can receive at most two of four slots. Several category feeds from one domain count as one publisher. No popularity or credibility score is shown, and no human review is implied.

Ticket discounts, countdown promotions, sponsored-content labels, and NIST event listings are excluded at read time as well as ingestion time. This also filters records retained before the new rule was deployed. Publisher headlines are never rewritten to hide promotional wording.

Story groups require the same category, dates within seven days, and either the same exact CVE identifier set or at least five shared substantive headline words with at least 68% token overlap. Every member must match the earliest anchor; there is no transitive chain matching. Groups preserve all links and count distinct organizations, without calling them independent confirmations. The earliest reference ID anchors the permalink while it remains in the index.

The `/news/stories` directory and related-coverage tab open `/news/story/[id]` publication timelines. Matching is recalculated from the current index. An archived anchor can still resolve to its permitted original reference after the group leaves that window; this is not a permanent archive of all group relationships. Timeline detail pages are `noindex`, and preserve discovery attribution rather than presenting a collection of headlines as an original OfRoot report. Source and query filters select a matching group member before choosing one representative, so older matching references remain discoverable.

The shorter masthead and topic controls prioritize reading. Existing shimmer and text primitives handle introductory motion; hover transitions give reading actions feedback. New headlines wait for explicit reader acceptance, and reduced-motion preferences disable the added transitions and entry animation.

## Additional source review — October 29, 2026

Two official endpoints were tested with HTTP 200 and valid RSS metadata before activation:

- **NIST information technology:** `https://www.nist.gov/news-events/information%20technology/rss.xml`. Listed by the [official feed directory](https://www.nist.gov/coo/nist-rss-feeds). [NIST's policy](https://www.nist.gov/copyrights-disclaimers) permits copying/distributing public information except material marked copyrighted. Use is restricted to attributed agency headlines, dates, and links. Events, bodies, imagery, logos, and third-party content are excluded. Website and email metadata reuse are recorded separately. A matching article-body evidence adapter is not enabled by this permission.
- **CMS health technology:** `https://www.cms.gov/newsroom/rss-feeds`. [CMS identifies its website as public domain and permits contextual links](https://www.cms.gov/about-cms/web-policies-important-links/about-website/link-to-us). The adapter indexes only agency newsroom metadata that explicitly concerns digital health, data, interoperability, prior authorization, or technology. It repairs the feed's current encoded-anchor link format only for fixed `/newsroom/` paths on `www.cms.gov`. Since feed timestamps lack a timezone, publication dates retain calendar-date precision. Bodies, logos, imagery, and third-party works are excluded. Website/email metadata use are separate recorded decisions, not an automatic entitlement to substantive digests.

The NIH endpoint returned HTTP 403 and was not activated. No vendor source was activated based only on public access to a feed or repository. Existing brief/email evidence gates remain in force; the new feeds initially extend the discovery index.
