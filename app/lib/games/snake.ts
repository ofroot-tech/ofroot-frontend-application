export type SnakeDirection = 'up' | 'down' | 'left' | 'right';
export type SnakeGameStatus = 'playing' | 'game-over';
export type SnakeGameOverReason = 'wall' | 'self' | 'board-full';

export type GridPosition = {
  x: number;
  y: number;
};

export type SnakeGameConfig = {
  cols: number;
  rows: number;
  initialLength?: number;
  initialDirection?: SnakeDirection;
};

export type SnakeGameState = {
  cols: number;
  rows: number;
  snake: GridPosition[];
  direction: SnakeDirection;
  food: GridPosition | null;
  score: number;
  status: SnakeGameStatus;
  gameOverReason?: SnakeGameOverReason;
};

const DIRECTION_DELTAS: Record<SnakeDirection, GridPosition> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
};

const OPPOSITE_DIRECTIONS: Record<SnakeDirection, SnakeDirection> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
};

const DEFAULT_INITIAL_LENGTH = 3;

function positionsEqual(a: GridPosition, b: GridPosition) {
  return a.x === b.x && a.y === b.y;
}

function isOutOfBounds(position: GridPosition, cols: number, rows: number) {
  return position.x < 0 || position.y < 0 || position.x >= cols || position.y >= rows;
}

export function getFoodSpawnCell(
  cols: number,
  rows: number,
  occupied: GridPosition[],
  random: () => number = Math.random
): GridPosition | null {
  const occupiedCells = new Set(occupied.map((segment) => `${segment.x},${segment.y}`));
  const freeCells: GridPosition[] = [];

  for (let y = 0; y < rows; y += 1) {
    for (let x = 0; x < cols; x += 1) {
      const key = `${x},${y}`;
      if (!occupiedCells.has(key)) {
        freeCells.push({ x, y });
      }
    }
  }

  if (freeCells.length === 0) return null;

  const index = Math.floor(random() * freeCells.length);
  return freeCells[Math.min(index, freeCells.length - 1)];
}

export function createSnakeGame(
  config: SnakeGameConfig,
  random: () => number = Math.random
): SnakeGameState {
  const cols = Math.max(2, Math.floor(config.cols));
  const rows = Math.max(2, Math.floor(config.rows));
  const initialLength = Math.min(
    cols,
    Math.max(2, Math.floor(config.initialLength ?? DEFAULT_INITIAL_LENGTH))
  );
  const direction = config.initialDirection ?? 'right';
  const startX = Math.max(initialLength - 1, Math.floor(cols / 2));
  const startY = Math.floor(rows / 2);

  const snake = Array.from({ length: initialLength }, (_, index) => ({
    x: startX - index,
    y: startY,
  }));

  const food = getFoodSpawnCell(cols, rows, snake, random);

  return {
    cols,
    rows,
    snake,
    direction,
    food,
    score: 0,
    status: food ? 'playing' : 'game-over',
    gameOverReason: food ? undefined : 'board-full',
  };
}

export function setSnakeDirection(
  state: SnakeGameState,
  requestedDirection: SnakeDirection
): SnakeGameState {
  if (state.status !== 'playing') return state;
  if (state.direction === requestedDirection) return state;

  const reversingDirection = OPPOSITE_DIRECTIONS[state.direction] === requestedDirection;
  if (reversingDirection && state.snake.length > 1) return state;

  return {
    ...state,
    direction: requestedDirection,
  };
}

export function stepSnakeGame(
  state: SnakeGameState,
  random: () => number = Math.random
): SnakeGameState {
  if (state.status !== 'playing') return state;

  const head = state.snake[0];
  const delta = DIRECTION_DELTAS[state.direction];
  const nextHead = { x: head.x + delta.x, y: head.y + delta.y };

  if (isOutOfBounds(nextHead, state.cols, state.rows)) {
    return {
      ...state,
      status: 'game-over',
      gameOverReason: 'wall',
    };
  }

  const willGrow = state.food !== null && positionsEqual(nextHead, state.food);
  const hitBody = state.snake.some((segment, index) => {
    if (!willGrow && index === state.snake.length - 1) return false;
    return positionsEqual(segment, nextHead);
  });

  if (hitBody) {
    return {
      ...state,
      status: 'game-over',
      gameOverReason: 'self',
    };
  }

  const nextSnake = [nextHead, ...state.snake];
  if (!willGrow) {
    nextSnake.pop();
  }

  if (!willGrow) {
    return {
      ...state,
      snake: nextSnake,
    };
  }

  const nextScore = state.score + 1;
  const nextFood = getFoodSpawnCell(state.cols, state.rows, nextSnake, random);

  return {
    ...state,
    snake: nextSnake,
    score: nextScore,
    food: nextFood,
    status: nextFood ? 'playing' : 'game-over',
    gameOverReason: nextFood ? undefined : 'board-full',
  };
}

export function advanceSnakeByTicks(
  state: SnakeGameState,
  ticks: number,
  random: () => number = Math.random
): SnakeGameState {
  let nextState = state;
  const totalTicks = Math.max(0, Math.floor(ticks));

  for (let index = 0; index < totalTicks; index += 1) {
    if (nextState.status !== 'playing') break;
    nextState = stepSnakeGame(nextState, random);
  }

  return nextState;
}
