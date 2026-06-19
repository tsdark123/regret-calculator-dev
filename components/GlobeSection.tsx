import React, { useEffect, useRef } from 'react';
import { GlobePulse } from './ui/cobe-globe-pulse';
import { Cover } from './ui/cover';
import { LocationMap } from './ui/expand-map';
import { Theme } from '../types';
import { cn } from '@/lib/utils';

interface GlobeSectionProps {
  theme: Theme;
}

const themeMarkerColors: Record<Theme, [number, number, number]> = {
  purple: [0.66, 0.33, 0.97],  // #a855f7
  green: [0.13, 0.55, 0.13],   // #22c55e
  blue: [0.23, 0.51, 0.96],    // #3b82f6
};

const themePulseColors: Record<Theme, string> = {
  purple: '#a855f7',
  green: '#22c55e',
  blue: '#3b82f6',
};

export const GlobeSection: React.FC<GlobeSectionProps> = ({ theme }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animId: number;

    const waveData = Array.from({ length: 8 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      canvas!.width = canvas!.parentElement?.offsetWidth || 0;
      canvas!.height = canvas!.parentElement?.offsetHeight || 0;
    }

    function update() {
      waveData.forEach(d => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1;
        d.value += (d.targetValue - d.value) * d.speed;
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      waveData.forEach((d, i) => {
        const freq = d.value * 7;
        ctx!.beginPath();
        for (let x = 0; x < canvas!.width; x++) {
          const nx = (x / canvas!.width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
          const y = (py + 1) * canvas!.height / 2;
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
      time += 0.02;
      update();
      draw();
      animId = requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
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
    <section className="hidden md:flex w-full py-12 flex-col items-center justify-center select-none border-t border-b relative flex-shrink-0" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-100" />
      <div style={{ ...beamStyle(false, '0s'), top: -1 }} />
      <div style={{ ...beamStyle(true, '-2s'), top: -1 }} />
      <div style={{ ...beamStyle(false, '-1s'), bottom: -1 }} />
      <div style={{ ...beamStyle(true, '-3s'), bottom: -1 }} />
      <div className="relative z-10 text-center mb-10 flex flex-col items-center gap-3">
        <h2 className="text-3xl md:text-4xl lg:text-5xl font-semibold max-w-3xl mx-auto text-center relative z-20 py-2 text-[var(--text-main)]">
          Regret Calculator has been used in over{" "}
          <Cover className="font-bold" lightMode={theme === 'blue'}>85 countries</Cover>
        </h2>
        <p className="mt-1 text-lg text-[var(--text-muted)]">
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
          <GlobePulse
            markerColor={themeMarkerColors[theme]}
            pulseColor={themePulseColors[theme]}
            speed={0.008}
            lightMode={theme === 'blue'}
          />
        </div>
      </div>

      {/* Mobile: centered globe only */}
      <div className="lg:hidden w-[400px] h-[400px] relative z-10">
        <GlobePulse
          markerColor={themeMarkerColors[theme]}
          pulseColor={themePulseColors[theme]}
          speed={0.008}
          lightMode={theme === 'blue'}
        />
      </div>
    </section>
  );
};
