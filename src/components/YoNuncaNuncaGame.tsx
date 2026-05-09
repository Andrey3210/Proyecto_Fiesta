import { useEffect, useRef, useState } from 'react';
import type { MouseEvent as ReactMouseEvent } from 'react';
import { FaCheckCircle, FaGlassCheers } from 'react-icons/fa';

import { LiquidButton } from '@/components/ui/liquid-glass-button';

import type { Participant } from '../App';

type YoNuncaNuncaGameProps = {
  participants: Participant[];
  onBackToHub: () => void;
  onButtonPress: (event: ReactMouseEvent<HTMLElement>) => void;
};

const prompts = [
  "he dejado a alguien plantado en una cita sin avisar",
  "he utilizado el 'no me acuerdo de esa noche' como excusa para algo",
  "me han metido el dedo en el culo sin esperármelo",
  "me he depilado y luego me he quedado con las ganas",
  "he durado menos de 5 minutos en la cama",
  "he estado con alguien mucho mayor que yo (10+ años)",
  "me he ido de un bar sin pagar la última ronda",
  "me he liado con alguno de los presentes en esta fiesta",
  "he probado drogas duras en un festival",
  "se me ha roto el condón y me he enterado al final",
  "me han quitado puntos del carnet por volver de fiesta",
  "he tenido que tomarme la pastilla del día después",
  "me he liado con más de 2 hermanos/as (o primos/as)",
  "he hecho sexting con alguien que ni siquiera me gustaba",
  "me he quedado insatisfecho después de hacerlo y lo he fingido",
  "me han atado a la cama (o yo he atado a alguien)",
  "me he liado con alguien que tenía pareja estable",
  "he tenido una ETS y me he curado en silencio",
  "he utilizado un juguete sexual en público (control remoto)",
  "he tenido un gatillazo en el momento más esperado",
  "he tardado menos de 24h en liarme con alguien después de terminar una relación",
  "me he liado con alguien para hacer daño a otra persona",
  "me he sentido atraído por la pareja de un amigo y se lo he contado",
  "me han hecho una cobra (sexo oral) y casi me duermo",
  "he escuchado a alguno de los presentes haciéndolo en la habitación de al lado",
  "me he grabado haciéndolo y luego borré el vídeo por miedo",
  "lo he hecho estando colocado y no recordaba casi nada",
  "me he inventado que me dolía algo para no hacerlo con alguien",
  "he visto a alguno de los presentes desnudo sin querer",
  "he intentado ligar con un famoso en un after",
  "he cancelado planes con mis amigos para tirarme a alguien",
  "lo he hecho en un coche y nos vieron los de la grúa",
  "he tenido una cita con alguien que he conocido por Tinder y era un catfish",
  "he usado un caramelo Halls para hacer una felación",
  "he mentido haciendo sexting enviando fotos falsas",
  "he escuchado a mis padres haciéndolo de adulto",
  "he besado a dos personas diferentes en la misma fiesta sin que se enteraran",
  "he fingido estar borracho para no hacer algo que me daba vergüenza",
  "he vomitado encima de alguien mientras bailaba",
  "he meado en la calle pensando que nadie me veía",
  "he robado un vaso de un bar como souvenir de la noche",
  "he dicho 'te quiero' borracho sin querer",
  "he mandado un audio de 5 minutos llorando por WhatsApp",
  "he desaparecido de una fiesta sin despedirme de nadie",
  "he ligado con la ex de un amigo a escondidas",
  "he llorado en el baño de una discoteca por algo estúpido",
  "he perdido las llaves de casa dos veces en la misma semana",
  "he dormido en el portal de mi edificio porque no podía abrir",
  "he ido a trabajar con la misma ropa de la fiesta",
  "he quedado con un ex solo por sexo y me he arrepentido al instante",
  "he hecho un trío y uno de ellos no me gustaba del todo",
  "he tenido sexo en una piscina y casi me ahogo",
  "he utilizado a alguien para darle celos a otra persona",
  "he fingido un orgasmo para que acabara rápido",
  "he dicho que era virgen para quedar bien",
  "he mentido sobre mi edad en una app de ligar",
  "he enviado una foto en pelotas por Snapchat y se ha guardado",
  "he hecho una videollamada explícita sin querer a un grupo de WhatsApp",
  "he estado con alguien solo porque me invitaba a copas",
  "he robado un mechero de un local de fiesta",
  "he bailado encima de una mesa hasta que se rompió",
  "he perdido el conocimiento en una fiesta y me desperté en otro sitio",
  "he meado en un armario por error pensando que era el baño",
  "he cogido un uber de 50€ porque no había transporte público",
  "he quedado con alguien de Tinder y resultó ser mi profesor",
  "he tenido una aventura con el compañero de piso de mi amigo",
  "he ligado con alguien en un funeral (o evento serio)",
  "he tenido sexo en un camerino de un centro comercial",
  "he usado la tarjeta de crédito de mis padres para pagar una cita",
  "he fingido estar enfermo para no ir a clase después de fiesta",
  "he hecho un amarre o algo de brujería para conseguir a alguien",
  "he espiado el móvil de mi pareja mientras dormía",
  "he tenido una relación abierta y me arrepentí",
  "he compartido más de lo debido en una historia de Instagram borracho",
  "he stalkeado a alguien hasta encontrar su dirección",
  "he hecho que alguien se enamorara de mí solo por diversión",
  "he tenido sexo de pago (o aceptado dinero sin querer)",
  "he hecho un trío y salí llorando",
  "he tenido un sueño húmedo con alguien de esta fiesta",
  "he escrito un poema borracho y se lo mandé a la persona equivocada",
  "he hecho rayas de algo en el váter de una discoteca",
  "he besado a alguien con brackets y me enganché",
  "he tenido una cita a ciegas y me fui por la puerta de atrás",
  "he usado una aplicación para grabar conversaciones sin consentimiento",
  "he dicho 'te voy a llamar' y bloqueé al momento",
  "he hecho llorar a alguien borracho y no me acuerdo",
  "he tenido sexo en una hamaca y nos caímos",
  "he tocado el piano borracho en un bar que no era el mío",
  "he llevado a alguien a un after y se durmió en mi sofá tres días",
  "he echado de menos a un ex estando con otra persona en la cama",
  "he tenido una relación de verano que destruí a propósito",
  "he enviado un mensaje al chat de trabajo diciendo 'qué ganas de follar'",
  "he fingido una llamada importante para irme de una cita horrible",
  "he compartido cama con alguien y me he hecho el dormido para no follar",
  "he hecho un juego de 'verdad o reto' y acabé desnudo en la calle",
  "he tenido que llamar a mis padres para que me recogieran de fiesta",
  "he perdido mi dentadura postiza (o un diente falso) en un beso",
  "he metido a alguien en casa de mis padres sin que se enteraran",
  "he tenido un orgasmo mientras conducía (con vibrador o manual)",
  "he hecho sexo tántrico y me reí todo el rato",
  "he usado el dinero de la compra para comprar alcohol",
  "he hecho una fiesta privada y nos desalojó la policía",
  "he mandado una foto en pelotas a mi grupo de amigos por error",
  "he ligado con alguien en un velatorio",
  "he tenido relaciones en un confesionario de iglesia",
  "he hecho una orgía y solo recuerdo la mitad de los participantes",
  "he tenido una pelea con mi mejor amigo porque nos gustaba la misma persona",
  "he ignorado deliberadamente a alguien que me escribió 'hola' repetido",
  "he hecho una lista con 'pros y contras' de mis ligues",
  "he llorado escuchando 'Bad Bunny' después de una noche loca",
  "he dejado a alguien por mensaje de texto y luego me arrepentí",
  "he hecho un trío con dos personas que se odiaban",
  "he tenido una noche loca y al día siguiente no recordaba mi nombre",
  "he usado la aplicación de 'Mepinto' para algo ilegal",
  "he hecho que alguien me mantuviera un mes a cambio de sexo",
  "he tenido un lío con mi mejor amiga y ahora es raro",
  "he practicado BDSM sin saber lo que hacía",
  "he tenido que ir a urgencias por algo sexual",
  "he hecho una broma pesada que acabó con alguien llorando",
  "he tenido una aventura con la novia de mi hermano",
  "he dejado plantado a un amigo en medio de una fiesta por un ligue",
  "he hecho una apuesta sobre a quién me ligaba primero",
  "he tomado fotos sin consentimiento en una fiesta (y me arrepiento)",
  "he usado un disfraz sexual en una fiesta normal",
  "he hecho un 'pack' y se filtró a mis contactos",
  "he tenido sexo en un cine y nos echaron",
  "he pedido a alguien que me pegara durante el sexo",
  "he hecho un vídeo tutorial de cómo liar un porro borracho",
  "he salido en la foto de un desconocido haciendo el ridículo",
  "he contratado a un/a escort para un amigo de broma",
  "he ligado con alguien que resultó ser menor de edad sin saberlo",
  "he hecho un juego de roles enfermizo en la cama",
  "he tenido que fingir que me gustaba alguien para no herir sus sentimientos",
  "he robado algo de la casa de un ligue como trofeo",
  "he tenido una 'amiga con derechos' y me enamoré perdidamente",
  "he hecho ghosting después de dos años de relación",
  "he escrito una carta de amor borracho y la envié por correo postal",
  "he hecho una fiesta temática de pijamas y acabé en el hospital",
  "he gritado '¡este no es mi hijo!' en una fiesta de disfraces",
  "he meado en una botella porque no quería levantarme del sofá",
  "he tenido sexo en la terraza de un hotel y nos vieron",
  "he usado una aplicación de citas para encontrar trabajo (y funcionó)",
  "he hecho un trío con dos gemelos/as",
  "he tenido relaciones en un ascensor y se paró",
  "he fingido tener una enfermedad para no quedar con alguien",
  "he hecho un 'cameo' en una historia de Instagram sin permiso",
  "he compartido contraseñas de Netflix con un ligue que luego me bloqueó",
  "he llevado a alguien a una cita al McDonald's pensando que era fino",
  "he tenido un accidente de ibuprofeno con alcohol y acabé en urgencias",
  "he hecho un 'twerking' tan malo que me lesioné la espalda",
  "he grabado un karaoke borracho y lo subí a YouTube",
  "he dicho 'te voy a extrañar' a alguien que conocí hace 2 horas",
  "he hecho una rifa entre mis amigos para ver quién se ligaba a alguien",
  "he llorado delante de mi ex en una fiesta y no me acuerdo por qué",
  "he tenido sexo en un parque y me picaron mosquitos en partes íntimas",
  "he usado un disfraz de pato para ir a una fiesta de disfraces y ligar",
  "he hecho un altar con fotos de mi crush",
  "he simulado ser otra persona en una app de citas",
  "he pasado una noche entera viendo el móvil de mi pareja mientras dormía",
  "he hecho una transición de 'amigos a amantes' y destrocé el grupo",
  "he tenido un embarazo psicológico por un susto",
  "he tenido sexo con alguien y luego me pidió devolverle el dinero del uber",
  "he fingido ser gay/lesbiana para ligar con alguien del mismo sexo",
  "he hecho un 'sexting' con la persona equivocada y no me di cuenta",
  "he tenido una relación a distancia basada en mentiras",
  "he comprado un vibrador en una tienda 24h y me crucé con un conocido",
  "he hecho un 'challenge' de TikTok borracho y me rompí algo",
  "he tenido que pedir prestado un tampón a un desconocido en una fiesta",
  "he dejado una 'resaca moral' tan grande que cambié de número",
  "he hecho un trio con una pareja y al final me quería quedar con ella",
  "he tenido sexo en una biblioteca y me calló un bibliotecario",
  "he usado la frase 'es que soy muy intenso/a' como excusa para todo",
  "he hecho un juego de 'nunca nunca' y descubrí cosas que no quería",
  "he empezado una pelea en una fiesta por una copa",
  "he ligado con alguien y luego resultó ser mi primo lejano",
  "he hecho una cena romántica con velas y se quemó la cortina",
  "he tenido que salir por la ventana de la casa de un ligue porque llegaron sus padres",
  "he hecho un 'casting' sexual con varias personas y al final no elegí a nadie",
  "he usado la tarjeta de crédito de mi ex para comprar algo caro",
  "he hecho una 'petición de mano' falsa como broma en una fiesta",
  "he tenido relaciones en la ducha y resbalé",
  "he traicionado a un amigo contando un secreto a cambio de un favor sexual",
  "he hecho una 'ceremonia de sanación' con hierbas después de una ETS",
  "he tenido un sueño erótico con la madre/padre de un amigo y se lo conté",
  "he fingido tener un tatuaje temporal para parecer más interesante",
  "he hecho una fiesta de 'after after' que duró 3 días sin dormir",
  "he robado el cargador de un desconocido en un bar",
  "he tenido sexo con un desconocido en un coche compartido (uber, cabify)",
  "he hecho un 'match' en Tinder con mi ex y pensé en volver",
  "he tenido que llamar a una ambulancia por una borrachera",
  "he hecho una declaración de amor en un karaoke y todo el mundo se quedó en silencio",
  "he usado una muñeca inflable como decoración de fiesta",
  "he hecho una 'ruleta rusa' de besos con desconocidos",
  "he tenido sexo en la oficina después de una fiesta de empresa",
  "he tocado en una banda de fiesta sin saber tocar ningún instrumento",
  "he hecho que alguien se enamorara de mí por cómo bailo (y bailo mal)",
  "he tenido una cita de Tinder y acabé en una secta",
  "he hecho una 'quema de fotos' de mi ex en una hoguera de playa",
  "he tenido una aventura con un profesor/a después de clases",
  "he hecho un 'brindis' y se me cayó el vaso entero en la comida de alguien",
  "he fingido tener gemelos/mellizos para justificar dos citas el mismo día",
] as const;

