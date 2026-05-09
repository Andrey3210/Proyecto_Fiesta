import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaCheckCircle, FaCrown, FaSkull, FaStopCircle } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';
import { ParticipantAvatarBadge } from '@/components/ui/participant-avatar';

import type { Participant } from '../App';

type QuienEsMasProbableProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

type RevealSummary = {
  votedParticipantId: string;
  votes: number;
};

const questionPrompts = [
  '¿Quién es más probable que haya visto porno hoy?',
  '¿Quién es más probable que se insinúe a un policía para librarse de una multa?',
  '¿Quién es más probable que tenga una relación abierta?',
  '¿Quién es más probable que acabe con un coma etílico esta noche?',
  '¿Quién es más probable que haga un viaje solo para tirarse a alguien?',
  '¿Quién es más probable que le pongan los juegos de rol?',
  '¿Quién es más probable que mienta sobre su edad para ligar?',
  '¿Quién es más probable que sea más romántico del grupo?',
  '¿Quién es más probable que termine siendo stripper?',
  '¿Quién es más probable que no lleve ropa interior ahora mismo?',
  '¿Quién es más probable que dure menos en la cama?',
  '¿Quién es más probable que sea más bruto en la cama?',
  '¿Quién es más probable que le sean infiel?',
  '¿Quién es más probable que sea infiel a su pareja?',
  '¿Quién es más probable que se meta en una pelea?',
  '¿Quién es más probable que haya sido el primero en perder la virginidad?',
  '¿Quién es más probable que haya perdido la virginidad más tarde?',
  '¿Quién es más probable que haya tenido un trío?',
  '¿Quién es más probable que sea más egocéntrico?',
  '¿Quién es más probable que haya tenido más líos?',
  '¿Quién es más probable que cante mejor en la ducha?',
  '¿Quién es más probable que sea el más pesado del grupo?',
  '¿Quién es más probable que haya tenido la relación más larga?',
  '¿Quién es más probable que se case antes?',
  '¿Quién es más probable que sea el más mandón?',
  '¿Quién es más probable que bese mejor?',
  '¿Quién es más probable que sea más lameculos?',
  '¿Quién es más probable que sea más dramático?',
  '¿Quién es más probable que sea más irresponsable?',
  '¿Quién es más probable que le pongan los pies?',
  '¿Quién es más probable que termine siendo rico?',
  '¿Quién es más probable que sea el menos maduro?',
  '¿Quién es más probable que quiera besar a alguien presente?',
  '¿Quién es más probable que no se case nunca?',
  '¿Quién es más probable que tenga el ex más pesado?',
  '¿Quién es más probable que haya mandado un mensaje al ex borracho?',
  '¿Quién es más probable que llore viendo una película de amor?',
  '¿Quién es más probable que haya ligado con alguien del trabajo?',
  '¿Quién es más probable que tenga una foto comprometedora en el móvil?',
  '¿Quién es más probable que haya fingido un orgasmo?',
  '¿Quién es más probable que tenga un juguete sexual en casa?',
  '¿Quién es más probable que haya tenido sexo en un lugar público?',
  '¿Quién es más probable que haya enviado nudes?',
  '¿Quién es más probable que tenga el historial de búsqueda más comprometedor?',
  '¿Quién es más probable que haya ligado con alguien mucho mayor?',
  '¿Quién es más probable que haya ligado con alguien mucho más joven?',
  '¿Quién es más probable que haya tenido sexo en el primer encuentro?',
  '¿Quién es más probable que tenga un fetiche secreto?',
  '¿Quién es más probable que haya tenido sexo con alguien de quien no recuerda el nombre?',
  '¿Quién es más probable que haya tenido sexo en el baño de una discoteca?',
  '¿Quién es más probable que haya liado con el mejor amigo de su ex?',
  '¿Quién es más probable que haya liado con la ex de su mejor amigo?',
  '¿Quién es más probable que haya tenido una aventura de una noche que se alargó más de lo esperado?',
  '¿Quién es más probable que haya bloqueado a alguien después de una noche juntos?',
  '¿Quién es más probable que haya hecho ghosting a alguien que le gustaba de verdad?',
  '¿Quién es más probable que haya tenido sexo con alguien presente en esta sala?',
  '¿Quién es más probable que haya practicado sexting?',
  '¿Quién es más probable que haya tenido una relación secreta?',
  '¿Quién es más probable que haya mentido sobre el número de personas con las que ha estado?',
  '¿Quién es más probable que haya roto con alguien por mensaje de texto?',
  '¿Quién es más probable que haya terminado llorando en una primera cita?',
  '¿Quién es más probable que haya vomitado de copas en público?',
  '¿Quién es más probable que haya orinado en la calle?',
  '¿Quién es más probable que haya perdido el móvil de fiesta?',
  '¿Quién es más probable que haya dormido en casa de alguien que no conocía?',
  '¿Quién es más probable que haya bailado encima de una barra?',
  '¿Quién es más probable que haya sido expulsado de un bar o discoteca?',
  '¿Quién es más probable que haya llamado a su ex después de una noche de fiesta?',
  '¿Quién es más probable que haya apostado dinero y perdido en una sola noche?',
  '¿Quién es más probable que haya comprado algo ridículo estando borracho?',
  '¿Quién es más probable que haya hecho el ridículo bailando en público?',
  '¿Quién es más probable que haya confundido a alguien con otra persona al ligar?',
  '¿Quién es más probable que haya inventado una excusa absurda para no ir a trabajar?',
  '¿Quién es más probable que haya copiado en un examen?',
  '¿Quién es más probable que haya mentido en su currículum?',
  '¿Quién es más probable que haya cotilleado el perfil de alguien durante más de una hora?',
  '¿Quién es más probable que haya espiado el móvil de su pareja?',
  '¿Quién es más probable que haya revisado el perfil de su ex esta semana?',
  '¿Quién es más probable que tenga conversaciones guardadas con alguien que ya no habla con él o ella?',
  '¿Quién es más probable que haya puesto mala cara en una foto grupal sin darse cuenta?',
  '¿Quién es más probable que haya olvidado el nombre de alguien con quien estuvo?',
  '¿Quién es más probable que haya fingido estar enfermo para cancelar un plan?',
  '¿Quién es más probable que haya dado un número de teléfono falso?',
  '¿Quién es más probable que haya tenido una relación solo por el físico?',
  '¿Quién es más probable que haya mandado un mensaje a la persona equivocada?',
  '¿Quién es más probable que haya respondido mal a alguien en un momento de celos?',
  '¿Quién es más probable que haya montado una escena en público?',
  '¿Quién es más probable que haya ignorado un mensaje durante más de una semana?',
  '¿Quién es más probable que haya cotilleado un secreto que le confiaron?',
  '¿Quién es más probable que haya hablado mal de alguien presente?',
  '¿Quién es más probable que sea el más celoso de la sala?',
  '¿Quién es más probable que haya seguido a su pareja sin que lo supiera?',
  '¿Quién es más probable que haya leído la conversación privada de alguien?',
  '¿Quién es más probable que haya inventado un novio o novia para dar celos?',
  '¿Quién es más probable que haya hecho una escena de celos por algo ridículo?',
  '¿Quién es más probable que haya terminado una relación y vuelto más de dos veces?',
  '¿Quién es más probable que haya seguido viendo a alguien cuando ya tenía pareja?',
  '¿Quién es más probable que haya fingido que no le importaba algo que le dolía mucho?',
  '¿Quién es más probable que haya llorado en el baño sin que nadie lo supiera?',
  '¿Quién es más probable que haya enviado un audio de voz en el peor momento posible?',
  '¿Quién es más probable que haya tenido una crush con alguien de su grupo de amigos?',
  '¿Quién es más probable que haya besado a alguien del grupo presente?',
  '¿Quién es más probable que tenga una app de citas instalada ahora mismo?',
  '¿Quién es más probable que haya quedado con alguien conocido en Tinder?',
  '¿Quién es más probable que haya subido una foto a propósito para dar celos?',
  '¿Quién es más probable que tenga la lista de reproducción más rara para ligar?',
  '¿Quién es más probable que haya usado a alguien para olvidar a otra persona?',
  '¿Quién es más probable que haya dicho "te quiero" demasiado pronto?',
  '¿Quién es más probable que haya tardado años en decírselo a alguien?',
  '¿Quién es más probable que haya terminado llorando por una serie o película sin decírselo a nadie?',
  '¿Quién es más probable que haya dormido con la ropa del otro sin pedirla?',
  '¿Quién es más probable que guarde mensajes románticos de hace años?',
  '¿Quién es más probable que haya tenido una relación completamente online?',
  '¿Quién es más probable que haya viajado para ver a alguien con quien solo había hablado por internet?',
  '¿Quién es más probable que haya tenido más de tres relaciones en el mismo año?',
  '¿Quién es más probable que haya terminado con alguien y arrepentido al día siguiente?',
  '¿Quién es más probable que haya vuelto con un ex que todo el mundo odiaba?',
  '¿Quién es más probable que tenga el ex más tóxico del grupo?',
  '¿Quién es más probable que haya bloqueado y desbloqueado a la misma persona más de cinco veces?',
  '¿Quién es más probable que haya dejado plantado a alguien en una cita?',
  '¿Quién es más probable que haya puesto una excusa ridícula para no ligar con alguien?',
  '¿Quién es más probable que haya tenido el peor intento de ligue de la historia?',
  '¿Quién es más probable que haya usado una frase de película para ligar?',
  '¿Quién es más probable que haya intentado ligar con el amigo de su pareja?',
  '¿Quién es más probable que haya tenido una crisis existencial después de los 25?',
  '¿Quién es más probable que siga sin tener claro qué quiere en la vida?',
  '¿Quién es más probable que haya gastado dinero que no tenía en algo completamente inútil?',
  '¿Quién es más probable que haya pedido dinero prestado y tardado años en devolverlo?',
  '¿Quién es más probable que haya llegado tarde a algo importante más de tres veces?',
  '¿Quién es más probable que haya olvidado un aniversario o cumpleaños clave?',
  '¿Quién es más probable que haya roto algo valioso de otra persona y no lo haya dicho?',
  '¿Quién es más probable que haya mentido sobre cuánto ha bebido?',
  '¿Quién es más probable que haya conducido cuando no debería haberlo hecho?',
  '¿Quién es más probable que haya ido a trabajar todavía borracho de la noche anterior?',
  '¿Quién es más probable que haya inventado una historia para quedar mejor en un grupo?',
  '¿Quién es más probable que haya exagerado una anécdota hasta hacerla irreconocible?',
  '¿Quién es más probable que haya sacado fotos en un funeral?',
  '¿Quién es más probable que haya hecho algo vergonzoso y culpado a otro?',
  '¿Quién es más probable que haya robado algo sin que nadie lo sepa?',
  '¿Quién es más probable que haya copiado los deberes o exámenes de alguien?',
  '¿Quién es más probable que haya tenido una discusión por algo completamente estúpido?',
  '¿Quién es más probable que haya tardado más de 30 minutos en responder un mensaje a propósito?',
  '¿Quién es más probable que haya puesto en visto a alguien durante días?',
  '¿Quién es más probable que haya hecho una captura de pantalla de una conversación privada?',
  '¿Quién es más probable que haya compartido un secreto que le contaron?',
  '¿Quién es más probable que haya hablado mal de un amigo con otro amigo?',
  '¿Quién es más probable que tenga el grupo de WhatsApp más activo a las 3 de la mañana?',
  '¿Quién es más probable que haya publicado algo en redes y lo haya borrado antes de que nadie lo vea?',
  '¿Quién es más probable que haya creado un perfil falso en redes sociales?',
  '¿Quién es más probable que haya investigado a alguien en internet durante más de una hora?',
  '¿Quién es más probable que gaste más en ropa de lo que admite?',
  '¿Quién es más probable que haya comprado algo en rebajas que nunca ha usado?',
  '¿Quién es más probable que tenga más suscripciones de streaming activas de las que recuerda?',
  '¿Quién es más probable que haya pedido comida a domicilio más de tres veces esta semana?',
  '¿Quién es más probable que haya dormido más de 12 horas seguidas siendo adulto?',
  '¿Quién es más probable que haya pasado un fin de semana entero sin salir de casa?',
  '¿Quién es más probable que lleve sin ir al gimnasio más de seis meses aunque pague la cuota?',
  '¿Quién es más probable que haya empezado una dieta y la haya abandonado en menos de 48 horas?',
  '¿Quién es más probable que haya hecho una videollamada desde el baño?',
  '¿Quién es más probable que haya respondido un mensaje importante mientras hacía otra cosa y lo haya fastidiado?',
  '¿Quién es más probable que haya fingido hablar por teléfono para evitar a alguien?',
  '¿Quién es más probable que haya salido corriendo de una conversación incómoda con cualquier excusa?',
  '¿Quién es más probable que haya dicho que ya casi llega cuando ni siquiera había salido de casa?',
  '¿Quién es más probable que haya llegado tarde a su propia fiesta?',
  '¿Quién es más probable que haya olvidado el nombre de alguien justo cuando debía presentarle a otra persona?',
  '¿Quién es más probable que haya saludado a alguien que no le estaba saludando a él o ella?',
  '¿Quién es más probable que haya respondido "sí" a algo sin haber escuchado la pregunta?',
  '¿Quién es más probable que haya tenido una discusión de madrugada que nunca debió empezar?',
  '¿Quién es más probable que haya dicho algo sin filtro que arruinó el ambiente?',
  '¿Quién es más probable que haya sido el primero en quedarse dormido en una fiesta?',
  '¿Quién es más probable que haya cantado una canción completamente mal creyendo que la sabía?',
  '¿Quién es más probable que haya ganado un concurso de cosas sin sentido?',
  '¿Quién es más probable que haya tenido la peor resaca del grupo?',
  '¿Quién es más probable que haya mezclado bebidas que nunca debería haber mezclado?',
  '¿Quién es más probable que haya perdido una apuesta ridícula y la haya cumplido?',
  '¿Quién es más probable que haya hecho una promesa de borracho que tuvo que cumplir sobrio?',
  '¿Quién es más probable que haya besado a alguien en Nochevieja sin saber muy bien cómo llegó ahí?',
  '¿Quién es más probable que haya terminado en un lugar completamente inesperado de madrugada?',
  '¿Quién es más probable que haya pasado vergüenza ajena por culpa de alguien del grupo?',
  '¿Quién es más probable que haya hecho algo por moda que ahora le da vergüenza admitir?',
  '¿Quién es más probable que haya tenido la peor foto de perfil de la historia?',
  '¿Quién es más probable que haya subido una historia de Instagram desde el baño?',
  '¿Quién es más probable que tenga la pantalla del móvil más rota y siga sin arreglarla?',
  '¿Quién es más probable que haya llamado accidentalmente a alguien con quien no quería hablar?',
  '¿Quién es más probable que haya mandado un audio de voz sin querer mientras el teléfono estaba en el bolsillo?',
  '¿Quién es más probable que haya subido una foto sin darse cuenta de que salía algo comprometedor de fondo?',
  '¿Quién es más probable que haya puesto en modo avión para ignorar a alguien?',
  '¿Quién es más probable que haya tenido el teléfono muerto en el peor momento posible?',
  '¿Quién es más probable que haya hecho una promesa que sabía que no iba a cumplir?',
  '¿Quién es más probable que haya dicho que llegaba en cinco minutos y tardado media hora?',
  '¿Quién es más probable que acabe viviendo en otro país?',
  '¿Quién es más probable que haya intentado ligar en un velatorio?',
  '¿Quién es más probable que haya tenido una conversación completamente diferente con cada persona del grupo sobre el mismo tema?',
  '¿Quién es más probable que haya pedido consejo sobre su relación y hecho exactamente lo contrario?',
  '¿Quién es más probable que haya montado un drama y luego actuado como si no hubiera pasado nada?',
  '¿Quién es más probable que haya terminado más borracho de lo esperado en una reunión familiar?',
  '¿Quién es más probable que tenga más secretos de los que admite ante el grupo?',
  '¿Quién es más probable que haya hecho algo que nunca contará a nadie de este grupo?',
  '¿Quién es más probable que acabe siendo el más famoso del grupo?',
  '¿Quién es más probable que, en el fondo, quiera a alguien presente en esta sala?',
] as const;

