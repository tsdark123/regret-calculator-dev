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

  useEffect(() => {
    const canvas = canvasRef.current;
    const section = sectionRef.current;
    if (!canvas || !section) return;
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
      canvas!.width = section!.offsetWidth;
      canvas!.height = section!.offsetHeight;
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
    observer.observe(section);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  // Track visibility to re-trigger animation
  useEffect(() => {
    const section = sectionRef.current;
    if (!section) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsVisible(entry.isIntersecting);
        });
      },
      { threshold: 0.3 }
    );

    observer.observe(section);
    return () => observer.disconnect();
  }, []);

  return (
  <section ref={sectionRef} className="hidden md:block w-full py-12 select-none relative overflow-hidden border-b" style={{ borderColor: 'rgba(107, 114, 128, 0.2)' }}>
    <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-90" />
    <div className="relative z-10 flex w-full items-center justify-center">
      <motion.div
        key={isVisible ? 'visible' : 'hidden'}
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
