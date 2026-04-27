import { useEffect, useMemo, useState } from 'react';
import { FaArrowLeft, FaForward, FaGlassCheers, FaQuestionCircle } from 'react-icons/fa';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';

import type { Participant } from '../App';

type TruthOrDareGameProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type TurnMode = 'idle' | 'truth' | 'shot';

const shotDuration = 10;

const truthTopics = [
  'tu ex',
  'una amistad rota',
  'una mentira grande',
  'una pelea fuerte',
  'los celos',
  'redes sociales',
  'tu familia',
  'tu dinero',
  'un arrepentimiento',
  'tu peor decisión',
  'una promesa rota',
  'una inseguridad',
  'un chisme que ayudaste a correr',
  'tu trabajo o estudios',
  'una opinión impopular',
  'una persona que no soportas',
  'tu peor roche en público',
  'un secreto que guardas',
  'tu última discusión seria',
  'algo que te da vergüenza admitir',
];

const truthTemplates = [
  (topic: string) => `¿Qué fue lo más difícil que viviste con ${topic}?`,
  (topic: string) => `¿Qué verdad sobre ${topic} todavía te cuesta decir?`,
  (topic: string) => `¿A quién le ocultaste algo por culpa de ${topic}?`,
  (topic: string) => `¿Qué harías distinto si ${topic} volviera a pasar?`,
  (topic: string) => `¿Qué fue lo más impulsivo que hiciste por ${topic}?`,
  (topic: string) => `¿Qué opinión real tienes sobre ${topic}?`,
  (topic: string) => `¿Qué te dejó mal parado en ${topic}?`,
  (topic: string) => `¿Qué parte de ${topic} todavía te pesa?`,
  (topic: string) => `¿Qué conversación te falta tener sobre ${topic}?`,
  (topic: string) => `¿Qué decisión tomaste por orgullo con ${topic}?`,
  (topic: string) => `¿Qué fue lo más incómodo que pasó con ${topic}?`,
  (topic: string) => `¿Qué mentira pequeña dijiste para salir de un problema con ${topic}?`,
  (topic: string) => `¿Qué es lo que más te molesta de ${topic}?`,
  (topic: string) => `¿Qué secreto relacionado con ${topic} te sigue dando vueltas?`,
  (topic: string) => `¿Qué te da más miedo que la gente sepa de ${topic}?`,
];

const truthQuestions = truthTopics
  .flatMap((topic) => truthTemplates.map((template) => template(topic)))
  .slice(0, 300);

const pickRandomTruth = () =>
  truthQuestions[Math.floor(Math.random() * truthQuestions.length)];

function TruthOrDareGame({ participants, onBackToHub, onButtonPress }: TruthOrDareGameProps) {
  const [currentPlayerIndex, setCurrentPlayerIndex] = useState(0);
  const [mode, setMode] = useState<TurnMode>('idle');
  const [currentTruth, setCurrentTruth] = useState('');
  const [shotSecondsLeft, setShotSecondsLeft] = useState(shotDuration);

  const currentPlayer = participants[currentPlayerIndex];
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

  const advancePlayer = () => {
    if (participants.length === 0) {
      return;
    }

    setCurrentPlayerIndex((index) => (index + 1) % participants.length);
    setMode('idle');
    setCurrentTruth('');
    setShotSecondsLeft(shotDuration);
  };

  const startTruth = () => {
    if (optionsLocked) {
      return;
    }

    setMode('truth');
    setCurrentTruth(pickRandomTruth());
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
                  <p className="mt-1 text-slate-200">Elige una verdad o prepárate para el shot.</p>
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

          <section className="rounded-[2rem] border border-white/10 bg-black/30 p-6 shadow-inner shadow-black/25">
            {mode === 'idle' ? (
              <div className="flex min-h-[32rem] flex-col items-center justify-center rounded-[1.75rem] border border-dashed border-white/15 bg-white/5 p-8 text-center">
                <p className="text-sm uppercase tracking-[0.4em] text-white/55">Listos</p>
                <p className="mt-4 text-3xl font-black">Verdad o Shot</p>
                <p className="mt-3 max-w-md text-slate-200">
                  Aquí verás una pregunta clara o un shot con cronómetro.
                </p>
              </div>
            ) : (
              <div className="flex min-h-[32rem] flex-col justify-between rounded-[1.75rem] border border-white/10 bg-white/5 p-6">
                <div>
                  <p className="text-sm uppercase tracking-[0.45em] text-white/55">
                    {mode === 'truth' ? 'Verdad' : 'Shot'}
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
                    className="flex-1"
                    disabled={mode === 'shot' && !shotCompleted}
                    onClick={(event) => {
                      onButtonPress(event);
                      advancePlayer();
                    }}
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
    </div>
  );
}

export default TruthOrDareGame;
