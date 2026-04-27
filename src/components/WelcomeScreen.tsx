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
    <div className="flex min-h-screen flex-col items-center bg-transparent px-4 py-10 text-white">
      <div className="w-full max-w-5xl app-fade-up">
        <div className="mb-8 text-center">
          <p className="mb-2 text-sm uppercase tracking-[0.5em] text-cyan-200/80">
            MondeFan
          </p>
          <h1 className="text-5xl font-black tracking-tight">Bienvenida</h1>
          <p className="mt-3 text-lg text-slate-200">
            Agrega participantes, edita sus nombres y juega cuando haya 2 o mas.
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
          </section>

          <aside className="relative overflow-hidden rounded-3xl border border-white/10 bg-slate-950/55 p-6 shadow-2xl backdrop-blur-2xl app-fade-up-delay">
            <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-black/25 to-black/65" />
            <div className="relative z-10 flex flex-col justify-between">
              <h2 className="text-2xl font-bold">Listos para jugar</h2>
              <p className="mt-2 text-slate-200">
                Los participantes se guardan mientras cambias entre pantallas.
              </p>
              <div className="mt-5 grid grid-cols-2 gap-3">
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
                    Total
                  </p>
                  <p className="mt-1 text-2xl font-black">{participants.length}</p>
                </div>
                <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
                  <p className="text-xs uppercase tracking-[0.25em] text-slate-300/70">
                    Lista
                  </p>
                  <p className="mt-1 text-2xl font-black">
                    {participants.length >= 2 ? 'Lista' : 'Falta'}
                  </p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {participants.slice(0, 4).map((participant) => (
                  <div
                    key={participant.id}
                    className="rounded-2xl border border-white/10 bg-white/5 p-3 text-center app-float"
                  >
                    <ParticipantAvatarBadge
                      avatar={participant.avatar}
                      backgroundColor={participant.color}
                      className="mx-auto mb-2"
                      seed={participant.avatarSeed}
                      alt={participant.name}
                    />
                    <p className="text-sm font-semibold">{participant.name}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="relative z-10">
              <LiquidButton
                className="mt-8 w-full"
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
                Necesitas 2 o mas participantes para activar la ruleta.
              </p>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}

export default WelcomeScreen;
