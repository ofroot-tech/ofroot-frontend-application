# Signal briefs

Implementation policy and reading experience, October 28, 2026.

## Improved product prompt

> Add a source-referenced Signal brief alongside every news reference while preserving the original publisher link. Use the Signal mark as the recognizable secondary action, with a descriptive accessible label and a comfortable touch target. Give available briefs a standalone `/news/briefs` collection, while keeping OfRoot-authored material in `/insights`.
>
> Build a concise reading view that follows OfRoot’s current dark plum, Geist, lavender-rule, and peach-accent design. Keep long headlines compact, make the evidence easy to inspect, and show the source publication date separately from evidence-check and brief-preparation dates. Present a short digest, cited primary-record details, clearly separated OfRoot context, scope limitations, and direct source references.
>
> Prefer exact, permitted primary-source material over rewriting another publisher’s article. For this release, assemble short extractive digests from approved research metadata and public-agency records; do not scrape commercial articles, summarize full papers, or use an AI model to invent prose or citations. Identify the result as an automated source digest and label any abridged source excerpt plainly. Discovery attribution and substantive evidence must remain distinguishable.
>
> If an approved primary record cannot support a brief, show an honest explanation and the original-publisher link. Never turn a headline alone into a substantive summary. Preserve the existing news scheduler, metadata index, source attribution, removal rules, and publisher traffic. Cache briefs separately, record their provenance, run the checks, and verify the complete desktop and mobile flow before release.

This implementation supports OfRoot’s practical-AI and connected-systems positioning through useful discovery, inspectable evidence, and clear limits. It does not present automated aggregation as independent journalism.

## Reader flow and information architecture

- `/news` remains the current discovery index. Original headlines open their publishers. The additional Signal-mark action opens `/news/brief/[id]`.
- `/news/briefs` contains available primary-source digests from the current index, with topic links and headline search. A topic without ready evidence stays visibly empty rather than receiving an unsupported summary.
- `/news/brief/[id]` shows the digest or a coverage explanation for a known reference. Approved archived metadata can preserve a permalink after the headline leaves the latest-news window; missing, suppressed, and paused-source references remain unavailable even if an old brief is cached.
- `/insights` remains the area for OfRoot-authored guides and analysis. It is not populated by the automated digest process.
- `/news/methodology#briefs` explains scope, evidence, citations, reuse, cache timing, and limitations to readers.

The brief’s citation **[1]** credits the discovery headline. Citation **[2]** identifies the actual primary record used for substantive text and structured details. These are provenance roles, not a claim that two independent sources verified the same story; agency items can have the same original URL in both roles. Original-publisher and primary-record links stay visible. A separate “View retrieved metadata” action opens the exact fixed API/feed endpoint used for the evidence check, so the record’s human-readable destination and its retrieved metadata are both inspectable.

## Evidence adapters and source policy

An approved discovery source is not automatically an approved digest source. Retrieval uses fixed endpoints and exact record identities, not model-generated URLs or a broad website crawler.

| Adapter | Exact match and permitted material | Scope and limitations |
| --- | --- | --- |
| arXiv via DataCite | The DOI, DataCite record ID, and registered research URL must match. Use the deposited abstract and bibliographic fields. | arXiv descriptive metadata, including abstracts, is CC0; deposited DataCite metadata is CC0. Linked full papers retain separate rights. An abstract states the authors’ claims and is not a full-paper review, replication, or verification of peer review. |
| Federal Register | Match the document number and original document URL. Use the agency-supplied abstract, type, citation, and dates when supplied. | Reproduction is permitted under the Federal Register’s policy and 1 CFR 2.6. API/XML material is informational; verify the official edition for legal reliance. A proposal or notice is not an enacted requirement. |
| CISA KEV | Match one exact CVE entry against CISA’s official GitHub data mirror. Use its description and structured catalog fields. | The KEV database is CC0. Third-party linked content is excluded. Catalog inclusion does not prove compromise of a reader’s systems; federal-agency remediation dates are not universal deadlines. “Unknown” ransomware use does not mean no ransomware use. |
| FDA | Match the fixed FDA RSS feed’s release URL and title exactly. Use only the short agency-supplied feed description. Reject an item bearing third-party or restrictive rights markings. | Agency-created material is public domain unless otherwise marked. The full release and supporting studies are not scraped or reviewed. Announcements are not independent clinical verification or individualized medical advice. |
| Commercial discovery reporting, including TechCrunch | Keep the approved, unchanged headline metadata and publisher attribution. No commercial article body is fetched by the brief adapters. | Discovery RSS terms do not establish permission for rewritten summaries. This release shows the coverage explanation when no reviewed primary-evidence adapter supports the reference. |

