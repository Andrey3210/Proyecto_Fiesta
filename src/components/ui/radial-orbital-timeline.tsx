"use client";

import { useEffect, useRef, useState } from 'react';
import type { ElementType, MouseEvent as ReactMouseEvent } from 'react';
import { ArrowRight, Link, Zap } from 'lucide-react';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

export interface TimelineItem {
  id: number;
  title: string;
  date: string;
  content: string;
  category: string;
  icon: ElementType;
  relatedIds: number[];
  status: 'completed' | 'in-progress' | 'pending';
  energy: number;
}

interface RadialOrbitalTimelineProps {
  timelineData: TimelineItem[];
  onItemSelect?: (item: TimelineItem) => void;
  onNodePress?: (event: ReactMouseEvent<HTMLElement>) => void;
  activeId?: number | null;
  title?: string;
  subtitle?: string;
}

export default function RadialOrbitalTimeline({
  timelineData,
  onItemSelect,
  onNodePress,
  activeId = null,
  title = 'Elige un juego',
  subtitle = 'Toca un nodo para abrirlo a pantalla completa.',
}: RadialOrbitalTimelineProps) {
  const [expandedId, setExpandedId] = useState<number | null>(activeId);
  const [pendingItem, setPendingItem] = useState<TimelineItem | null>(null);
  const [introSeed, setIntroSeed] = useState(0);

  const rotationRef   = useRef(0);
  const introRef      = useRef(0);
  const introDoneRef  = useRef(false);
  const autoRotateRef = useRef(true);
  const radiusRef     = useRef(216);
  const rotSpeedRef   = useRef(0.003);   // grados/ms â€” lento y constante
  const rafRef        = useRef(0);
  const nodeRefs      = useRef<(HTMLDivElement | null)[]>([]);

  // Responsive
  useEffect(() => {
    const update = () => {
      const small = window.innerWidth < 640;
      radiusRef.current   = small ? 118 : 216;
      rotSpeedRef.current = small ? 0.005 : 0.003;
    };
    update();
    window.addEventListener('resize', update);
    return () => window.removeEventListener('resize', update);
  }, []);

  // Loop
  useEffect(() => {
    const INTRO_MS = 1150;
    const start    = performance.now();
    let   last     = start;

    rotationRef.current  = 0;
    introRef.current     = 0;
    introDoneRef.current = false;
    autoRotateRef.current = true;

    const total = timelineData.length;

    function frame(now: number) {
      const delta = now - last;
      last = now;

      // 1. Intro: todos los nodos salen juntos al mismo ritmo
      if (!introDoneRef.current) {
        const elapsed = now - start;
        const t = Math.min(1, elapsed / INTRO_MS);
        // Ease agresivo: la órbita se abre más rápido al principio y se asienta antes.
        introRef.current = 1 - Math.pow(1 - t, 4);
        if (t >= 1) {
          introRef.current     = 1;
          introDoneRef.current = true;
        }
      }

      // 2. RotaciÃ³n constante
      if (autoRotateRef.current) {
        const introBoost = introDoneRef.current ? 1 : 1 + (1 - introRef.current) * 2.4;
        rotationRef.current =
          (rotationRef.current + delta * rotSpeedRef.current * introBoost) % 360;
      }

      // 3. Posicionar nodos
      const intro  = introRef.current;
      // Radio IDÃ‰NTICO para todos â€” no varÃ­a por Ã¡ngulo ni por Ã­ndice
      const r = radiusRef.current * intro;

      for (let i = 0; i < total; i++) {
        const el = nodeRefs.current[i];
        if (!el) continue;

        // Ãngulo: posiciÃ³n base + rotaciÃ³n global. Sin desfase individual.
        const baseAngle = (i / total) * 360;
        const angleDeg  = (baseAngle + rotationRef.current) % 360;
        const angleRad  = (angleDeg * Math.PI) / 180;

        const x = r * Math.cos(angleRad);
        const y = r * Math.sin(angleRad);

        // zIndex solo para que los nodos "delanteros" tapen a los traseros
        const zIndex = Math.round(100 + 50 * Math.sin(angleRad));

        el.style.transform = `translate3d(${x}px, ${y}px, 0)`;
        el.style.zIndex    = String(zIndex);
        el.style.opacity   = String(Math.min(1, intro * 1.4)); // aparecen suavemente
        el.style.willChange = 'transform';
      }

      rafRef.current = requestAnimationFrame(frame);
    }

    rafRef.current = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(rafRef.current);
  }, [timelineData.length, introSeed]);

  const getStatusStyles = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':   return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
      case 'in-progress': return 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100';
      case 'pending':     return 'border-amber-300/40 bg-amber-500/15 text-amber-100';
      default:            return 'border-white/20 bg-white/5 text-white/70';
    }
  };

  const handleBackgroundClick = (e: ReactMouseEvent<HTMLDivElement>) => {
    const target = e.target as Node;
    const isNode = nodeRefs.current.some(ref => ref?.contains(target));
    if (!isNode) {
      setExpandedId(null);
      autoRotateRef.current = true;
    }
  };

  const activeItem = expandedId
    ? timelineData.find(item => item.id === expandedId) ?? null
    : null;

  if (pendingItem) {
    return (
      <div className="fixed inset-0 z-[120] flex min-h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-5 pt-14 text-white app-fade-up sm:py-6 sm:pt-16">
        <div className="absolute inset-0 bg-black/18" />
        <div className="relative z-10 w-full max-w-7xl">
          <div className="mx-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center shadow-2xl backdrop-blur-2xl">
            <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
            <h2 className="mt-3 text-2xl font-black">Próximamente</h2>
            <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
              Tienes un comodín de 2 nuevos juegos porque no me alcanzó tiempo :(
            </p>
            <button
              className="mt-6 w-full rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
              onClick={(event) => {
                event.stopPropagation();
                setExpandedId(null);
                setPendingItem(null);
                autoRotateRef.current = true;
                setIntroSeed((value) => value + 1);
              }}
              type="button"
            >
              Volver al hub
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-5 pt-14 text-white sm:py-6 sm:pt-16"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 bg-black/18" />

      <div className="relative z-10 w-full max-w-7xl">
        <div className="mb-4 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/60">MondeFan</p>
          <h1 className="text-4xl font-black sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-xs text-slate-100/90 sm:text-base">{subtitle}</p>
        </div>

        <div className="relative flex min-h-[440px] items-center justify-center sm:min-h-[560px]">
          <div className="absolute inset-0 flex items-center justify-center">

            {/* NÃºcleo */}
            <div className="absolute h-24 w-24 rounded-full bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 opacity-95 shadow-[0_0_100px_rgba(255,255,255,0.32)] sm:h-32 sm:w-32" />

            {/* Anillos */}
            <div className="absolute h-36 w-36 rounded-full border border-white/12 sm:h-44 sm:w-44" />
            <div className="absolute h-64 w-64 rounded-full border border-white/10 sm:h-80 sm:w-80" />
            <div className="absolute h-[20rem] w-[20rem] rounded-full border border-white/10 sm:h-[26rem] sm:w-[26rem]" />

            {/* Nodos */}
            {timelineData.map((item, index) => {
              const isExpanded = expandedId === item.id;
              const isPending  = item.status === 'pending';
              const Icon       = item.icon;

              return (
                <div
                  key={item.id}
                  ref={el => { nodeRefs.current[index] = el; }}
                  className={cn(
                    'absolute transform-gpu',
                    isPending ? 'cursor-default' : 'cursor-pointer',
                  )}
                  style={{
                    zIndex:     isExpanded ? 200 : undefined,
                    opacity:    isExpanded ? 1   : undefined,
                    transition: 'none',
                  }}
                  role="button"
                  tabIndex={0}
                  aria-label={isPending ? `${item.title}, prÃ³ximamente` : `Abrir ${item.title}`}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (isPending) {
                      setPendingItem(item);
                      autoRotateRef.current = false;
                      return;
                    }
                    onNodePress?.(e);
                    setExpandedId(item.id);
                    autoRotateRef.current = false;
                    onItemSelect?.(item);
                  }}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      e.preventDefault();
                      if (isPending) {
                        setPendingItem(item);
                        autoRotateRef.current = false;
                        return;
                      }
                      setExpandedId(item.id);
                      autoRotateRef.current = false;
                      onItemSelect?.(item);
                    }
                  }}
                >
                  {/* Halo */}
                  <div
                    className={cn(
                      'absolute -inset-4 rounded-full blur-2xl transition-opacity duration-300',
                      isExpanded ? 'opacity-100' : isPending ? 'opacity-35' : 'opacity-60',
                    )}
                    style={{
                      background: `radial-gradient(circle, ${
                        item.category === 'Ruleta'           ? 'rgba(236,72,153,0.45)'
                        : item.category === 'Verdad o Shot'  ? 'rgba(59,130,246,0.45)'
                        : item.category === 'Verdad o Reto'  ? 'rgba(251,191,36,0.45)'
                        : item.category === 'Quién es más probable' ? 'rgba(6,182,212,0.45)'
                        : item.category === 'Impostor'       ? 'rgba(34,197,94,0.35)'
                        :                                      'rgba(251,191,36,0.35)'
                      } 0%, rgba(0,0,0,0) 72%)`,
                    }}
                  />

                  {/* Icono */}
                  <div
                    className={cn(
                      'relative flex h-16 w-16 items-center justify-center rounded-full border-2 backdrop-blur-xl transition-all duration-300 sm:h-24 sm:w-24',
                      isExpanded
                        ? 'border-white bg-white text-slate-950 shadow-[0_0_44px_rgba(255,255,255,0.45)]'
                        : isPending
                        ? 'border-white/35 bg-black/50 text-white shadow-[0_0_28px_rgba(255,255,255,0.12)]'
                        : 'border-white/35 bg-black/50 text-white shadow-[0_0_28px_rgba(255,255,255,0.12)]',
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  {/* Etiqueta */}
                  <div
                    className={cn(
                      'absolute left-1/2 top-24 -translate-x-1/2 whitespace-nowrap text-sm font-semibold',
                      isExpanded ? 'text-white' : isPending ? 'text-white/70' : 'text-white/75',
                    )}
                  >
                    {item.title}
                  </div>

                  {/* Card expandida */}
                  {isExpanded && (
                    <Card className="absolute left-1/2 top-32 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 border-white/10 bg-slate-950/90 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className={cn('border', getStatusStyles(item.status))}>
                            {item.status === 'completed'   ? 'LISTO'
                              : item.status === 'in-progress' ? 'ACTIVO'
                              : 'NUEVO'}
                          </Badge>
                          <span className="text-xs font-mono text-white/50">{item.date}</span>
                        </div>
                        <CardTitle className="mt-2 text-xl">
                          {isPending ? 'ComodÃ­n desbloqueado' : item.title}
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-white/80">
                        {isPending ? (
                          <>
                            <p>{item.content}</p>
                            <p className="rounded-2xl border border-amber-300/20 bg-amber-500/10 p-4 text-amber-50">
                              Hay 2 juegos nuevos pensados para despuÃ©s, y van a salir cuando sigamos sumando contenido.
                            </p>
                          </>
                        ) : (
                          <p>{item.content}</p>
                        )}

                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                            <span className="flex items-center gap-1">
                              <Zap size={12} />
                              EnergÃ­a
                            </span>
                            <span>{item.energy}%</span>
                          </div>
                          <div className="h-1.5 overflow-hidden rounded-full bg-white/10">
                            <div
                              className="h-full rounded-full bg-gradient-to-r from-fuchsia-500 via-cyan-400 to-emerald-400"
                              style={{ width: `${item.energy}%` }}
                            />
                          </div>
                        </div>

                        {item.relatedIds.length > 0 && !isPending && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-white/60">
                              <Link size={12} />
                              Relacionado
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.relatedIds.map(relatedId => {
                                const rel = timelineData.find(e => e.id === relatedId);
                                if (!rel) return null;
                                return (
                                  <Button
                                    key={relatedId}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full border-white/15 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                                    onClick={e => {
                                      e.stopPropagation();
                                      setExpandedId(rel.id);
                                      onItemSelect?.(rel);
                                    }}
                                  >
                                    {rel.title}
                                    <ArrowRight size={12} className="ml-1" />
                                  </Button>
                                );
                              })}
                            </div>
                          </div>
                        )}
                      </CardContent>
                    </Card>
                  )}
                </div>
              );
            })}
          </div>

          {activeItem && (
            <div className="pointer-events-none absolute inset-x-4 bottom-4 flex justify-center">
              <div className="pointer-events-auto w-full max-w-md rounded-[2rem] border border-white/10 bg-slate-950/70 px-5 py-4 text-center shadow-2xl backdrop-blur-2xl">
                <p className="text-xs uppercase tracking-[0.35em] text-white/50">Seleccionado</p>
                <p className="mt-2 text-lg font-semibold text-white">{activeItem.title}</p>
                <p className="mt-1 text-sm text-white/70">{activeItem.content}</p>
              </div>
            </div>
          )}          {pendingItem && (
            <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/70 px-4 pb-8 backdrop-blur-sm sm:pb-12">
              <div className="w-full max-w-md overflow-hidden rounded-[2rem] border border-white/10 bg-slate-950/90 p-6 text-center text-white shadow-2xl">
                <p className="text-sm uppercase tracking-[0.45em] text-white/60">Aviso</p>
                <h2 className="mt-3 text-2xl font-black">Próximamente</h2>
                <p className="mt-4 rounded-2xl border border-white/10 bg-white/5 p-4 text-slate-200">
                  Tienes un comodín de 2 nuevos juegos porque no me alcanzó tiempo :(
                </p>
                <div className="mt-6 flex justify-center">
                  <button
                    className="rounded-2xl bg-white px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-white/90"
                    onClick={() => setPendingItem(null)}
                    type="button"
                  >
                    Entendido
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}


