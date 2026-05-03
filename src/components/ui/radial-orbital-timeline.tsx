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
  const [rotationAngle, setRotationAngle] = useState(0);
  const [autoRotate, setAutoRotate] = useState(false);
  const [canAutoRotate, setCanAutoRotate] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const orbitRef = useRef<HTMLDivElement>(null);
  const [radius, setRadius] = useState(170);

  useEffect(() => {
    if (!autoRotate) {
      return undefined;
    }

    const interval = window.setInterval(() => {
      setRotationAngle((current) => (current + 0.08) % 360);
    }, 32);

    return () => window.clearInterval(interval);
  }, [autoRotate]);

  const handleBackgroundClick = (event: ReactMouseEvent<HTMLDivElement>) => {
    if (event.target === containerRef.current || event.target === orbitRef.current) {
      setExpandedId(null);
      setAutoRotate(canAutoRotate);
    }
  };

  useEffect(() => {
    const updateRadius = () => {
      setCanAutoRotate(window.innerWidth >= 768);
      setAutoRotate(window.innerWidth >= 768);
      setRadius(window.innerWidth < 640 ? 138 : 216);
    };

    updateRadius();
    window.addEventListener('resize', updateRadius);

    return () => window.removeEventListener('resize', updateRadius);
  }, []);

  const calculateNodePosition = (index: number, total: number) => {
    const angle = ((index / total) * 360 + rotationAngle) % 360;
    const radian = (angle * Math.PI) / 180;
    const x = radius * Math.cos(radian);
    const y = radius * Math.sin(radian);
    const zIndex = Math.round(100 + 50 * Math.cos(radian));
    const opacity = Math.max(0.72, 0.78 + 0.22 * ((1 + Math.sin(radian)) / 2));

    return { x, y, zIndex, opacity };
  };

  const getStatusStyles = (status: TimelineItem['status']) => {
    switch (status) {
      case 'completed':
        return 'border-emerald-400/50 bg-emerald-500/15 text-emerald-100';
      case 'in-progress':
        return 'border-cyan-400/50 bg-cyan-500/15 text-cyan-100';
      default:
        return 'border-white/20 bg-white/5 text-white/70';
    }
  };

  const activeItem = expandedId
    ? timelineData.find((item) => item.id === expandedId) ?? null
    : null;

  return (
    <div
      ref={containerRef}
      className="relative flex h-[100dvh] w-full items-center justify-center overflow-hidden px-4 py-6 pt-16 text-white app-fade-up"
      onClick={handleBackgroundClick}
    >
      <div className="absolute inset-0 bg-black/18" />

      <div className="relative z-10 w-full max-w-7xl">
        <div className="mb-4 text-center">
          <p className="mb-3 text-xs uppercase tracking-[0.5em] text-white/60">
            MondeFan
          </p>
          <h1 className="text-5xl font-black sm:text-6xl">{title}</h1>
          <p className="mx-auto mt-3 max-w-3xl text-sm text-slate-100/90 sm:text-base">
            {subtitle}
          </p>
        </div>

        <div className="relative flex min-h-[560px] items-center justify-center">
          <div
            ref={orbitRef}
            className="absolute inset-0 flex items-center justify-center"
            style={{ transform: 'translate(0px, 0px)' }}
          >
            <div className="absolute h-32 w-32 rounded-full bg-gradient-to-br from-fuchsia-500 via-indigo-500 to-cyan-400 opacity-95 shadow-[0_0_100px_rgba(255,255,255,0.32)]" />
            <div className="absolute h-44 w-44 rounded-full border border-white/12" />
            <div className="absolute h-80 w-80 rounded-full border border-white/10" />
            <div className="absolute h-[26rem] w-[26rem] rounded-full border border-white/10" />

            {timelineData.map((item, index) => {
              const position = calculateNodePosition(index, timelineData.length);
              const isExpanded = expandedId === item.id;
              const Icon = item.icon;

              return (
                <div
                  key={item.id}
                  className={cn(
                    'absolute cursor-pointer transition-transform duration-300',
                    isExpanded ? 'scale-110' : 'hover:scale-105',
                  )}
                  role="button"
                  tabIndex={0}
                  aria-label={`Abrir ${item.title}`}
                  style={{
                    transform: `translate(${position.x}px, ${position.y}px)`,
                    zIndex: isExpanded ? 200 : position.zIndex,
                    opacity: isExpanded ? 1 : position.opacity,
                  }}
                  onClick={(event) => {
                    event.stopPropagation();
                    onNodePress?.(event);
                    setExpandedId(item.id);
                    setAutoRotate(false);
                    onItemSelect?.(item);
                  }}
                  onKeyDown={(event) => {
                    if (event.key === 'Enter' || event.key === ' ') {
                      event.preventDefault();
                      setExpandedId(item.id);
                      setAutoRotate(false);
                      onItemSelect?.(item);
                    }
                  }}
                >
                  <div
                    className={cn(
                      'absolute -inset-4 rounded-full blur-2xl transition-opacity duration-300',
                      isExpanded ? 'opacity-100' : 'opacity-60',
                    )}
                    style={{
                      background: `radial-gradient(circle, ${item.category === 'Ruleta' ? 'rgba(236,72,153,0.45)' : item.category === 'Verdad o Shot' ? 'rgba(59,130,246,0.45)' : 'rgba(34,197,94,0.35)'} 0%, rgba(0,0,0,0) 72%)`,
                    }}
                  />

                  <div
                    className={cn(
                      'relative flex h-20 w-20 items-center justify-center rounded-full border-2 backdrop-blur-xl transition-all duration-300 sm:h-24 sm:w-24',
                      isExpanded
                        ? 'border-white bg-white text-slate-950 shadow-[0_0_44px_rgba(255,255,255,0.45)]'
                        : 'border-white/35 bg-black/50 text-white shadow-[0_0_28px_rgba(255,255,255,0.12)]',
                    )}
                  >
                    <Icon size={24} />
                  </div>

                  <div
                    className={cn(
                      'absolute left-1/2 top-24 -translate-x-1/2 whitespace-nowrap text-sm font-semibold transition-all duration-300',
                      isExpanded ? 'scale-110 text-white' : 'text-white/75',
                    )}
                  >
                    {item.title}
                  </div>

                  {isExpanded && (
                    <Card className="absolute left-1/2 top-32 w-[min(24rem,calc(100vw-2rem))] -translate-x-1/2 border-white/10 bg-slate-950/90 shadow-2xl shadow-black/40 backdrop-blur-2xl">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between gap-3">
                          <Badge className={cn('border', getStatusStyles(item.status))}>
                            {item.status === 'completed'
                              ? 'LISTO'
                              : item.status === 'in-progress'
                                ? 'ACTIVO'
                                : 'PRONTO'}
                          </Badge>
                          <span className="text-xs font-mono text-white/50">{item.date}</span>
                        </div>
                        <CardTitle className="mt-2 text-xl">{item.title}</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4 text-sm text-white/80">
                        <p>{item.content}</p>
                        <div className="rounded-2xl border border-white/10 bg-white/5 p-3">
                          <div className="mb-2 flex items-center justify-between text-xs text-white/70">
                            <span className="flex items-center gap-1">
                              <Zap size={12} />
                              Energ?a
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

                        {item.relatedIds.length > 0 && (
                          <div className="space-y-2">
                            <div className="flex items-center gap-1 text-xs uppercase tracking-[0.3em] text-white/60">
                              <Link size={12} />
                              Relacionado
                            </div>
                            <div className="flex flex-wrap gap-2">
                              {item.relatedIds.map((relatedId) => {
                                const relatedItem = timelineData.find((entry) => entry.id === relatedId);

                                if (!relatedItem) {
                                  return null;
                                }

                                return (
                                  <Button
                                    key={relatedId}
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    className="h-8 rounded-full border-white/15 bg-white/5 px-3 text-xs text-white hover:bg-white/10"
                                    onClick={(event) => {
                                      event.stopPropagation();
                                      setExpandedId(relatedItem.id);
                                      onItemSelect?.(relatedItem);
                                    }}
                                  >
                                    {relatedItem.title}
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
          )}
        </div>
      </div>
    </div>
  );
}
