import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import {
  FaEdit,
  FaTrash,
} from 'react-icons/fa';
import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';
import type { Participant } from '../App';

type WelcomeScreenProps = {
  participants: Participant[];
  onAddParticipant: (name: string) => void;
  onDeleteParticipant: (id: string) => void;
  onEditParticipant: (id: string, name: string) => void;
  onStartGame: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

const welcomeBackdropStyle = {
  background:
    'radial-gradient(circle at top left, rgba(34, 211, 238, 0.24), transparent 34%), radial-gradient(circle at bottom right, rgba(168, 85, 247, 0.20), transparent 30%), radial-gradient(circle at 50% 20%, rgba(16, 185, 129, 0.14), transparent 26%)',
};

function WelcomeScreen({
  participants,
  onAddParticipant,
  onDeleteParticipant,
  onEditParticipant,
  onStartGame,
  onButtonPress,
}: WelcomeScreenProps) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = () => {
    const trimmedName = name.trim();

    if (!trimmedName) {
      return;
    }

    if (editingId) {
      onEditParticipant(editingId, trimmedName);
    } else {
      onAddParticipant(trimmedName);
    }

    setName('');
    setEditingId(null);

    window.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  const handleEdit = (participant: Participant) => {
    setName(participant.name);
    setEditingId(participant.id);
  };

  const handleDelete = (participantId: string) => {
    onDeleteParticipant(participantId);

    if (editingId === participantId) {
      setEditingId(null);
      setName('');
    }
  };

  useEffect(() => {
    if (!editingId) {
      return;
    }

    inputRef.current?.focus();
    inputRef.current?.select();
  }, [editingId]);

  return (
    <div className="relative flex min-h-screen flex-col items-center overflow-hidden bg-transparent px-4 py-10 text-white">
      <div className="pointer-events-none absolute inset-0" style={welcomeBackdropStyle} />
      <div className="pointer-events-none absolute -left-16 top-20 h-56 w-56 rounded-full bg-cyan-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-4 right-0 h-64 w-64 rounded-full bg-fuchsia-500/10 blur-3xl" />
      <div className="w-full max-w-5xl app-fade-up">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.5em] text-cyan-100/80">
            MondeFan
          </p>
          <h1 className="text-5xl font-black tracking-tight">Feliz Cumpleaños Mala! 🥳</h1>
          <p className="mt-3 text-lg text-slate-200">
            Esta app es un regalo para Tuti.
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <section className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-white shadow-2xl backdrop-blur-2xl app-fade-up">
            <div className="mb-4 flex flex-col gap-2">
              <label className="text-sm font-semibold uppercase tracking-[0.2em] text-slate-300/80">
                Nombre del participante
              </label>
              <div className="flex flex-col gap-3 sm:flex-row">
                <input
                  ref={inputRef}
                  className="w-full rounded-2xl border border-white/10 bg-slate-900/80 px-4 py-3 text-lg text-white outline-none transition placeholder:text-slate-400 focus:border-cyan-300/50 focus:ring-4 focus:ring-cyan-300/10"
                  onChange={(event) => setName(event.target.value)}
                  placeholder="Escribe un nombre"
                  type="text"
                  value={name}
                />
                <LiquidButton
                  className="w-full sm:w-auto"
                  onClick={(event) => {
                    onButtonPress(event);
                    handleSubmit();
                  }}
                  size="lg"
                  variant="cool"
                  type="button"
                >
                  {editingId ? 'Guardar cambio' : 'Agregar'}
                </LiquidButton>
              </div>
              <p className="text-sm text-slate-300">
                Total de participantes: <span className="font-semibold text-white">{participants.length}</span>
              </p>
            </div>

            <ul className="space-y-3">
              {participants.map((participant) => (
                <li
                  key={participant.id}
                  className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                >
                  <div className="flex items-center gap-3">
                    <ParticipantAvatarBadge
                      avatar={participant.avatar}
                      backgroundColor={participant.color}
                      seed={participant.avatarSeed}
                      alt={participant.name}
                    />
                    <div>
                      <p className="font-semibold text-white">{participant.name}</p>
                      <p className="text-xs uppercase tracking-[0.2em] text-slate-300/70">
                        Avatar
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <LiquidButton
                      className="rounded-full bg-transparent text-blue-200 hover:text-white"
                      onClick={(event) => {
                        onButtonPress(event);
                        handleEdit(participant);
                      }}
                      size="icon"
                      variant="cool"
                      type="button"
                    >
                      <FaEdit />
                    </LiquidButton>
                    <LiquidButton
                      className="rounded-full bg-transparent text-red-200 hover:text-white"
                      onClick={(event) => {
                        onButtonPress(event);
                        handleDelete(participant.id);
                      }}
                      size="icon"
                      variant="cool"
                      type="button"
                    >
                      <FaTrash />
                    </LiquidButton>
                  </div>
                </li>
              ))}
            </ul>

            <div className="mt-6">
              <LiquidButton
                className="w-full"
                disabled={participants.length < 2}
                onClick={(event) => {
                  onButtonPress(event);
                  onStartGame();
                }}
                size="xxl"
                variant="cool"
                type="button"
              >
                Jugar
              </LiquidButton>

              <p className="mt-3 text-sm text-slate-300">
                Necesitas 2 o mas participantes para empezar a jugar.
              </p>
            </div>
          </section>

        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
