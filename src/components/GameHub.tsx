import { FaMask } from 'react-icons/fa';
import type { MouseEvent as ReactMouseEvent } from 'react';

import RadialOrbitalTimeline, {
  type TimelineItem,
} from '@/components/ui/radial-orbital-timeline';

import type { Participant } from '../App';

type GameMode = 'roulette' | 'truth' | 'impostor';

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
];

function GameHub({
  participants,
  onBackToWelcome,
  onSelectGame,
  onButtonPress,
}: GameHubProps) {
  void onBackToWelcome;

  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <RadialOrbitalTimeline
        activeId={null}
        subtitle={`Participantes listos: ${participants.length}. Toca un juego para empezar.`}
        timelineData={timelineData}
        title="Juegos de Fiesta"
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
        }}
        onNodePress={onButtonPress}
      />
    </div>
  );
}

export default GameHub;
