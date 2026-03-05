Original prompt: Build a classic Snake game in this repo with only classic loop features (grid movement, growth, food spawn, score, game-over, restart), reuse existing tooling, keep UI minimal, add deterministic/testable logic with basic tests, and include an extra feature where the snake game appears only when the user is about to leave the page.

## Progress Log
- Located existing `components/ExitIntentPrompt.tsx` hook in global layout, selected it as the integration point for the hidden feature.
- Added deterministic snake logic in `app/lib/games/snake.ts` (`createSnakeGame`, direction updates, tick stepping, food placement, collisions).
- Added new UI component `components/ExitIntentSnakeGame.tsx` with keyboard + mobile controls, pause/restart, and deterministic hooks (`window.render_game_to_text`, `window.advanceTime`).
- Reworked `components/ExitIntentPrompt.tsx` to open a compact snake panel on upward exit intent (once per session) instead of toast-only behavior.
- Added logic tests in `__tests__/snakeGame.test.ts` for movement, growth, collisions, direction rules, and deterministic food placement.
- Hardened keyboard handling so hotkeys do not fire while typing in inputs and pause only toggles during active gameplay.
- Attempted validation runs, but this shell currently has no Node runtime (`node`, `npm`, `npx` all missing), so Jest and Playwright checks could not be executed.
- Added marketing copy to the game panel: ongoing “win 10% off first month” message and a winner-state block showing code `SNAKE10` when the board is fully filled.
- Upgraded mobile friendliness:
  - larger mobile control pad with active press feedback
  - swipe gesture controls on board
  - gentler speed ramp for mobile and score-based acceleration
  - auto-pause on tab blur/visibility change
  - minimize button and compact reopen chip to avoid accidental close loss
- Added post-game offer funnel:
  - track attempts
  - after 3 finishes (if not yet won), show “proceed” prompt before email capture
  - when won, directly open email capture for discount follow-up
- Added `app/api/snake-offer/route.ts` to send offer leads via existing Resend credentials (`RESEND_API_KEY`, `RESEND_FROM`, `RESEND_FROM_NAME`, `CONTACT_EMAIL`).
- Added homepage CRO pass in `app/page.tsx`:
  - clearer primary offer copy
  - stronger above-the-fold proof strip
  - CTA hierarchy cleanup (single repeated primary intent: book 20-minute audit)
  - tracked homepage CTAs and service-card clicks
- Added client tracking helpers:
  - `components/home/HomeViewPing.tsx` for homepage view event
  - `components/home/HomeTrackedLink.tsx` for CTA click events
- Enabled Vercel custom event transport by mounting `Analytics` in `app/layout.tsx`.

## TODO / Next
- Install/enable Node in the shell, then run Jest for `__tests__/snakeGame.test.ts`.
- Start Next dev server and run Playwright game-client loop from the `develop-web-game` skill against the exit-intent panel, then inspect screenshots/text output.