const getNextPrompt = (): string =>
  prompts[Math.floor(Math.random() * prompts.length)] ?? prompts[0];

function YoNuncaNuncaGame({ participants, onBackToHub, onButtonPress }: YoNuncaNuncaGameProps) {
  const [hasStarted, setHasStarted] = useState(false);
  const [roundNumber, setRoundNumber] = useState(1);
  const [currentPrompt, setCurrentPrompt] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const feedbackTimerRef = useRef<number | null>(null);

  useEffect(() => {
    return () => {
      if (feedbackTimerRef.current !== null) {
        window.clearTimeout(feedbackTimerRef.current);
      }
    };
  }, []);

  useEffect(() => {
    if (!hasStarted && participants.length >= 2) {
      setCurrentPrompt(getNextPrompt());
      setHasStarted(true);
    }
  }, [hasStarted, participants]);

  const handleExit = (event: ReactMouseEvent<HTMLElement>) => {
    onButtonPress(event);
    onBackToHub();
  };

  const handleTakeShot = (event: ReactMouseEvent<HTMLElement>) => {
    if (showFeedback) return;

    onButtonPress(event);
    setShowFeedback(true);

    if (feedbackTimerRef.current !== null) {
      window.clearTimeout(feedbackTimerRef.current);
    }

    feedbackTimerRef.current = window.setTimeout(() => {
      setCurrentPrompt(getNextPrompt());
      setRoundNumber((prev) => prev + 1);
      setShowFeedback(false);
    }, 700);
  };

  const gameBackdropStyle = {
    backgroundColor: '#04131E',
    backgroundImage:
      'radial-gradient(circle at top left, rgba(34,197,94,0.24), transparent 32%), radial-gradient(circle at bottom right, rgba(14,165,233,0.20), transparent 30%), radial-gradient(circle at center, rgba(168,85,247,0.14), transparent 42%), linear-gradient(180deg, rgba(2,6,23,0.78), rgba(4,19,30,0.98))',
  };

  if (!hasStarted) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 text-center text-white" style={gameBackdropStyle}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.28),rgba(4,19,30,0.22))]" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xl font-black">Cargando juego...</p>
          <p className="mt-2 text-sm text-white/70">Necesitas al menos 2 jugadores.</p>
          <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-white/10">
            <div className="h-full w-1/2 animate-pulse bg-fuchsia-400" />
          </div>
          <LiquidButton
            className="mt-4 w-full !min-h-12 rounded-xl border border-white/15 bg-white/10 text-sm font-black text-white"
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

  if (participants.length < 2) {
    return (
      <div className="relative flex min-h-screen items-center justify-center overflow-hidden px-3 text-center text-white" style={gameBackdropStyle}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.20),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.16),transparent_32%),linear-gradient(180deg,rgba(2,6,23,0.28),rgba(4,19,30,0.22))]" />
        <div className="relative z-10 w-full max-w-sm rounded-2xl border border-white/10 bg-black/40 p-5 shadow-2xl backdrop-blur-2xl">
          <p className="text-xl font-black">Pocos jugadores.</p>
          <p className="mt-2 text-sm text-white/70">Necesitas al menos 2.</p>
          <LiquidButton
            className="mt-4 w-full !min-h-12 rounded-xl border border-white/15 bg-white/10 text-sm font-black text-white"
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

  return (
    <div className="relative flex min-h-[100svh] flex-col items-center justify-center overflow-hidden bg-transparent px-3 py-6 pt-16 font-fiesta text-white sm:px-4 sm:py-10 sm:pt-24">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(34,197,94,0.22),transparent_30%),radial-gradient(circle_at_bottom_right,rgba(14,165,233,0.18),transparent_32%),radial-gradient(circle_at_center,rgba(168,85,247,0.12),transparent_42%)]" />
      <div className="pointer-events-none absolute left-10 top-14 h-72 w-72 rounded-full bg-emerald-400/10 blur-3xl" />
      <div className="pointer-events-none absolute bottom-6 right-8 h-80 w-80 rounded-full bg-cyan-400/10 blur-3xl" />

      <div className="relative z-10 w-[min(96vw,96rem)] overflow-hidden rounded-[2.75rem] border border-white/10 bg-slate-950/80 p-5 shadow-[0_40px_120px_rgba(0,0,0,0.45)] backdrop-blur-2xl sm:p-10" style={gameBackdropStyle}>
        <div className="flex items-center justify-between gap-3 rounded-2xl border border-white/10 bg-black/40 p-3 backdrop-blur-xl sm:p-4">
          <div className="flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1.5 text-white/80 sm:px-4 sm:py-2">
            <FaGlassCheers className="h-3.5 w-3.5 text-cyan-200 sm:h-4 sm:w-4" />
          </div>

          <div className="rounded-full border border-cyan-300/20 bg-cyan-400/10 px-3 py-1 text-xs font-bold text-cyan-100 sm:px-4 sm:py-1.5 sm:text-sm">
            Ronda {roundNumber}
          </div>

          <div className="h-10 w-10 sm:h-12 sm:w-12" />
        </div>

        <div className="mt-5 flex flex-1 items-center justify-center py-3 sm:py-5">
          <div className="group relative w-full max-w-3xl">
            <div className="pointer-events-none absolute -inset-6 rounded-[2rem] bg-gradient-to-r from-emerald-500/15 via-cyan-500/15 to-violet-500/15 blur-2xl transition-opacity duration-700 group-hover:opacity-100 sm:opacity-60" />
            <div
              className="relative mx-auto w-full rounded-[1.75rem] border border-cyan-400/35 bg-gradient-to-br from-emerald-500/12 via-cyan-500/10 to-violet-500/10 p-5 text-center shadow-[0_0_40px_rgba(34,197,94,0.12)] sm:p-8"
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
                  0%, 100% { box-shadow: 0 0 40px rgba(34,197,94,0.12), 0 0 60px rgba(14,165,233,0.08); }
                  50% { box-shadow: 0 0 60px rgba(34,197,94,0.24), 0 0 90px rgba(14,165,233,0.14); }
                }
              `}</style>

              <p className="text-xs font-bold uppercase tracking-[0.35em] text-cyan-200/80 sm:text-sm">
                Yo nunca nunca
              </p>
              <p className="mt-3 text-2xl font-black leading-tight text-white sm:text-4xl">
                {currentPrompt}
              </p>
              <p className="mt-3 text-sm text-white/65 sm:text-base">
                {participants.length} jugadores en la mesa
              </p>

              <div className="mt-6 flex flex-col gap-3 sm:items-center sm:justify-center">
                <LiquidButton
                  className="min-h-14 rounded-[1.1rem] border border-cyan-300/25 bg-[linear-gradient(135deg,rgba(16,185,129,0.22),rgba(14,165,233,0.22),rgba(168,85,247,0.18))] px-5 py-3 text-sm font-black text-white shadow-[0_18px_45px_rgba(14,165,233,0.25)] transition hover:brightness-110 active:scale-95 sm:min-h-16 sm:px-7 sm:text-base"
                  onClick={handleTakeShot}
                  type="button"
                  variant="cool"
                >
                  <span className="flex items-center gap-2">
                    <span className="text-lg">🍸</span>
                    <span className="flex flex-col items-start leading-none">
                      <span className="text-base sm:text-lg">Me la tomo</span>
                      <span className="text-[0.65rem] font-semibold uppercase tracking-[0.22em] text-white/75">
                        Siguiente
                      </span>
                    </span>
                  </span>
                </LiquidButton>
              </div>
            </div>
          </div>
        </div>

        {showFeedback && (
          <div className="pointer-events-none fixed inset-0 z-50 flex items-center justify-center bg-black/45 backdrop-blur-sm">
            <div className="app-feedback-shot app-shot-burst flex flex-col items-center justify-center rounded-[2.5rem] border border-white/25 bg-[linear-gradient(135deg,rgba(34,197,94,0.22),rgba(14,165,233,0.28),rgba(168,85,247,0.42))] px-8 py-7 text-center shadow-[0_30px_90px_rgba(0,0,0,0.42)]">
              <FaCheckCircle className="text-4xl text-cyan-100 drop-shadow-[0_8px_18px_rgba(0,0,0,0.35)] sm:text-5xl" />
              <span className="mt-3 block text-[clamp(3.5rem,22vw,9rem)] font-black tracking-[0.15em] text-white drop-shadow-[0_12px_32px_rgba(0,0,0,0.52)]">
                HECHO
              </span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default YoNuncaNuncaGame;
