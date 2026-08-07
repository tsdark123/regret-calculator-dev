import React, { useEffect, useRef, useState } from 'react';
import { GlobePulse } from './ui/cobe-globe-pulse';
import { Cover } from './ui/cover';
import { LocationMap } from './ui/expand-map';
import { Theme } from '../types';
import { cn } from '@/lib/utils';

interface GlobeSectionProps {
  theme: Theme;
}

const themeMarkerColors: Record<Theme, [number, number, number]> = {
  purple: [0.66, 0.33, 0.97],
  green: [0.13, 0.55, 0.13],
  blue: [0.23, 0.51, 0.96],
};

const themePulseColors: Record<Theme, string> = {
  purple: '#a855f7',
  green: '#22c55e',
  blue: '#3b82f6',
};

export const GlobeSection: React.FC<GlobeSectionProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const sectionRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  // Wave canvas: only run the expensive animation while the section is in view.
  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');
    let isVisibleRef = false;
    let isPaused = document.hidden || reducedMotion.matches;
    let animId: number | undefined;

    const waveData = Array.from({ length: 5 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      canvas!.width = section!.offsetWidth;
      canvas!.height = section!.offsetHeight;
    }

    let time = 0;

    function update() {
      waveData.forEach(d => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1;
        d.value += (d.targetValue - d.value) * d.speed;
      });
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      waveData.forEach((d, i) => {
        const freq = d.value * 7;
        ctx!.beginPath();
        // Lower resolution stepping to cut CPU cost
        for (let x = 0; x <= w; x += 4) {
          const nx = (x / w) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / waveData.length);
          const y = (py + 1) * h / 2;
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.3);
        const r = 40 + intensity * 60;
        const g = 40 + intensity * 80;
        ctx!.lineWidth = 0.8 + i * 0.2;
        ctx!.strokeStyle = `rgba(${r},${g},229,0.08)`;
        ctx!.shadowColor = `rgba(${r},${g},229,0.04)`;
        ctx!.shadowBlur = 2;
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      });
    }

    function animate() {
      if (isPaused || !isVisibleRef) {
        return;
      }

      time += 0.02;
      update();
      draw();
      animId = requestAnimationFrame(animate);
    }

    function scheduleIfNeeded() {
      if (animId) {
        cancelAnimationFrame(animId);
        animId = undefined;
      }

      if (isPaused || !isVisibleRef) {
        return;
      }

      animId = requestAnimationFrame(animate);
    }

    const resizeObserver = new ResizeObserver(resize);
    resizeObserver.observe(section);
    resize();

    const intersectionObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          isVisibleRef = entry.isIntersecting;
          setIsVisible(entry.isIntersecting);
          scheduleIfNeeded();
        });
      },
      { threshold: 0.1, rootMargin: '0px' }
    );
    intersectionObserver.observe(section);

    const handleVisibility = () => {
      isPaused = document.hidden || reducedMotion.matches;
      scheduleIfNeeded();
    };

    const handleMotionChange = (e: MediaQueryListEvent) => {
      isPaused = document.hidden || e.matches;
      scheduleIfNeeded();
    };

    document.addEventListener('visibilitychange', handleVisibility);
    reducedMotion.addEventListener('change', handleMotionChange);

    // Initial schedule
    scheduleIfNeeded();

    return () => {
      if (animId) cancelAnimationFrame(animId);
      resizeObserver.disconnect();
      intersectionObserver.disconnect();
      document.removeEventListener('visibilitychange', handleVisibility);
      reducedMotion.removeEventListener('change', handleMotionChange);
    };
  }, []);

  const beamColor = { purple: '#a855f7', green: '#10b981', blue: '#3b82f6' }[theme];
  const beamStyle = (reverse: boolean, delay: string): React.CSSProperties => ({
    position: 'absolute',
    left: 0,
    width: '30%',
    height: '1px',
    background: `linear-gradient(to right, transparent, ${beamColor}, transparent)`,
    animation: `beam-slide 4s linear infinite`,
    animationDelay: delay,
    animationDirection: reverse ? 'reverse' : 'normal',
    pointerEvents: 'none',
    zIndex: 20,
  });

  return (
    <section ref={sectionRef} className="flex w-full pt-2 pb-8 md:py-12 flex-col items-center justify-center select-none md:border-t md:border-b relative flex-shrink-0" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-100" />
      <div className="hidden md:block" style={{ ...beamStyle(false, '0s'), top: -1 }} />
      <div className="hidden md:block" style={{ ...beamStyle(true, '-2s'), top: -1 }} />
      <div className="hidden md:block" style={{ ...beamStyle(false, '-1s'), bottom: -1 }} />
      <div className="hidden md:block" style={{ ...beamStyle(true, '-3s'), bottom: -1 }} />
      <div className="relative z-10 text-center mb-2 md:mb-10 flex flex-col items-center gap-3 -mt-12 md:mt-0 px-4">
        {/* Mobile heading: explicit line breaks */}
        <h2 className="md:hidden text-[clamp(1.5rem,_7vw,_2rem)] font-semibold mx-auto text-center relative z-20 py-2 text-[var(--text-main)] leading-tight">
          Regret Calculator has been<br />
          used in over{" "}
          <Cover className="font-bold" lightMode={theme === 'blue'} active={isVisible}>42 countries</Cover>
        </h2>
        {/* Desktop heading: original single-line flow */}
        <h2 className="hidden md:block text-3xl md:text-4xl lg:text-5xl font-semibold max-w-3xl mx-auto text-center relative z-20 py-2 text-[var(--text-main)]">
          Regret Calculator has been used in over{" "}
          <Cover className="font-bold" lightMode={theme === 'blue'} active={isVisible}>42 countries</Cover>
        </h2>
        <p className="md:hidden mt-1 text-base text-[var(--text-muted)] max-w-xs leading-snug">
          See where we've helped people make<br />smarter financial decisions worldwide
        </p>
        <p className="hidden md:block mt-1 text-lg text-[var(--text-muted)]">
          See where we've helped people make smarter financial decisions worldwide
        </p>
      </div>
      {/* Symmetrical layout: card on left, globe slightly right of center */}
      <div className="hidden lg:block w-[1152px] h-[600px] mx-auto relative z-10">
        {/* Live Activity card — left side */}
        <div className="absolute left-0 top-1/2 -translate-y-1/2 flex flex-col items-center gap-3">
          <p className="text-[var(--text-muted)] text-[10px] font-medium tracking-[0.2em] uppercase">
            Recent Calculation
          </p>
          <LocationMap theme={theme} />
        </div>

        {/* Globe — slightly right of center for symmetry */}
        <div className="absolute right-0 top-1/2 -translate-y-1/2 w-[600px] h-[600px]">
          {isVisible && (
            <GlobePulse
              markerColor={themeMarkerColors[theme]}
              pulseColor={themePulseColors[theme]}
              speed={0.008}
              lightMode={theme === 'blue'}
              active={isVisible}
            />
          )}
        </div>
      </div>

      {/* Mobile: centered globe only — non-interactive (touch passes through to scroll-snap) */}
      <div className="lg:hidden w-[400px] h-[400px] max-w-full relative z-10">
        {isVisible && (
          <GlobePulse
            markerColor={themeMarkerColors[theme]}
            pulseColor={themePulseColors[theme]}
            speed={0.008}
            lightMode={theme === 'blue'}
            interactive={false}
            active={isVisible}
          />
        )}
      </div>
    </section>
  );
};
