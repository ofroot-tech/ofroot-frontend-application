"use client";

import { useCallback, useEffect, useMemo, useRef, useState, type TouchEvent } from 'react';
import {
  advanceSnakeByTicks,
  createSnakeGame,
  setSnakeDirection,
  type SnakeDirection,
} from '@/app/lib/games/snake';

const BOARD_COLS = 14;
const BOARD_ROWS = 14;
const BASE_TICK_MS_DESKTOP = 170;
const BASE_TICK_MS_MOBILE = 190;
const MIN_TICK_MS = 90;
const TICK_DROP_PER_STEP = 8;
const TICK_STEP_SCORE = 3;

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
  return createSnakeGame({ cols: BOARD_COLS, rows: BOARD_ROWS });
}

function getTickMs(score: number, mobile: boolean) {
  const base = mobile ? BASE_TICK_MS_MOBILE : BASE_TICK_MS_DESKTOP;
  const steps = Math.floor(score / TICK_STEP_SCORE);
  return Math.max(MIN_TICK_MS, base - steps * TICK_DROP_PER_STEP);
}

type DirectionButtonProps = {
  label: string;
  isActive: boolean;
  onClick: () => void;
};

function DirectionButton({ label, isActive, onClick }: DirectionButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`h-11 rounded-md border text-sm font-semibold ${
        isActive
          ? 'border-gray-800 bg-gray-800 text-white'
          : 'border-gray-300 bg-white text-gray-700'
      }`}
    >
      {label}
    </button>
  );
}

