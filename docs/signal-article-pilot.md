# Blog and Signal article pilot

This bounded pilot adds a short Signal companion to OfRoot-owned published articles. It preserves the existing third-party news index and primary-evidence briefs. It does not place full article bodies in the discovery feed or establish new third-party reuse permissions.

## Publication rules

- Follow `/about/editorial-standards` and `docs/signal-editorial.md`. Primary-source rights, attribution, suppression and correction rules still apply.
- Use plain language, a useful next step and traceable sources. Keep facts, OfRoot commentary and examples distinct. No invented outcomes, citations or review claims.
- The initial manifest contains short extracts from 11 existing OfRoot guides. Their original article URLs, publication dates and identity remain intact. The remaining 19 slots are for future eligible articles, not invented filler.
- Count **30 unique articles total**, including existing articles and failed/pending narration. `checkedPilot` rejects a 31st article. Corrections or retries retain the same identity and slot.
- `registerPilotArticle` checks enrollment; it does not publish to the CMS. A publisher must check the manifest and the actual article before enabling its companion. The remote CMS publication hook is not yet integrated.
- Release the pilot only after content, actual audio assets, complete application verification and source review pass. The count includes every enrolled article, even when audio is pending or failed.

## Audio

Each narration uses the exact `pilotTranscript`. The player requires a saved MP3, its SHA-256, duration and matching transcript hash. A changed summary invalidates old audio. Do not claim completion from a playable URL alone; verify actual bytes, intelligibility, correct article, pause/seek, mobile playback, download and failure recovery.

Use the approved OpenAI connection on the server or generation workstation. Keep credentials private and out of client configuration. The default narration is the built-in Cedar voice, with clear, friendly pacing. Browser speech synthesis is not a saved recording; the UI and schema must not show completed audio when a real asset is missing.

## Release checks

Use the project's exact dependencies and current main. Check blog and Signal light/dark contrast, mobile layout, keyboard/focus, saved/search state, audio interaction, sources, canonical URLs, metadata and JSON-LD. Include only enabled, actually published pilot routes in the sitemap, with real publication/update dates. Cosmetic theme changes do not reset article dates.

Local component checks are separate from a full Next.js build, the external CMS, actual narration and canonical production verification.
