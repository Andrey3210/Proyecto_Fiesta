import { useEffect, useRef, useState } from 'react';
import {
  FaArrowLeft,
  FaChevronRight,
  FaEye,
  FaEyeSlash,
  FaHandPaper,
  FaMask,
  FaRedoAlt,
} from 'react-icons/fa';
import type { MouseEvent as ReactMouseEvent, PointerEvent as ReactPointerEvent } from 'react';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';
import {
  impostorCategories,
  impostorCategoryMap,
  type ImpostorCategoryKey,
  type ImpostorSecret,
} from '@/data/impostor-categories';

import type { Participant } from '../App';

type ImpostorGameProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type Phase = 'setup' | 'reveal' | 'summary';

const shuffleList = <T,>(values: readonly T[]) => {
  const order = [...values];

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
};

const holdDuration = 900;

function ImpostorGame({ participants, onBackToHub, onButtonPress }: ImpostorGameProps) {
  const participantSignature = participants.map((participant) => participant.id).join('|');
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<ImpostorCategoryKey | null>(null);
  const [showHint, setShowHint] = useState(true);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [secretItem, setSecretItem] = useState<ImpostorSecret | null>(null);
  const [bagOpen, setBagOpen] = useState(false);
  const [readyToContinue, setReadyToContinue] = useState(false);
  const [isHolding, setIsHolding] = useState(false);
  const [holdProgress, setHoldProgress] = useState(0);
  const resultPanelRef = useRef<HTMLDivElement | null>(null);
  const holdStartRef = useRef<number | null>(null);
  const holdFrameRef = useRef<number | null>(null);

  const selectedCategory = selectedCategoryKey ? impostorCategoryMap[selectedCategoryKey] : null;
  const currentPlayer = participants.find((participant) => participant.id === turnOrder[currentTurnIndex]);
  const impostorPlayer = impostorId
    ? participants.find((participant) => participant.id === impostorId)
    : null;
  const isCurrentImpostor = currentPlayer?.id === impostorId;
  const canStart = participants.length >= 3 && selectedCategory !== null;

  const resetHoldState = () => {
    if (holdFrameRef.current !== null) {
      window.cancelAnimationFrame(holdFrameRef.current);
      holdFrameRef.current = null;
    }

    holdStartRef.current = null;
    setIsHolding(false);
    setHoldProgress(0);
  };

  const resetRoundState = () => {
    setPhase('setup');
    setTurnOrder([]);
    setCurrentTurnIndex(0);
    setImpostorId(null);
    setSecretItem(null);
    setBagOpen(false);
    setReadyToContinue(false);
    resetHoldState();
  };

  const confirmCategoryChange = () =>
    window.confirm('Cambiar de categoría reiniciará la configuración actual. ¿Quieres continuar?');

  useEffect(() => {
    if (participants.length === 0) {
      resetRoundState();
      return;
    }

    if (phase !== 'setup' && participantSignature) {
      resetRoundState();
    }
  }, [participantSignature]);

  useEffect(() => {
    if (phase === 'setup') {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [phase, currentTurnIndex, readyToContinue, bagOpen]);

  useEffect(
    () => () => {
      if (holdFrameRef.current !== null) {
        window.cancelAnimationFrame(holdFrameRef.current);
      }
    },
    [],
  );

  const startRound = () => {
    if (!selectedCategory || participants.length < 3) {
      return;
    }

    const shuffledParticipants = shuffleList(participants.map((participant) => participant.id));
    const impostorIndex = Math.floor(Math.random() * shuffledParticipants.length);
    const pickedSecret =
      selectedCategory.words[Math.floor(Math.random() * selectedCategory.words.length)] ?? null;

    if (!pickedSecret) {
      return;
    }

    setTurnOrder(shuffledParticipants);
    setCurrentTurnIndex(0);
    setImpostorId(shuffledParticipants[impostorIndex] ?? null);
    setSecretItem(pickedSecret);
    setBagOpen(false);
    setReadyToContinue(false);
    resetHoldState();
    setPhase('reveal');
  };

  const revealBag = () => {
    if (bagOpen) {
      return;
    }

    resetHoldState();
    setHoldProgress(1);
    setBagOpen(true);
    setReadyToContinue(false);
  };

  const handleHoldStart = (event: ReactPointerEvent<HTMLButtonElement>) => {
    if (phase !== 'reveal' || bagOpen || readyToContinue || isHolding) {
      return;
    }

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    holdStartRef.current = window.performance.now();
    setIsHolding(true);

    const tick = (timestamp: number) => {
      if (holdStartRef.current === null) {
        return;
      }

      const progress = Math.min(1, (timestamp - holdStartRef.current) / holdDuration);
      setHoldProgress(progress);

      if (progress >= 1) {
        revealBag();
        return;
      }

      holdFrameRef.current = window.requestAnimationFrame(tick);
    };

    holdFrameRef.current = window.requestAnimationFrame(tick);
  };

  const handleHoldEnd = () => {
    if (bagOpen) {
      setBagOpen(false);
      setReadyToContinue(true);
      resetHoldState();
      return;
    }

    resetHoldState();
  };

  const handleNextPlayer = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);

    if (currentTurnIndex + 1 < turnOrder.length) {
      setCurrentTurnIndex((index) => index + 1);
      setBagOpen(false);
      setReadyToContinue(false);
      resetHoldState();
      return;
    }

    setPhase('summary');
  };

  const selectedColor = selectedCategory?.accent ?? '#38bdf8';
  const selectedPanel = selectedCategory?.panel ?? 'from-sky-500/20 via-cyan-500/14 to-indigo-500/10';

  if (phase === 'setup') {
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

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/25">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Impostor</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Elige una categoría, activa o desactiva la pista y luego cada jugador abre su bolsa
                manteniendo presionado.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {impostorCategories.map((category) => (
                  <button
                    key={category.key}
                    className="group relative min-h-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8"
                    onClick={(event) => {
                      onButtonPress(event);

                      if (!confirmCategoryChange()) {
                        return;
                      }

                      setSelectedCategoryKey(category.key);
                    }}
                    type="button"
                  >
                    <span className={`absolute inset-0 bg-gradient-to-br ${category.panel}`} />
                    <span className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.18),transparent_40%)]" />
                    <span
                      className="absolute left-0 top-0 h-full w-1 rounded-r-full"
                      style={{
                        backgroundColor: category.accent,
                        boxShadow: `0 0 18px ${category.accent}66`,
                      }}
                    />
                    <span className="relative z-10 flex h-full flex-col gap-4">
                      <span className="flex items-start justify-between gap-4">
                        <span className="flex flex-col">
                          <span className="text-lg font-black leading-tight">{category.label}</span>
                          <span className="mt-2 text-sm text-white/75">{category.description}</span>
                          <span
                            className="mt-4 h-1 w-24 rounded-full"
                            style={{ backgroundColor: category.accent }}
                          />
                        </span>
                        <span
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl border border-white/15 bg-black/20 p-2 shadow-inner"
                          style={{
                            boxShadow: `0 0 0 1px ${category.accent}33`,
                          }}
                        >
                          <FaMask className="text-2xl" />
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div
                  className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5"
                  style={{
                    boxShadow: selectedCategory ? `0 0 0 1px ${selectedColor}22` : undefined,
                  }}
                >
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">Categoría</p>
                  {selectedCategory ? (
                    <>
                      <p className="mt-2 text-2xl font-black" style={{ color: selectedColor }}>
                        {selectedCategory.label}
                      </p>
                      <p className="mt-2 text-slate-200">{selectedCategory.description}</p>
                      <p className="mt-4 text-sm text-white/70">
                        {selectedCategory.words.length} secretos listos para la ronda.
                      </p>
                    </>
                  ) : (
                    <>
                      <p className="mt-2 text-2xl font-black text-white">Sin categoría aún</p>
                      <p className="mt-2 text-slate-200">
                        Selecciona una de las tarjetas de arriba para preparar la partida.
                      </p>
                    </>
                  )}
                </div>

                <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-5">
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">Ajustes</p>
                  <button
                    className={`mt-4 w-full rounded-[1.4rem] border px-4 py-4 text-left transition ${
                      showHint
                        ? 'border-emerald-400/40 bg-emerald-500/10 text-white'
                        : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                    }`}
                    onClick={(event) => {
                      onButtonPress(event);
                      setShowHint((value) => !value);
                    }}
                    type="button"
                  >
                    <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em]">
                      {showHint ? <FaEye /> : <FaEyeSlash />}
                      Pista del impostor
                    </span>
                    <span className="mt-2 block text-sm text-slate-200">
                      {showHint
                        ? 'Activa para que el impostor vea una pista extra.'
                        : 'Desactivada para jugar más difícil.'}
                    </span>
                  </button>

                  <div className="mt-4 rounded-[1.4rem] border border-white/10 bg-white/5 px-4 py-4">
                    <p className="text-sm uppercase tracking-[0.3em] text-white/50">Jugadores</p>
                    <p className="mt-2 text-sm text-slate-200">
                      {participants.length} participantes listos.
                    </p>
                    <p className="mt-1 text-xs text-slate-400">
                      Necesitas al menos 3 para empezar.
                    </p>
                  </div>

                  <LiquidButton
                    className="mt-5 w-full"
                    disabled={!canStart}
                    onClick={(event) => {
                      onButtonPress(event);
                      startRound();
                    }}
                    size="xxl"
                    variant="cool"
                    type="button"
                  >
                    <span className="flex items-center gap-2">
                      <FaMask />
                      Empezar ronda
                    </span>
                  </LiquidButton>
                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
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
              <h1 className="mt-2 text-4xl font-black sm:text-5xl">Ronda terminada</h1>
              <p className="mt-3 text-slate-200">
                La categoría era <span className="font-semibold">{selectedCategory?.label ?? 'Categoría'}</span>.
              </p>

              <div
                className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/25 p-6"
                style={{
                  boxShadow: `0 0 0 1px ${selectedColor}22`,
                }}
              >
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                  La palabra secreta
                </p>
                <p className="mt-3 text-3xl font-black" style={{ color: selectedColor }}>
                  {secretItem?.answer}
                </p>
                {showHint && secretItem && (
                  <p className="mt-3 text-slate-200">
                    Pista del impostor: <span className="font-semibold">{secretItem.clue}</span>
                  </p>
                )}
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">Impostor</p>
                <p className="mt-2 text-2xl font-black" style={{ color: '#fb7185' }}>
                  {impostorPlayer?.name ?? 'Desconocido'}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LiquidButton
                  className="w-full"
                  onClick={(event) => {
                    onButtonPress(event);
                    setPhase('setup');
                    setTurnOrder([]);
                    setCurrentTurnIndex(0);
                    setImpostorId(null);
                    setSecretItem(null);
                    setBagOpen(false);
                    setReadyToContinue(false);
                    resetHoldState();
                  }}
                  size="xxl"
                  variant="cool"
                  type="button"
                >
                  <span className="flex items-center gap-2">
                    <FaRedoAlt />
                    Jugar otra vez
                  </span>
                </LiquidButton>
                <LiquidButton
                  className="w-full"
                  onClick={(event) => {
                    onButtonPress(event);

                    if (!confirmCategoryChange()) {
                      return;
                    }

                    setSelectedCategoryKey(null);
                    resetRoundState();
                  }}
                  size="xxl"
                  variant="cool"
                  type="button"
                >
                  Elegir categoría
                </LiquidButton>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/25">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">Resumen</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {participants.slice(0, 6).map((participant) => {
                  const isImpostor = participant.id === impostorId;

                  return (
                    <div
                      key={participant.id}
                      className="rounded-3xl border border-white/10 bg-black/25 p-4"
                      style={{
                        boxShadow: isImpostor ? `0 0 0 1px ${selectedColor}55` : undefined,
                      }}
                    >
                      <ParticipantAvatarBadge
                        avatar={participant.avatar}
                        backgroundColor={participant.color}
                        seed={participant.avatarSeed}
                        alt={participant.name}
                        sizeClassName="h-14 w-14"
                      />
                      <p className="mt-3 font-semibold">{participant.name}</p>
                      <p className="mt-1 text-sm text-slate-300">
                        {isImpostor ? 'Impostor de la ronda' : 'Jugador normal'}
                      </p>
                    </div>
                  );
                })}
              </div>
              <p className="mt-5 text-sm text-slate-300">
                Puedes volver al hub o iniciar otra ronda con la misma lista de participantes.
              </p>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (!currentPlayer || !secretItem) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-white">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl">
          <p className="text-2xl font-black">No hay partida activa.</p>
          <p className="mt-2 text-slate-200">Vuelve al inicio y arranca una ronda nueva.</p>
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

      <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-6 shadow-2xl backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
          <section className="rounded-[2rem] border border-white/10 bg-white/5 p-6 shadow-inner shadow-black/25">
            <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
            <h1 className="mt-2 text-4xl font-black sm:text-5xl">Impostor</h1>

            <div className="mt-4 flex flex-wrap gap-2">
              <LiquidButton
                className="rounded-full !px-4 !py-2 text-sm"
                onClick={(event) => {
                  onButtonPress(event);

                  if (!confirmCategoryChange()) {
                    return;
                  }

                  resetRoundState();
                  setSelectedCategoryKey(null);
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
                  borderColor: `${selectedColor}55`,
                  backgroundColor: `${selectedColor}12`,
                }}
              >
                {selectedCategory?.label ?? 'Sin categoría'}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
              <p className="text-sm uppercase tracking-[0.35em] text-white/50">Jugadores</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {turnOrder.map((playerId, index) => {
                  const participant = participants.find((entry) => entry.id === playerId);

                  if (!participant) {
                    return null;
                  }

                  const active = index === currentTurnIndex;

                  return (
                    <span
                      key={playerId}
                      className="inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm"
                      style={{
                        borderColor: active ? `${selectedColor}66` : 'rgba(255,255,255,0.08)',
                        backgroundColor: active ? `${selectedColor}14` : 'rgba(255,255,255,0.03)',
                      }}
                    >
                      <span
                        className="h-2.5 w-2.5 rounded-full"
                        style={{ backgroundColor: participant.color }}
                      />
                      {participant.name}
                    </span>
                  );
                })}
              </div>
            </div>

            <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
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
                    Mantén presionada la bolsa para ver tu papel.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 grid gap-3 sm:grid-cols-2">
              <button
                className={`rounded-[1.5rem] border px-4 py-4 text-left transition ${
                  showHint
                    ? 'border-emerald-400/40 bg-emerald-500/10 text-white'
                    : 'border-white/10 bg-white/5 text-slate-200 hover:bg-white/10'
                }`}
                onClick={(event) => {
                  onButtonPress(event);
                  setShowHint((value) => !value);
                }}
                type="button"
              >
                <span className="flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.3em]">
                  {showHint ? <FaEye /> : <FaEyeSlash />}
                  Pista
                </span>
                <span className="mt-2 block text-sm text-slate-200">
                  {showHint
                    ? 'Activa para mostrar la pista solo al impostor.'
                    : 'Desactivada para jugar más difícil.'}
                </span>
              </button>

              <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">Ronda</p>
                <p className="mt-2 text-sm text-slate-200">
                  {currentTurnIndex + 1} de {turnOrder.length}
                </p>
              </div>
            </div>

            <div className="mt-6">
              <LiquidButton
                className="w-full"
                disabled={!canStart}
                onClick={(event) => {
                  onButtonPress(event);
                  startRound();
                }}
                size="xxl"
                variant="cool"
                type="button"
              >
                <span className="flex items-center gap-2">
                  <FaMask />
                  Empezar ronda
                </span>
              </LiquidButton>
              {!canStart && (
                <p className="mt-3 text-sm text-slate-300">
                  Necesitas al menos 3 participantes y una categoría elegida.
                </p>
              )}
            </div>
          </section>

          <section
            ref={resultPanelRef}
            className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-inner shadow-black/25"
          >
            <div
              className={`rounded-[2rem] border border-white/10 bg-white/5 p-6 ${phase === 'reveal' ? 'app-reveal-focus' : ''}`}
              style={{
                boxShadow: `0 0 0 1px ${selectedColor}18`,
              }}
            >
              <div className="relative mx-auto flex min-h-[32rem] max-w-xl flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-5">
                <div
                  className={`absolute inset-0 bg-gradient-to-br ${selectedPanel}`}
                  aria-hidden="true"
                />
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_38%)]" />

                {!bagOpen && !readyToContinue ? (
                  <button
                    className="relative z-10 mt-2 w-full touch-none select-none"
                    onPointerDown={handleHoldStart}
                    onPointerLeave={handleHoldEnd}
                    onPointerUp={handleHoldEnd}
                    onPointerCancel={handleHoldEnd}
                    onContextMenu={(event) => event.preventDefault()}
                    type="button"
                  >
                    <div
                      className="relative mx-auto flex h-[22rem] w-full max-w-[20rem] items-end justify-center rounded-[2.5rem] border border-white/10 bg-black/20 p-4 shadow-[0_30px_80px_rgba(0,0,0,0.35)]"
                      style={{
                        boxShadow: `0 0 0 1px ${selectedColor}22, 0 30px 80px rgba(0,0,0,0.35)`,
                      }}
                    >
                      <div
                        className="absolute left-1/2 top-0 h-20 w-40 -translate-x-1/2 rounded-b-[1.75rem] border border-white/10 bg-black/40 transition-transform duration-500"
                        style={{
                          background: `linear-gradient(180deg, rgba(255,255,255,0.14), rgba(0,0,0,0.22)), ${selectedColor}14`,
                          transform: bagOpen
                            ? 'translate(-50%, -20%) rotate(-8deg)'
                            : 'translate(-50%, 0) rotate(0deg)',
                        }}
                      />
                      <div
                        className="relative flex w-full flex-col items-center rounded-[2rem] border border-white/10 bg-gradient-to-b from-black/10 to-black/35 px-6 py-10 transition-transform duration-500"
                        style={{
                          transform: isHolding
                            ? 'translateY(-4px) scale(1.01)'
                            : 'translateY(0) scale(1)',
                        }}
                      >
                        <div
                          className="mb-6 h-2 w-28 rounded-full"
                          style={{
                            backgroundColor: selectedColor,
                            boxShadow: `0 0 18px ${selectedColor}66`,
                          }}
                        />
                        <div
                          className="flex h-24 w-24 items-center justify-center rounded-full border border-white/15 bg-white/10"
                          style={{
                            boxShadow: `0 0 0 1px ${selectedColor}33`,
                          }}
                        >
                          <FaHandPaper className="text-4xl" />
                        </div>
                        <p className="mt-6 text-center text-2xl font-black">Mantén presionado</p>
                        <p className="mt-2 max-w-xs text-center text-sm text-slate-200">
                          La bolsa se abre mientras mantienes el dedo o el mouse pulsado.
                        </p>

                        <div className="mt-8 w-full overflow-hidden rounded-full border border-white/10 bg-black/35">
                          <div
                            className="h-3 rounded-full transition-[width] duration-75 ease-linear"
                            style={{
                              width: `${holdProgress * 100}%`,
                              backgroundColor: selectedColor,
                            }}
                          />
                        </div>

                        <p className="mt-3 text-xs uppercase tracking-[0.4em] text-white/50">
                          {holdProgress < 1 ? 'Presiona y mantén' : 'Abriendo...'}
                        </p>
                      </div>
                    </div>
                  </button>
                ) : readyToContinue ? (
                  <div className="relative z-10 mt-4 flex w-full flex-col items-center">
                    <div className="rounded-[2rem] border border-white/10 bg-black/25 px-6 py-8 text-center">
                      <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                        Secreto visto
                      </p>
                      <p className="mt-5 text-3xl font-black" style={{ color: selectedColor }}>
                        Pasa el teléfono
                      </p>
                      <p className="mt-4 text-slate-200">
                        Ya viste tu papel. Ahora deja que siga el siguiente jugador.
                      </p>
                    </div>

                    <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                      <LiquidButton
                        className="!h-24 !w-full !rounded-full !px-10 !text-xl sm:!h-20 sm:!px-12 sm:!text-lg"
                        onClick={handleNextPlayer}
                        size="xxl"
                        variant="cool"
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <FaChevronRight />
                          Continuar
                        </span>
                      </LiquidButton>
                    </div>
                  </div>
                ) : (
                  <div className="relative z-10 mt-4 flex w-full flex-col items-center">
                    <div className="rounded-[2rem] border border-white/10 bg-black/25 px-6 py-8 text-center">
                      <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                        {isCurrentImpostor ? 'Tu papel' : 'Tu palabra'}
                      </p>
                      <p className="mt-5 text-3xl font-black" style={{ color: selectedColor }}>
                        {isCurrentImpostor ? 'Eres el impostor' : secretItem.answer}
                      </p>
                      <p className="mt-4 text-slate-200">
                        {isCurrentImpostor
                          ? 'Tu tarea es escuchar, mirar y no delatarte.'
                          : 'No digas esta palabra en voz alta hasta que termine la ronda.'}
                      </p>
                      {isCurrentImpostor && showHint && (
                        <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                          <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                            Pista secreta
                          </p>
                          <p className="mt-2 text-lg font-semibold text-white">
                            {secretItem.clue}
                          </p>
                        </div>
                      )}
                      {isCurrentImpostor && !showHint && (
                        <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
                          La pista fue desactivada al inicio de la ronda.
                        </div>
                      )}
                      {!isCurrentImpostor && (
                        <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-100">
                          Esta palabra la comparte todo el grupo menos el impostor.
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

export default ImpostorGame;
