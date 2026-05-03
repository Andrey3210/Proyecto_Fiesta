import { useEffect, useMemo, useRef, useState } from 'react';
import { FaArrowLeft, FaForward, FaGlassCheers, FaQuestionCircle } from 'react-icons/fa';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';
import divertidasImage from '@/assets/truth-divertidas.svg';
import comprometidasImage from '@/assets/truth-comprometidas.svg';
import romanticasImage from '@/assets/truth-romanticas.svg';
import atrevidasImage from '@/assets/truth-atrevidas.svg';
import incomodasImage from '@/assets/truth-incomodas.svg';
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

type TurnMode = 'idle' | 'truth' | 'shot';

const shotDuration = 10;

const shuffleList = <T,>(values: readonly T[]) => {
  const order = [...values];

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
};

const categoryVisuals: Record<
  TruthCategoryKey,
  {
    accent: string;
    panel: string;
    image: string;
  }
> = {
  divertidas: {
    accent: '#f59e0b',
    panel: 'from-amber-500/22 via-orange-500/16 to-rose-500/10',
    image: divertidasImage,
  },
  comprometidas: {
    accent: '#38bdf8',
    panel: 'from-sky-500/22 via-cyan-500/16 to-slate-500/10',
    image: comprometidasImage,
  },
  romanticas: {
    accent: '#fb7185',
    panel: 'from-pink-500/22 via-rose-500/16 to-fuchsia-500/10',
    image: romanticasImage,
  },
  atrevidas: {
    accent: '#a855f7',
    panel: 'from-fuchsia-500/22 via-violet-500/16 to-rose-500/10',
    image: atrevidasImage,
  },
  incomodas: {
    accent: '#22c55e',
    panel: 'from-emerald-500/22 via-lime-500/16 to-teal-500/10',
    image: incomodasImage,
  },
};

