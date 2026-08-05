import React, { useEffect, useRef, useState } from 'react';
import { motion, Variants } from 'framer-motion';
import { TrendingUp } from 'lucide-react';

const containerVariants: Variants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.18 },
  },
};

const itemVariants: Variants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 100, damping: 15 },
  },
};

const features: React.ReactNode[] = [
  '💸 Enter any daily or monthly expense.',
  '📈 Pick a stock, ETF, or crypto to compare.',
  '📉 See decades of compound growth you\'re missing.',
  '⚖️ Toggle inflation adjustment.',
  '📤 Share the result. Let it sink in.',
];

const footer = (
  <p className="pt-2 text-2xl text-[var(--text-muted)]">
    Free. Private. No sign-up required.
  </p>
);

export const FeaturesReveal: React.FC = () => {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
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

    // Fewer, simpler waves than before for a lighter render loop
    const waveData = Array.from({ length: 5 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      canvas!.width = section!.offsetWidth;
      canvas!.height = section!.offsetHeight;
    }

    function draw() {
      const w = canvas!.width;
      const h = canvas!.height;
      ctx!.clearRect(0, 0, w, h);

      waveData.forEach((d, i) => {
        const freq = d.value * 7;
        ctx!.beginPath();
        // Lower resolution stepping: only calculate every 4 pixels to cut CPU cost
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

    let time = 0;

    function update() {
      waveData.forEach(d => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1;
        d.value += (d.targetValue - d.value) * d.speed;
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
        // When paused (hidden or reduced motion), stop the loop to save CPU.
        // We don't redraw a static frame because the section is already off-screen.
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
      { threshold: 0.1, rootMargin: '100px' }
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

  return (
  <section ref={sectionRef} className="w-full py-12 select-none relative overflow-hidden md:border-b" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-90" />
    <div className="relative z-10 flex w-full items-center justify-center">
      <motion.div
        className="flex max-w-lg flex-col items-start space-y-4 p-8 text-left"
        variants={containerVariants}
        initial="hidden"
        animate={isVisible ? 'visible' : 'hidden'}
      >
        <motion.div variants={itemVariants}>
          <TrendingUp className="h-10 w-10 rounded-full bg-[var(--primary)] p-2 text-white" />
        </motion.div>

        <motion.h2
          variants={itemVariants}
          className="text-4xl font-bold tracking-tight text-[var(--text-main)]"
        >
          It's simple.
        </motion.h2>

        <div className="flex flex-col space-y-2">
          {features.map((feature, index) => (
            <motion.div
              key={index}
              variants={itemVariants}
              className="text-2xl text-[var(--text-muted)]"
            >
              {feature}
            </motion.div>
          ))}
        </div>

        <motion.div variants={itemVariants}>{footer}</motion.div>
      </motion.div>
    </div>
  </section>
  );
};