export default function ExitIntentSnakeGame() {
  const [gameState, setGameState] = useState(createInitialState);
  const [paused, setPaused] = useState(false);
  const [isMobileViewport, setIsMobileViewport] = useState(false);
  const [activeDirection, setActiveDirection] = useState<SnakeDirection | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [showProceedPrompt, setShowProceedPrompt] = useState(false);
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [email, setEmail] = useState('');
  const [submitState, setSubmitState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [submitMessage, setSubmitMessage] = useState('');
  const stateRef = useRef(gameState);
  const pausedRef = useRef(paused);
  const previousStatusRef = useRef(gameState.status);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  useEffect(() => {
    stateRef.current = gameState;
  }, [gameState]);

  useEffect(() => {
    pausedRef.current = paused;
  }, [paused]);

  const hasWon = gameState.gameOverReason === 'board-full';
  const currentTickMs = useMemo(
    () => getTickMs(gameState.score, isMobileViewport),
    [gameState.score, isMobileViewport]
  );

  const changeDirection = useCallback((direction: SnakeDirection) => {
    setGameState((previous) => setSnakeDirection(previous, direction));
    setActiveDirection(direction);
    window.setTimeout(() => setActiveDirection((curr) => (curr === direction ? null : curr)), 140);
  }, []);

  const restartGame = useCallback(() => {
    setPaused(false);
    setGameState(createInitialState());
    setShowProceedPrompt(false);
  }, []);

  const applyTicks = useCallback((ticks: number) => {
    setGameState((previous) => {
      if (pausedRef.current || previous.status !== 'playing') return previous;
      return advanceSnakeByTicks(previous, ticks);
    });
  }, []);

  const togglePause = useCallback(() => {
    if (stateRef.current.status !== 'playing') return;
    setPaused((previous) => !previous);
  }, []);

  useEffect(() => {
    const media = window.matchMedia('(max-width: 640px)');
    const update = () => setIsMobileViewport(media.matches);
    update();
    media.addEventListener('change', update);
    return () => media.removeEventListener('change', update);
  }, []);

  useEffect(() => {
    if (paused || gameState.status !== 'playing') return;

    const intervalId = window.setInterval(() => {
      applyTicks(1);
    }, currentTickMs);

    return () => window.clearInterval(intervalId);
  }, [applyTicks, currentTickMs, gameState.status, paused]);

  useEffect(() => {
    const onVisibilityChange = () => {
      if (document.hidden) {
        setPaused(true);
      }
    };
    const onBlur = () => setPaused(true);

    document.addEventListener('visibilitychange', onVisibilityChange);
    window.addEventListener('blur', onBlur);
    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange);
      window.removeEventListener('blur', onBlur);
    };
  }, []);

  useEffect(() => {
    const previousStatus = previousStatusRef.current;
    const currentStatus = gameState.status;
    if (previousStatus !== 'game-over' && currentStatus === 'game-over') {
      setAttempts((prev) => {
        const next = prev + 1;
        if (hasWon) {
          setShowEmailForm(true);
          setShowProceedPrompt(false);
        } else if (next >= 3) {
          setShowProceedPrompt(true);
        }
        return next;
      });
    }
    previousStatusRef.current = currentStatus;
  }, [gameState.status, hasWon]);

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

  const submitEmail = useCallback(async () => {
    const trimmed = email.trim();
    if (!trimmed || !/^\S+@\S+\.\S+$/.test(trimmed)) {
      setSubmitState('error');
      setSubmitMessage('Enter a valid email address.');
      return;
    }

    try {
      setSubmitState('submitting');
      setSubmitMessage('');
      const res = await fetch('/api/snake-offer', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: trimmed,
          attempts,
          score: gameState.score,
          won: hasWon,
          couponCode: 'SNAKE10',
        }),
      });
      const payload = await res.json().catch(() => null);
      if (!res.ok || !payload?.ok) {
        throw new Error(payload?.error?.message || 'Unable to send right now.');
      }
      setSubmitState('success');
      setSubmitMessage('Thanks. We received your request and will follow up with your discount.');
    } catch (error: any) {
      setSubmitState('error');
      setSubmitMessage(error?.message || 'Unable to send right now.');
    }
  }, [attempts, email, gameState.score, hasWon]);

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
        attempts,
        offerFlow: {
          showProceedPrompt,
          showEmailForm,
          submitState,
        },
      });
    };

    window.advanceTime = (ms: number) => {
      const tickMs = getTickMs(stateRef.current.score, isMobileViewport);
      const ticks = Math.max(1, Math.round(ms / tickMs));
      applyTicks(ticks);
    };

    return () => {
      delete window.render_game_to_text;
      delete window.advanceTime;
    };
  }, [applyTicks, attempts, isMobileViewport, showEmailForm, showProceedPrompt, submitState]);

  const snakeCells = useMemo(() => {
    return new Set(gameState.snake.map((segment) => `${segment.x},${segment.y}`));
  }, [gameState.snake]);

  const head = gameState.snake[0];
  const foodCellKey = gameState.food ? `${gameState.food.x},${gameState.food.y}` : null;
  const boardCellCount = gameState.cols * gameState.rows;
  const gameOverMessage =
    gameState.gameOverReason === 'board-full'
      ? 'You filled the board. Restart to play again.'
      : 'Game over. Press R or tap Restart.';

  const onTouchStart = (event: TouchEvent<HTMLDivElement>) => {
    const firstTouch = event.changedTouches[0];
    touchStartRef.current = { x: firstTouch.clientX, y: firstTouch.clientY };
  };

  const onTouchEnd = (event: TouchEvent<HTMLDivElement>) => {
    const start = touchStartRef.current;
    const firstTouch = event.changedTouches[0];
    if (!start || !firstTouch) return;
    const dx = firstTouch.clientX - start.x;
    const dy = firstTouch.clientY - start.y;
    const threshold = 22;

    if (Math.abs(dx) < threshold && Math.abs(dy) < threshold) return;
    if (Math.abs(dx) > Math.abs(dy)) {
      changeDirection(dx > 0 ? 'right' : 'left');
      return;
    }
    changeDirection(dy > 0 ? 'down' : 'up');
  };

  return (
    <div className="w-full">
      <div className="mb-2 flex items-center justify-between text-xs text-gray-700">
        <span className="font-semibold">Score: {gameState.score}</span>
        <span>
          {gameState.status === 'game-over' ? 'Game over' : paused ? 'Paused' : 'Playing'}
        </span>
      </div>

      <p className="mb-2 text-xs text-gray-700">
        Fill the board to win <span className="font-semibold">10% off</span> your first month.
      </p>

      <div
        className="mx-auto grid w-full max-w-[360px] gap-0.5 rounded-md border border-gray-300 bg-gray-200 p-1 touch-none"
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
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

      <p className="mt-2 text-xs text-gray-600">Controls: Arrow keys/WASD, swipe, Space/P pause, R restart.</p>

      {gameState.status === 'game-over' ? (
        <p className="mt-2 text-xs font-medium text-red-600">{gameOverMessage}</p>
      ) : null}

      {hasWon ? (
        <div className="mt-2 rounded border border-emerald-300 bg-emerald-50 p-2 text-xs text-emerald-900">
          <p className="font-semibold">You won: 10% off your first month.</p>
          <p>
            Your code: <span className="font-mono font-semibold">SNAKE10</span>
          </p>
        </div>
      ) : null}

      {showProceedPrompt && gameState.status === 'game-over' && !showEmailForm ? (
        <div className="mt-2 rounded border border-amber-300 bg-amber-50 p-2 text-xs text-amber-900">
          <p className="font-semibold">You played 3 rounds. Want to proceed with the 10% offer?</p>
          <div className="mt-2 flex gap-2">
            <button
              type="button"
              onClick={() => {
                setShowEmailForm(true);
                setShowProceedPrompt(false);
              }}
              className="rounded border border-amber-400 bg-white px-2 py-1 font-semibold text-amber-900"
            >
              Yes, proceed
            </button>
            <button
              type="button"
              onClick={() => setShowProceedPrompt(false)}
              className="rounded border border-amber-300 bg-white px-2 py-1 text-amber-900"
            >
              Not now
            </button>
          </div>
        </div>
      ) : null}

      {showEmailForm ? (
        <div className="mt-2 rounded border border-gray-300 bg-gray-50 p-2 text-xs">
          <p className="font-semibold text-gray-900">Get your 10% code via email</p>
          <div className="mt-2 flex gap-2">
            <input
              type="email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder="you@company.com"
              className="min-w-0 flex-1 rounded border border-gray-300 bg-white px-2 py-1 text-sm"
            />
            <button
              type="button"
              onClick={submitEmail}
              disabled={submitState === 'submitting' || submitState === 'success'}
              className="rounded border border-gray-800 bg-gray-800 px-3 py-1 font-semibold text-white disabled:opacity-60"
            >
              {submitState === 'submitting' ? 'Sending...' : submitState === 'success' ? 'Sent' : 'Send'}
            </button>
          </div>
          {submitMessage ? (
            <p className={`mt-2 ${submitState === 'success' ? 'text-emerald-700' : 'text-red-600'}`}>{submitMessage}</p>
          ) : null}
        </div>
      ) : null}

      <div className="mt-3 flex flex-wrap gap-2">
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
        <span className="self-center text-xs text-gray-500">Attempts: {attempts}</span>
      </div>

      <div className="fixed inset-x-3 bottom-16 z-[10002] sm:hidden">
        <div className="mx-auto grid max-w-[320px] grid-cols-3 gap-2 rounded-lg border border-gray-300 bg-white p-2 shadow-lg">
          <span />
          <DirectionButton label="Up" isActive={activeDirection === 'up'} onClick={() => changeDirection('up')} />
          <span />
          <DirectionButton label="Left" isActive={activeDirection === 'left'} onClick={() => changeDirection('left')} />
          <DirectionButton label="Down" isActive={activeDirection === 'down'} onClick={() => changeDirection('down')} />
          <DirectionButton label="Right" isActive={activeDirection === 'right'} onClick={() => changeDirection('right')} />
        </div>
      </div>
    </div>
  );
}
