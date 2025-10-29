// app/lib/ui/physics.ts
// A tiny, dependency-free physics helper for organic UI animations.
// Provides a spring-based "liquid open" effect by animating a clip-path circle.

export type Spring = {
  stiffness: number; // k
  damping: number;   // c
  mass: number;      // m
};

function now() {
  return typeof performance !== 'undefined' ? performance.now() : Date.now();
}

// Simple critically-damped spring integrator
function stepSpring(x: number, v: number, target: number, dt: number, s: Spring) {
  const k = s.stiffness;
  const c = s.damping;
  const m = s.mass;
  // Force = -k(x - target) - c*v
  const a = (-k * (x - target) - c * v) / m;
  const v2 = v + a * dt;
  const x2 = x + v2 * dt;
  return { x: x2, v: v2 };
}

export type LiquidOpenOptions = {
  spring?: Partial<Spring>;
  center?: { x: number; y: number };
  shape?: 'circle' | 'roundedRect';
  borderRadius?: number; // px for rounded rect corner radius
};

export class LiquidOpen {
  private el: HTMLElement;
  private frame: number | null = null;
  private spring: Spring;
  private radius = 1; // initial px radius
  private velocity = 0;
  private maxRadius = 0;
  private startedAt = 0;
  private center: { x: number; y: number };
  private targetRadius = 0;
  private shape: 'circle' | 'roundedRect' = 'circle';
  private cornerRadius: number = 16;

  constructor(el: HTMLElement, opts?: LiquidOpenOptions) {
    this.el = el;
    const rect = el.getBoundingClientRect();
    this.maxRadius = Math.hypot(rect.width, rect.height) * 0.75; // expand beyond bounds a bit
  // Default to true geometric center unless caller specifies otherwise
  this.center = opts?.center || { x: rect.width / 2, y: rect.height / 2 };
    const base: Spring = { stiffness: 400, damping: 38, mass: 1 };
    this.spring = { ...base, ...(opts?.spring || {}) } as Spring;
    this.shape = opts?.shape || 'circle';
    this.cornerRadius = opts?.borderRadius ?? 16;
  }

  start() { // open
    this.startedAt = now();
    this.radius = 1;
    this.velocity = 0;
    this.targetRadius = this.maxRadius;
    this.tick();
  }

  startOpen() {
    this.start();
  }

  startClose() {
    const rect = this.el.getBoundingClientRect();
    this.maxRadius = Math.hypot(rect.width, rect.height) * 0.75;
    this.startedAt = now();
    this.radius = this.maxRadius;
    this.velocity = 0;
    this.targetRadius = 1;
    this.tick();
  }

  private tick = () => {
    const t = now();
    const dt = Math.min(32, t - (this.startedAt || t)) / 1000; // clamp large dt
    this.startedAt = t;
    const { x, v } = stepSpring(this.radius, this.velocity, this.targetRadius || this.maxRadius, dt, this.spring);
    this.radius = x;
    this.velocity = v;
    let clip: string;
    if (this.shape === 'roundedRect') {
      const rect = this.el.getBoundingClientRect();
      const r = Math.max(1, this.radius);
      const left = Math.max(0, this.center.x - r);
      const top = Math.max(0, this.center.y - r);
      const right = Math.max(0, rect.width - (this.center.x + r));
      const bottom = Math.max(0, rect.height - (this.center.y + r));
      clip = `inset(${top.toFixed(1)}px ${right.toFixed(1)}px ${bottom.toFixed(1)}px ${left.toFixed(1)}px round ${this.cornerRadius}px)`;
    } else {
      clip = `circle(${Math.max(1, this.radius).toFixed(1)}px at ${this.center.x.toFixed(1)}px ${this.center.y.toFixed(1)}px)`;
    }
    this.el.style.clipPath = clip as any;
    (this.el.style as any).webkitClipPath = clip;
    this.el.style.willChange = 'clip-path';
    const nearTarget = Math.abs(this.radius - (this.targetRadius || this.maxRadius)) > 1 || Math.abs(this.velocity) > 0.01;
    if (nearTarget) {
      this.frame = requestAnimationFrame(this.tick);
    } else {
      this.stop();
      // settle fully open
  this.el.style.clipPath = 'none' as any;
  (this.el.style as any).webkitClipPath = 'none';
      this.el.style.willChange = '';
    }
  };

  stop() {
    if (this.frame != null) cancelAnimationFrame(this.frame);
    this.frame = null;
  }
}
