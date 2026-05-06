import { useEffect, useMemo, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaFire } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';
import {
  truthCategories,
  truthCategoryMap,
  type TruthCategoryKey,
} from '@/data/truth-categories';

import type { Participant } from '../App';

type TruthOrDareGameProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type TurnOutcome =
  | {
      kind: 'responded';
      id: number;
      emoji: string;
    }
  | {
      kind: 'shot';
      id: number;
    };

type TurnTransition = 'responded' | 'shot' | null;

const respondedEmojis = [
  '\u{1F628}',
  '\u{1FAE3}',
  '\u{1F631}',
  '\u{1F635}',
  '\u{1F62C}',
  '\u{1F62F}',
  '\u{1F92F}',
  '\u{1F976}',
];

const shuffleList = <T,>(values: readonly T[]) => {
  const order = [...values];

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
};

const pickRandom = <T,>(values: readonly T[]) => values[Math.floor(Math.random() * values.length)] ?? values[0];

function TruthOrDareGame({ participants, onBackToHub, onButtonPress }: TruthOrDareGameProps) {
  void onBackToHub;

  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TruthCategoryKey | null>(null);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [truthDeck, setTruthDeck] = useState<string[]>([]);
  const [truthDeckIndex, setTruthDeckIndex] = useState(0);
  const [currentTruth, setCurrentTruth] = useState<string>('');
  const [turnTransition, setTurnTransition] = useState<TurnTransition>(null);
  const [turnOutcome, setTurnOutcome] = useState<TurnOutcome | null>(null);
  const turnTimerRef = useRef<number | null>(null);

  const participantSignature = useMemo(
    () => participants.map((participant) => participant.id).join('|'),
    [participants],
  );

  const selectedCategory = selectedCategoryKey ? truthCategoryMap[selectedCategoryKey] : null;
  const currentPlayer = turnOrder.length > 0
    ? participants.find((participant) => participant.id === turnOrder[currentTurnIndex])
    : null;

  useEffect(() => {
    const body = document.body;
    const html = document.documentElement;
    const previousBodyOverflow = body.style.overflow;
    const previousHtmlOverflow = html.style.overflow;
    const previousBodyOverscroll = body.style.overscrollBehavior;
    const previousHtmlOverscroll = html.style.overscrollBehavior;

    body.style.overflow = 'hidden';
    html.style.overflow = 'hidden';
    body.style.overscrollBehavior = 'none';
    html.style.overscrollBehavior = 'none';

    return () => {
      body.style.overflow = previousBodyOverflow;
      html.style.overflow = previousHtmlOverflow;
      body.style.overscrollBehavior = previousBodyOverscroll;
      html.style.overscrollBehavior = previousHtmlOverscroll;
    };
  }, []);

  useEffect(
    () => () => {
      if (turnTimerRef.current !== null) {
        window.clearTimeout(turnTimerRef.current);
      }
    },
    [],
  );

  useEffect(() => {
    if (participants.length < 2 || !selectedCategoryKey) {
      return;
    }

    if (turnOrder.length === 0) {
      const nextOrder = shuffleList(participants.map((participant) => participant.id));
      const nextTruthDeck = shuffleList(truthCategoryMap[selectedCategoryKey].questions);

      setTurnOrder(nextOrder);
      setCurrentTurnIndex(0);
      setTruthDeck(nextTruthDeck);
      setTruthDeckIndex(0);
      setCurrentTruth(nextTruthDeck[0] ?? '');
    }
  }, [participants.length, selectedCategoryKey, turnOrder.length, participantSignature]);

  const startRound = (categoryKey: TruthCategoryKey) => {
    if (participants.length < 2) {
      return;
    }

    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
      turnTimerRef.current = null;
    }

    const nextOrder = shuffleList(participants.map((participant) => participant.id));
    const nextTruthDeck = shuffleList(truthCategoryMap[categoryKey].questions);

    setSelectedCategoryKey(categoryKey);
    setTurnOrder(nextOrder);
    setCurrentTurnIndex(0);
    setTruthDeck(nextTruthDeck);
    setTruthDeckIndex(0);
    setCurrentTruth(nextTruthDeck[0] ?? '');
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

    setCurrentTurnIndex((currentIndex) => {
      if (turnOrder.length === 0) {
        return 0;
      }

      const nextIndex = (currentIndex + 1) % turnOrder.length;
      return nextIndex;
    });

    setTruthDeckIndex((currentIndex) => {
      if (truthDeck.length === 0) {
        return 0;
      }

      const nextIndex = currentIndex + 1;

      if (nextIndex < truthDeck.length) {
        setCurrentTruth(truthDeck[nextIndex]);
        return nextIndex;
      }

      const nextDeck = shuffleList(selectedCategory ? selectedCategory.questions : truthCategories[0].questions);
      const nextTruth = nextDeck[0] ?? '';
      setTruthDeck(nextDeck);
      setCurrentTruth(nextTruth);
      return 0;
    });
  };

  const finishTurn = (kind: 'responded' | 'shot') => {
    if (!selectedCategory || currentPlayer === null || turnTransition !== null) {
      return;
    }

    if (turnTimerRef.current !== null) {
      window.clearTimeout(turnTimerRef.current);
    }

    const choiceDuration = 760;

    setTurnTransition(kind);
    setTurnOutcome(
      kind === 'responded'
        ? {
            kind,
            id: Date.now(),
            emoji: pickRandom(respondedEmojis),
          }
        : {
            kind,
            id: Date.now(),
          },
    );

    turnTimerRef.current = window.setTimeout(() => {
      advanceTurn();
    }, choiceDuration);
  };

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

  if (!selectedCategoryKey) {
    return (
      <div className="relative flex min-h-[100svh] w-full items-start justify-center overflow-hidden bg-transparent px-3 pb-4 pt-[5.75rem] text-white app-fade-up sm:px-4 sm:pt-24">
        <div className="w-full max-w-5xl overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_30px_100px_rgba(0,0,0,0.42)] backdrop-blur-2xl sm:p-6">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.18),transparent_38%),linear-gradient(180deg,rgba(15,23,42,0.08),rgba(0,0,0,0.52))]" />
          <div className="relative z-10 flex flex-col gap-5">
            <header className="flex flex-col gap-3 border-b border-white/10 pb-4 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-[0.7rem] uppercase tracking-[0.45em] text-white/70">MondeFan</p>
                <h1 className="mt-2 text-3xl font-black sm:text-5xl">Verdad o Shot</h1>
                <p className="mt-2 max-w-2xl text-sm text-white/80 sm:text-base">
                  Elige una categoría y empieza el turno sin scroll ni pantallas partidas.
                </p>
              </div>
              <div className="rounded-full border border-white/10 bg-white/10 px-4 py-2 text-sm font-semibold text-white/90">
                {participants.length} participantes
              </div>
            </header>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {truthCategories.map((category) => (
                <LiquidButton
                  key={category.key}
                  className="min-h-32 w-full rounded-[1.75rem] border border-white/10 bg-white/5 !px-4 !py-4 text-left shadow-[0_16px_50px_rgba(0,0,0,0.18)] transition hover:-translate-y-0.5 hover:bg-white/10"
                  onClick={(event) => {
                    onButtonPress(event);
                    startRound(category.key);
                  }}
                  size="lg"
                  type="button"
                  variant="cool"
                >
                  <div className="flex h-full flex-col justify-between gap-3">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <p className="text-3xl leading-none">{category.emoji}</p>
                        <h2 className="mt-3 text-xl font-black">{category.label}</h2>
                      </div>
                      <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1 text-[0.65rem] uppercase tracking-[0.3em] text-white/70">
                        Elegir
                      </span>
                    </div>
                    <p className="text-sm leading-relaxed text-white/78">{category.description}</p>
                  </div>
                </LiquidButton>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const panelTransitionClass =
    turnTransition === 'responded'
      ? 'app-choice-responded'
      : turnTransition === 'shot'
        ? 'app-choice-shot'
        : '';

  const panelStyle = currentPlayer
    ? {
        backgroundColor: currentPlayer.color,
        backgroundImage:
          'linear-gradient(180deg, rgba(255, 255, 255, 0.22), rgba(15, 23, 42, 0.48)), radial-gradient(circle at top, rgba(255, 255, 255, 0.22), transparent 35%), radial-gradient(circle at bottom right, rgba(15, 23, 42, 0.18), transparent 32%)',
      }
    : {
        backgroundColor: '#0f172a',
      };

  return (
    <div className="relative flex min-h-[100svh] w-full items-start justify-center overflow-hidden bg-transparent px-3 pb-4 pt-[5.75rem] text-white app-fade-up sm:px-4 sm:pt-24">
      <div
        className={`relative flex w-full max-w-4xl flex-1 flex-col overflow-hidden rounded-[2.35rem] border border-white/12 shadow-[0_30px_100px_rgba(0,0,0,0.42)] ${panelTransitionClass}`}
        style={panelStyle}
      >
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_36%),linear-gradient(180deg,rgba(0,0,0,0.06),rgba(0,0,0,0.26))]" />
        <div className="absolute inset-x-0 top-0 h-24 bg-white/10 blur-3xl" />

        <div className="relative z-10 flex flex-1 flex-col">
          <header className="flex flex-col gap-4 px-4 pb-4 pt-4 sm:px-6 sm:pb-5 sm:pt-6 lg:flex-row lg:items-start lg:justify-between">
            <div className="min-w-0 flex-1">
              <p className="text-[0.7rem] uppercase tracking-[0.45em] text-white/75">Verdad o Shot</p>
              <h2 className="mt-2 truncate text-3xl font-black sm:text-5xl">
                {currentPlayer?.name ?? 'Preparando ronda...'}
              </h2>
              <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-white/90">
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  {selectedCategory?.label}
                </span>
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  Ronda {currentTurnIndex + 1}
                </span>
                <span className="rounded-full border border-white/15 bg-black/18 px-3 py-1 backdrop-blur">
                  Pregunta {truthDeckIndex + 1}
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

          <main className="relative flex flex-1 items-center justify-center px-4 py-2 sm:px-8 sm:py-4">
            {currentTruth ? (
              <div className="mx-auto max-w-2xl rounded-[2.25rem] border border-white/15 bg-black/12 px-5 py-6 text-center shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-sm sm:px-8 sm:py-10">
                <p className="text-[0.65rem] uppercase tracking-[0.5em] text-white/70">La verdad</p>
                <p className="mt-4 text-balance text-3xl font-black leading-tight text-white sm:text-5xl">
                  {currentTruth}
                </p>
              </div>
            ) : (
              <div className="mx-auto max-w-xl rounded-[2rem] border border-dashed border-white/18 bg-black/12 px-6 py-8 text-center backdrop-blur-sm">
                <p className="text-2xl font-black sm:text-3xl">Preparando ronda...</p>
                <p className="mt-2 text-sm text-white/80 sm:text-base">
                  Estamos mezclando participantes y preguntas.
                </p>
              </div>
            )}
          </main>

          <footer className="grid grid-cols-2 gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] sm:px-6 sm:pb-6">
            <LiquidButton
              className="!min-h-14 rounded-[1.5rem] border border-white/15 bg-white/10 !px-4 !py-3 text-base font-black text-white shadow-[0_14px_40px_rgba(0,0,0,0.22)] backdrop-blur-sm transition hover:bg-white/15 sm:!min-h-16 sm:text-lg"
              disabled={!currentPlayer || turnTransition !== null}
              onClick={(event) => {
                onButtonPress(event);
                finishTurn('responded');
              }}
              size="lg"
              type="button"
              variant="default"
            >
              Respondió
            </LiquidButton>

            <LiquidButton
              className="!min-h-14 rounded-[1.5rem] border border-amber-200/30 bg-gradient-to-r from-amber-300 via-orange-400 to-rose-500 !px-4 !py-3 text-base font-black text-white shadow-[0_18px_50px_rgba(249,115,22,0.35)] transition hover:brightness-110 sm:!min-h-16 sm:text-lg"
              disabled={!currentPlayer || turnTransition !== null}
              onClick={(event) => {
                onButtonPress(event);
                finishTurn('shot');
              }}
              size="lg"
              type="button"
              variant="cool"
            >
              Shot
            </LiquidButton>
          </footer>
        </div>

        {turnOutcome?.kind === 'responded' ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/12 backdrop-blur-[2px]">
            <div className="app-feedback-responded flex items-center justify-center text-[clamp(5rem,30vw,14rem)] leading-none drop-shadow-[0_24px_60px_rgba(0,0,0,0.45)]">
              {turnOutcome.emoji}
            </div>
          </div>
        ) : null}

        {turnOutcome?.kind === 'shot' ? (
          <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center bg-black/22 backdrop-blur-[3px]">
            <div className="app-feedback-shot app-shot-burst flex flex-col items-center justify-center rounded-[2.5rem] border border-white/25 bg-[linear-gradient(135deg,rgba(255,255,255,0.2),rgba(251,191,36,0.28),rgba(239,68,68,0.42))] px-8 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
              <FaFire className="text-4xl text-amber-200 drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] sm:text-5xl" />
              <span className="mt-3 block text-[clamp(4rem,26vw,10rem)] font-black tracking-[0.2em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.52)]">
                SHOT!
              </span>
            </div>
          </div>
        ) : null}
      </div>
    </div>
  );
}

export default TruthOrDareGame;
