import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaFire } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';
import { dareChallengesByCategory } from '@/data/dareChallengesByCategory';
import {
  truthCategories,
  truthCategoryMap,
  type TruthCategoryKey,
} from '@/data/truth-categories';

import type { Participant } from '../App';

type TruthOrRetoGameProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type TurnOutcome =
  | { kind: 'truth'; id: number; emoji: string }
  | { kind: 'dare'; id: number; emoji: string };

type PromptKind = 'truth' | 'dare';

const respondedEmojis = [
  '\u{1F628}','\u{1FAE3}','\u{1F631}','\u{1F635}',
  '\u{1F62C}','\u{1F62F}','\u{1F92F}','\u{1F976}',
];

const shuffleList = <T,>(values: readonly T[]) => {
  const order = [...values];
  for (let i = order.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [order[i], order[j]] = [order[j], order[i]];
  }
  return order;
};

const pickRandom = <T,>(values: readonly T[]) =>
  values[Math.floor(Math.random() * values.length)] ?? values[0];

const getNextDeckItem = (
  currentDeck: readonly string[],
  currentIndex: number,
  source: readonly string[],
): { deck: string[]; index: number; value: string } => {
  if (source.length === 0) {
    return { deck: [], index: 0, value: '' };
  }

  if (currentIndex < currentDeck.length) {
    return {
      deck: [...currentDeck],
      index: currentIndex + 1,
      value: currentDeck[currentIndex] ?? '',
    };
  }

  const reshuffledDeck = shuffleList(source);

  return {
    deck: reshuffledDeck,
    index: 1,
    value: reshuffledDeck[0] ?? '',
  };
};

// Colores accent por categoría para las tarjetas
function getCategoryAccent(index: number) {
  const palette = [
    { from: 'rgba(236,72,153,0.18)', to: 'rgba(239,68,68,0.08)',   glow: 'rgba(236,72,153,0.40)',  border: 'rgba(236,72,153,0.30)' },
    { from: 'rgba(59,130,246,0.18)', to: 'rgba(99,102,241,0.08)',  glow: 'rgba(59,130,246,0.38)',  border: 'rgba(59,130,246,0.28)' },
    { from: 'rgba(34,197,94,0.16)',  to: 'rgba(16,185,129,0.08)',  glow: 'rgba(34,197,94,0.36)',   border: 'rgba(34,197,94,0.26)'  },
    { from: 'rgba(251,191,36,0.18)', to: 'rgba(249,115,22,0.08)',  glow: 'rgba(251,191,36,0.38)',  border: 'rgba(251,191,36,0.28)' },
    { from: 'rgba(168,85,247,0.18)', to: 'rgba(236,72,153,0.08)',  glow: 'rgba(168,85,247,0.38)',  border: 'rgba(168,85,247,0.28)' },
    { from: 'rgba(20,184,166,0.18)', to: 'rgba(59,130,246,0.08)',  glow: 'rgba(20,184,166,0.36)',  border: 'rgba(20,184,166,0.26)' },
  ];
  return palette[index % palette.length];
}

