import { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { FaEye, FaEyeSlash, FaRedoAlt, FaSkull, FaQuestionCircle, FaVoteYea, FaRegLightbulb, FaMagic } from 'react-icons/fa';
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

// Fondo animado con partículas (efecto de "polvo mágico")
const particleBackgroundStyle = {
  background: `
    radial-gradient(circle at 20% 30%, rgba(0,0,0,0.9), transparent 70%),
    repeating-linear-gradient(45deg, rgba(255,255,255,0.02) 0px, rgba(255,255,255,0.02) 2px, transparent 2px, transparent 12px)
  `,
};

function ImpostorGame({ participants, onBackToHub, onButtonPress }: ImpostorGameProps) {
  void onBackToHub;

  const participantSignature = participants.map((p) => p.id).join('|');
  const [phase, setPhase] = useState<Phase>('setup');
  const [selectedCategoryKey, setSelectedCategoryKey] = useState<ImpostorCategoryKey | null>(null);
  const [pendingCategoryChange, setPendingCategoryChange] = useState<PendingCategoryChange | null>(null);
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
  const currentPlayer = participants.find((p) => p.id === turnOrder[currentTurnIndex]);
  const impostorPlayer = impostorId ? participants.find((p) => p.id === impostorId) : null;
  const votedPlayer = votedPlayerId ? participants.find((p) => p.id === votedPlayerId) : null;
  const isCurrentImpostor = currentPlayer?.id === impostorId;
  const scrollPageToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });
  const scrollResultToTop = () => window.setTimeout(() => resultPanelRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 50);

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
    if (!pendingCategoryChange) return;
    setPendingCategoryChange(null);
    if (pendingCategoryChange.kind === 'switch') setSelectedCategoryKey(pendingCategoryChange.nextKey);
    else setSelectedCategoryKey(null);
    resetMatchState();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  useEffect(() => {
    if (participants.length === 0) {
      resetMatchState();
      setSelectedCategoryKey(null);
      return;
    }
    if (participantSignature && phase !== 'setup') resetMatchState();
  }, [participantSignature]);

  useEffect(() => {
    if (phase !== 'round' || roundSecondsLeft === 0) return undefined;
    const timer = window.setTimeout(() => setRoundSecondsLeft((s) => Math.max(0, s - 1)), 1000);
    return () => window.clearTimeout(timer);
  }, [phase, roundSecondsLeft]);

  const startMatch = (categoryKey = selectedCategoryKey) => {
    const category = categoryKey ? impostorCategoryMap[categoryKey] : null;
    if (!category || participants.length < 3) return;
    const shuffled = shuffleList(participants.map((p) => p.id));
    const impostorIdx = Math.floor(Math.random() * shuffled.length);
    const pickedSecret = category.words[Math.floor(Math.random() * category.words.length)];
    if (!pickedSecret) return;
    setTurnOrder(shuffled);
    setCurrentTurnIndex(0);
    setImpostorId(shuffled[impostorIdx]);
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
    setRoundIndex((v) => v + 1);
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
    if (!impostorId) return;
    const impostorSelected = participantId === impostorId;
    setVoteResult(impostorSelected ? 'group-wins' : 'impostor-wins');
    setVotedPlayerId(participantId);
    setPhase('summary');
    scrollResultToTop();
  };

  const selectedColor = selectedCategory?.accent ?? '#b91c1c';
  const roundProgressWidth = `${Math.max(0, (roundSecondsLeft / roundDuration) * 100)}%`;
  const isLowTime = roundSecondsLeft <= 10 && phase === 'round';

  // Animaciones globales avanzadas
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes floatParticle {
        0% { transform: translateY(0px) translateX(0px); opacity: 0; }
        50% { opacity: 0.8; }
        100% { transform: translateY(-40vh) translateX(20px); opacity: 0; }
      }
      @keyframes glitch {
        0% { text-shadow: -2px 0 red, 2px 0 blue; transform: skew(0deg); }
        20% { text-shadow: 2px 0 red, -2px 0 blue; transform: skew(2deg); }
        40% { text-shadow: -2px 0 blue, 2px 0 red; transform: skew(-2deg); }
        60% { text-shadow: 2px 0 blue, -2px 0 red; transform: skew(1deg); }
        80% { text-shadow: -2px 0 red, 2px 0 blue; transform: skew(-1deg); }
        100% { text-shadow: none; transform: skew(0deg); }
      }
      @keyframes pulseRing {
        0% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 0,0,0), 0.4); }
        70% { box-shadow: 0 0 0 12px rgba(var(--accent-rgb, 0,0,0), 0); }
        100% { box-shadow: 0 0 0 0 rgba(var(--accent-rgb, 0,0,0), 0); }
      }
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
      @keyframes stamp {
        0% { transform: scale(0) rotate(-15deg); opacity: 0; }
        60% { transform: scale(1.2) rotate(2deg); }
        100% { transform: scale(1) rotate(0deg); opacity: 1; }
      }
      @keyframes burn {
        0% { border-color: rgba(255, 80, 40, 0.3); box-shadow: 0 0 0px rgba(255,80,40,0); }
        100% { border-color: rgba(255, 80, 40, 0.8); box-shadow: 0 0 15px rgba(255,80,40,0.5); }
      }
      @keyframes spin-slow {
        from { transform: rotate(0deg); }
        to { transform: rotate(360deg); }
      }
      .animate-float-particle {
        animation: floatParticle 6s infinite ease-in-out;
      }
      .animate-glitch {
        animation: glitch 0.3s infinite;
      }
      .animate-pulse-ring {
        animation: pulseRing 1.5s infinite;
      }
      .animate-shimmer {
        background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
        background-size: 200% 100%;
        animation: shimmer 2s infinite;
      }
      .animate-stamp {
        animation: stamp 0.4s cubic-bezier(0.34, 1.2, 0.64, 1) forwards;
      }
      .animate-burn {
        animation: burn 0.8s ease-in-out infinite alternate;
      }
      .animate-spin-slow {
        animation: spin-slow 4s linear infinite;
      }
      .particle {
        position: absolute;
        width: 4px;
        height: 4px;
        background: rgba(255, 200, 100, 0.6);
        border-radius: 50%;
        pointer-events: none;
        z-index: 0;
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  // Generar partículas flotantes
  const [particles] = useState(() => Array.from({ length: 24 }, (_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    animationDelay: `${Math.random() * 5}s`,
    duration: `${4 + Math.random() * 5}s`,
    size: `${2 + Math.random() * 5}px`,
    color: `rgba(${Math.floor(150 + Math.random() * 105)}, ${Math.floor(100 + Math.random() * 100)}, 50, ${0.2 + Math.random() * 0.6})`
  })));

  // Modal de confirmación (reutilizable)
  const renderPendingModal = () => {
    if (!pendingCategoryChange) return null;
    return createPortal(
      <div className="fixed inset-0 z-[70] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-sm rounded-2xl border border-red-800/60 bg-black/95 p-5 text-center shadow-2xl animate-stamp">
          <FaQuestionCircle className="mx-auto text-4xl text-red-500 mb-2" />
          <h2 className="text-xl font-black">Interrupción</h2>
          <p className="mt-2 text-sm text-stone-300">
            {pendingCategoryChange.kind === 'insufficient'
              ? 'Necesitas al menos 3 participantes para jugar.'
              : 'Cambiar de expediente reiniciará el juicio actual.'}
          </p>
          <div className="mt-5 flex gap-2">
            <button
              className="flex-1 rounded-xl border border-stone-600 bg-black/60 py-2 text-sm font-medium hover:bg-stone-800 transition"
              onClick={() => setPendingCategoryChange(null)}
            >
              Seguir
            </button>
            <button
              className="flex-1 rounded-xl bg-red-700 py-2 text-sm font-bold hover:bg-red-600 transition"
              onClick={commitPendingCategoryChange}
            >
              Reiniciar
            </button>
          </div>
        </div>
      </div>,
      document.body
    );
  };

  // ---------- SETUP (selección de categoría) ----------
  if (phase === 'setup') {
    return (
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-y-auto bg-transparent px-3 py-4 font-fiesta text-white"
        style={particleBackgroundStyle}>
        {particles.map(p => (
          <div
            key={p.id}
            className="particle"
            style={{
              left: p.left,
              width: p.size,
              height: p.size,
              background: p.color,
              animation: `floatParticle ${p.duration} infinite`,
              animationDelay: p.animationDelay
            }}
          />
        ))}
        <div className="w-full max-w-6xl overflow-y-auto rounded-[2.5rem] border border-white/10 bg-black/60 p-4 shadow-2xl backdrop-blur-2xl max-h-[95vh] sm:p-6">
          <div className="relative z-10">
            <section className="rounded-[2rem] border border-white/10 bg-black/40 p-4 shadow-inner sm:p-6">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[0.7rem] uppercase tracking-[0.45em] text-white/55">
                    MondeFan · Juego de máscaras
                  </p>
                  <h1 className="mt-2 text-6xl font-black tracking-[-0.08em] text-white sm:text-8xl">
                    IMPOSTOR
                  </h1>
                </div>
                <FaMagic className="text-4xl text-white/45 animate-spin-slow sm:text-6xl" />
              </div>

              <div className="mt-6 grid gap-3 grid-cols-2 sm:grid-cols-3 lg:grid-cols-4">
                {impostorCategories.map((category) => (
                  <button
                    key={category.key}
                    className="group relative overflow-hidden rounded-[1.4rem] border border-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_0_24px_currentColor]"
                    style={{ borderColor: `${category.accent}66`, backgroundColor: `${category.accent}0d` }}
                    onClick={(event) => {
                      onButtonPress(event);
                      if (selectedCategoryKey && selectedCategoryKey !== category.key) setPendingCategoryChange({ kind: 'switch', nextKey: category.key });
                      else if (participants.length < 3) setPendingCategoryChange({ kind: 'insufficient' });
                      else { setSelectedCategoryKey(category.key); startMatch(category.key); }
                    }}
                    type="button"
                  >
                    <span className={`absolute inset-0 bg-gradient-to-br ${category.panel} opacity-25 transition group-hover:opacity-50`} />
                    <div className="relative z-10 p-3 text-center sm:p-4">
                      <div className="text-4xl transition-transform duration-300 group-hover:scale-110">{category.emoji}</div>
                      <p className="mt-2 text-sm font-semibold leading-tight text-white sm:text-base">{category.label}</p>
                      <p className="mt-1 text-[10px] leading-snug text-white/55 sm:text-[11px]">{category.description}</p>
                    </div>
                  </button>
                ))}
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                <div className="rounded-[1.4rem] border border-white/10 bg-black/45 p-3 sm:p-5" style={selectedCategory ? { borderColor: selectedColor } : {}}>
                  <p className="text-[0.68rem] uppercase tracking-[0.35em] text-white/45">Expediente activo</p>
                  {selectedCategory ? (
                    <div className="mt-3 flex items-center gap-3">
                      <span className="text-4xl">{selectedCategory.emoji}</span>
                      <div>
                        <p className="text-2xl font-semibold text-white sm:text-3xl">{selectedCategory.label}</p>
                        <p className="text-sm text-white/55">{selectedCategory.words.length} palabras</p>
                      </div>
                    </div>
                  ) : <p className="mt-3 text-sm text-white/50">Elige una categoría</p>}
                </div>

                <div className="rounded-[1.4rem] border border-white/10 bg-black/45 p-3 sm:p-5">
                  <p className="text-[0.68rem] uppercase tracking-[0.35em] text-white/45">Ajustes</p>
                  <button
                    className={`mt-3 w-full rounded-2xl border px-4 py-5 text-left transition-colors ${showHint ? 'border-white/20 bg-white/8' : 'border-white/10 bg-black/30'}`}
                    onClick={(e) => { onButtonPress(e); setShowHint(!showHint); }}
                  >
                    <div className="flex items-center gap-2 text-base font-medium text-white">
                      {showHint ? <FaEye className="text-white/80" /> : <FaEyeSlash />}
                      {showHint ? 'Pista activa' : 'Modo sombra'}
                    </div>
                  </button>
                  <div className="mt-3 flex justify-between text-xs text-white/45">
                    <span>👥 {participants.length}</span>
                    <span>🔪 mínimo 3</span>
                  </div>
                </div>
              </div>
            </section>
          </div>
        </div>
        {renderPendingModal()}
      </div>
    );
  }

  // ---------- SUMMARY (resultado final) ----------
  if (phase === 'summary') {
    const resultTitle = voteResult === 'group-wins' ? '✨ INOCENTES GANAN ✨' : '💀 IMPOSTOR VENCE 💀';
    return (
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-y-auto bg-transparent px-3 py-4 font-fiesta text-white"
        style={particleBackgroundStyle}>
        {particles.map(p => <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, background: p.color, animation: `floatParticle ${p.duration} infinite`, animationDelay: p.animationDelay }} />)}
        <div className="w-full max-w-5xl overflow-y-auto rounded-[2.5rem] border border-white/10 bg-black/60 p-4 backdrop-blur-2xl max-h-[95vh] sm:p-6">
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-4 animate-stamp sm:p-5">
              <h1 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">SENTENCIA</h1>
              <div className="mt-4 rounded-2xl border-l-8 p-4" style={{ borderLeftColor: selectedColor, background: `${selectedColor}10` }}>
                <p className="text-2xl font-black sm:text-3xl" style={{ color: selectedColor }}>{resultTitle}</p>
                <p className="mt-2 text-sm text-white/55">{voteResult === 'group-wins' ? 'El voto colectivo atrapó al impostor' : 'El engaño triunfó'}</p>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-3">
                <div className="rounded-2xl bg-black/60 p-3 text-center animate-burn">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/45">Impostor</p>
                  <p className="mt-2 block max-w-[9rem] truncate text-base font-black sm:max-w-[11rem] sm:text-lg" title={impostorPlayer?.name ?? '??'} style={{ color: impostorPlayer?.color }}>{impostorPlayer?.name ?? '??'}</p>
                </div>
                <div className="rounded-2xl bg-black/60 p-3 text-center">
                  <p className="text-[0.65rem] uppercase tracking-[0.3em] text-white/45">Votado</p>
                  <p className="mt-2 block max-w-[9rem] truncate text-base font-black sm:max-w-[11rem] sm:text-lg" title={votedPlayer?.name ?? 'nadie'} style={{ color: votedPlayer?.color }}>{votedPlayer?.name ?? 'nadie'}</p>
                </div>
              </div>
              <div className="mt-5 flex gap-3">
                <LiquidButton className="flex-1 py-3 text-base sm:py-4 sm:text-lg" onClick={(e) => { onButtonPress(e); startMatch(); }} size="xxl" variant="cool"><FaRedoAlt className="mr-1" /> Otra ronda</LiquidButton>
                <LiquidButton className="flex-1 py-3 text-base sm:py-4 sm:text-lg" onClick={(e) => { onButtonPress(e); setPendingCategoryChange({ kind: 'clear' }); }} size="xxl" variant="cool">Cambiar caso</LiquidButton>
              </div>
            </div>

            <div className="rounded-[2rem] border border-white/10 bg-black/40 p-4 sm:p-5">
              <p className="text-[0.68rem] uppercase tracking-[0.35em] text-white/45">Hall de sospechosos</p>
              <div className="mt-3 grid gap-3 grid-cols-2 max-h-60 overflow-y-auto">
                {participants.map(p => {
                  const isImpostor = p.id === impostorId;
                  const isVoted = p.id === votedPlayerId;
                  return (
                    <div key={p.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${isImpostor ? 'border-white/25 bg-white/8' : 'border-white/10 bg-black/40'}`}>
                      <ParticipantAvatarBadge avatar={p.avatar} backgroundColor={p.color} seed={p.avatarSeed} alt={p.name} sizeClassName="h-10 w-10" />
                      <div className="flex-1 min-w-0">
                        <p className="block max-w-[8.5rem] truncate text-sm font-semibold text-white" title={p.name}>{p.name}</p>
                        <p className="text-[0.65rem] uppercase tracking-[0.25em] text-white/45">{isImpostor ? 'Impostor' : isVoted ? 'Votado' : 'Ciudadano'}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
        {renderPendingModal()}
      </div>
    );
  }

  // ---------- REVEAL (con glitch y efecto brillo) ----------
  if (phase === 'reveal' && currentPlayer && secretItem) {
    return (
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-y-auto bg-transparent px-3 py-4 font-fiesta text-white"
        style={particleBackgroundStyle}>
        {particles.map(p => <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, background: p.color, animation: `floatParticle ${p.duration} infinite`, animationDelay: p.animationDelay }} />)}
        <div className="w-full max-w-5xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-black/60 p-4 backdrop-blur-2xl sm:p-6">
            <div className="grid gap-3 md:grid-cols-2 md:items-stretch">
              <div className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/40 p-4 sm:p-5">
                <div className="flex flex-wrap gap-1">
                  <LiquidButton className="rounded-full !px-4 !py-2 text-sm" onClick={(e) => { onButtonPress(e); setPendingCategoryChange({ kind: 'clear' }); }} size="lg" variant="cool">Caso</LiquidButton>
                  <div className="rounded-full border px-4 py-2 text-sm" style={{ backgroundColor: `${selectedColor}18`, borderColor: selectedColor }}>{selectedCategory?.emoji} {selectedCategory?.label}</div>
                </div>
                <div className="mt-4 overflow-hidden rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <ParticipantAvatarBadge avatar={currentPlayer.avatar} backgroundColor={currentPlayer.color} seed={currentPlayer.avatarSeed} alt={currentPlayer.name} sizeClassName="h-12 w-12" />
                    <p className="block max-w-[12rem] truncate text-2xl font-semibold text-white sm:max-w-[16rem] sm:text-3xl" title={currentPlayer.name} style={{ color: currentPlayer.color }}>{currentPlayer.name}</p>
                  </div>
                  <p className="mt-2 text-sm text-white/45">toca revelar</p>
                </div>
              </div>

              <div ref={resultPanelRef} className="rounded-[2rem] border border-white/10 bg-black/30 p-4 sm:p-5">
                <div className="rounded-2xl border p-5 text-center relative overflow-hidden" style={{ borderColor: selectedColor, background: `${selectedColor}10` }}>
                  {revealStep === 'covered' ? (
                    <div>
                      <FaRegLightbulb className="mx-auto text-5xl text-amber-400 animate-pulse" />
                      <p className="mt-3 text-2xl font-black tracking-[-0.04em] text-white sm:text-3xl">EXPEDIENTE OCULTO</p>
                      <LiquidButton className="mt-4 !px-6 !py-2 text-base rounded-full" onClick={handleRevealAction} size="lg" variant="cool">ABRIR</LiquidButton>
                    </div>
                  ) : (
                    <div className="transition-all duration-500 transform scale-100">
                      <p className={`text-4xl font-black tracking-[-0.05em] sm:text-5xl ${isCurrentImpostor ? 'animate-glitch' : 'animate-pulse'}`} style={{ color: isCurrentImpostor ? '#ff4444' : selectedColor }}>
                        {isCurrentImpostor ? '¡ERES EL IMPOSTOR!' : secretItem.answer}
                      </p>
                      <p className="mt-2 text-sm text-white/55">{isCurrentImpostor ? 'siembra la discordia' : 'palabra prohibida'}</p>
                      {isCurrentImpostor && showHint && (
                        <div className="mt-4 inline-block rounded-2xl border border-amber-500/40 bg-black/70 p-3 animate-shimmer">
                          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-amber-200/70">Pista</p>
                          <p className="mt-1 text-lg font-medium">{secretItem.clue}</p>
                        </div>
                      )}
                      <LiquidButton className="mt-5 !px-6 !py-2 text-base rounded-full" onClick={handleRevealAction} size="lg" variant="cool">
                        {currentTurnIndex + 1 < turnOrder.length ? '⏩ Siguiente' : '🎲 Iniciar ronda'}
                      </LiquidButton>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPendingModal()}
      </div>
    );
  }

  // ---------- ROUND (timer circular con degradado) ----------
  if (phase === 'round' && currentPlayer && secretItem) {
    const radius = 45;
    const circumference = 2 * Math.PI * radius;
    const dashOffset = circumference * (1 - (roundSecondsLeft / roundDuration));
    const gradientId = `gradient-${roundIndex}`;

    return (
      <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-y-auto bg-transparent px-3 py-4 font-fiesta text-white"
        style={particleBackgroundStyle}>
        {particles.map(p => <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, background: p.color, animation: `floatParticle ${p.duration} infinite`, animationDelay: p.animationDelay }} />)}
        <div className="w-full max-w-5xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-black/60 p-4 backdrop-blur-2xl sm:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-black/40 p-4 sm:p-5">
                <div className="flex items-center justify-between gap-3">
                  <LiquidButton className="rounded-full !px-4 !py-2 text-sm" onClick={(e) => { onButtonPress(e); setPendingCategoryChange({ kind: 'clear' }); }} size="lg" variant="cool">Caso</LiquidButton>
                  <span className="rounded-full border px-4 py-2 text-sm" style={{ backgroundColor: `${selectedColor}18`, borderColor: selectedColor }}>Ronda #{roundIndex}</span>
                </div>
                <div className="mt-4 rounded-2xl border border-white/10 bg-black/40 p-4">
                  <div className="flex items-center gap-3">
                    <ParticipantAvatarBadge avatar={currentPlayer.avatar} backgroundColor={currentPlayer.color} seed={currentPlayer.avatarSeed} alt={currentPlayer.name} sizeClassName="h-12 w-12" />
                    <p className="block max-w-[12rem] truncate text-2xl font-semibold text-white sm:max-w-[16rem] sm:text-3xl" title={currentPlayer.name} style={{ color: currentPlayer.color }}>{currentPlayer.name}</p>
                  </div>
                  <div className="mt-4 grid grid-cols-2 gap-2 text-center">
                    <div className="flex min-h-[6.5rem] flex-col justify-center rounded-2xl bg-black/40 p-3">
                      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-white/45">Ronda</span>
                      <p className="mt-1 text-2xl font-black text-white tabular-nums">#{roundIndex}</p>
                    </div>
                    <div className="flex min-h-[6.5rem] flex-col justify-center rounded-2xl bg-black/40 p-3">
                      <span className="text-[0.65rem] uppercase tracking-[0.25em] text-white/45">Tiempo</span>
                      <p className={`mt-1 text-2xl font-black tabular-nums ${isLowTime ? 'text-red-400' : 'text-white'}`}>{roundSecondsLeft}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div ref={resultPanelRef} className="overflow-hidden rounded-[2rem] border border-white/10 bg-black/30 p-4 sm:p-5">
                <div className="flex h-full flex-col rounded-2xl border p-5 text-center" style={{ borderColor: selectedColor }}>
                  <div className="mx-auto flex h-[9.5rem] w-[9.5rem] flex-shrink-0 items-center justify-center sm:h-[11.5rem] sm:w-[11.5rem]">
                  <svg width="140" height="140" viewBox="0 0 110 110" className="block">
                    <defs>
                      <linearGradient id={gradientId} x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stopColor={selectedColor} />
                        <stop offset="100%" stopColor="#ffaa44" />
                      </linearGradient>
                    </defs>
                    <circle cx="55" cy="55" r={radius} fill="none" stroke="#2d1a1a" strokeWidth="6" />
                    <circle cx="55" cy="55" r={radius} fill="none" stroke={`url(#${gradientId})`} strokeWidth="6"
                      strokeDasharray={circumference} strokeDashoffset={dashOffset} strokeLinecap="round"
                      transform="rotate(-90 55 55)" style={{ transition: 'stroke-dashoffset 1s linear' }} />
                    <text x="55" y="62" textAnchor="middle" fill="white" fontSize="20" fontWeight="bold" className="font-mono tabular-nums">{roundSecondsLeft}</text>
                  </svg>
                  </div>
                  <div className="mt-4 flex flex-col gap-3 sm:flex-row">
                    <LiquidButton className="w-full py-3 text-base sm:py-4 sm:text-lg" onClick={(e) => { onButtonPress(e); handleContinueRound(); }} size="xxl" variant="cool">⏩ Siguiente ronda</LiquidButton>
                    <LiquidButton className="w-full py-3 text-base sm:py-4 sm:text-lg" onClick={(e) => { onButtonPress(e); handleGoToVote(); }} size="xxl" variant="cool"><FaVoteYea className="inline mr-1" /> Votar</LiquidButton>
                  </div>
                  <div className="mt-4 h-2 w-full overflow-hidden rounded-full bg-black/50">
                    <div className="h-full rounded-full transition-all duration-1000" style={{ width: roundProgressWidth, background: `linear-gradient(90deg, ${selectedColor}, #ffaa44)` }} />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPendingModal()}
      </div>
    );
  }

  // ---------- VOTE (con efecto foco y color del jugador) ----------
  if (phase === 'vote') {
    return (
      <div className="relative flex h-screen flex-col items-center justify-center bg-transparent px-3 py-2 font-fiesta text-white overflow-hidden"
        style={particleBackgroundStyle}>
        {particles.map(p => <div key={p.id} className="particle" style={{ left: p.left, width: p.size, height: p.size, background: p.color, animation: `floatParticle ${p.duration} infinite`, animationDelay: p.animationDelay }} />)}
        <div className="w-full max-w-5xl">
          <div className="rounded-[2.5rem] border border-white/10 bg-black/60 p-4 backdrop-blur-2xl sm:p-6">
            <div className="grid gap-3 md:grid-cols-2">
              <div className="rounded-[2rem] border border-white/10 bg-black/40 p-4 sm:p-5">
                <h2 className="text-4xl font-black tracking-[-0.05em] text-white sm:text-6xl">VOTACIÓN</h2>
                <p className="mt-2 text-sm text-white/55">Ronda #{roundIndex} · voto secreto</p>
                <div className="mt-3 text-base text-white/70">Elige al culpable</div>
              </div>

              <div ref={resultPanelRef} className="rounded-[2rem] border border-white/10 bg-black/30 p-4 sm:p-5">
                <div className="rounded-2xl border p-4" style={{ borderColor: selectedColor }}>
                  <p className="text-center text-[0.68rem] uppercase tracking-[0.35em] text-white/45">Lista de acusados</p>
                  <div className="mt-3 grid gap-3 grid-cols-2 max-h-60 overflow-y-auto">
                    {participants.map(p => {
                      const isSelected = p.id === selectedVoteId;
                      return (
                        <button key={p.id}
                          onClick={(e) => { onButtonPress(e); handleVoteForPlayer(p.id); }}
                          className={`relative flex items-center gap-3 rounded-2xl border p-3 transition-all duration-200 ${isSelected ? 'scale-[1.02] shadow-[0_0_12px_currentColor]' : 'hover:scale-[1.01]'}`}
                          style={{ borderColor: isSelected ? p.color : '#444', backgroundColor: isSelected ? `${p.color}20` : '#00000060' }}
                          type="button">
                          <ParticipantAvatarBadge avatar={p.avatar} backgroundColor={p.color} seed={p.avatarSeed} alt={p.name} sizeClassName="h-10 w-10" />
                          <p className="block max-w-[8rem] truncate text-base font-semibold text-white" title={p.name}>{p.name}</p>
                          {isSelected && <FaVoteYea className="ml-auto text-sm text-yellow-400" />}
                        </button>
                      );
                    })}
                  </div>
                  <LiquidButton className="mt-4 w-full py-3 text-base sm:py-4 sm:text-lg" onClick={(e) => { onButtonPress(e); setPhase('round'); setSelectedVoteId(null); }} size="xxl" variant="cool">← Volver al debate</LiquidButton>
                </div>
              </div>
            </div>
          </div>
        </div>
        {renderPendingModal()}
      </div>
    );
  }

  // Fallback (no debería ocurrir)
  return (
      <div className="flex min-h-[100svh] items-center justify-center bg-black text-white">
      <div className="max-w-sm rounded-2xl border border-red-800 bg-black/80 p-6 text-center">
        <FaSkull className="mx-auto text-4xl text-red-500 animate-bounce" />
        <p className="text-xl font-black mt-2">Caso perdido</p>
        <p className="text-xs text-stone-400">Reinicia el juego</p>
      </div>
    </div>
  );
}

export default ImpostorGame;
