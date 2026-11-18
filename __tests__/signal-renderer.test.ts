import { drawSignal, sampleSignalImpact, sampleSignalPacket } from '@/components/brand/signal-renderer';

function recordingContext() {
  const squares: number[][] = [];
  const context = {
    clearRect: jest.fn(),
    save: jest.fn(),
    restore: jest.fn(),
    translate: jest.fn(),
    scale: jest.fn(),
    fillRect: (...rect: number[]) => squares.push(rect),
    fillStyle: '',
    globalAlpha: 1,
  };
  return { context: context as unknown as CanvasRenderingContext2D, squares };
}

describe('the pixel signal transmission', () => {
  it('carries a packet from the left sources, through the mark, to the right sources', () => {
    const positions = [0, 1.5, 2.7, 4].map(time => sampleSignalPacket(time, 0));
    expect(positions.every(packet => packet.visible)).toBe(true);
    expect(positions[0].x).toBeLessThan(328);
    expect(positions[1].x).toBeGreaterThan(328);
    expect(positions[2].x).toBeGreaterThan(584);
    expect(positions[3].x).toBeGreaterThan(850);
    expect(sampleSignalPacket(5, 0).visible).toBe(false);
    expect(sampleSignalPacket(6.4, 0).x).toBeCloseTo(positions[0].x);
  });

  it('disturbs the five bars in travel order and reforms each row behind the packet', () => {
    const peaks = Array.from({ length: 5 }, (_, bar) => {
      let peakTime = 0;
      let peakEnergy = 0;
      for (let time = 0; time < 4; time += 0.005) {
        const energy = sampleSignalImpact(time, 0, bar);
        if (energy > peakEnergy) { peakEnergy = energy; peakTime = time; }
      }
      expect(peakEnergy).toBeGreaterThan(0.95);
      expect(sampleSignalImpact(peakTime - 0.1, 0, bar)).toBe(0);
      expect(sampleSignalImpact(peakTime + 0.33, 0, bar)).toBe(0);
      return peakTime;
    });
    expect(peaks.every((time, bar) => bar === 0 || time > peaks[bar - 1])).toBe(true);
    expect(peaks[4] - peaks[0]).toBeGreaterThan(1);
    expect(peaks[4] - peaks[0]).toBeLessThan(1.5);
  });

  it('gives every row a staggered transmission instead of blinking the entire mark', () => {
    const positions = Array.from({ length: 11 }, (_, row) => sampleSignalPacket(0, row).x);
    expect(new Set(positions).size).toBe(11);
    for (let row = 0; row < 11; row++) {
      let wasHit = false;
      for (let time = 0; time < 6.4; time += 0.05) {
        if (sampleSignalImpact(time, row, 2) > 0.5) wasHit = true;
      }
      expect(wasHit).toBe(true);
    }
  });

  it('draws real pixel displacement and gaps, while still mode ignores the clock', () => {
    const first = recordingContext();
    const later = recordingContext();
    const moving = recordingContext();
    drawSignal(first.context, 960, 320, 0, { still: true });
    drawSignal(later.context, 960, 320, 3.8, { still: true });
    drawSignal(moving.context, 960, 320, 4.95);
    expect(later.squares).toEqual(first.squares);
    const pristineBody = first.squares.filter(rect => rect[2] === 12);
    const movingBody = moving.squares.filter(rect => rect[2] === 12);
    expect(pristineBody).toHaveLength(99);
    expect(movingBody).not.toEqual(pristineBody);
    expect(movingBody.every(rect => rect[2] === rect[3])).toBe(true);
    expect(moving.squares.length).toBeLessThan(250);
    expect(moving.context.clearRect).toHaveBeenCalledWith(0, 0, 960, 320);
  });

  it('fits a bounded stage and does no drawing when the host has no size', () => {
    const { context, squares } = recordingContext();
    drawSignal(context, 480, 160, 0);
    expect(context.scale).toHaveBeenCalledWith(0.5, 0.5);
    squares.length = 0;
    drawSignal(context, 0, 0, 0);
    expect(squares).toHaveLength(0);
  });
});
