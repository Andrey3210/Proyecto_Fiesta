import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import GameHub from './components/GameHub';
import ImpostorGame from './components/ImpostorGame';
import Roulette from './components/Roulette';
import WelcomeScreen from './components/WelcomeScreen';
import TruthOrDareGame from './components/TruthOrDareGame';
import DigitalGlitch from '@/components/ui/digital-glitch';
import {
  participantAvatarOrder,
  participantAvatarToColor,
  type ParticipantAvatar,
} from '@/lib/participant-avatars';

export type Participant = {
  id: string;
  name: string;
  color: string;
  avatar: ParticipantAvatar;
  avatarSeed: string;
};

type Stage = 'welcome' | 'hub' | 'game';
type GameMode = 'roulette' | 'truth' | 'impostor';

type ButtonPulse = {
  x: number;
  y: number;
  strength: number;
  radius: number;
};

const BUTTON_GLITCH_STRENGTH = 0.5;
const BUTTON_GLITCH_RADIUS_MULTIPLIER = 0.5;

const storageKey = 'mondefan.participants';

const isParticipantAvatar = (value: unknown): value is ParticipantAvatar =>
  typeof value === 'string' && participantAvatarOrder.includes(value as ParticipantAvatar);

const getRandomAvatar = (): ParticipantAvatar =>
  participantAvatarOrder[Math.floor(Math.random() * participantAvatarOrder.length)];

const getDistinctAvatar = (participants: Participant[]): ParticipantAvatar => {
  const usedAvatars = new Set(participants.map((participant) => participant.avatar));
  const availableAvatars = participantAvatarOrder.filter((avatar) => !usedAvatars.has(avatar));

  if (availableAvatars.length > 0) {
    return availableAvatars[Math.floor(Math.random() * availableAvatars.length)];
  }

  return getRandomAvatar();
};

const normalizeParticipant = (participant: unknown): Participant | null => {
  if (typeof participant !== 'object' || participant === null) {
    return null;
  }

  const currentParticipant = participant as Record<string, unknown>;

  if (typeof currentParticipant.id !== 'string' || typeof currentParticipant.name !== 'string') {
    return null;
  }

  const legacyAvatar = currentParticipant.avatar ?? currentParticipant.icon;
  const avatar = isParticipantAvatar(legacyAvatar) ? legacyAvatar : getRandomAvatar();
  const avatarSeed =
    typeof currentParticipant.avatarSeed === 'string'
      ? currentParticipant.avatarSeed
      : currentParticipant.id;

  return {
    id: currentParticipant.id,
    name: currentParticipant.name,
    avatar,
    color: participantAvatarToColor(avatar),
    avatarSeed,
  };
};

const loadParticipants = (): Participant[] => {
  if (typeof window === 'undefined') {
    return [];
  }

  try {
    const rawParticipants = window.localStorage.getItem(storageKey);

    if (!rawParticipants) {
      return [];
    }

    const parsedParticipants: unknown = JSON.parse(rawParticipants);

    if (!Array.isArray(parsedParticipants)) {
      return [];
    }

    return parsedParticipants
      .map(normalizeParticipant)
      .filter((participant): participant is Participant => participant !== null);
  } catch {
    return [];
  }
};

const createParticipant = (name: string, participants: Participant[]): Participant => {
  const avatar = getDistinctAvatar(participants);
  const avatarSeed = `${name}-${Date.now().toString(16)}-${Math.random().toString(16).slice(2)}`;

  return {
    id: `${Date.now()}-${Math.random().toString(16).slice(2)}`,
    name,
    avatar,
    color: participantAvatarToColor(avatar),
    avatarSeed,
  };
};

