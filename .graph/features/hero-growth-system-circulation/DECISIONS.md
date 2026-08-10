# Decisions

## Decision: Orbit labels and counter-rotate their text
- Date: 2026-08-10
- Status: accepted
- Context: Rotating the whole diagram would turn labels sideways and upside down. Pulsing only the ring would not communicate circulation.
- Decision: Rotate one label track clockwise and counter-rotate each pill by the same duration so the labels travel while remaining upright.
- Evidence: E-1, E-3

## Decision: Use a small client observer with CSS motion
- Date: 2026-08-10
- Status: accepted
- Context: The loop is nonessential and should not consume work while offscreen or in a hidden tab.
- Decision: Keep geometry and animation declarative in CSS, and use `IntersectionObserver` plus `visibilitychange` only to control `animation-play-state`.
- Evidence: E-2, E-3

## Decision: Preserve the static first frame
- Date: 2026-08-10
- Status: accepted
- Context: Failed JavaScript and reduced-motion preferences must not hide the diagram or its meaning.
- Decision: Render the current three label positions by default and start movement only after visibility is observed.
- Evidence: E-2, E-3

## Decision: Publish through GitHub main and Vercel Git integration
- Date: 2026-08-10
- Status: accepted
- Context: `www.ofroot.technology` is currently served by the Vercel `main-website` production project from the repository's `main` branch.
- Decision: Commit and push the isolated branch, open a ready pull request, verify its Vercel preview, squash-merge to `main`, then verify the exact production deployment and canonical homepage.
- Evidence: E-7