const getNextQuestion = (): string => {
  return questionPrompts[Math.floor(Math.random() * questionPrompts.length)] ?? questionPrompts[0];
};

const trimDisplayName = (name: string, maxLength = 14) => {
  if (name.length <= maxLength) {
    return name;
  }

  return `${name.slice(0, Math.max(0, maxLength - 1)).trimEnd()}...`;
};

const rouletteBackground =
  'radial-gradient(circle at top left, rgba(16,185,129,0.26), transparent 34%), radial-gradient(circle at bottom right, rgba(245,158,11,0.24), transparent 30%), radial-gradient(circle at center, rgba(139,92,246,0.14), transparent 42%)';

const rouletteShell =
  'absolute inset-0 bg-gradient-to-b from-emerald-500/18 via-amber-500/10 to-black/82';

const roulettePanel =
  'relative z-10 w-[min(96vw,96rem)] overflow-hidden rounded-[2.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10';

function QuienEsMasProbable({ participants, onBackToHub, onButtonPress }: QuienEsMasProbableProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [turnNumber, setTurnNumber] = useState(1);
  const [currentQuestion, setCurrentQuestion] = useState('');
  const [selectedVote, setSelectedVote] = useState<string | null>(null);
  const [revealSummary, setRevealSummary] = useState<RevealSummary | null>(null);
  const [participantScores, setParticipantScores] = useState<Record<string, number>>({});
  const [gameEnded, setGameEnded] = useState(false);
  const [lastVoteTargetId, setLastVoteTargetId] = useState<string | null>(null);
  const voteFlashTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (voteFlashTimerRef.current !== null) {
        window.clearTimeout(voteFlashTimerRef.current);
      }
      if (revealTimerRef.current !== null) {
        window.clearTimeout(revealTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted && participants.length >= 2) {
      const nextQuestion = getNextQuestion();
      const scores = participants.reduce<Record<string, number>>((acc, p) => {
        acc[p.id] = 0;
        return acc;
      }, {});

      setCurrentQuestion(nextQuestion);
      setParticipantScores(scores);
      setHasStarted(true);
    }
  }, [hasStarted, participants]);

  const hasVoted = selectedVote !== null;

  const castVote = (targetId: string) => {
    if (hasVoted || revealSummary || gameEnded) return;

    setSelectedVote(targetId);
    setLastVoteTargetId(targetId);

    if (voteFlashTimerRef.current !== null) {
      window.clearTimeout(voteFlashTimerRef.current);
    }

    voteFlashTimerRef.current = window.setTimeout(() => {
      setLastVoteTargetId(null);
      revealVote(targetId);
    }, 250);
  };

  const revealVote = (targetId: string) => {
    setRevealSummary({
      votedParticipantId: targetId,
      votes: 1,
    });

    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }

    revealTimerRef.current = window.setTimeout(() => {
      setParticipantScores((prev) => ({
        ...prev,
        [targetId]: (prev[targetId] ?? 0) + 1,
      }));
      loadNextTurn();
    }, 700);
  };

  const loadNextTurn = () => {
    const nextQuestion = getNextQuestion();

    setCurrentQuestion(nextQuestion);
    setSelectedVote(null);
    setRevealSummary(null);
    setLastVoteTargetId(null);
    setTurnNumber((prev) => prev + 1);
  };

  const restartGame = () => {
    if (participants.length < 2) return;

    const nextQuestion = getNextQuestion();
    const resetScores = participants.reduce<Record<string, number>>((acc, p) => {
      acc[p.id] = 0;
      return acc;
    }, {});

    if (voteFlashTimerRef.current !== null) {
      window.clearTimeout(voteFlashTimerRef.current);
    }

    if (revealTimerRef.current !== null) {
      window.clearTimeout(revealTimerRef.current);
    }

    setHasStarted(true);
    setTurnNumber(1);
    setCurrentQuestion(nextQuestion);
    setSelectedVote(null);
    setRevealSummary(null);
    setParticipantScores(resetScores);
    setGameEnded(false);
    setLastVoteTargetId(null);
  };

  const handleEndGame = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);
    setGameEnded(true);
  };

  const handleExit = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);
    onBackToHub();
  };

  const voteTarget = selectedVote
    ? participants.find((p) => p.id === selectedVote)
    : null;

  const scoresSorted = Object.entries(participantScores)
    .map(([id, votes]) => {
      const participant = participants.find((p) => p.id === id);
      return {
        id,
        name: participant?.name ?? '',
        votes,
        color: participant?.color ?? '#000000',
        avatar: participant?.avatar,
        avatarSeed: participant?.avatarSeed,
      };
    })
    .sort((a, b) => b.votes - a.votes);

  if (!hasStarted) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#0B1120] px-2 text-center text-white">
        <div className={rouletteShell} />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: rouletteBackground }} />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-xl font-black sm:text-2xl">Cargando juego...</p>
          <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-cyan-400" />
          </div>
        </div>
      </div>
    );
  }

  if (participants.length < 2) {
    return (
      <div className="relative flex h-screen items-center justify-center overflow-hidden bg-[#0B1120] px-2 text-center text-white">
        <div className={rouletteShell} />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: rouletteBackground }} />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 text-center shadow-2xl backdrop-blur-2xl">
          <p className="text-xl font-black sm:text-2xl">Pocos jugadores.</p>
          <p className="mt-1 text-sm text-white/70 sm:text-base">Necesitas al menos 2.</p>
          <LiquidButton
            className="mt-4 w-full !min-h-12 rounded-xl border border-cyan-300/20 bg-white/10 text-sm font-black text-white sm:!min-h-14 sm:text-base"
            onClick={handleExit}
            size="lg"
            variant="cool"
          >
            Volver
          </LiquidButton>
        </div>
      </div>
    );
  }

  if (gameEnded) {
    return (
      <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-transparent px-3 py-6 pt-24 font-fiesta text-white sm:px-4 sm:py-10 sm:pt-28">
        <div className={rouletteShell} />
        <div className="pointer-events-none absolute inset-0" style={{ backgroundImage: rouletteBackground }} />
        <div className="pointer-events-none absolute left-5 top-10 h-40 w-40 rounded-full bg-emerald-400/10 blur-3xl" />
        <div className="pointer-events-none absolute bottom-3 right-5 h-48 w-48 rounded-full bg-amber-400/10 blur-3xl" />

        <div className={roulettePanel}>
          <div className="relative z-10 flex flex-1 flex-col items-center justify-center gap-5 px-2 py-4 overflow-y-auto">
          <div className="text-center shrink-0">
            <div className="mb-2 flex justify-center text-5xl sm:text-6xl">
              <FaSkull className="animate-bounce text-red-500" />
            </div>
            <h1 className="text-4xl font-black sm:text-5xl">¡Terminado!</h1>
            <p className="mt-1 text-sm text-white/70 sm:text-base">
              {turnNumber - 1} rondas
            </p>
          </div>

          <div className="w-full max-w-2xl space-y-3">
            <h2 className="mb-2 text-base font-black uppercase tracking-wide text-center sm:text-lg">
              Ranking
            </h2>
            {scoresSorted.map((score, idx) => (
              <div
                key={score.id}
                className={`flex items-center gap-3 rounded-2xl border p-3 text-sm transition-all sm:p-4 sm:text-base ${
                  idx === 0
                    ? 'border-red-500/50 bg-red-500/10'
                    : idx === 1
                      ? 'border-yellow-500/30 bg-yellow-500/5'
                      : idx === 2
                        ? 'border-orange-500/30 bg-orange-500/5'
                        : 'border-white/10 bg-white/5'
                }`}
              >
                <div className="text-xl font-black sm:text-2xl">#{idx + 1}</div>
                <div className="flex-1 min-w-0">
                  <p className="truncate font-black text-white" title={score.name}>
                    {trimDisplayName(score.name, 18)}
                  </p>
                  <p className="text-xs text-white/60 sm:text-sm">
                    {score.votes} voto{score.votes !== 1 ? 's' : ''}
                  </p>
                </div>
                {idx === 0 && (
                  <div className="flex items-center gap-1 rounded-full bg-red-500/20 px-3 py-1.5">
                    <FaCrown className="text-xl text-red-400" />
                  </div>
                )}
              </div>
            ))}
          </div>

            <div className="mt-4 grid w-full gap-3 sm:grid-cols-2">
              <LiquidButton
                className="min-h-12 rounded-xl border border-white/15 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-lg active:scale-95 sm:min-h-14 sm:px-6 sm:text-base"
                onClick={handleExit}
                type="button"
                variant="default"
              >
                Volver al Hub
              </LiquidButton>
              <LiquidButton
                className="min-h-12 rounded-xl border border-cyan-300/20 bg-white/10 px-5 py-3 text-sm font-black text-white shadow-lg active:scale-95 sm:min-h-14 sm:px-6 sm:text-base"
                onClick={(event) => {
                  onButtonPress(event);
                  restartGame();
                }}
                type="button"
                variant="cool"
              >
                Volver a jugar
              </LiquidButton>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-start overflow-hidden bg-transparent px-3 py-6 pt-24 font-fiesta text-white sm:px-4 sm:py-10 sm:pt-28">
      <div className={rouletteShell} />
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.10),transparent_36%),linear-gradient(180deg,rgba(0,0,0,0.04),rgba(0,0,0,0.30))]" />
      <div className="pointer-events-none absolute left-10 top-14 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-8 h-80 w-80 rounded-full bg-amber-300/10 blur-3xl" />

      <div className={roulettePanel}>
        {/* Header Ultra Compacto */}
        <header className="shrink-0 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl sm:p-4">
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 sm:px-4 sm:py-2">
              <FaCrown className="h-3.5 w-3.5 text-cyan-200 sm:h-4 sm:w-4" />
            </div>

            <div className="flex items-center gap-1">
              <span className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100 sm:px-4 sm:py-1.5 sm:text-sm">
                Ronda {turnNumber}
              </span>
            </div>

            <button
              type="button"
              onClick={handleEndGame}
              className="flex items-center gap-2 rounded-full border border-red-300/20 bg-red-500/10 px-3 py-1.5 text-xs font-bold text-red-200 transition hover:bg-red-500/15 active:scale-95 sm:px-4 sm:py-2 sm:text-sm"
            >
              <FaStopCircle className="h-3.5 w-3.5" />
              Stop
            </button>
          </div>
        </header>

        {/* Pregunta Compacta Flotante */}
        <div className="flex flex-1 items-center justify-center py-3 sm:py-5">
          <div className="group relative w-full max-w-2xl">
            {/* Fondo decorativo animado */}
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-cyan-500/15 via-fuchsia-500/15 to-pink-500/15 blur-2xl transition-opacity duration-700 group-hover:opacity-100 sm:opacity-60" />

            {/* Card de la pregunta */}
            <div
              className="relative mx-auto w-full rounded-[1.75rem] border border-cyan-400/40 bg-gradient-to-br from-cyan-500/10 via-fuchsia-500/8 to-pink-500/10 p-4 shadow-[0_0_40px_rgba(6,182,212,0.15)] transition-all duration-500 sm:p-6"
              style={{
                animation: 'float 3s ease-in-out infinite, pulse-glow 2s ease-in-out infinite',
              }}
            >
              <style>{`
                @keyframes float {
                  0%, 100% { transform: translateY(0px) rotateZ(-0.5deg); }
                  50% { transform: translateY(-8px) rotateZ(0.5deg); }
                }
                @keyframes pulse-glow {
                  0%, 100% { box-shadow: 0 0 40px rgba(6,182,212,0.15), 0 0 60px rgba(168,85,247,0.08); }
                  50% { box-shadow: 0 0 60px rgba(6,182,212,0.25), 0 0 90px rgba(168,85,247,0.15); }
                }
              `}</style>

              <div className="text-center">
                <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/70 sm:text-sm">
                  ¿Quién es más probable que...?
                </p>
                <p className="mt-3 text-lg font-black leading-tight text-white sm:text-2xl">
                  {currentQuestion}
                </p>
              </div>

              {/* Brillo decorativo */}
              <div className="pointer-events-none absolute inset-0 rounded-[1.75rem] bg-gradient-to-b from-white/15 via-transparent to-transparent opacity-30" />
            </div>
          </div>
        </div>

        {/* Votantes - Grid Ultra Compacto */}
        <section className="mt-3 flex-1 min-h-0 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl sm:p-4">
          <div className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40 sm:text-sm">
            Vota ({participants.length} jugadores)
          </div>

          <div className="grid h-full min-h-0 auto-rows-max grid-cols-2 gap-2 overflow-y-auto sm:grid-cols-3 sm:gap-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6">
            {participants.map((participant) => {
              const isHighlighted = lastVoteTargetId === participant.id;
              const currentScore = participantScores[participant.id] ?? 0;

              return (
                <button
                  key={participant.id}
                  type="button"
                  onClick={(event) => {
                    onButtonPress(event);
                    castVote(participant.id);
                  }}
                  disabled={hasVoted || revealSummary !== null}
                  className={`group relative overflow-hidden rounded-xl border transition-all duration-150 active:scale-95 ${hasVoted || revealSummary ? 'cursor-not-allowed opacity-60' : 'border-white/15 bg-gradient-to-br from-white/10 to-white/5 hover:border-white/30'}`}
                  style={{
                    boxShadow: isHighlighted
                      ? `0 0 0 1.5px ${participant.color}, 0 0 20px ${participant.color}80`
                      : '0 2px 12px rgba(0,0,0,0.2)',
                  }}
                >
                  <div className="relative z-10 flex flex-col items-center gap-2 p-3 text-center sm:p-4">
                    <div className="relative">
                      <ParticipantAvatarBadge
                        alt={participant.name}
                        avatar={participant.avatar}
                        backgroundColor={participant.color}
                        seed={participant.avatarSeed}
                        sizeClassName="h-11 w-11 sm:h-12 sm:w-12"
                      />
                      {isHighlighted && (
                        <div
                          className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border border-white/30 bg-cyan-500 animate-pulse sm:h-6 sm:w-6"
                          style={{ animationDuration: '0.45s' }}
                        >
                          <FaCheckCircle className="h-3 w-3 text-white" />
                        </div>
                      )}
                    </div>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-bold text-white sm:text-base" title={participant.name}>
                        {trimDisplayName(participant.name, 12)}
                      </p>
                      {currentScore > 0 && (
                        <p className={`text-xs font-bold sm:text-sm ${currentScore >= 3 ? 'text-red-400' : 'text-yellow-400'}`}>
                          {currentScore}
                        </p>
                      )}
                    </div>
                  </div>

                  <div
                    className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-br from-white/10 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
                    style={{ backgroundColor: `${participant.color}15` }}
                  />
                </button>
              );
            })}
          </div>
        </section>

        {/* Panel de Scores Minimal */}
        <div className="mt-3 rounded-2xl border border-white/10 bg-black/40 p-2 backdrop-blur-xl sm:p-3">
          <div className="flex items-center gap-1 overflow-x-auto pb-1">
            {scoresSorted.slice(0, 6).map((score, idx) => (
              <div
                key={score.id}
                className={`shrink-0 rounded-xl border px-2 py-1 text-center text-xs font-bold sm:px-3 sm:py-1.5 sm:text-sm ${
                  idx === 0
                    ? 'border-red-500/40 bg-red-500/15 text-red-300'
                    : 'border-white/15 bg-white/5 text-white/70'
                }`}
              >
                <p className="truncate font-black text-white" title={score.name}>
                  {trimDisplayName(score.name, 12)}
                </p>
                <p className="text-[0.65rem] sm:text-xs">{score.votes}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Reveal Modal - Minimal */}
        {revealSummary && voteTarget && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
            <div className="animate-bounce rounded-[1.75rem] border-2 border-cyan-400/60 bg-gradient-to-br from-cyan-500/20 via-fuchsia-500/15 to-pink-500/20 p-5 text-center shadow-[0_0_80px_rgba(6,182,212,0.3)] sm:p-7">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-200 sm:text-sm">¡Voto registrado!</p>
              <p className="mt-2 text-4xl font-black text-white sm:text-5xl" title={voteTarget.name}>
                {trimDisplayName(voteTarget.name, 18)}
              </p>
              <div className="mx-auto mt-3 h-1 w-20 rounded-full bg-gradient-to-r from-cyan-400 to-fuchsia-500 opacity-60" />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default QuienEsMasProbable;
