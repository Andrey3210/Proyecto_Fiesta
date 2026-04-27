import { useMemo, useState } from 'react';
import { Wheel, type WheelDataType } from 'react-custom-roulette';
import { FaArrowLeft } from 'react-icons/fa';
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
  const [mustSpin, setMustSpin] = useState(false);
  const [prizeNumber, setPrizeNumber] = useState(0);
  const [selected, setSelected] = useState<Participant | null>(null);
  const [spinProfile, setSpinProfile] = useState<SpinProfile>('agile');

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
          textColor: '#ffffff',
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
        <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/15 to-black/85" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1fr_0.65fr] lg:items-center">
          <section className="flex flex-col items-center text-center">
            <p className="mb-3 text-sm uppercase tracking-[0.5em] text-white/70">
              MondeFan
            </p>
            <h1 className="text-5xl font-black sm:text-6xl">Ruleta</h1>
            <p className="mt-3 max-w-xl text-slate-200">
              Una ruleta real con un acabado más limpio.
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

            <div className="relative mt-8 w-full max-w-[min(88vw,36rem)]">
              <div className="absolute left-1/2 top-0 z-20 -translate-x-1/2 -translate-y-1/2">
                <div className="h-0 w-0 border-l-[16px] border-r-[16px] border-b-[28px] border-l-transparent border-r-transparent border-b-white drop-shadow-[0_4px_10px_rgba(255,255,255,0.45)]" />
              </div>

              <div className="relative rounded-full border border-white/10 bg-slate-900/70 p-2 shadow-[0_0_0_1px_rgba(255,255,255,0.05),0_40px_120px_rgba(0,0,0,0.55)]">
                <div className="pointer-events-none absolute inset-[0.75rem] rounded-full border border-white/10 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.16),rgba(255,255,255,0.03)_34%,rgba(0,0,0,0.18)_100%)]" />
                <Wheel
                  backgroundColors={['#ff4fbf', '#7c3aed', '#06b6d4', '#f59e0b', '#22c55e', '#ef4444']}
                  data={wheelData}
                  innerBorderColor="#ffffff"
                  innerBorderWidth={2}
                  mustStartSpinning={mustSpin}
                  onStopSpinning={handleStopSpinning}
                  outerBorderColor="#ffffff"
                  outerBorderWidth={14}
                  perpendicularText
                  prizeNumber={prizeNumber}
                  radiusLineColor="rgba(255,255,255,0.15)"
                  radiusLineWidth={1}
                  spinDuration={spinDurationByProfile[spinProfile]}
                  startingOptionIndex={0}
                  textColors={['#ffffff']}
                  textDistance={72}
                />
              </div>
            </div>

            <LiquidButton
              className="mt-8"
              disabled={mustSpin}
              onClick={spinRoulette}
              size="xxl"
              variant="cool"
              type="button"
            >
              {mustSpin ? 'Girando...' : 'Girar'}
            </LiquidButton>
          </section>

          <aside className="rounded-[2rem] border border-white/10 bg-white/5 p-6 text-center shadow-inner shadow-black/20">
            <p className="text-sm uppercase tracking-[0.4em] text-white/60">Resultado</p>
            {selected ? (
              <div className="mt-6 app-fade-up">
                <ParticipantAvatarBadge
                  avatar={selected.avatar}
                  backgroundColor={selected.color}
                  className="mx-auto h-24 w-24"
                  seed={selected.avatarSeed}
                  alt={selected.name}
                  sizeClassName="h-24 w-24"
                />
                <p className="mt-5 text-3xl font-black" style={{ color: selected.color }}>
                  {selected.name}
                </p>
                <p className="mt-3 text-slate-200">La rueda cayó aquí.</p>
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