function App() {
  const [stage, setStage] = useState<Stage>('welcome');
  const [gameMode, setGameMode] = useState<GameMode>('roulette');
  const [participants, setParticipants] = useState<Participant[]>(loadParticipants);
  const [pendingExit, setPendingExit] = useState<Stage | null>(null);
  const [buttonPulse, setButtonPulse] = useState<ButtonPulse | null>(null);
  const backgroundProps =
    stage === 'welcome'
      ? {
          baseColor: '#4fc9ff',
          speed: 0.78,
          glitchIntensity: 0.34,
          rgbShift: 0.013,
          scanlineDensity: 1360,
          scanlineOpacity: 0.14,
        }
      : stage === 'hub'
        ? {
            baseColor: '#7d8bff',
            speed: 0.92,
            glitchIntensity: 0.48,
            rgbShift: 0.016,
            scanlineDensity: 1160,
            scanlineOpacity: 0.16,
          }
      : gameMode === 'roulette'
        ? {
            baseColor: '#ff4bbf',
            speed: 1.35,
            glitchIntensity: 0.78,
            rgbShift: 0.028,
            scanlineDensity: 900,
            scanlineOpacity: 0.22,
          }
        : gameMode === 'impostor'
        ? {
            baseColor: '#46f2b1',
            speed: 1.08,
            glitchIntensity: 0.62,
            rgbShift: 0.02,
            scanlineDensity: 1080,
            scanlineOpacity: 0.18,
          }
        : {
            baseColor: '#8bffcf',
            speed: 1.05,
            glitchIntensity: 0.58,
            rgbShift: 0.018,
            scanlineDensity: 1120,
            scanlineOpacity: 0.18,
          };

  useEffect(() => {
    window.localStorage.setItem(storageKey, JSON.stringify(participants));
  }, [participants]);

  useEffect(() => {
    if (!buttonPulse) {
      return undefined;
    }

    const timeout = window.setTimeout(() => setButtonPulse(null), 260);
    return () => window.clearTimeout(timeout);
  }, [buttonPulse]);

  const triggerButtonPulse = (event: ReactMouseEvent<HTMLElement>) => {
    const target = event.currentTarget.getBoundingClientRect();
    setButtonPulse({
      x: target.left + target.width / 2,
      y: target.top + target.height / 2,
      strength: BUTTON_GLITCH_STRENGTH,
      radius: Math.max(target.width, target.height) * BUTTON_GLITCH_RADIUS_MULTIPLIER,
    });
  };

  const handleAddParticipant = (name: string) => {
    setParticipants((currentParticipants) => [
      ...currentParticipants,
      createParticipant(name, currentParticipants),
    ]);
  };

  const handleUpdateParticipant = (id: string, name: string) => {
    setParticipants((currentParticipants) =>
      currentParticipants.map((participant) =>
        participant.id === id ? { ...participant, name } : participant,
      ),
    );
  };

  const handleDeleteParticipant = (id: string) => {
    setParticipants((currentParticipants) =>
      currentParticipants.filter((participant) => participant.id !== id),
    );
  };

  const handleStartGame = () => {
    if (participants.length < 2) {
      return;
    }

    setStage('hub');
  };

  if (stage === 'welcome') {
    return (
      <div className="relative min-h-screen overflow-hidden">
        <DigitalGlitch {...backgroundProps} pulse={buttonPulse} />
        <div key="welcome" className="app-stage-in">
          <WelcomeScreen
            onAddParticipant={handleAddParticipant}
            onDeleteParticipant={handleDeleteParticipant}
            onEditParticipant={handleUpdateParticipant}
            onStartGame={handleStartGame}
            onButtonPress={triggerButtonPulse}
            participants={participants}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="relative min-h-screen overflow-hidden">
      <DigitalGlitch {...backgroundProps} pulse={buttonPulse} />
      <div key={`games-${stage}-${gameMode}`} className="app-stage-in">
        {stage === 'hub' ? (
          <GameHub
            participants={participants}
            onButtonPress={triggerButtonPulse}
            onBackToWelcome={() => setStage('welcome')}
            onSelectGame={(nextGame) => {
              setGameMode(nextGame);
              setStage('game');
            }}
          />
        ) : gameMode === 'roulette' ? (
          <Roulette
            participants={participants}
            onButtonPress={triggerButtonPulse}
            onBackToHub={() => setPendingExit('hub')}
          />
        ) : gameMode === 'truth' ? (
          <TruthOrDareGame
            participants={participants}
            onButtonPress={triggerButtonPulse}
            onBackToHub={() => setPendingExit('hub')}
          />
        ) : (
          <ImpostorGame
            participants={participants}
            onButtonPress={triggerButtonPulse}
            onBackToHub={() => setPendingExit('hub')}
          />
        )}
      </div>

      {pendingExit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/85 p-6 text-center text-white shadow-2xl">
              <p className="text-sm uppercase tracking-[0.45em] text-white/60">
                Aviso
              </p>
              <h2 className="mt-3 text-2xl font-black">¿Salir del juego?</h2>
              <p className="mt-3 text-slate-200">
                Si vuelves ahora, el turno actual se cerrará.
              </p>
              <div className="mt-6 flex gap-3">
                <button
                  className="flex-1 rounded-2xl border border-white/10 bg-white/10 px-4 py-3 text-sm font-semibold text-white transition hover:bg-white/15"
                  onClick={() => setPendingExit(null)}
                  type="button"
                >
                  Seguir jugando
                </button>
                <button
                  className="flex-1 rounded-2xl bg-white px-4 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                  onClick={() => {
                    setStage(pendingExit);
                    setPendingExit(null);
                  }}
                  type="button"
                >
                  Volver
                </button>
              </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