function CategoryCard({
  category,
  index,
  onSelect,
}: {
  category: (typeof truthCategories)[number];
  index: number;
  onSelect: () => void;
}) {
  const accent = getCategoryAccent(index);
  const [hovered, setHovered] = useState(false);

  return (
    <button
      type="button"
      className="group relative w-full overflow-hidden rounded-[1.6rem] text-left transition-all duration-300"
      style={{
        border: `1px solid ${hovered ? accent.border : 'rgba(255,255,255,0.08)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${accent.from}, ${accent.to}), rgba(15,23,42,0.7)`
          : 'rgba(255,255,255,0.04)',
        boxShadow: hovered
          ? `0 0 0 1px ${accent.border}, 0 20px 60px rgba(0,0,0,0.3), 0 0 80px -20px ${accent.glow}`
          : '0 4px 24px rgba(0,0,0,0.18)',
        transform: hovered ? 'translateY(-3px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      {/* Brillo superior */}
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.glow}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="flex items-center gap-4 px-5 py-5">
        {/* Emoji con halo */}
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl transition-all duration-300"
          style={{
            background: hovered
              ? `radial-gradient(circle, ${accent.from} 0%, rgba(0,0,0,0.3) 100%)`
              : 'rgba(255,255,255,0.06)',
            boxShadow: hovered ? `0 0 30px ${accent.glow}` : 'none',
            transform: hovered ? 'scale(1.12)' : 'scale(1)',
          }}
        >
          {category.emoji}
        </div>

        {/* Texto */}
        <div className="min-w-0 flex-1">
          <p
            className="text-base font-black leading-tight tracking-tight transition-colors duration-200"
            style={{ color: hovered ? '#fff' : 'rgba(255,255,255,0.9)' }}
          >
            {category.label}
          </p>
          <p className="mt-1 text-xs leading-relaxed" style={{ color: 'rgba(255,255,255,0.52)' }}>
            {category.description}
          </p>
        </div>

        {/* Flecha */}
        <div
          className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full transition-all duration-300"
          style={{
            background: hovered ? accent.glow : 'rgba(255,255,255,0.06)',
            transform: hovered ? 'translateX(2px)' : 'translateX(0)',
          }}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path
              d="M3 7h8M7.5 3.5L11 7l-3.5 3.5"
              stroke="white"
              strokeWidth="1.5"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeOpacity={hovered ? 1 : 0.5}
            />
          </svg>
        </div>
      </div>
    </button>
  );
}

function TruthOrRetoGame({ participants, onBackToHub, onButtonPress }: TruthOrRetoGameProps) {
  void onBackToHub;

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TruthCategoryKey | null>(null);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [roundNumber, setRoundNumber] = useState(1);
  const [truthDeck, setTruthDeck] = useState<string[]>([]);
  const [truthDeckIndex, setTruthDeckIndex] = useState(0);
  const [dareDeck, setDareDeck] = useState<string[]>([]);
  const [dareDeckIndex, setDareDeckIndex] = useState(0);
  const [currentPromptKind, setCurrentPromptKind] = useState<PromptKind | null>(null);
  const [currentPrompt, setCurrentPrompt] = useState<string>('');
  const [turnOutcome, setTurnOutcome] = useState<TurnOutcome | null>(null);
  const [selectionGlitch, setSelectionGlitch] = useState(false);
  const turnTimerRef = useRef<number | null>(null);

  const selectedCategory = selectedCategoryKey ? truthCategoryMap[selectedCategoryKey] : null;
  const currentPlayer =
    turnOrder.length > 0
      ? participants.find((p) => p.id === turnOrder[currentTurnIndex])
      : null;

  useEffect(
    () => () => {
      if (turnTimerRef.current !== null) window.clearTimeout(turnTimerRef.current);
    },
    [],
  );

  useEffect(() => {
    if (!selectionGlitch) {
      return undefined;
    }

    const timeout = window.setTimeout(() => {
      setSelectionGlitch(false);
    }, 420);

    return () => window.clearTimeout(timeout);
  }, [selectionGlitch]);

  const triggerSelectionGlitch = () => {
    setSelectionGlitch(false);
    window.requestAnimationFrame(() => {
      setSelectionGlitch(true);
    });
  };

  const drawNextPrompt = (kind: PromptKind) => {
    if (!selectedCategoryKey) {
      return '';
    }

    if (kind === 'truth') {
      const result = getNextDeckItem(
        truthDeck,
        truthDeckIndex,
        truthCategoryMap[selectedCategoryKey].questions,
      );
      setTruthDeck(result.deck);
      setTruthDeckIndex(result.index);
      return result.value;
    }

    const result = getNextDeckItem(
      dareDeck,
      dareDeckIndex,
      dareChallengesByCategory[selectedCategoryKey],
    );
    setDareDeck(result.deck);
    setDareDeckIndex(result.index);
    return result.value;
  };

  const startRound = (categoryKey: TruthCategoryKey) => {
    if (participants.length < 2) return;
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
    triggerSelectionGlitch();
    const nextOrder = shuffleList(participants.map((p) => p.id));
    const nextDeck  = shuffleList(truthCategoryMap[categoryKey].questions);
    setSelectedCategoryKey(categoryKey);
    setTurnOrder(nextOrder);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setTruthDeck(nextDeck);
    setTruthDeckIndex(0);
    setDareDeck(shuffleList(dareChallengesByCategory[categoryKey]));
    setDareDeckIndex(0);
    setCurrentPromptKind(null);
    setCurrentPrompt('');
    setTurnOutcome(null);
  };

  const advanceTurn = () => {
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
    setTurnOutcome(null);
    setCurrentPromptKind(null);
    setCurrentPrompt('');
    setCurrentTurnIndex((cur) => {
      if (turnOrder.length === 0) return 0;
      const next = cur + 1;
      if (next < turnOrder.length) return next;
      setRoundNumber((r) => r + 1);
      setTurnOrder(shuffleList(participants.map((p) => p.id)));
      return 0;
    });
  };

  const revealPrompt = (kind: PromptKind) => {
    if (!selectedCategory || currentPlayer === null || currentPromptKind !== null) return;
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }

    triggerSelectionGlitch();
    const prompt = drawNextPrompt(kind);
    setCurrentPromptKind(kind);
    setCurrentPrompt(prompt);
    setTurnOutcome({
      kind,
      id: Date.now(),
      emoji: kind === 'truth' ? pickRandom(respondedEmojis) : '\u{1F525}',
    });
    turnTimerRef.current = window.setTimeout(() => {
      setTurnOutcome(null);
      turnTimerRef.current = null;
    }, 650);
  };

  const finishPrompt = () => {
    if (currentPromptKind === null) return;

    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }

    advanceTurn();
  };

  // ── Sin participantes ────────────────────────────────────
  if (participants.length < 2) {
    return (
      <div className="flex min-h-[100svh] items-center justify-center px-4 text-center text-white app-fade-up">
        <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/85 p-8 shadow-2xl backdrop-blur-2xl">
          <p className="text-2xl font-black">No hay participantes disponibles.</p>
          <p className="mt-2 text-slate-200">Vuelve al hub y agrega al menos 2 jugadores.</p>
        </div>
      </div>
    );
  }

  // ── Selección de categoría ───────────────────────────────
  if (!selectedCategoryKey) {
    return (
      <div className="relative flex min-h-[100svh] w-full items-start justify-center overflow-y-auto bg-transparent px-4 pb-8 pt-20 text-white app-fade-up sm:px-6 sm:pt-24">
        <div className={`relative my-auto w-full max-w-2xl ${selectionGlitch ? 'app-glitch-burst' : ''}`}>

          {/* Header */}
          <div className="mb-8 text-center">
            <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/50">MondeFan</p>
            <h1 className="mt-3 text-4xl font-black leading-none sm:text-6xl">
              Verdad o Reto
            </h1>
            <p className="mx-auto mt-3 max-w-sm text-sm text-white/60 sm:text-base">
              Elige una categoría para empezar.
            </p>

            {/* Badge participantes */}
            <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/6 px-4 py-2 text-sm text-white/70 backdrop-blur">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              {participants.length} participantes listos
            </div>
          </div>

          {/* Grid de categorías */}
          <div className="flex flex-col gap-3">
            {truthCategories.map((category, index) => (
              <CategoryCard
                key={category.key}
                category={category}
                index={index}
                onSelect={() => {
                  startRound(category.key);
                }}
              />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // ── Juego en curso ───────────────────────────────────────
  const panelStyle = currentPlayer
    ? {
        backgroundColor: '#0B1120',
        backgroundImage:
          `linear-gradient(180deg, rgba(6,182,212,0.14), rgba(11,17,32,0.82)),
           radial-gradient(circle at top left, rgba(168,85,247,0.22), transparent 34%),
           radial-gradient(circle at bottom right, rgba(236,72,153,0.18), transparent 30%),
           radial-gradient(circle at center, ${currentPlayer.color}26, transparent 44%)`,
      }
    : {
        backgroundColor: '#0B1120',
        backgroundImage:
          'linear-gradient(180deg, rgba(6,182,212,0.10), rgba(11,17,32,0.82)), radial-gradient(circle at top left, rgba(168,85,247,0.18), transparent 34%), radial-gradient(circle at bottom right, rgba(236,72,153,0.12), transparent 30%)',
      };

  return (
    <div className="relative flex min-h-[100svh] w-full items-start justify-center overflow-y-auto bg-transparent px-3 pb-6 pt-20 text-white app-fade-up sm:px-4 sm:pt-24">
      <div
        className={`relative my-auto flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-[2.35rem] border border-white/12 shadow-[0_30px_100px_rgba(0,0,0,0.42)] ${selectionGlitch ? 'app-glitch-burst' : ''}`}
        style={panelStyle}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_36%),linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.26))]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-white/10 blur-3xl" />
        <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(90deg,rgba(6,182,212,0.10),rgba(168,85,247,0.10),rgba(236,72,153,0.08))] blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col">
          <header className="flex flex-col gap-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-white/75">Verdad o Reto</p>
              <h2 className="mt-2 truncate text-3xl font-black sm:text-5xl">
                {currentPlayer?.name ?? 'Preparando ronda...'}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  {selectedCategory?.label}
                </span>
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  Ronda {roundNumber}
                </span>
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  {currentPromptKind ? currentPromptKind === 'truth' ? 'Verdad' : 'Reto' : 'Elige'}
                </span>
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  {turnOrder.length} jugadores
                </span>
              </div>
            </div>

            <div className="flex shrink-0 items-center gap-3 self-start rounded-[1.75rem] border border-white/15 bg-black/18 p-3 backdrop-blur-sm">
              <div className="min-w-0">
                <p className="text-[0.65rem] uppercase tracking-[0.35em] text-white/65">Turno</p>
                <p className="mt-1 max-w-[11rem] truncate text-lg font-bold">
                  {currentPlayer?.name ?? 'Preparando'}
                </p>
              </div>
              {currentPlayer ? (
                <ParticipantAvatarBadge
                  alt={currentPlayer.name}
                  avatar={currentPlayer.avatar}
                  backgroundColor={currentPlayer.color}
                  className="h-16 w-16"
                  seed={currentPlayer.avatarSeed}
                  sizeClassName="h-16 w-16"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/15 bg-white/10 text-sm font-black">
                  ?
                </div>
              )}
            </div>
          </header>

          <main className="relative flex flex-1 items-center justify-center px-4 py-4 sm:px-8 sm:py-6">
            {currentPromptKind && currentPrompt ? (
              <div
                className="mx-auto max-w-2xl rounded-[2.25rem] border border-cyan-300/25 px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-8 sm:py-10"
                style={{
                  backgroundImage:
                    'linear-gradient(135deg, rgba(6,182,212,0.20), rgba(11,17,32,0.72), rgba(168,85,247,0.20))',
                }}
              >
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/70">
                  {currentPromptKind === 'truth' ? 'La verdad' : 'El reto'}
                </p>
                <p className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-5xl">
                  {currentPrompt}
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-white/18 bg-black/12 px-6 py-8 text-center backdrop-blur-sm">
                <p className="text-2xl font-black sm:text-3xl">Elige verdad o reto</p>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  La categoría ya está lista. Ahora toca decidir cómo quieres pasar el turno.
                </p>
              </div>
            )}
          </main>

          <footer className="grid grid-cols-2 gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
            {currentPromptKind === null ? (
              <>
                <LiquidButton
                  className="!min-h-14 rounded-[1.5rem] border border-white/15 bg-white/10 !px-4 !py-3 text-base font-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-white/15 sm:!min-h-16 sm:text-lg"
                  disabled={!currentPlayer}
                  onClick={(event) => {
                    onButtonPress(event);
                    revealPrompt('truth');
                  }}
                  size="lg"
                  type="button"
                  variant="default"
                >
                  Verdad
                </LiquidButton>

                <LiquidButton
                  className="!min-h-14 rounded-[1.5rem] border border-amber-200/30 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 !px-4 !py-3 text-base font-black text-white shadow-[0_18px_50px_rgba(249,115,22,0.35)] transition hover:brightness-110 sm:!min-h-16 sm:text-lg"
                  disabled={!currentPlayer}
                  onClick={(event) => {
                    onButtonPress(event);
                    revealPrompt('dare');
                  }}
                  size="lg"
                  type="button"
                  variant="cool"
                >
                  Reto
                </LiquidButton>
              </>
            ) : (
              <LiquidButton
                className="col-span-2 !min-h-14 rounded-[1.5rem] border border-white/15 bg-white/10 !px-4 !py-3 text-base font-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-white/15 sm:!min-h-16 sm:text-lg"
                disabled={!currentPlayer}
                onClick={(event) => {
                  onButtonPress(event);
                  finishPrompt();
                }}
                size="lg"
                type="button"
                variant="default"
              >
                Siguiente jugador
              </LiquidButton>
            )}
          </footer>
        </div>

        {turnOutcome?.kind === 'truth' ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/12 backdrop-blur-[2px]">
            <div className="app-feedback-responded flex items-center justify-center text-[clamp(5rem,30vw,14rem)] leading-none drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              {turnOutcome.emoji}
            </div>
          </div>
        ) : null}

        {turnOutcome?.kind === 'dare' ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/22 backdrop-blur-[3px]">
            <div className="app-feedback-shot app-shot-burst flex flex-col items-center justify-center rounded-[2.5rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(251,191,36,0.28),rgba(239,68,68,0.42))] px-8 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
              <FaFire className="text-4xl text-amber-200 drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] sm:text-5xl" />
              <span className="mt-3 block text-[clamp(4rem,26vw,10rem)] font-black tracking-[0.2em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.52)]">
                RETO!
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TruthOrRetoGame;