function TruthOrDareGame({ participants, onBackToHub, onButtonPress }: TruthOrDareGameProps) {
  const participantSignature = participants.map((participant) => participant.id).join('|');
  const [turnOrder, setTurnOrder] = useState<string[]>(() =>
    shuffleList(participants.map((participant) => participant.id)),
  );
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [mode, setMode] = useState<TurnMode>('idle');
  const [currentTruth, setCurrentTruth] = useState('');
  const [shotSecondsLeft, setShotSecondsLeft] = useState(shotDuration);
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<TruthCategoryKey | null>(null);
  const [showCategoryChangeWarning, setShowCategoryChangeWarning] = useState(false);
  const [truthDeck, setTruthDeck] = useState<string[]>([]);
  const [truthDeckIndex, setTruthDeckIndex] = useState(0);
  const turnPanelRef = useRef<HTMLDivElement | null>(null);
  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  const currentPlayer = participants.find((participant) => participant.id === turnOrder[currentTurnIndex]);
  const selectedCategory = selectedCategoryKey ? truthCategoryMap[selectedCategoryKey] : null;
  const shotCompleted = mode === 'shot' && shotSecondsLeft === 0;
  const optionsLocked = mode !== 'idle';

  const progressWidth = useMemo(
    () => `${(shotSecondsLeft / shotDuration) * 100}%`,
    [shotSecondsLeft],
  );

  useEffect(() => {
    if (mode !== 'shot' || shotSecondsLeft === 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setShotSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [mode, shotSecondsLeft]);

  useEffect(() => {
    const participantIds = participants.map((participant) => participant.id);

    if (participantIds.length === 0) {
      setTurnOrder([]);
      setCurrentTurnIndex(0);
      setMode('idle');
      setCurrentTruth('');
      setShotSecondsLeft(shotDuration);
      return;
    }

    setTurnOrder(shuffleList(participantIds));
    setCurrentTurnIndex(0);
    setMode('idle');
    setCurrentTruth('');
    setShotSecondsLeft(shotDuration);
  }, [participantSignature]);

  useEffect(() => {
    if (!selectedCategory) {
      setTruthDeck([]);
      setTruthDeckIndex(0);
      setMode('idle');
      setCurrentTruth('');
      setShotSecondsLeft(shotDuration);
      return;
    }

    setTruthDeck(shuffleList(selectedCategory.questions));
    setTruthDeckIndex(0);
    setMode('idle');
    setCurrentTruth('');
    setShotSecondsLeft(shotDuration);
  }, [selectedCategoryKey, selectedCategory?.questions]);

  useEffect(() => {
    if (mode === 'idle') {
      return;
    }

    const timer = window.setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [mode]);

  const drawTruth = () => {
    if (!selectedCategory) {
      return '';
    }

    let nextDeck = truthDeck;
    let nextIndex = truthDeckIndex;

    if (nextDeck.length === 0 || nextIndex >= nextDeck.length) {
      nextDeck = shuffleList(selectedCategory.questions);
      nextIndex = 0;
      setTruthDeck(nextDeck);
    }

    const nextTruth = nextDeck[nextIndex] ?? '';
    setTruthDeckIndex(nextIndex + 1);
    return nextTruth;
  };

  const advancePlayer = () => {
    if (participants.length === 0) {
      return;
    }

    setCurrentTurnIndex((index) => {
      const nextIndex = index + 1;

      if (nextIndex < turnOrder.length) {
        return nextIndex;
      }

      setTurnOrder(shuffleList(participants.map((participant) => participant.id)));
      return 0;
    });
    setMode('idle');
    setCurrentTruth('');
    setShotSecondsLeft(shotDuration);
  };

  const handleAdvancePlayer = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);
    advancePlayer();

    window.setTimeout(() => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      });
    }, 140);
  };

  const startTruth = () => {
    if (optionsLocked || !selectedCategory) {
      return;
    }

    setMode('truth');
    setCurrentTruth(drawTruth());
    setShotSecondsLeft(shotDuration);
  };

  const startShot = () => {
    if (optionsLocked) {
      return;
    }

    setMode('shot');
    setCurrentTruth('SHOT! SHOT! SHOT!');
    setShotSecondsLeft(shotDuration);
  };

  const selectCategory = (categoryKey: TruthCategoryKey) => {
    const shouldChange = window.confirm(
      'Cambiar de categoría reiniciará la ronda actual. ¿Quieres continuar?',
    );

    if (!shouldChange) {
      return;
    }

    setSelectedCategoryKey(categoryKey);
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  if (!currentPlayer) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl">
          <p className="text-2xl font-black">No hay participantes disponibles.</p>
          <p className="mt-2 text-slate-200">Vuelve al hub y agrega al menos 2 jugadores.</p>
          <LiquidButton
            className="mt-6"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
          >
            Volver
          </LiquidButton>
        </div>
      </div>
    );
  }

  if (!selectedCategory) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-4 py-10 pt-20 font-fiesta text-white app-fade-up sm:pt-24">
        <div className="fixed left-4 top-4 z-50">
          <LiquidButton
            className="rounded-full"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
          >
            <span className="flex items-center gap-2">
              <FaArrowLeft />
              Volver
            </span>
          </LiquidButton>
        </div>

        <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/25">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Elige una categoría</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Primero selecciona la categoría de verdades. Después entramos al juego con la ronda
                aleatoria.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {truthCategories.map((category) => (
                  <button
                    key={category.key}
                    className="group relative min-h-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8"
                    onClick={(event) => {
                      onButtonPress(event);
                      selectCategory(category.key);
                    }}
                    type="button"
                  >
                    <span
                      className={`absolute inset-0 bg-gradient-to-br ${categoryVisuals[category.key].panel}`}
                    />
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%)]" />
                    <span
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full"
                      style={{
                        backgroundColor: categoryVisuals[category.key].accent,
                        boxShadow: `0 0 18px ${categoryVisuals[category.key].accent}66`,
                      }}
                    />
                    <span className="relative z-10 flex h-full flex-col gap-4">
                      <span className="flex items-start justify-between gap-4">
                        <span className="flex flex-col">
                          <span className="text-lg font-black leading-tight">{category.label}</span>
                          <span className="mt-2 text-sm text-white/75">{category.description}</span>
                          <span
                            className="mt-4 h-1 w-24 rounded-full"
                            style={{
                              backgroundColor: categoryVisuals[category.key].accent,
                            }}
                          />
                        </span>
                        <span
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/20 p-2 shadow-inner"
                          style={{
                            boxShadow: `0 0 0 1px ${categoryVisuals[category.key].accent}33`,
                          }}
                        >
                          <img
                            alt=""
                            aria-hidden="true"
                            className="h-full w-full object-contain drop-shadow-[0_10px_18px_rgba(0,0,0,0.4)]"
                            src={categoryVisuals[category.key].image}
                          />
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-4 py-10 pt-20 font-fiesta text-white app-fade-up sm:pt-24">
      <div className="fixed left-4 top-4 z-50">
        <LiquidButton
          className="rounded-full"
          onClick={(event) => {
            onButtonPress(event);
            onBackToHub();
          }}
          size="lg"
          variant="cool"
          type="button"
        >
          <span className="flex items-center gap-2">
            <FaArrowLeft />
            Volver
          </span>
        </LiquidButton>
      </div>

      <div className="w-full max-w-5xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/25">
            <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Verdad o Shot</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <LiquidButton
                className="rounded-full !px-4 !py-2 text-sm"
                onClick={(event) => {
                    onButtonPress(event);
                    setShowCategoryChangeWarning(true);
                  }}
                size="lg"
                variant="cool"
                type="button"
              >
                Cambiar categoría
              </LiquidButton>
              <div
                className="rounded-full border px-4 py-2 text-sm text-white/80"
                style={{
                  borderColor: `${categoryVisuals[selectedCategory.key].accent}55`,
                  backgroundColor: `${categoryVisuals[selectedCategory.key].accent}12`,
                }}
              >
                {selectedCategory.label}
              </div>
            </div>

            <div
              ref={turnPanelRef}
              key={currentPlayer.id}
              className="app-turn-rise mt-6 rounded-3xl border border-white/10 bg-black/25 p-5"
            >
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Turno</p>
              <div className="mt-3 flex items-center gap-4">
                <ParticipantAvatarBadge
                  avatar={currentPlayer.avatar}
                  backgroundColor={currentPlayer.color}
                  seed={currentPlayer.avatarSeed}
                  alt={currentPlayer.name}
                  sizeClassName="h-16 w-16"
                />
                <div>
                  <p className="text-3xl font-black" style={{ color: currentPlayer.color }}>
                    {currentPlayer.name}
                  </p>
                  <p className="mt-1 text-slate-200">
                    Elige una verdad de {selectedCategory.label.toLowerCase()} o prepárate para el
                    shot.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <LiquidButton
                className="w-full"
                disabled={optionsLocked}
                onClick={(event) => {
                  onButtonPress(event);
                  startTruth();
                }}
                size="xxl"
                variant="cool"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <FaQuestionCircle />
                  Verdad
                </span>
              </LiquidButton>
              <LiquidButton
                className="w-full"
                disabled={optionsLocked}
                onClick={(event) => {
                  onButtonPress(event);
                  startShot();
                }}
                size="xxl"
                variant="cool"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <FaGlassCheers />
                  Shot
                </span>
              </LiquidButton>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Estado</p>
              <p className="mt-2 text-lg text-slate-200">
                {mode === 'idle'
                  ? 'Selecciona una opción para empezar.'
                  : mode === 'truth'
                    ? 'Verdad activa.'
                    : shotCompleted
                      ? '¡Shot tomado!'
                      : 'Cuenta regresiva en curso.'}
              </p>
            </div>
          </section>

          <section
            ref={resultPanelRef}
            className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-inner shadow-black/25"
          >
            {mode === 'idle' ? (
              <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-white/55">Listos</p>
                <p className="mt-4 text-3xl font-black">Verdad o Shot</p>
                <p className="mt-3 max-w-md text-slate-200">
                  Aquí verás una pregunta de la categoría elegida o un shot con cronómetro.
                </p>
              </div>
            ) : (
              <div
                key={`${mode}-${currentPlayer.id}`}
                className="app-reveal-focus flex min-h-[32rem] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-6"
              >
                <div>
                  <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                    {mode === 'truth' ? selectedCategory.label : 'Shot'}
                  </p>
                  <div className="mt-5 rounded-[1.5rem] border border-white/10 bg-black/25 p-6">
                    {mode === 'truth' ? (
                      <p className="text-2xl font-semibold leading-relaxed text-white sm:text-3xl">
                        {currentTruth}
                      </p>
                    ) : (
                      <div className="text-center">
                        <p className="text-4xl font-black uppercase tracking-[0.3em] text-rose-200 sm:text-5xl">
                          SHOT! SHOT! SHOT!
                        </p>
                        <p className="mt-4 text-slate-200">
                          Tienes un momento para tomarlo.
                        </p>
                        <div className="mt-6 overflow-hidden rounded-full border border-white/10 bg-black/40">
                          <div
                            className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 transition-[width] duration-1000 ease-linear"
                            style={{ width: progressWidth }}
                          />
                        </div>
                        <p className="mt-4 text-6xl font-black text-white">{shotSecondsLeft}</p>
                        {shotCompleted && (
                          <p className="mt-4 text-lg font-semibold text-emerald-300">
                            ¡Shot tomado!
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <LiquidButton
                    className="!h-24 !w-full !rounded-full !px-10 !text-xl sm:!h-20 sm:!px-12 sm:!text-lg"
                    disabled={mode === 'shot' && !shotCompleted}
                    onClick={handleAdvancePlayer}
                    size="xxl"
                    variant="cool"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <FaForward />
                      Siguiente participante
                    </span>
                  </LiquidButton>
                </div>
              </div>
            )}
          </section>
        </div>
      </div>

      {showCategoryChangeWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-center text-white shadow-2xl">
            <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
            <h2 className="mt-3 text-2xl font-black">Cambiar categoría</h2>
            <p className="mt-3 text-slate-200">Si cambias la categoría, la ronda actual se reiniciará.</p>
            <div className="mt-6 flex gap-3">
              <button
                className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                onClick={() => setShowCategoryChangeWarning(false)}
                type="button"
              >
                Seguir jugando
              </button>
              <button
                className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                onClick={() => {
                  setShowCategoryChangeWarning(false);
                  setSelectedCategoryKey(null);
                  window.scrollTo({
                    top: 0,
                    behavior: 'smooth',
                  });
                }}
                type="button"
              >
                Cambiar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default TruthOrDareGame;
