import { ArrowLeft } from 'lucide-react';
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
    content: 'Una ruleta real para elegir a alguien al azar y empezar la fiesta.',
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
    content: 'Turnos en orden con preguntas claras y shots si toca.',
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
    content: 'Bolsa secreta, pistas opcionales y un impostor tratando de pasar desapercibido.',
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
  return (
    <div className="relative min-h-screen overflow-hidden bg-transparent text-white">
      <div className="fixed left-4 top-4 z-50">
        <button
          className="rounded-full border border-white/10 bg-slate-950/80 px-5 py-3 text-sm font-semibold shadow-2xl backdrop-blur-xl transition hover:bg-slate-900"
          onClick={(event) => {
            onButtonPress(event);
            onBackToWelcome();
          }}
          type="button"
        >
          <span className="flex items-center gap-2">
            <ArrowLeft size={18} />
            Editar
          </span>
        </button>
      </div>

      <RadialOrbitalTimeline
        activeId={null}
        subtitle={`Participantes listos: ${participants.length}. Toca un nodo para entrar.`}
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
