"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  advanceSnakeByTicks,
  createSnakeGame,
  setSnakeDirection,
  type SnakeDirection,
} from '@/app/lib/games/snake';

const BOARD_COLS = 14;
const BOARD_ROWS = 14;
const GAME_TICK_MS = 120;

const KEY_TO_DIRECTION: Record<string, SnakeDirection> = {
  ArrowUp: 'up',
  ArrowDown: 'down',
  ArrowLeft: 'left',
  ArrowRight: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
};

declare global {
  interface Window {
    render_game_to_text?: () => string;
    advanceTime?: (ms: number) => void;
  }
}

function createInitialState() {
  return createSnakeGame({
    cols: BOARD_COLS,
    rows: BOARD_ROWS,
  });
}

type DirectionButtonProps = {
  label: string;
  onClick: () => void;
};

function DirectionButton({ label, onClick }: DirectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="h-8 rounded border border-gray-300 bg-white text-xs font-medium text-gray-700"
    >
      {label}
    </button>
  );
}

export default function ExitIntentSnakeGame() {
  const [gameState, setGameState] = useState(createInitialState);
  const [paused, setPaused] = useState(false);
  const stateRef = useRef(gameState);
  const pausedRef = useRef(paused);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const changeDirection = useCallback((direction: SnakeDirection) => {
    setGameState((previous) => setSnakeDirection(previous, direction));
  }, []);

  const restartGame = useCallback(() => {
    setPaused(false);
    setGameState(createInitialState());
  }, []);

  const applyTicks = useCallback((ticks: number) => {
    setGameState((previous) => {
      if (pausedRef.current || previous.status !== 'playing') return previous;
      return advanceSnakeByTicks(previous, ticks);
    });
  }, []);

  const togglePause = useCallback(() => {
    setPaused((previous) => !previous);
  }, []);

  useEffect(() => {
    if (paused || gameState.status !== 'playing') return;

    const intervalId = window.setInterval(() => {
      applyTicks(1);
    }, GAME_TICK_MS);

    return () => window.clearInterval(intervalId);
  }, [applyTicks, gameState.status, paused]);

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      if (target) {
        const tagName = target.tagName;
        const editingField = tagName === 'INPUT' || tagName === 'TEXTAREA' || tagName === 'SELECT';
        if (editingField || target.isContentEditable) return;
      }

      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      const direction = KEY_TO_DIRECTION[key];

      if (direction) {
        event.preventDefault();
        changeDirection(direction);
        return;
      }

      if (key === ' ' || key === 'p') {
        if (stateRef.current.status !== 'playing') return;
        event.preventDefault();
        togglePause();
        return;
      }

      if (key === 'r') {
        event.preventDefault();
        restartGame();
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [changeDirection, restartGame, togglePause]);

  useEffect(() => {
    window.render_game_to_text = () => {
      const snapshot = stateRef.current;
      return JSON.stringify({
        coordinateSystem: 'origin top-left; x grows to the right; y grows downward',
        status: snapshot.status,
        paused: pausedRef.current,
        board: { cols: snapshot.cols, rows: snapshot.rows },
        score: snapshot.score,
        direction: snapshot.direction,
        snake: snapshot.snake,
        food: snapshot.food,
      });
    };

    window.advanceTime = (ms: number) => {
      const ticks = Math.max(1, Math.round(ms / GAME_TICK_MS));
      applyTicks(ticks);
    };

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [applyTicks]);

  const snakeCells = useMemo(() => {
    return new Set(gameState.snake.map((segment) => `${segment.x},${segment.y}`));
  }, [gameState.snake]);

  const head = gameState.snake[0];
  const foodCellKey = gameState.food ? `${gameState.food.x},${gameState.food.y}` : null;
  const boardCellCount = gameState.cols * gameState.rows;
  const gameOverMessage =
    gameState.gameOverReason === 'board-full'
      ? 'You filled the board. Restart to play again.'
      : 'Game over. Press R or use Restart.';
  const hasWon = gameState.gameOverReason === 'board-full';

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-700">
        <span className="font-semibold">Score: {gameState.score}</span>
        <span>
          {gameState.status === 'game-over' ? 'Game over' : paused ? 'Paused' : 'Playing'}
        </span>
      </div>

      <div
        className="grid gap-0.5 rounded-md border border-gray-300 bg-gray-200 p-1"
        style={{ gridTemplateColumns: `repeat(${gameState.cols}, minmax(0, 1fr))` }}
      >
        {Array.from({ length: boardCellCount }, (_, index) => {
          const x = index % gameState.cols;
          const y = Math.floor(index / gameState.cols);
          const key = `${x},${y}`;
          const isHead = head.x === x && head.y === y;
          const isFood = foodCellKey === key;
          const isSnake = snakeCells.has(key);

          let className = 'aspect-square rounded-[2px] bg-white';
          if (isSnake) className = 'aspect-square rounded-[2px] bg-emerald-500';
          if (isHead) className = 'aspect-square rounded-[2px] bg-emerald-700';
          if (isFood) className = 'aspect-square rounded-[2px] bg-[var(--color-primary)]';

          return <div key={key} className={className} />;
        })}
      </div>

      <p className="mt-2 text-xs text-gray-600">Controls: Arrow keys/WASD, Space or P to pause, R to restart.</p>
      <p className="mt-1 text-xs text-gray-700">
        Win and get <span className="font-semibold">10% off</span> your first month of service.
      </p>

      {gameState.status === 'game-over' ? (
        <p className="mt-2 text-xs font-medium text-red-600">{gameOverMessage}</p>
      ) : null}
      {hasWon ? (
        <div className="mt-2 rounded border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-900">
          <p className="font-semibold">You won: 10% off your first month.</p>
          <p>
            Use code <span className="font-mono font-semibold">SNAKE10</span> when you start.
          </p>
        </div>
      ) : null}

      <div className="mt-3 flex gap-2">
        <button
          type="button"
          onClick={togglePause}
          disabled={gameState.status === 'game-over'}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {paused ? 'Resume' : 'Pause'}
        </button>
        <button
          type="button"
          onClick={restartGame}
          className="rounded border border-gray-300 bg-white px-2 py-1 text-xs font-medium text-gray-700"
        >
          Restart
        </button>
      </div>

      <div className="mt-3 sm:hidden">
        <div className="mx-auto grid w-28 grid-cols-3 gap-1">
          <span />
          <DirectionButton label="Up" onClick={() => changeDirection('up')} />
          <span />
          <DirectionButton label="Left" onClick={() => changeDirection('left')} />
          <DirectionButton label="Down" onClick={() => changeDirection('down')} />
          <DirectionButton label="Right" onClick={() => changeDirection('right')} />
        </div>
      </div>
    </div>
  );
}
