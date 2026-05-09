import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaMask, FaUsers } from 'react-icons/fa';

import RadialOrbitalTimeline, {
  type TimelineItem,
} from '@/components/ui/radial-orbital-timeline';

import type { Participant } from '../App';

type GameMode = 'roulette' | 'truth' | 'reto' | 'impostor' | 'quien' | 'yo';

type GameHubProps = {
  participants: Participant[];
  onBackToWelcome: () => void;
  onSelectGame: (gameMode: GameMode) => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

const timelineData: TimelineItem[] = [
  {
    id: 1,
    title: 'Ruleta',
    date: 'Jugar ahora',
    content: 'Un giro, un ganador. Rápido, justo y al azar.',
    category: 'Ruleta',
    icon: () => <span className="text-xl">🎡</span>,
    relatedIds: [2, 3],
    status: 'completed',
    energy: 95,
  },
  {
    id: 2,
    title: 'Verdad o Shot',
    date: 'Jugar ahora',
    content: 'Verdades, shots y ritmo directo.',
    category: 'Verdad o Shot',
    icon: () => <span className="text-xl">🍻</span>,
    relatedIds: [1, 3],
    status: 'in-progress',
    energy: 88,
  },
  {
    id: 3,
    title: 'Impostor',
    date: 'Jugar ahora',
    content: 'Reparte roles y encuentra al impostor.',
    category: 'Impostor',
    icon: FaMask,
    relatedIds: [1, 2],
    status: 'completed',
    energy: 92,
  },
  {
    id: 4,
    title: 'Verdad o Reto',
    date: 'Jugar ahora',
    content: 'Verdades, retos y ritmo directo.',
    category: 'Verdad o Reto',
    icon: () => <span className="text-xl">🎲</span>,
    relatedIds: [1, 2, 3],
    status: 'in-progress',
    energy: 86,
  },
  {
    id: 6,
    title: 'Quién es más probable',
    date: 'Jugar ahora',
    content: 'Voten en secreto y descubran al más probable del grupo.',
    category: 'Quién es más probable',
    icon: FaUsers,
    relatedIds: [1, 2, 3, 4],
    status: 'in-progress',
    energy: 84,
  },
  {
    id: 7,
    title: 'Yo Nunca Nunca',
    date: 'Jugar ahora',
    content: 'Frases, tragos y confesiones rápidas.',
    category: 'Yo Nunca Nunca',
    icon: () => <span className="text-xl">🍷</span>,
    relatedIds: [1, 2, 4, 6],
    status: 'in-progress',
    energy: 87,
  },
];

const hubBackdropStyle = {
  background:
    'radial-gradient(circle at top, rgba(99, 102, 241, 0.24), transparent 34%), radial-gradient(circle at bottom left, rgba(34, 211, 238, 0.18), transparent 30%), radial-gradient(circle at center right, rgba(168, 85, 247, 0.14), transparent 24%)',
};

function GameHub({
  participants,
  onBackToWelcome,
  onSelectGame,
  onButtonPress,
}: GameHubProps) {
  void onBackToWelcome;

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div className="pointer-events-none absolute inset-0" style={hubBackdropStyle} />
      <div className="pointer-events-none absolute left-0 top-24 h-64 w-64 rounded-full bg-indigo-500/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-10 h-72 w-72 rounded-full bg-cyan-400/10 blur-3xl" />
      <RadialOrbitalTimeline
        activeId={null}
        subtitle={`Participantes listos: ${participants.length}. Toca un juego para empezar.`}
        timelineData={timelineData}
        title="Juegos"
        onItemSelect={(item) => {
          if (item.id === 1) {
            onSelectGame('roulette');
          }

          if (item.id === 2) {
            onSelectGame('truth');
          }

          if (item.id === 3) {
            onSelectGame('impostor');
          }

          if (item.id === 4) {
            onSelectGame('reto');
          }

          if (item.id === 6) {
            onSelectGame('quien');
          }

          if (item.id === 7) {
            onSelectGame('yo');
          }
        }}
        onNodePress={onButtonPress}
      />
    </div>
  );
}

export default GameHub;
