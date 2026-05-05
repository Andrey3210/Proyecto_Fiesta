import { useEffect, useMemo, useRef, useState } from 'react';
import { Wheel, type WheelDataType } from 'react-custom-roulette';
import type { MouseEvent as ReactMouseEvent } from 'react';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';

import type { Participant } from '../App';

type RouletteProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type SpinProfile = 'agile' | 'normal' | 'smooth';

function Roulette({ participants, onBackToHub, onButtonPress }: RouletteProps) {
  void onBackToHub;

  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [spinProfile, setSpinProfile] = useState<SpinProfile>('agile');
  const resultPanelRef = useRef<HTMLElement | null>(null);

  const spinDurationByProfile: Record<SpinProfile, number> = {
    agile: 0.9,
    normal: 1.2,
    smooth: 1.5,
  };

  const wheelData: WheelDataType[] = useMemo(
    () =>
      participants.map((participant) => ({
        option: participant.name,
        style: {
          backgroundColor: participant.color,
          textColor: '#f8fafc',
          fontSize: 30,
          fontWeight: 900,
        },
      })),
    [participants],
  );

  if (participants.length < 2) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4 text-center text-white app-fade-up">
        <div className="max-w-md rounded-3xl border border-white/10 bg-slate-950/80 p-8 shadow-2xl backdrop-blur-2xl">
          <p className="text-2xl font-black">Faltan participantes</p>
          <p className="mt-2 text-slate-200">Agrega al menos 2 para usar la ruleta.</p>
        </div>
      </div>
    );
  }

  const spinRoulette = () => {
    if (mustSpin) {
      return;
    }

    setSelected(null);
    setPrizeNumber(Math.floor(Math.random() * participants.length));
    setMustSpin(true);
  };

  const handleStopSpinning = () => {
    setSelected(participants[prizeNumber] ?? null);
    setMustSpin(false);
  };

  useEffect(() => {
    if (!selected) {
      return undefined;
    }

    const timer = window.setTimeout(() => {
      resultPanelRef.current?.scrollIntoView({
        behavior: 'smooth',
        block: 'start',
      });
    }, 120);

    return () => window.clearTimeout(timer);
  }, [selected]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center bg-transparent px-3 py-6 pt-16 font-fiesta text-white app-fade-up sm:px-4 sm:py-10 sm:pt-24">
      <div className="w-full max-w-[92rem] overflow-hidden rounded-[2.25rem] border border-white/10 bg-slate-950/80 p-4 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-8">
        <div className="absolute inset-0 bg-gradient-to-b from-fuchsia-500/18 via-sky-500/8 to-black/75" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),transparent_40%),radial-gradient(circle_at_bottom_right,rgba(59,130,246,0.22),transparent_30%)]" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.72fr] lg:items-center">
          <section className="flex flex-col items-center text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.5em] text-white/80">MondeFan</p>
            <h1 className="text-4xl font-black sm:text-6xl">Ruleta</h1>
            <p className="mt-3 max-w-xl text-slate-100">
              Un giro, un ganador. Rápido, justo y al azar.
            </p>

            <div className="mt-6 flex flex-wrap justify-center gap-2">
              {[
                { key: 'agile', label: 'Ágil' },
                { key: 'normal', label: 'Normal' },
                { key: 'smooth', label: 'Suave' },
              ].map((option) => (
                <LiquidButton
                  key={option.key}
                  className={`min-w-24 ${
                    spinProfile === option.key ? '' : 'bg-white/5 text-slate-200 hover:bg-white/10'
                  }`}
                  onClick={(event) => {
                    onButtonPress(event);
                    setSpinProfile(option.key as SpinProfile);
                  }}
                  size="lg"
                  variant={spinProfile === option.key ? 'cool' : 'default'}
                  type="button"
                >
                  {option.label}
                </LiquidButton>
              ))}
            </div>

            <div className="relative mx-auto mt-10 flex w-full max-w-[min(92vw,34rem)] justify-center">
              <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                <div className="h-0 w-0 border-l-[22px] border-r-[22px] border-b-[40px] border-l-transparent border-r-transparent border-b-white drop-shadow-[0_8px_18px_rgba(255,255,255,0.55)]" />
              </div>

              <div className="relative mx-auto rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.14),rgba(15,23,42,0.95)_55%,rgba(0,0,0,0.9)_100%)] p-3 shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_110px_rgba(255,255,255,0.12),0_50px_140px_rgba(0,0,0,0.6)]">
                <div className="pointer-events-none absolute inset-2 rounded-full border border-white/15 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.22),rgba(255,255,255,0.03)_34%,rgba(0,0,0,0.12)_100%)]" />
                <div className="relative scale-[1.02] sm:scale-[1.06]">
                  <Wheel
                    backgroundColors={[
                      '#ff4fbf',
                      '#7c3aed',
                      '#22d3ee',
                      '#f59e0b',
                      '#22c55e',
                      '#f43f5e',
                    ]}
                    data={wheelData}
                    fontSize={30}
                    fontWeight={900}
                    innerBorderColor="rgba(255,255,255,0.8)"
                    innerBorderWidth={5}
                    innerRadius={10}
                    mustStartSpinning={mustSpin}
                    onStopSpinning={handleStopSpinning}
                    outerBorderColor="rgba(255,255,255,0.95)"
                    outerBorderWidth={22}
                    perpendicularText
                    prizeNumber={prizeNumber}
                    radiusLineColor="rgba(255,255,255,0.28)"
                    radiusLineWidth={2}
                    spinDuration={spinDurationByProfile[spinProfile]}
                    startingOptionIndex={0}
                    textColors={['#ffffff']}
                    textDistance={76}
                  />
                </div>
              </div>
            </div>

            <LiquidButton
              className="mt-10"
              disabled={mustSpin}
              onClick={spinRoulette}
              size="xxl"
              variant="cool"
              type="button"
            >
              {mustSpin ? 'Girando...' : 'Girar'}
            </LiquidButton>
          </section>

          <aside ref={resultPanelRef} className="rounded-[2rem] border border-white/10 bg-white/5 p-4 text-center shadow-inner shadow-black/20 sm:p-6">
            <p className="text-sm uppercase tracking-[0.4em] text-white/70">Resultado</p>
            {selected ? (
              <div className="mt-6 app-fade-up">
                <div className="mx-auto flex h-36 w-36 items-center justify-center rounded-full bg-[radial-gradient(circle,rgba(255,255,255,0.35),rgba(255,255,255,0.08)_48%,rgba(0,0,0,0.05)_100%)] p-3 shadow-[0_0_60px_rgba(255,255,255,0.12)]">
                  <ParticipantAvatarBadge
                    avatar={selected.avatar}
                    backgroundColor={selected.color}
                    className="h-28 w-28"
                    seed={selected.avatarSeed}
                    alt={selected.name}
                    sizeClassName="h-28 w-28"
                  />
                </div>
                <p className="mt-5 text-3xl font-black" style={{ color: selected.color }}>
                  {selected.name}
                </p>
                <p className="mt-3 text-slate-100">La rueda cayó aquí.</p>
              </div>
            ) : (
              <div className="mt-8 rounded-3xl border border-dashed border-white/15 bg-black/20 p-8">
                <p className="text-lg text-slate-200">Pulsa girar para elegir a alguien.</p>
                <p className="mt-2 text-sm text-slate-400">Los nombres giran con estilo.</p>
              </div>
            )}
          </aside>
        </div>
      </div>
    </div>
  );
}

export default Roulette;