Policy references reviewed for the implementation:

- [arXiv API terms: descriptive metadata and full-text distinction](https://info.arxiv.org/help/api/tou.html).
- [DataCite data and file use policy](https://support.datacite.org/docs/datacite-data-file-use-policy).
- [Federal Register: about this site and copyright](https://www.federalregister.gov/reader-aids/government-policy-and-ofr-procedures/about-this-site).
- [Federal Register API documentation](https://www.federalregister.gov/developers/documentation/api/v1).
- [CISA KEV official data repository](https://github.com/cisagov/kev-data) and [CC0 license](https://github.com/cisagov/kev-data/blob/develop/LICENSE).
- [FDA website policies](https://www.fda.gov/about-fda/about-website/website-policies).
- [TechCrunch RSS terms](https://techcrunch.com/rss-terms-of-use/).

Source policies can change. Review the relevant rights basis before expanding to other records, full article text, images, advertising, or model-written summaries. Pending discovery sources remain disabled; broadening a brief adapter requires its own evidence and rights review.

## Composition and provenance

The generator is deterministic and extractive. It selects up to three complete sentences within a 110-word reading budget from the approved record’s abstract or short description. It does not splice claims, paraphrase restricted reporting, or call an LLM. Structured primary-record details can support a brief even when no sentence fits the excerpt budget; the reading view should then show those details without an empty quotation.

The introduction describes the record type and its scope. OfRoot context is a separate, category-specific, authored template expressed as considerations and limits. It is not additional reporting or an unsupported account of the event. Every displayed key detail points to the primary-record citation.

Evidence retrieval rejects redirects and unsafe record identities, applies an eight-second timeout and a streamed four-megabyte body limit, renders source material as plain text, and rejects unsafe XML declarations in the FDA feed. The CISA catalog request is coalesced and cached for 15 minutes to avoid fetching the whole catalog separately for every CVE.

Each cached brief records:

- The discovery article ID and a fingerprint over its metadata and generator version.
- The generator version and preparation timestamp.
- Status: `ready`, `unsupported`, or `unavailable`, with a reason when coverage is insufficient.
- The exact primary-record URL, fixed evidence-retrieval endpoint, title, publisher, publication date when supplied, and evidence-fetch timestamp.
- The reuse basis, evidence scope, source abstract or short description, structured details, and caveats.
- A SHA-256 content hash of the substantive evidence, excluding retrieval time so unchanged evidence keeps the same hash.

The reading page displays publication, source-check, and preparation dates separately, together with scope and reuse basis. Content hash, article fingerprint, and generator version remain recorded provenance for operators; they are not claims of editorial verification.

## Persistence, expiry, and access

The existing news metadata archive and 15-minute feed scheduler remain separate from briefs. Brief code uses the configured news database connection and an additive `ofroot_signal_briefs` table. This does not require changing or redeploying the existing Neon feed function.

Ready brief records expire after one hour; unsuccessful or unsupported results expire after 15 minutes. Evidence is checked again on a later request after expiry, rather than through a new unattended brief-generation schedule. A short, bounded process cache reduces repeated database reads, and matching concurrent requests share one in-flight operation. Database cache failures do not replace missing evidence with invented content.

Every detail request checks the current public news index, then can resolve an older reference from the existing metadata archive. Archived references pass through the same current source-approval and suppression policy before any brief is served. This keeps standalone permalinks useful after a headline leaves the latest-news window without turning a stored brief into a way to recover a removed or paused reference. Ready details have canonical URLs; unsupported and unavailable views are marked `noindex` while retaining useful original-source navigation.

The standalone collection uses bounded candidates and concurrency. It is a view of the latest available digests in the current index, not exhaustive coverage of all sources, all stored metadata, or the wider web.

## Reading UX rationale

The brief page uses the current Signal and OfRoot public-site palette and typography. It keeps the original headline at a compact 32–54px scale rather than turning a long headline into a marketing hero. A readable main column and a separate provenance rail stack into one column on smaller screens.

Readers first encounter the digest and its scope, then structured details, optional OfRoot context, caveats, and full references. Short inline citations lead to a visible source layer with return links. Discovery attribution is distinguished from evidence, and commentary is distinguished from source text. Original-source actions remain prominent. The page uses semantic headings, descriptive link labels, visible focus, comfortable touch targets, and static reading text; it adds no continuous canvas animation to the detail view.

This structure gives readers a useful first read while making it easy to inspect the evidence and continue at the source. Empty, unsupported, and temporarily unavailable states explain their limits rather than borrowing the visual appearance of a completed summary.
