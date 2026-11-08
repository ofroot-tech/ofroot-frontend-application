# Blog and Signal article pilot

This bounded pilot adds a short Signal companion to OfRoot-owned published articles. It preserves the existing third-party news index and primary-evidence briefs. It does not place full article bodies in the discovery feed or establish new third-party reuse permissions.

## Publication rules

- Follow `/about/editorial-standards` and `docs/signal-editorial.md`. Primary-source rights, attribution, suppression and correction rules still apply.
- Use plain language, a useful next step and traceable sources. Keep facts, OfRoot commentary and examples distinct. No invented outcomes, citations or review claims.
- The initial manifest contains short extracts from 11 existing OfRoot guides. Their original article URLs, publication dates and identity remain intact. The remaining 19 slots are for future eligible articles, not invented filler.
- Count **30 unique articles total**, including existing articles and failed/pending narration. `checkedPilot` rejects a 31st article. Corrections or retries retain the same identity and slot.
- `registerPilotArticle` checks enrollment in the source-owned publishing list. The current confirmed publishing path is Codex and reviewed website source, so the public reading pages require no separate CMS API.
- The owner confirmed that articles are currently posted through Codex. The build checks source-guide coverage while slots remain, source summaries, and actual accepted recording bytes. Future website-editor support remains a separate setup and must use this same 30-total list; do not create a second counter.
- Release the pilot only after content, actual audio assets, complete application verification and source review pass. The count includes every enrolled article, even when audio is pending or failed.

## Audio

Each narration uses the exact `pilotTranscript`. The player requires a saved MP3, its SHA-256, duration and matching transcript hash. A changed summary invalidates old audio. Do not claim completion from a playable URL alone; verify actual bytes, intelligibility, correct article, pause/seek, mobile playback, download and failure recovery.

Use the approved OpenAI connection on the server or generation workstation. Keep credentials private and out of client configuration. The default narration is the built-in Cedar voice, with clear, friendly pacing. Browser speech synthesis is not a saved recording; the UI and schema must not show completed audio when a real asset is missing.

## Release checks

Use the project's exact dependencies and current main. Check blog and Signal light/dark contrast, mobile layout, keyboard/focus, saved/search state, audio interaction, sources, canonical URLs, metadata and JSON-LD. Include only enabled, actually published pilot routes in the sitemap, with real publication/update dates. Cosmetic theme changes do not reset article dates.

Local component checks are separate from a full Next.js build, the external CMS, actual narration and canonical production verification.

## Next articles through Codex

For each new owned article, review its facts and source rights, register one identity in this list, prepare its short Signal and exact transcript, generate and verify its saved narration, then update its file hash, transcript hash and duration. The build must pass before publication. While slots remain, a new guide or static blog article without an enrolled companion fails the publishing checks. At 30 unique articles, stop pilot enrollment; normal article publishing may continue. Failed narration and retries retain the original slot.
