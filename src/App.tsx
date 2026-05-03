import { useEffect, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaDownload, FaTimes } from 'react-icons/fa';
import GameHub from './components/GameHub';
import ImpostorGame from './components/ImpostorGame';
import Roulette from './components/Roulette';
import WelcomeScreen from './components/WelcomeScreen';
import TruthOrDareGame from './components/TruthOrDareGame';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
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

const isStandaloneDisplay = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (window.navigator as Navigator & { standalone?: boolean }).standalone === true
  );
};

const isIosSafari = () => {
  if (typeof window === 'undefined') {
    return false;
  }

  const userAgent = window.navigator.userAgent;
  return /iPhone|iPad|iPod/i.test(userAgent) && /Safari/i.test(userAgent) && !/CriOS|FxiOS/i.test(userAgent);
};

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
  const [deferredInstallPrompt, setDeferredInstallPrompt] = useState<BeforeInstallPromptEvent | null>(
    null,
  );
  const [isAppInstalled, setIsAppInstalled] = useState(isStandaloneDisplay);
  const [showIosInstallHelp, setShowIosInstallHelp] = useState(false);
  const [showInstallHelp, setShowInstallHelp] = useState(false);
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

  useEffect(() => {
    const handleBeforeInstallPrompt = (event: Event) => {
      event.preventDefault();
      setDeferredInstallPrompt(event as BeforeInstallPromptEvent);
    };

    const handleAppInstalled = () => {
      setDeferredInstallPrompt(null);
      setIsAppInstalled(true);
      setShowIosInstallHelp(false);
      setShowInstallHelp(false);
    };

    setIsAppInstalled(isStandaloneDisplay());

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

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

  const handleInstallApp = async () => {
    if (isAppInstalled) {
      return;
    }

    if (deferredInstallPrompt) {
      deferredInstallPrompt.prompt();
      const choice = await deferredInstallPrompt.userChoice;
      if (choice.outcome === 'accepted') {
        setIsAppInstalled(true);
      }
      setDeferredInstallPrompt(null);
      return;
    }

    if (isIosSafari()) {
      setShowIosInstallHelp(true);
      return;
    }

    setShowInstallHelp(true);
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
      {!isAppInstalled && (
        <div className="fixed right-4 top-4 z-50">
          <LiquidButton
            className="rounded-full !px-4 !py-3 shadow-2xl"
            onClick={handleInstallApp}
            size="lg"
            variant="cool"
            type="button"
          >
            <span className="flex items-center gap-2">
              <FaDownload />
              Instalar
            </span>
          </LiquidButton>
        </div>
      )}
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

      {showIosInstallHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Instalar en iPhone</p>
                <h2 className="mt-2 text-2xl font-black">Agregar a pantalla de inicio</h2>
              </div>
              <button
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                onClick={() => setShowIosInstallHelp(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p>1. Toca el boton de compartir en Safari.</p>
              <p className="mt-2">2. Elige "Agregar a pantalla de inicio".</p>
              <p className="mt-2">3. Confirma para abrir el juego como app.</p>
            </div>

            <div className="mt-6 flex justify-end">
              <LiquidButton
                onClick={() => setShowIosInstallHelp(false)}
                size="lg"
                variant="cool"
                type="button"
              >
                Entendido
              </LiquidButton>
            </div>
          </div>
        </div>
      )}

      {showInstallHelp && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/70 px-4 backdrop-blur-sm">
          <div className="w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-white shadow-2xl">
            <div className="flex items-start justify-between gap-4">
              <div>
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Instalación</p>
                <h2 className="mt-2 text-2xl font-black">No aparece el aviso</h2>
              </div>
              <button
                className="rounded-full border border-white/10 bg-white/10 p-2 text-white transition hover:bg-white/15"
                onClick={() => setShowInstallHelp(false)}
                type="button"
              >
                <FaTimes />
              </button>
            </div>

            <div className="mt-4 rounded-3xl border border-white/10 bg-white/5 p-4 text-sm text-slate-200">
              <p>Si estás probando la app en modo desarrollo, primero abre una vista instalada o una versión compilada.</p>
              <p className="mt-2">En Chrome/Edge: busca la opción de instalar en la barra del navegador.</p>
              <p className="mt-2">En iPhone/Safari: usa Compartir y luego “Agregar a pantalla de inicio”.</p>
            </div>

            <div className="mt-6 flex justify-end">
              <LiquidButton
                onClick={() => setShowInstallHelp(false)}
                size="lg"
                variant="cool"
                type="button"
              >
                Entendido
              </LiquidButton>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
