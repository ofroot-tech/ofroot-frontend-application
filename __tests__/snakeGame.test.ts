import {
  createSnakeGame,
  getFoodSpawnCell,
  setSnakeDirection,
  stepSnakeGame,
  type SnakeGameState,
} from '@/app/lib/games/snake';

function makeState(overrides: Partial<SnakeGameState> = {}): SnakeGameState {
  return {
    cols: 6,
    rows: 6,
    snake: [
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ],
    direction: 'right',
    food: { x: 5, y: 5 },
    score: 0,
    status: 'playing',
    ...overrides,
  };
}

describe('snake game logic', () => {
  it('creates a playable game with food on an unoccupied cell', () => {
    const state = createSnakeGame({ cols: 8, rows: 8 }, () => 0);
    expect(state.status).toBe('playing');
    expect(state.food).not.toBeNull();

    const foodKey = `${state.food?.x},${state.food?.y}`;
    const snakeKeys = new Set(state.snake.map((segment) => `${segment.x},${segment.y}`));
    expect(snakeKeys.has(foodKey)).toBe(false);
  });

  it('moves forward one cell per tick without growth when food is not hit', () => {
    const next = stepSnakeGame(makeState());
    expect(next.snake).toEqual([
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
    ]);
    expect(next.score).toBe(0);
    expect(next.status).toBe('playing');
  });

  it('ignores immediate reverse direction for multi-segment snake', () => {
    const reversed = setSnakeDirection(makeState(), 'left');
    expect(reversed.direction).toBe('right');

    const turned = setSnakeDirection(makeState(), 'up');
    expect(turned.direction).toBe('up');
  });

  it('grows snake, increments score, and respawns food when food is eaten', () => {
    const next = stepSnakeGame(
      makeState({
        food: { x: 3, y: 2 },
      }),
      () => 0
    );

    expect(next.snake).toEqual([
      { x: 3, y: 2 },
      { x: 2, y: 2 },
      { x: 1, y: 2 },
      { x: 0, y: 2 },
    ]);
    expect(next.score).toBe(1);
    expect(next.food).toEqual({ x: 0, y: 0 });
  });

  it('ends the game on wall collision', () => {
    const next = stepSnakeGame(
      makeState({
        snake: [
          { x: 5, y: 2 },
          { x: 4, y: 2 },
          { x: 3, y: 2 },
        ],
      })
    );

    expect(next.status).toBe('game-over');
    expect(next.gameOverReason).toBe('wall');
  });

  it('ends the game on self collision', () => {
    const next = stepSnakeGame(
      makeState({
        snake: [
          { x: 2, y: 2 },
          { x: 3, y: 2 },
          { x: 3, y: 1 },
          { x: 2, y: 1 },
          { x: 1, y: 1 },
          { x: 1, y: 2 },
        ],
        direction: 'up',
      })
    );

    expect(next.status).toBe('game-over');
    expect(next.gameOverReason).toBe('self');
  });

  it('marks board-full when last free cell is consumed', () => {
    const next = stepSnakeGame(
      makeState({
        cols: 2,
        rows: 2,
        snake: [
          { x: 0, y: 0 },
          { x: 0, y: 1 },
          { x: 1, y: 1 },
        ],
        direction: 'right',
        food: { x: 1, y: 0 },
      })
    );

    expect(next.score).toBe(1);
    expect(next.food).toBeNull();
    expect(next.status).toBe('game-over');
    expect(next.gameOverReason).toBe('board-full');
  });

  it('spawns food deterministically from the free-cell list', () => {
    const food = getFoodSpawnCell(
      3,
      2,
      [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 2, y: 0 },
        { x: 0, y: 1 },
      ],
      () => 0.95
    );

    expect(food).toEqual({ x: 2, y: 1 });
  });
});
