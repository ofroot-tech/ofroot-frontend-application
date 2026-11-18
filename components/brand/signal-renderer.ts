type SignalOptions = { still?: boolean; faint?: boolean };

const BAR_LEFT = [328, 392, 456, 520, 584] as const;
const BAR_ROWS = [3, 7, 11, 7, 5] as const;
const PERIOD = 6.4;
const SPEED = 210;
const ORIGIN = 48;
const ROW_DELAY = 0.58;
const PEACH = '#ffb78f';
const LAVENDER = '#c3afe1';

const modulo = (value: number, divisor: number) => ((value % divisor) + divisor) % divisor;

/** Horizontal rows are numbered 0–10, from the top to the bottom of the mark. */
export function sampleSignalPacket(timeSeconds: number, row: number) {
  const phase = modulo(timeSeconds + row * ROW_DELAY, PERIOD);
  const x = ORIGIN + phase * SPEED;
  return { x, visible: x <= 912 };
}

function impactAt(timeSeconds: number, row: number, x: number) {
  const phase = modulo(timeSeconds + row * ROW_DELAY, PERIOD);
  const age = phase - (x - ORIGIN) / SPEED;
  // A short front opens the row; a longer tail puts each pixel back in place.
  if (age < 0 || age >= 0.32) return 0;
  return age < 0.055 ? age / 0.055 : ((0.32 - age) / 0.265) ** 2;
}

/** The same row packet reaches each successive bar, rather than independent beats. */
export function sampleSignalImpact(timeSeconds: number, row: number, bar: number) {
  return impactAt(timeSeconds, row, BAR_LEFT[bar]);
}

/**
 * Paints a transparent, self-contained 3:1 illustration from a caller-owned clock.
 * This function owns no frame loop, listeners, elapsed time, or mutable state.
 */
export function drawSignal(
  context: CanvasRenderingContext2D,
  width: number,
  height: number,
  timeSeconds: number,
  { still = false, faint = false }: SignalOptions = {},
) {
  context.clearRect(0, 0, width, height);
  if (!Number.isFinite(width) || !Number.isFinite(height) || width <= 0 || height <= 0) return;
  const time = still || !Number.isFinite(timeSeconds) ? 0 : timeSeconds;
  const brightness = faint ? 0.45 : 1;
  const scale = Math.min(width / 960, height / 320);

  context.save();
  context.translate((width - 960 * scale) / 2, (height - 320 * scale) / 2);
  context.scale(scale, scale);

  // A sparse lattice keeps the signal's rows legible without a costly full field.
  context.fillStyle = LAVENDER;
  context.globalAlpha = 0.13 * brightness;
  for (let y = 52; y <= 268; y += 54) {
    for (let x = 54; x <= 906; x += 54) context.fillRect(x, y, 1.5, 1.5);
  }

  BAR_LEFT.forEach((left, bar) => {
    // The centre-row packet also adds a whole pixel to each end of a bar. The
    // height change travels with the very same packet as the row disturbance.
    const extension = !still && sampleSignalImpact(time, 5, bar) > 0.34 ? 1 : 0;
    const halfRows = (BAR_ROWS[bar] - 1) / 2 + extension;
    for (let localRow = -halfRows; localRow <= halfRows; localRow++) {
      const row = localRow + 5;
      const y = 154 + localRow * 18;
      for (let column = 0; column < 3; column++) {
        const x = left + column * 18;
        const packet = sampleSignalPacket(time, row);
        const impact = still ? 0 : impactAt(time, row, x + 6);
        // The packet occupies a real gap in the row; neighbouring squares move
        // forwards and alternate above/below the row, then return behind it.
        if (!still && packet.visible && Math.abs(packet.x - (x + 6)) < 6) continue;
        const dx = impact * 14;
        const dy = impact * (row % 2 === 0 ? -9 : 9);
        context.fillStyle = impact > 0.5 ? '#ffdcc7'
          : (bar === 4 && (row + column) % 3 === 0) || (bar === 3 && localRow > 1 && column === 2)
            ? LAVENDER : PEACH;
        context.globalAlpha = (0.72 + ((bar * 3 + column * 2 + row) % 5) * 0.055) * brightness;
        context.fillRect(x + dx, y + dy, 12, 12);
      }
    }
  });

  for (let row = 0; row < 11; row++) {
    const packet = sampleSignalPacket(time, row);
    if (!packet.visible) continue;
    // The still mark keeps a few ambient source pixels, clear of the five bars.
    if (still && (row % 3 !== 0 || (packet.x > 300 && packet.x < 660))) continue;
    const y = 157 + (row - 5) * 18;
    context.fillStyle = row % 3 === 0 ? LAVENDER : PEACH;
    context.globalAlpha = 0.26 * brightness;
    context.fillRect(packet.x - 25, y + 1, 3, 3);
    context.globalAlpha = 0.48 * brightness;
    context.fillRect(packet.x - 13, y, 5, 5);
    context.globalAlpha = 0.94 * brightness;
    context.fillRect(packet.x, y - 1, 7, 7);
  }
  context.restore();
}
