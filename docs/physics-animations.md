# Physics animations: Liquid reveal

This project includes a tiny, dependency-free physics helper that creates an organic "liquid open" animation by animating a CSS clip-path circle. It's designed to feel alive and be reused across overlays, cards, and panels.

## What’s included

- `app/lib/ui/physics.ts`
  - `Spring` type and spring integrator
  - `LiquidOpen` class that animates `clip-path: circle(...)`
- `app/lib/ui/useLiquidOpen.ts`
  - `useLiquidOpen(enabled, options)` React hook
  - `LiquidReveal` convenience component wrapper

## Quick start

- Hook usage:

```tsx
'use client';
import { useLiquidOpen } from '@/app/lib/ui/useLiquidOpen';

export default function Example() {
  const [open, setOpen] = useState(false);
  const panelRef = useLiquidOpen(open, { spring: { stiffness: 420, damping: 36 } });

  return (
    <>
      <button onClick={() => setOpen((v) => !v)}>Toggle</button>
      {open && (
        <div ref={panelRef as any} className="rounded-xl bg-white p-6 shadow-xl">
          Hello 👋
        </div>
      )}
    </>
  );
}
```

- Component wrapper:

```tsx
import { LiquidReveal } from '@/app/lib/ui/useLiquidOpen';

<LiquidReveal active={open} className="rounded-xl bg-white p-6 shadow-xl">
  Content here
</LiquidReveal>
```

## Options

```ts
export type LiquidOpenOptions = {
  spring?: Partial<Spring>; // stiffness, damping, mass
  center?: { x: number; y: number }; // origin of the circle inside the element
};
```

- By default, the center is computed from the element bounds: `x = width/2`, `y = height/3` for a slightly top-weighted pour effect.
- You can override `center` to bias the reveal from a specific point (e.g., source button location).

## Best practices

- Use for opening transitions; the animation reveals content then disables clip-path for perf.
- Avoid nesting multiple clip-path animations on the same element; prefer wrapping with `LiquidReveal`.
- Keep spring values modest: `stiffness` ~ 360–480, `damping` ~ 30–42.

## Extending

- Additional effects can be added alongside `clip-path` (e.g., subtle opacity/translate). The `LiquidOpen` class is single-responsibility; compose other CSS transitions in components.
- To add a new animation mode (e.g., liquid close), consider adding another class or extending `LiquidOpen` with a `reverse()` method and a target of 0 radius.

## Where it’s used

- Navbar overlay panel
- Chat widget panel
- Invoice detail content and items editor container

## Troubleshooting

- If TypeScript complains about `webkitClipPath`, the code casts the style to `any` for cross-browser support. This is intentional.
- If the element doesn’t animate, ensure it is mounted in the DOM when `useLiquidOpen` runs and that `active`/`enabled` is `true`.
