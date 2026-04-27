import { memo, useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

type DigitalGlitchProps = {
  baseColor: string;
  speed: number;
  glitchIntensity: number;
  rgbShift: number;
  scanlineDensity: number;
  scanlineOpacity: number;
  pulse?: {
    x: number;
    y: number;
    strength: number;
    radius: number;
  } | null;
};

type UniformTargets = {
  baseColor: THREE.Color;
  speed: number;
  glitchIntensity: number;
  rgbShift: number;
  scanlineDensity: number;
  scanlineOpacity: number;
};

const vertexShader = `
  void main() {
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;
  uniform vec2 u_resolution;
  uniform float u_time;
  uniform float u_glitch_intensity;
  uniform float u_rgb_shift;
  uniform float u_scanline_density;
  uniform float u_scanline_opacity;
  uniform vec3 u_base_color;
  uniform vec2 u_pulse_center;
  uniform float u_pulse_strength;
  uniform float u_pulse_radius;

  float random(vec2 p) {
    return fract(sin(dot(p.xy, vec2(12.9898, 78.233))) * 43758.5453);
  }
  
  float noise(float p) {
    return random(vec2(p, p * 2.0));
  }

  vec3 palette(float t) {
    vec3 a = vec3(0.08, 0.09, 0.16);
    vec3 b = vec3(0.32, 0.20, 0.45);
    vec3 c = vec3(0.55, 0.78, 1.00);
    vec3 d = vec3(0.18, 0.30, 0.62);
    return a + b * cos(6.28318 * (c * t + d));
  }

  void main() {
    vec2 uv = gl_FragCoord.xy / u_resolution.xy;
    vec2 centered = uv - 0.5;
    float pulseDistance = distance(gl_FragCoord.xy, u_pulse_center);
    float pulseMask = 1.0 - smoothstep(u_pulse_radius, u_pulse_radius * 0.15, pulseDistance);
    float pulseNoise = random(gl_FragCoord.xy * 0.07 + u_time);
    float time = u_time * 0.22;
    float glitch_time = floor(u_time * 10.0);
    float glitch_amount = noise(glitch_time) * u_glitch_intensity * 0.045;

    float glitchBand = fract(uv.y * 11.0 + noise(glitch_time) * 52.0);
    if (glitchBand > 0.965) {
      uv.x += glitch_amount;
    }

    float burst = step(0.992, fract(sin(u_time * 1.7 + uv.y * 24.0) * 43758.5453));
    uv.x += burst * (noise(glitch_time + uv.y * 10.0) - 0.5) * 0.08;

    vec2 pulseDirection = vec2(
      random(vec2(gl_FragCoord.y, u_time)) - 0.5,
      random(vec2(gl_FragCoord.x, u_time * 1.3)) - 0.5
    );
    uv += pulseDirection * pulseMask * u_pulse_strength * 0.18;
    uv.x += pulseMask * (pulseNoise - 0.5) * u_pulse_strength * 0.22;

    float wobble = sin(u_time * 0.65 + uv.y * 10.0) * 0.5 + 0.5;
    vec2 uv_r = uv + vec2(u_rgb_shift * wobble, 0.0);
    vec2 uv_g = uv;
    vec2 uv_b = uv - vec2(u_rgb_shift * (1.0 - wobble), 0.0);
    
    float pattern_r = step(0.5, fract(uv_r.x * 1.7 + u_time * 0.28));
    float pattern_g = step(0.5, fract(uv_g.x * 1.7 + u_time * 0.24));
    float pattern_b = step(0.5, fract(uv_b.x * 1.7 + u_time * 0.20));
    
    vec3 color = vec3(pattern_r, pattern_g, pattern_b);
    color *= u_base_color;

    float minorGrid = 1.0 - smoothstep(0.02, 0.045, min(
      abs(fract(uv.x * 6.0 + time * 0.12) - 0.5),
      abs(fract(uv.y * 9.0 - time * 0.08) - 0.5)
    ));
    float majorGrid = 1.0 - smoothstep(0.012, 0.025, min(
      abs(fract(uv.x * 2.5 + time * 0.05) - 0.5),
      abs(fract(uv.y * 3.5 - time * 0.04) - 0.5)
    ));
    float grid = minorGrid * 0.08 + majorGrid * 0.16;

    float scanline = sin(uv.y * u_scanline_density + u_time * 3.5) * 0.5 + 0.5;
    color *= mix(1.0, scanline, u_scanline_opacity * 0.24);
    color += grid * vec3(0.03, 0.045, 0.08);
    color += (random(uv + u_time) - 0.5) * 0.01;
    color = mix(color, palette(time + centered.x * 0.45 + centered.y * 0.25), 0.18 + 0.06 * sin(u_time * 0.65));
    color = mix(vec3(0.012, 0.016, 0.04), color, 0.84);
    color += pulseMask * u_pulse_strength * vec3(0.14, 0.18, 0.3);

    gl_FragColor = vec4(color, 1.0);
  }
`;

function hexToThreeColor(hex: string) {
  return new THREE.Color(hex);
}

function lerp(current: number, target: number, delta: number) {
  return current + (target - current) * delta;
}

function DigitalGlitch({
  baseColor,
  speed,
  glitchIntensity,
  rgbShift,
  scanlineDensity,
  scanlineOpacity,
  pulse,
}: DigitalGlitchProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isWebGLSupported] = useState(() => {
    if (typeof document === 'undefined') {
      return true;
    }

    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl') || canvas.getContext('experimental-webgl'));
  });

  const target = useMemo<UniformTargets>(
    () => ({
      baseColor: hexToThreeColor(baseColor),
      speed,
      glitchIntensity,
      rgbShift,
      scanlineDensity,
      scanlineOpacity,
    }),
    [baseColor, speed, glitchIntensity, rgbShift, scanlineDensity, scanlineOpacity],
  );

  const targetRef = useRef(target);
  const pulseRef = useRef(pulse);

  useEffect(() => {
    targetRef.current = target;
  }, [target]);

  useEffect(() => {
    pulseRef.current = pulse;
  }, [pulse]);

  useEffect(() => {
    const container = containerRef.current;

    if (!container) {
      return undefined;
    }

    const isTouchDevice = window.matchMedia('(pointer: coarse)').matches || window.innerWidth < 768;
    const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, isTouchDevice ? 1.05 : 1.5));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const clock = new THREE.Clock();

    const uniforms = {
      u_time: { value: 0 },
      u_resolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
      u_glitch_intensity: { value: targetRef.current.glitchIntensity },
      u_rgb_shift: { value: targetRef.current.rgbShift },
      u_scanline_density: { value: targetRef.current.scanlineDensity },
      u_scanline_opacity: { value: targetRef.current.scanlineOpacity },
      u_base_color: { value: targetRef.current.baseColor.clone() },
      u_pulse_center: { value: new THREE.Vector2(-10000, -10000) },
      u_pulse_strength: { value: 0 },
      u_pulse_radius: { value: 1 },
    };

    const material = new THREE.ShaderMaterial({
      vertexShader,
      fragmentShader,
      uniforms,
    });
    const geometry = new THREE.PlaneGeometry(2, 2);
    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    const current = {
      baseColor: targetRef.current.baseColor.clone(),
      speed: targetRef.current.speed,
      glitchIntensity: targetRef.current.glitchIntensity,
      rgbShift: targetRef.current.rgbShift,
      scanlineDensity: targetRef.current.scanlineDensity,
      scanlineOpacity: targetRef.current.scanlineOpacity,
    };

    let animationFrameId = 0;

    const resize = () => {
      const width = container.clientWidth || window.innerWidth;
      const height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height, false);
      uniforms.u_resolution.value.set(width, height);
    };

    const animate = () => {
      const next = targetRef.current;

      current.speed = lerp(current.speed, next.speed, 0.06);
      current.glitchIntensity = lerp(current.glitchIntensity, next.glitchIntensity, 0.06);
      current.rgbShift = lerp(current.rgbShift, next.rgbShift, 0.06);
      current.scanlineDensity = lerp(current.scanlineDensity, next.scanlineDensity, 0.06);
      current.scanlineOpacity = lerp(current.scanlineOpacity, next.scanlineOpacity, 0.06);
      current.baseColor.lerp(next.baseColor, 0.04);

      uniforms.u_time.value = clock.getElapsedTime() * current.speed;
      uniforms.u_glitch_intensity.value = current.glitchIntensity;
      uniforms.u_rgb_shift.value = current.rgbShift;
      uniforms.u_scanline_density.value = current.scanlineDensity;
      uniforms.u_scanline_opacity.value = current.scanlineOpacity;
      uniforms.u_base_color.value.copy(current.baseColor);
      if (pulseRef.current) {
        uniforms.u_pulse_center.value.set(pulseRef.current.x, pulseRef.current.y);
        uniforms.u_pulse_strength.value = pulseRef.current.strength;
        uniforms.u_pulse_radius.value = pulseRef.current.radius;
      } else {
        uniforms.u_pulse_center.value.set(-10000, -10000);
        uniforms.u_pulse_strength.value = 0;
        uniforms.u_pulse_radius.value = 1;
      }

      renderer.render(scene, camera);
      animationFrameId = window.requestAnimationFrame(animate);
    };

    window.addEventListener('resize', resize);
    resize();
    animationFrameId = window.requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resize);
      window.cancelAnimationFrame(animationFrameId);

      if (renderer.domElement.parentNode === container) {
        container.removeChild(renderer.domElement);
      }

      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, []);

  if (!isWebGLSupported) {
    return (
      <div className="flex h-full w-full items-center justify-center bg-black text-white">
        <div className="rounded-lg border border-red-500/50 bg-gray-900/50 p-8 text-center">
          <h2 className="text-2xl font-bold text-red-400">WebGL Not Supported</h2>
          <p className="mt-2 text-white/70">
            Sorry, your browser does not support WebGL, which is required for this animation.
          </p>
        </div>
      </div>
    );
  }

  return <div ref={containerRef} className="fixed inset-0 h-[100dvh] w-[100vw]" />;
}

export default memo(DigitalGlitch);
