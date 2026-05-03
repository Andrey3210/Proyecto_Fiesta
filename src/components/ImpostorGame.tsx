import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import {
  FaArrowLeft,
  FaClock,
  FaEye,
  FaEyeSlash,
  FaRedoAlt,
  FaUsers,
} from 'react-icons/fa';
import type { MouseEvent as ReactMouseEvent } from 'react';

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

type Phase = 'setup' | 'reveal' | 'round' | 'vote' | 'summary';
type RevealStep = 'covered' | 'shown';
type VoteResult = 'impostor-wins' | 'group-wins' | null;
type PendingCategoryChange =
  | { kind: 'clear' }
  | { kind: 'insufficient' }
  | { kind: 'switch'; nextKey: ImpostorCategoryKey };

const shuffleList = <T,>(values: readonly T[]) => {
  const order = [...values];

  for (let index = order.length - 1; index > 0; index -= 1) {
    const randomIndex = Math.floor(Math.random() * (index + 1));
    [order[index], order[randomIndex]] = [order[randomIndex], order[index]];
  }

  return order;
};

const roundDuration = 45;

function ImpostorGame({ participants, onBackToHub, onButtonPress }: ImpostorGameProps) {
  const participantSignature = participants.map((participant) => participant.id).join('|');
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<ImpostorCategoryKey | null>(null);
  const [pendingCategoryChange, setPendingCategoryChange] = useState<PendingCategoryChange | null>(
    null,
  );
  const [showHint, setShowHint] = useState(true);
  const [turnOrder, setTurnOrder] = useState<string[]>([]);
  const [currentTurnIndex, setCurrentTurnIndex] = useState(0);
  const [impostorId, setImpostorId] = useState<string | null>(null);
  const [secretItem, setSecretItem] = useState<ImpostorSecret | null>(null);
  const [revealStep, setRevealStep] = useState<RevealStep>('covered');
  const [roundIndex, setRoundIndex] = useState(1);
  const [roundSecondsLeft, setRoundSecondsLeft] = useState(roundDuration);
  const [selectedVoteId, setSelectedVoteId] = useState<string | null>(null);
  const [voteResult, setVoteResult] = useState<VoteResult>(null);
  const [votedPlayerId, setVotedPlayerId] = useState<string | null>(null);
  const resultPanelRef = useRef<HTMLDivElement | null>(null);

  const selectedCategory = selectedCategoryKey ? impostorCategoryMap[selectedCategoryKey] : null;
  const currentPlayer = participants.find((participant) => participant.id === turnOrder[currentTurnIndex]);
  const impostorPlayer = impostorId
    ? participants.find((participant) => participant.id === impostorId)
    : null;
  const votedPlayer = votedPlayerId
    ? participants.find((participant) => participant.id === votedPlayerId)
    : null;
  const isCurrentImpostor = currentPlayer?.id === impostorId;
  const activeVotePlayer = selectedVoteId
    ? participants.find((participant) => participant.id === selectedVoteId)
    : null;
  const scrollPageToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };
  const scrollResultToTop = () => {
    window.setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 50);
  };

  const resetMatchState = () => {
    setPhase('setup');
    setTurnOrder([]);
    setCurrentTurnIndex(0);
    setImpostorId(null);
    setSecretItem(null);
    setRevealStep('covered');
    setRoundIndex(1);
    setRoundSecondsLeft(roundDuration);
    setSelectedVoteId(null);
    setVoteResult(null);
    setVotedPlayerId(null);
  };

  const commitPendingCategoryChange = () => {
    if (!pendingCategoryChange) {
      return;
    }

    setPendingCategoryChange(null);

    if (pendingCategoryChange.kind === 'switch') {
      setSelectedCategoryKey(pendingCategoryChange.nextKey);
    } else {
      setSelectedCategoryKey(null);
    }

    resetMatchState();
    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (participants.length === 0) {
      resetMatchState();
      setSelectedCategoryKey(null);
      return;
    }

    if (participantSignature && phase !== 'setup') {
      resetMatchState();
    }
  }, [participantSignature]);

  useEffect(() => {
    if (phase !== 'round' || roundSecondsLeft === 0) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      setRoundSecondsLeft((seconds) => Math.max(0, seconds - 1));
    }, 1000);

    return () => window.clearTimeout(timer);
  }, [phase, roundSecondsLeft]);

  const startMatch = (categoryKey = selectedCategoryKey) => {
    const category = categoryKey ? impostorCategoryMap[categoryKey] : null;

    if (!category || participants.length < 3) {
      return;
    }

    const shuffledParticipants = shuffleList(participants.map((participant) => participant.id));
    const impostorIndex = Math.floor(Math.random() * shuffledParticipants.length);
    const pickedSecret = category.words[Math.floor(Math.random() * category.words.length)] ?? null;

    if (!pickedSecret) {
      return;
    }

    setTurnOrder(shuffledParticipants);
    setCurrentTurnIndex(0);
    setImpostorId(shuffledParticipants[impostorIndex] ?? null);
    setSecretItem(pickedSecret);
    setRevealStep('covered');
    setRoundIndex(1);
    setRoundSecondsLeft(roundDuration);
    setSelectedVoteId(null);
    setVoteResult(null);
    setVotedPlayerId(null);
    setPhase('reveal');
    scrollPageToTop();
  };

  const handleRevealAction = () => {
    if (revealStep === 'covered') {
      setRevealStep('shown');
      scrollResultToTop();
      return;
    }

    const nextIndex = currentTurnIndex + 1;

    if (nextIndex < turnOrder.length) {
      setCurrentTurnIndex(nextIndex);
      setRevealStep('covered');
      scrollResultToTop();
      return;
    }

    setPhase('round');
    setRoundSecondsLeft(roundDuration);
    setRevealStep('covered');
    scrollResultToTop();
  };

  const handleContinueRound = () => {
    setRoundIndex((value) => value + 1);
    setRoundSecondsLeft(roundDuration);
    scrollResultToTop();
  };

  const handleGoToVote = () => {
    setSelectedVoteId(null);
    setPhase('vote');
    scrollResultToTop();
  };

  const handleVoteForPlayer = (participantId: string) => {
    setSelectedVoteId(participantId);

    if (!impostorId) {
      return;
    }

    const impostorWasSelected = participantId === impostorId;
    setVoteResult(impostorWasSelected ? 'group-wins' : 'impostor-wins');
    setVotedPlayerId(participantId);
    setPhase('summary');
    scrollResultToTop();
  };

  const selectedColor = selectedCategory?.accent ?? '#38bdf8';
  const selectedPanel = selectedCategory?.panel ?? 'from-sky-500/20 via-cyan-500/14 to-indigo-500/10';
  const roundProgressWidth = `${Math.max(0, (roundSecondsLeft / roundDuration) * 100)}%`;

  if (phase === 'setup') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <LiquidButton
            className="rounded-full !px-4 !py-4"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
            aria-label="Volver"
          >
            <FaArrowLeft />
          </LiquidButton>
        </div>

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Impostor</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Elige una categoría y empieza. Sin pasos extra.
              </p>

              <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
                {impostorCategories.map((category) => (
                  <button
                    key={category.key}
                    className="group relative min-h-40 overflow-hidden rounded-[1.75rem] border border-white/10 bg-white/5 p-4 text-left shadow-[0_20px_50px_rgba(0,0,0,0.25)] transition duration-300 hover:-translate-y-1 hover:border-white/20 hover:bg-white/8"
                    onClick={(event) => {
                      onButtonPress(event);

                      if (selectedCategoryKey && selectedCategoryKey !== category.key) {
                        setPendingCategoryChange({ kind: 'switch', nextKey: category.key });
                        return;
                      }

                      if (participants.length < 3) {
                        setPendingCategoryChange({ kind: 'insufficient' });
                        return;
                      }

                      setSelectedCategoryKey(category.key);
                      startMatch(category.key);
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
                          className="flex h-14 w-14 shrink-0 items-center justify-center rounded-full border border-white/15 bg-black/20 text-2xl shadow-inner"
                          style={{
                            boxShadow: `0 0 0 1px ${category.accent}33`,
                            backgroundColor: `${category.accent}18`,
                          }}
                        >
                          {category.emoji}
                        </span>
                      </span>
                    </span>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-4 lg:grid-cols-[1.05fr_0.95fr]">
                <div
                  className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 sm:p-5"
                  style={{
                    boxShadow: selectedCategory ? `0 0 0 1px ${selectedColor}22` : undefined,
                  }}
                >
                  <p className="text-sm uppercase tracking-[0.35em] text-white/50">Categoría</p>
                  {selectedCategory ? (
                    <>
                      <div className="mt-2 flex items-center gap-3">
                        <span
                          className="flex h-12 w-12 items-center justify-center rounded-full border border-white/15 text-2xl"
                          style={{
                            backgroundColor: `${selectedColor}18`,
                          }}
                        >
                          {selectedCategory.emoji}
                        </span>
                        <p className="text-2xl font-black" style={{ color: selectedColor }}>
                          {selectedCategory.label}
                        </p>
                      </div>
                      <p className="mt-2 text-slate-200">{selectedCategory.description}</p>
                      <p className="mt-4 text-sm text-white/70">
                        {selectedCategory.words.length} palabras listas.
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

                <div className="rounded-[1.75rem] border border-white/10 bg-black/25 p-4 sm:p-5">
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
                    <p className="mt-1 text-xs text-slate-400">Necesitas al menos 3 para empezar.</p>
                  </div>

                </div>
              </div>
            </section>
          </div>
        </div>
      </div>
    );
  }

  if (phase === 'summary') {
    const resultTitle =
      voteResult === 'group-wins' ? 'Ganaron los demás' : 'Ganó el impostor';

    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <LiquidButton
            className="rounded-full !px-4 !py-4"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
            aria-label="Volver"
          >
            <FaArrowLeft />
          </LiquidButton>
        </div>

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.95fr_1.05fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Ronda terminada</h1>
              <p className="mt-3 text-slate-200">
                La categoría era <span className="font-semibold">{selectedCategory?.emoji ?? '🎭'}</span>.
              </p>

              <div
                className="mt-6 rounded-[1.75rem] border border-white/10 bg-black/25 p-5 sm:p-6"
                style={{
                  boxShadow: `0 0 0 1px ${selectedColor}22`,
                }}
              >
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">Resultado</p>
                <p className="mt-3 text-3xl font-black" style={{ color: selectedColor }}>
                  {resultTitle}
                </p>
                <p className="mt-3 text-slate-200">
                  {voteResult === 'group-wins'
                    ? 'El voto dio con el impostor. Ganaron todos los demás.'
                    : 'El voto fallo. El impostor se queda con la ronda.'}
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">Impostor</p>
                <p className="mt-2 text-2xl font-black" style={{ color: '#fb7185' }}>
                  {impostorPlayer?.name ?? 'Desconocido'}
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="text-sm uppercase tracking-[0.35em] text-white/50">Voto final</p>
                <p className="mt-2 text-2xl font-black" style={{ color: '#38bdf8' }}>
                  {votedPlayer?.name ?? 'Sin voto'}
                </p>
              </div>

              <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                <LiquidButton
                  className="w-full"
                  onClick={(event) => {
                    onButtonPress(event);
                    startMatch();
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
                    setPendingCategoryChange({ kind: 'clear' });
                  }}
                  size="xxl"
                  variant="cool"
                  type="button"
                >
                  Elegir categoría
                </LiquidButton>
              </div>
            </section>

            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">Resumen</p>
              <div className="mt-5 grid gap-4 sm:grid-cols-2">
                {participants.slice(0, 6).map((participant) => {
                  const isImpostor = participant.id === impostorId;
                  const isVoted = participant.id === votedPlayerId;

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
                      {isVoted && (
                        <p className="mt-2 text-sm font-semibold text-sky-200">Votado por el grupo</p>
                      )}
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

        {pendingCategoryChange &&
          createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
                <h2 className="mt-3 text-2xl font-black">Cambiar categoría</h2>
                  <p className="mt-3 text-slate-200">
                    {pendingCategoryChange.kind === 'insufficient'
                      ? 'Necesitas al menos 3 participantes para jugar Impostor.'
                      : 'Si cambias la categoría, se reiniciará la partida actual.'}
                  </p>
                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setPendingCategoryChange(null)}
                    type="button"
                  >
                    Seguir jugando
                  </button>
                  <button
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                    onClick={commitPendingCategoryChange}
                    type="button"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
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

  if (phase === 'reveal') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <LiquidButton
            className="rounded-full !px-4 !py-4"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
            aria-label="Volver"
          >
            <FaArrowLeft />
          </LiquidButton>
        </div>

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Impostor</h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <LiquidButton
                  className="rounded-full !px-4 !py-2 text-sm"
                  onClick={(event) => {
                    onButtonPress(event);
                    setPendingCategoryChange({ kind: 'clear' });
                  }}
                  size="lg"
                  variant="cool"
                  type="button"
                >
                  Cambiar categoría
                </LiquidButton>
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/80"
                  style={{
                    borderColor: `${selectedColor}55`,
                    backgroundColor: `${selectedColor}12`,
                  }}
                >
                  <span>{selectedCategory?.emoji ?? '🎭'}</span>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
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
                      Mira tu papel y pulsa siguiente para pasar al siguiente jugador.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                <p className="mt-2 text-sm text-slate-200">
                  {currentTurnIndex + 1} de {turnOrder.length}
                </p>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-4 sm:p-5">
                <p className="mt-2 text-lg text-slate-200">
                  {currentTurnIndex + 1 < turnOrder.length ? 'Pasa el teléfono.' : 'Listo para empezar.'}
                </p>
              </div>
            </section>

            <section
              ref={resultPanelRef}
              className="rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/25 sm:p-6"
            >
              <div
                className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-6"
                style={{
                  boxShadow: `0 0 0 1px ${selectedColor}18`,
                }}
              >
                <div className="relative mx-auto flex min-h-[22rem] max-w-xl flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 sm:min-h-[32rem] sm:p-5">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedPanel}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_38%)]" />

                  {revealStep === 'covered' ? (
                    <div className="relative z-10 mt-4 flex w-full flex-col items-center">
                      <div className="rounded-[2rem] border border-white/10 bg-black/25 px-6 py-8 text-center">
                        <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                          {selectedCategory?.emoji ?? '🎭'}
                        </p>
                        <p className="mt-5 text-3xl font-black" style={{ color: selectedColor }}>
                          {currentPlayer.name}
                        </p>
                        <p className="mt-4 text-slate-200">Solo esta persona lo ve.</p>
                      </div>

                      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                        <LiquidButton
                          className="!h-24 !w-full !rounded-full !px-10 !text-xl sm:!h-20 sm:!px-12 sm:!text-lg"
                          onClick={() => handleRevealAction()}
                          size="xxl"
                          variant="cool"
                          type="button"
                        >
                          <span className="flex items-center gap-2">
                            <FaUsers />
                            Revelar
                          </span>
                        </LiquidButton>
                      </div>
                    </div>
                  ) : (
                    <div className="relative z-10 mt-4 flex w-full flex-col items-center">
                      <div className="rounded-[2rem] border border-white/10 bg-black/25 px-6 py-8 text-center">
                        <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                          {selectedCategory?.emoji ?? '🎭'}
                        </p>
                        <p
                          className="mt-5 text-3xl font-black"
                          style={{ color: isCurrentImpostor ? '#ef4444' : selectedColor }}
                        >
                          {isCurrentImpostor ? 'Eres el impostor' : secretItem.answer}
                        </p>
                        <p className="mt-4 text-slate-200">
                          {isCurrentImpostor
                            ? 'Escucha y no te delates.'
                            : 'No digas la palabra en voz alta.'}
                        </p>
                        {isCurrentImpostor && showHint && (
                          <div className="mt-6 rounded-3xl border border-white/10 bg-white/5 p-4">
                            <p className="text-sm uppercase tracking-[0.35em] text-white/50">
                              Pista secreta
                            </p>
                            <p className="mt-2 text-lg font-semibold text-white">{secretItem.clue}</p>
                          </div>
                        )}
                        {isCurrentImpostor && !showHint && (
                          <div className="mt-6 rounded-3xl border border-amber-400/30 bg-amber-500/10 p-4 text-amber-100">
                            Pista apagada.
                          </div>
                        )}
                        {!isCurrentImpostor && (
                          <div className="mt-6 rounded-3xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-emerald-100">
                            Palabra del grupo.
                          </div>
                        )}
                      </div>

                      <div className="mt-6 flex w-full flex-col gap-3 sm:flex-row">
                        <LiquidButton
                          className="!h-24 !w-full !rounded-full !px-10 !text-xl sm:!h-20 sm:!px-12 sm:!text-lg"
                          onClick={() => handleRevealAction()}
                          size="xxl"
                          variant="cool"
                          type="button"
                        >
                          <span className="flex items-center gap-2">
                            <FaUsers />
                            Siguiente
                          </span>
                        </LiquidButton>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            </section>
          </div>
        </div>

        {pendingCategoryChange &&
          createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
                <h2 className="mt-3 text-2xl font-black">Cambiar categoría</h2>
                <p className="mt-3 text-slate-200">
                  Si cambias la categoría, se reiniciará la partida actual.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setPendingCategoryChange(null)}
                    type="button"
                  >
                    Seguir jugando
                  </button>
                  <button
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                    onClick={commitPendingCategoryChange}
                    type="button"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  if (phase === 'round') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <LiquidButton
            className="rounded-full !px-4 !py-4"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
            aria-label="Volver"
          >
            <FaArrowLeft />
          </LiquidButton>
        </div>

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Impostor</h1>

              <div className="mt-4 flex flex-wrap gap-2">
                <LiquidButton
                  className="rounded-full !px-4 !py-2 text-sm"
                  onClick={(event) => {
                    onButtonPress(event);
                    setPendingCategoryChange({ kind: 'clear' });
                  }}
                  size="lg"
                  variant="cool"
                  type="button"
                >
                  Cambiar categoría
                </LiquidButton>
                <div
                  className="inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm text-white/80"
                  style={{
                    borderColor: `${selectedColor}55`,
                    backgroundColor: `${selectedColor}12`,
                  }}
                >
                  <span>{selectedCategory?.emoji ?? '🎭'}</span>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-5">
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
                      La discusión está en marcha. No hace falta esperar a que termine el tiempo
                      para votar o seguir con otra ronda.
                    </p>
                  </div>
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Ronda</p>
                  <p className="mt-2 text-sm text-slate-200">#{roundIndex}</p>
                </div>

                <div className="rounded-[1.5rem] border border-white/10 bg-white/5 px-4 py-4">
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">Tiempo</p>
                  <p className="mt-2 text-sm text-slate-200">
                    {roundSecondsLeft > 0 ? `${roundSecondsLeft} segundos` : 'Tiempo terminado'}
                  </p>
                </div>
              </div>

              <div className="mt-6 rounded-3xl border border-white/10 bg-slate-950/60 p-5">
                <p className="mt-2 text-lg text-slate-200">
                  {roundSecondsLeft > 0 ? 'Debatan y observen.' : 'Pueden votar o seguir.'}
                </p>
              </div>
            </section>

            <section
              ref={resultPanelRef}
              className="rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/25 sm:p-6"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-4 sm:p-6">
                <div className="relative mx-auto flex min-h-[22rem] max-w-xl flex-col items-center justify-center overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/70 p-4 sm:min-h-[32rem] sm:p-5">
                  <div
                    className={`absolute inset-0 bg-gradient-to-br ${selectedPanel}`}
                    aria-hidden="true"
                  />
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),transparent_38%)]" />

                  <div className="relative z-10 w-full text-center">
                    <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                      <span className="inline-flex items-center gap-2">
                        <FaClock />
                        Ronda en curso
                      </span>
                    </p>
                    <p className="mt-5 text-5xl font-black text-white sm:text-6xl">{roundSecondsLeft}</p>
                    <p className="mt-3 text-slate-200">Cuando quieras, sigue o vota.</p>

                    <div className="mt-6 overflow-hidden rounded-full border border-white/10 bg-black/40">
                      <div
                        className="h-3 rounded-full bg-gradient-to-r from-rose-500 via-fuchsia-500 to-amber-400 transition-[width] duration-1000 ease-linear"
                        style={{ width: roundProgressWidth }}
                      />
                    </div>

                    <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                      <LiquidButton
                        className="w-full"
                        onClick={(event) => {
                          onButtonPress(event);
                          handleContinueRound();
                        }}
                        size="xxl"
                        variant="cool"
                        type="button"
                      >
                        Seguir con otra ronda
                      </LiquidButton>
                      <LiquidButton
                        className="w-full"
                        onClick={(event) => {
                          onButtonPress(event);
                          handleGoToVote();
                        }}
                        size="xxl"
                        variant="cool"
                        type="button"
                      >
                        <span className="flex items-center gap-2">
                          <FaUsers />
                          Votar
                        </span>
                      </LiquidButton>
                    </div>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>

        {pendingCategoryChange &&
          createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
                <h2 className="mt-3 text-2xl font-black">Cambiar categoría</h2>
                <p className="mt-3 text-slate-200">
                  Si cambias la categoría, se reiniciará la partida actual.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setPendingCategoryChange(null)}
                    type="button"
                  >
                    Seguir jugando
                  </button>
                  <button
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                    onClick={commitPendingCategoryChange}
                    type="button"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

  if (phase === 'vote') {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
        <div className="fixed left-3 top-3 z-50 sm:left-4 sm:top-4">
          <LiquidButton
            className="rounded-full !px-4 !py-4"
            onClick={(event) => {
              onButtonPress(event);
              onBackToHub();
            }}
            size="lg"
            variant="cool"
            type="button"
            aria-label="Volver"
          >
            <FaArrowLeft />
          </LiquidButton>
        </div>

        <div className="w-full max-w-6xl overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/80 p-4 shadow-2xl backdrop-blur-2xl sm:p-8">
          <div className="absolute inset-0 bg-gradient-to-b from-black/35 via-black/10 to-black/80" />
          <div className="relative z-10 grid gap-8 lg:grid-cols-[0.92fr_1.08fr] lg:items-start">
            <section className="rounded-[2rem] border border-white/10 bg-white/5 p-5 shadow-inner shadow-black/25 sm:p-6">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">MondeFan</p>
              <h1 className="mt-2 text-3xl font-black sm:text-5xl">Votación</h1>
              <p className="mt-3 max-w-2xl text-slate-200">
                Selecciona a la persona que crees que es el impostor.
              </p>

              <div className="mt-6 rounded-3xl border border-white/10 bg-black/25 p-4 sm:p-5">
                <p className="mt-2 text-3xl font-black" style={{ color: selectedColor }}>
                  #{roundIndex}
                </p>
                <p className="mt-2 text-slate-200">Si votan al impostor, ganan los demás.</p>
              </div>
            </section>

            <section
              ref={resultPanelRef}
              className="rounded-[2rem] border border-white/10 bg-black/30 p-4 shadow-inner shadow-black/25 sm:p-6"
            >
              <div className="rounded-[2rem] border border-white/10 bg-white/5 p-5 sm:p-6">
                <p className="text-sm uppercase tracking-[0.45em] text-white/55">Elige un jugador</p>
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {participants.map((participant) => {
                    const isSelected = participant.id === selectedVoteId;

                    return (
                      <button
                        key={participant.id}
                        className="rounded-3xl border border-white/10 bg-black/25 p-4 text-left transition hover:-translate-y-0.5 hover:bg-white/8"
                        onClick={(event) => {
                          onButtonPress(event);
                          handleVoteForPlayer(participant.id);
                        }}
                        type="button"
                        style={{
                          boxShadow: isSelected ? `0 0 0 1px ${selectedColor}66` : undefined,
                          borderColor: isSelected ? `${selectedColor}66` : undefined,
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
                          {isSelected ? 'Seleccionado para votar' : 'Toca para elegir'}
                        </p>
                      </button>
                    );
                  })}
                </div>

                <div className="mt-6 flex flex-col gap-3 sm:flex-row">
                  <LiquidButton
                    className="w-full"
                    onClick={(event) => {
                      onButtonPress(event);
                      setPhase('round');
                      setSelectedVoteId(null);
                    }}
                    size="xxl"
                    variant="cool"
                    type="button"
                  >
                    Volver a la ronda
                  </LiquidButton>
                </div>

                {activeVotePlayer && (
                  <p className="mt-4 text-sm text-slate-300">
                    Votarás por <span className="font-semibold">{activeVotePlayer.name}</span>.
                  </p>
                )}
              </div>
            </section>
          </div>
        </div>

        {pendingCategoryChange &&
          createPortal(
            <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/75 px-4 backdrop-blur-md">
              <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
                <h2 className="mt-3 text-2xl font-black">Cambiar categoría</h2>
                <p className="mt-3 text-slate-200">
                  Si cambias la categoría, se reiniciará la partida actual.
                </p>
                <div className="mt-6 flex gap-3">
                  <button
                    className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                    onClick={() => setPendingCategoryChange(null)}
                    type="button"
                  >
                    Seguir jugando
                  </button>
                  <button
                    className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                    onClick={commitPendingCategoryChange}
                    type="button"
                  >
                    Cambiar
                  </button>
                </div>
              </div>
            </div>,
            document.body,
          )}
      </div>
    );
  }

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

export default ImpostorGame;






