import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaFire, FaArrowLeft } from 'react-icons/fa';

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

type TurnTransition = PromptKind | null;

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

// Colores accent por categoría para las tarjetas (más pulidos)
function getCategoryAccent(index: number) {
  const palette = [
    { from: 'rgba(236,72,153,0.25)', to: 'rgba(239,68,68,0.12)',   glow: 'rgba(236,72,153,0.55)',  border: 'rgba(236,72,153,0.45)' },
    { from: 'rgba(59,130,246,0.25)', to: 'rgba(99,102,241,0.12)',  glow: 'rgba(59,130,246,0.55)',  border: 'rgba(59,130,246,0.45)' },
    { from: 'rgba(34,197,94,0.22)',  to: 'rgba(16,185,129,0.12)',  glow: 'rgba(34,197,94,0.50)',   border: 'rgba(34,197,94,0.40)'  },
    { from: 'rgba(251,191,36,0.25)', to: 'rgba(249,115,22,0.12)',  glow: 'rgba(251,191,36,0.55)',  border: 'rgba(251,191,36,0.45)' },
    { from: 'rgba(168,85,247,0.25)', to: 'rgba(236,72,153,0.12)',  glow: 'rgba(168,85,247,0.55)',  border: 'rgba(168,85,247,0.45)' },
    { from: 'rgba(20,184,166,0.25)', to: 'rgba(59,130,246,0.12)',  glow: 'rgba(20,184,166,0.50)',  border: 'rgba(20,184,166,0.40)' },
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
      className="group relative w-full overflow-hidden rounded-2xl text-left transition-all duration-300 active:scale-[0.98]"
      style={{
        border: `1px solid ${hovered ? accent.border : 'rgba(255,255,255,0.08)'}`,
        background: hovered
          ? `linear-gradient(135deg, ${accent.from}, ${accent.to}), rgba(15,23,42,0.85)`
          : 'rgba(255,255,255,0.04)',
        boxShadow: hovered
          ? `0 0 0 1px ${accent.border}, 0 20px 40px rgba(0,0,0,0.3), 0 0 60px -20px ${accent.glow}`
          : '0 4px 20px rgba(0,0,0,0.2)',
        transform: hovered ? 'translateY(-2px) scale(1.01)' : 'translateY(0) scale(1)',
      }}
      onClick={onSelect}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px transition-opacity duration-300"
        style={{
          background: `linear-gradient(90deg, transparent, ${accent.glow}, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />
      <div className="flex items-center gap-4 px-5 py-5">
        <div
          className="relative flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl text-3xl transition-all duration-300"
          style={{
            background: hovered
              ? `radial-gradient(circle, ${accent.from} 0%, rgba(0,0,0,0.3) 100%)`
              : 'rgba(255,255,255,0.06)',
            boxShadow: hovered ? `0 0 30px ${accent.glow}` : 'none',
            transform: hovered ? 'scale(1.08)' : 'scale(1)',
          }}
        >
          {category.emoji}
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-base font-black tracking-tight text-white">{category.label}</p>
          <p className="mt-1 text-xs text-white/50">{category.description}</p>
        </div>
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
  const [turnTransition, setTurnTransition] = useState<TurnTransition>(null);
  const [turnOutcome, setTurnOutcome] = useState<TurnOutcome | null>(null);
  const [selectionGlitch, setSelectionGlitch] = useState(false);
  const turnTimerRef = useRef<number | null>(null);

  const selectedCategory = selectedCategoryKey ? truthCategoryMap[selectedCategoryKey] : null;
  const currentPlayer =
    turnOrder.length > 0
      ? participants.find((p) => p.id === turnOrder[currentTurnIndex])
      : null;

  // Limpiar temporizador al desmontar
  useEffect(() => {
    return () => {
      if (turnTimerRef.current !== null) window.clearTimeout(turnTimerRef.current);
    };
  }, []);

  // Efecto para la animación de glitch
  useEffect(() => {
    if (!selectionGlitch) return;
    const timeout = window.setTimeout(() => setSelectionGlitch(false), 420);
    return () => window.clearTimeout(timeout);
  }, [selectionGlitch]);

  const triggerSelectionGlitch = () => {
    setSelectionGlitch(false);
    window.requestAnimationFrame(() => setSelectionGlitch(true));
  };

  const drawNextPrompt = (kind: PromptKind) => {
    if (!selectedCategoryKey) return '';

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
    const truthQuestions = truthCategoryMap[categoryKey].questions;
    const dareQuestions = dareChallengesByCategory[categoryKey];

    setSelectedCategoryKey(categoryKey);
    setTurnOrder(nextOrder);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setTruthDeck(shuffleList(truthQuestions));
    setTruthDeckIndex(0);
    setDareDeck(shuffleList(dareQuestions));
    setDareDeckIndex(0);
    setCurrentPromptKind(null);
    setCurrentPrompt('');
    setTurnTransition(null);
    setTurnOutcome(null);
  };

  const advanceTurn = () => {
    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }
    setTurnTransition(null);
    setTurnOutcome(null);
    setCurrentPromptKind(null);
    setCurrentPrompt('');

    setCurrentTurnIndex((cur) => {
      if (turnOrder.length === 0) return 0;
      const next = cur + 1;
      if (next < turnOrder.length) return next;
      // Nueva ronda
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
    setTurnTransition(kind);
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

  const handleExit = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);
    setSelectedCategoryKey(null);
    setTurnOrder([]);
    setCurrentTurnIndex(0);
    setRoundNumber(1);
    setCurrentPromptKind(null);
    setCurrentPrompt('');
    setTurnTransition(null);
    setTurnOutcome(null);
    if (turnTimerRef.current) window.clearTimeout(turnTimerRef.current);
  };

  // Pantalla sin participantes
  if (participants.length < 2) {
    return (
      <div className="flex h-screen items-center justify-center px-4 text-center text-white">
        <div className="w-full max-w-md rounded-2xl border border-white/10 bg-black/80 p-6 backdrop-blur-2xl">
          <p className="text-2xl font-black">No hay suficientes participantes</p>
          <p className="mt-2 text-stone-300">Necesitas al menos 2 jugadores.</p>
          <LiquidButton
            className="mt-6 w-full py-3 text-base"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
          >
            Volver al hub
          </LiquidButton>
        </div>
      </div>
    );
  }

  // Pantalla de selección de categoría
  if (!selectedCategoryKey) {
    return (
      <div className="flex h-screen w-full flex-col overflow-hidden bg-black px-4 py-6 text-white">
        <div className={`flex-1 overflow-y-auto pb-6 ${selectionGlitch ? 'app-glitch-burst' : ''}`}>
          <div className="mx-auto w-full max-w-2xl">
            <div className="mb-8 text-center">
              <p className="text-xs uppercase tracking-[0.5em] text-white/50">MondeFan</p>
              <h1 className="mt-3 text-4xl font-black sm:text-6xl">Verdad o Reto</h1>
              <p className="mx-auto mt-3 max-w-sm text-sm text-white/60">
                Elige una categoría para empezar.
              </p>
              <div className="mt-5 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm backdrop-blur">
                <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
                {participants.length} participantes listos
              </div>
            </div>

            <div className="flex flex-col gap-3">
              {truthCategories.map((category, idx) => (
                <CategoryCard
                  key={category.key}
                  category={category}
                  index={idx}
                  onSelect={() => startRound(category.key)}
                />
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Juego en curso
  const panelTransitionClass =
    turnTransition === 'truth'
      ? 'app-choice-responded'
      : turnTransition === 'dare'
      ? 'app-choice-shot'
      : '';

  // Fondo dinámico con overlay oscuro para contraste
  const panelStyle = currentPlayer
    ? {
        backgroundColor: currentPlayer.color,
        backgroundImage: `linear-gradient(180deg, rgba(0,0,0,0.5) 0%, rgba(15,23,42,0.8) 100%), radial-gradient(circle at top, rgba(255,255,255,0.15), transparent 50%)`,
      }
    : { backgroundColor: '#0f172a' };

  return (
    <div className="relative flex h-screen w-full flex-col overflow-hidden bg-black">
      <div
        className={`relative flex h-full w-full flex-col overflow-hidden rounded-none shadow-2xl ${panelTransitionClass} ${selectionGlitch ? 'app-glitch-burst' : ''}`}
        style={panelStyle}
      >
        {/* Overlay de luz ambiental */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.1),transparent_50%)] pointer-events-none" />

        {/* Header con botón de salir */}
        <header className="relative z-10 flex shrink-0 items-center justify-between gap-3 px-4 pt-6 pb-2 sm:px-6">
          <button
            type="button"
            onClick={handleExit}
            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/20 bg-black/40 text-white backdrop-blur transition hover:bg-white/10 active:scale-95"
          >
            <FaArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex flex-wrap items-center justify-end gap-2 text-right">
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs backdrop-blur">
              {selectedCategory?.label}
            </span>
            <span className="rounded-full border border-white/15 bg-black/30 px-3 py-1 text-xs backdrop-blur">
              Ronda {roundNumber}
            </span>
          </div>
        </header>

        {/* Info del jugador actual */}
        <div className="relative z-10 shrink-0 px-4 sm:px-6">
          <div className="flex items-center gap-4 rounded-2xl border border-white/15 bg-black/30 p-4 backdrop-blur">
            {currentPlayer ? (
              <>
                <ParticipantAvatarBadge
                  alt={currentPlayer.name}
                  avatar={currentPlayer.avatar}
                  backgroundColor={currentPlayer.color}
                  seed={currentPlayer.avatarSeed}
                  sizeClassName="h-14 w-14 sm:h-16 sm:w-16"
                />
                <div className="min-w-0 flex-1">
                  <p className="text-xs uppercase tracking-wider text-white/60">Turno de</p>
                  <p className="truncate text-2xl font-black text-white sm:text-3xl">
                    {currentPlayer.name}
                  </p>
                </div>
              </>
            ) : (
              <div className="flex items-center gap-3">
                <div className="h-14 w-14 animate-pulse rounded-full border border-white/20 bg-white/10" />
                <div className="h-8 w-32 animate-pulse rounded-lg bg-white/10" />
              </div>
            )}
          </div>
        </div>

        {/* Contenido principal (pregunta/reto o selector) */}
        <main className="relative z-10 flex flex-1 flex-col items-center justify-center px-4 py-6 sm:px-8">
          {currentPromptKind && currentPrompt ? (
            <div className="w-full max-w-2xl rounded-2xl border border-white/15 bg-black/40 p-6 text-center backdrop-blur-sm sm:p-8">
              <p className="text-xs uppercase tracking-[0.3em] text-white/70">
                {currentPromptKind === 'truth' ? 'Verdad' : 'Reto'}
              </p>
              <p className="mt-4 text-xl font-black leading-tight text-white sm:text-3xl md:text-4xl">
                {currentPrompt}
              </p>
            </div>
          ) : (
            <div className="w-full max-w-xl rounded-2xl border border-dashed border-white/20 bg-black/30 p-6 text-center backdrop-blur-sm">
              <p className="text-xl font-black text-white sm:text-2xl">Elige verdad o reto</p>
              <p className="mt-2 text-sm text-white/70">
                La categoría ya está lista. Toca decidir.
              </p>
            </div>
          )}
        </main>

        {/* Botones de acción */}
        <footer className="relative z-10 shrink-0 grid grid-cols-2 gap-3 px-4 pb-6 sm:px-6">
          {currentPromptKind === null ? (
            <>
              <LiquidButton
                className="min-h-[56px] rounded-xl border border-white/20 bg-white/10 text-base font-black text-white shadow-lg backdrop-blur active:scale-95"
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
                className="min-h-[56px] rounded-xl bg-gradient-to-r from-amber-500 via-orange-500 to-rose-600 text-base font-black text-white shadow-lg active:scale-95"
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
              className="col-span-2 min-h-[56px] rounded-xl border border-white/20 bg-white/10 text-base font-black text-white backdrop-blur active:scale-95"
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

        {/* Efectos de overlay al responder */}
        {turnOutcome?.kind === 'truth' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/30 backdrop-blur-sm">
            <div className="animate-bounce text-9xl drop-shadow-2xl">{turnOutcome.emoji}</div>
          </div>
        )}

        {turnOutcome?.kind === 'dare' && (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/50 backdrop-blur-md">
            <div className="flex flex-col items-center rounded-2xl border border-white/30 bg-gradient-to-br from-amber-500/40 to-rose-600/40 px-8 py-6 text-center shadow-2xl backdrop-blur">
              <FaFire className="text-5xl text-yellow-300 drop-shadow-lg" />
              <span className="mt-2 text-8xl font-black tracking-wider text-white drop-shadow-2xl">
                RETO!
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default TruthOrRetoGame;