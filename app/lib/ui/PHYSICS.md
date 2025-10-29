LiquidOpen spring engine

Overview

LiquidOpen provides a small, dependency-free spring integrator used for clip-path circle "liquid" reveal animations. It animates a circular clip-path that grows/shrinks from a center point to reveal or hide UI content with an organic, spring-like motion.

Where it's implemented

- `app/lib/ui/physics.ts` — Contains the `LiquidOpen` class and the spring integrator.
- `app/lib/ui/useLiquidOpen.ts` — React hook wrapper used to attach `LiquidOpen` to DOM elements.

Key parameters

- stiffness (k): Controls how strongly the spring pulls toward the target radius. Higher values make the animation faster and snappier.
- damping (c): Controls how quickly oscillations die out. Higher values reduce bounce; lower values allow a snappier, springy feel.
- mass (m): Higher mass slows the response (more inertia).

Default values

`physics.ts` sets these defaults in the `LiquidOpen` constructor:

const base: Spring = { stiffness: 400, damping: 38, mass: 1 };

Tuning guidance

- Make only per-instance changes where possible. Many components reuse the engine; changing the global default will affect all of them.
- Example roles:
  - Snappy open: stiffness 700–900, damping 45–60
  - Gentle open: stiffness 220–350, damping 30–42
  - Smooth with slight bounce: stiffness 450–550, damping 30–40

How to override per use

When calling `useLiquidOpen` you can pass a `spring` override like:

useLiquidOpen(visible, { spring: { stiffness: 800, damping: 50 }, mode: open ? 'open' : 'close' })

CSS transitions vs spring

- The fluid clip-path motion is handled by the physics engine above.
- The nav panel and backdrop transitions (opacity, translate) are CSS-driven via Tailwind utilities (e.g. `transition-opacity duration-700` or `transition-all duration-300`).
- To create asymmetric open/close durations for the CSS elements, toggle inline styles or classes based on the `open` state.

Examples

1) Make the nav liquid reveal slower but the panel drop faster:

useLiquidOpen(visible, { spring: { stiffness: 300, damping: 36 }, mode: open ? 'open' : 'close' });

and on the panel element:

style={{ transitionDuration: open ? '220ms' : '120ms' }}

Testing

- Use Storybook or a local page to try different values. Small increments are best.
- Watch for overshoot/oscillation; increasing damping is the simplest way to reduce this.

Notes

- The integrator is intentionally simple and deterministic; it clamps dt for stability.
- When the spring reaches its target, the code sets `clip-path: none` to remove the mask and avoid layout problems.
