import React, { useEffect, useState, useRef, useCallback } from 'react';
import { ArrowDown, Zap, BookOpen, X, ChevronRight, Check } from 'lucide-react';
import { BackgroundGraph } from './BackgroundGraph';
import { Confetti, ConfettiRef } from '@/components/ui/confetti';
import type { GlobalOptions as ConfettiGlobalOptions } from 'canvas-confetti';
import { Expense, Theme } from '../types';

interface HeroProps {
  onStart: () => void;
  onLoadPreset: (expense: Expense) => void;
  decisionCount: number;
  theme: Theme;
}

const StatCounter = ({ value, suffix = '', duration = 1100, glare = false }: { value: number, suffix?: string, duration?: number, glare?: boolean }) => {
  const ref = useRef<HTMLSpanElement>(null);
  const hasStarted = useRef(false);
  const hasFinished = useRef(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const rafRef = useRef<number | null>(null);
  const targetRef = useRef(value);
  const lastTargetRef = useRef(value);
  const startValueRef = useRef(0);
  const startTimeRef = useRef(0);
  const suffixRef = useRef(suffix);
  const durationRef = useRef(duration);

  const renderValue = useCallback((v: number) => {
    const span = ref.current;
    if (!span) return;
    // Truncate so a tiny fractional value (used as a sync signal) still
    // renders the intended integer (e.g. 960.000123 => "960").
    span.textContent = Math.trunc(v).toLocaleString() + suffixRef.current;
  }, []);

  const show = useCallback(() => {
    const span = ref.current;
    if (!span) return;
    span.classList.remove('opacity-0');
    span.style.opacity = '1';
  }, []);

  const start = useCallback(() => {
    if (hasStarted.current || !ref.current) return;
    hasStarted.current = true;
    hasFinished.current = false;
    startValueRef.current = 0;
    startTimeRef.current = performance.now();
    lastTargetRef.current = targetRef.current;
    show();

    const target = targetRef.current;

    if (target <= 0) {
      renderValue(target);
      hasStarted.current = false;
      hasFinished.current = true;
      return;
    }

    const step = (timestamp: number) => {
      const target = targetRef.current;

      if (target !== lastTargetRef.current) {
        const currentText = ref.current?.textContent ?? '0';
        startValueRef.current = parseInt(currentText.replace(/[^0-9-]/g, ''), 10) || 0;
        startTimeRef.current = performance.now();
        lastTargetRef.current = target;
      }

      const raw = Math.min((timestamp - startTimeRef.current) / durationRef.current, 1);
      const ease = 1 - Math.pow(1 - raw, 3);
      const current = Math.floor(startValueRef.current + (target - startValueRef.current) * ease);
      renderValue(current);

      if (raw < 1) {
        rafRef.current = requestAnimationFrame(step);
      } else {
        rafRef.current = null;
        hasStarted.current = false;
        hasFinished.current = true;
        renderValue(target);
      }
    };

    rafRef.current = requestAnimationFrame(step);
  }, [renderValue, show]);

  // Keep refs in sync with props without restarting the animation
  useEffect(() => { suffixRef.current = suffix; }, [suffix]);
  useEffect(() => { durationRef.current = duration; }, [duration]);

  // Start/restart the count-up when the value is ready. Hide the initial `0`
  // until counting begins so it doesn't flash while the fade-in delay runs.
  useEffect(() => {
    const span = ref.current;
    if (!span) return;

    targetRef.current = value;

    if (hasFinished.current) {
      if (value > 0 && lastTargetRef.current !== value) {
        hasFinished.current = false;
        start();
      } else {
        renderValue(value);
      }
      return;
    }

    if (hasStarted.current) {
      // rAF is already running and will pick up targetRef each frame
      return;
    }

    // Not started yet — hide and wait for the value to settle
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    span.classList.add('opacity-0');
    span.style.opacity = '0';

    timeoutRef.current = setTimeout(() => {
      start();
    }, 200);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [value, start, renderValue]);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      if (rafRef.current) {
        cancelAnimationFrame(rafRef.current);
        rafRef.current = null;
      }
    };
  }, []);

  return <span ref={ref} className={`select-none opacity-0 transition-opacity duration-150 ${glare ? 'text-glare' : ''}`}>0{suffix}</span>;
};

// --- Testimonial Component ---
const TESTIMONIALS = [
    { text: "This app slapped me in the face with reality.", author: "Sarah J." },
    { text: "I cancelled my 3 unused subscriptions immediately.", author: "Mike T." },
    { text: "Seeing $200k lost to coffee was a wake up call.", author: "Alex R." },
    { text: "My retirement plan just got 5 years shorter.", author: "David K." },
    { text: "Best financial visualizer I've ever used. Simple.", author: "Emily W." },
];

const TestimonialTicker = () => {
    const [index, setIndex] = useState(0);
    const [fade, setFade] = useState(true);

    useEffect(() => {
        const interval = setInterval(() => {
            setFade(false);
            setTimeout(() => {
                setIndex((prev) => (prev + 1) % TESTIMONIALS.length);
                setFade(true);
            }, 500);
        }, 4000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="mt-12 h-14 flex flex-col items-center justify-center select-none">
            <div className={`transition-opacity duration-500 flex flex-col items-center ${fade ? 'opacity-100' : 'opacity-0'}`}>
                <p className="text-lg text-[var(--text-muted)] italic font-light tracking-wide">"{TESTIMONIALS[index].text}"</p>
                <span className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold mt-2">- {TESTIMONIALS[index].author}</span>
            </div>
        </div>
    );
};

// --- Modals ---

const PresetModal = ({ isOpen, onClose, onSelect }: { isOpen: boolean; onClose: () => void; onSelect: (e: Expense) => void }) => {
    if (!isOpen) return null;
    
    const presets = [
        { name: 'Daily Coffee', amount: 5, frequency: 'Weekly', emoji: '☕' }, 
        { name: 'Streaming Services', amount: 45, frequency: 'Monthly', emoji: '📺' },
        { name: 'Dining Out', amount: 200, frequency: 'Monthly', emoji: '🍔' },
        { name: 'Rideshare/Uber', amount: 100, frequency: 'Monthly', emoji: '🚕' },
        { name: 'Cigarettes/Vapes', amount: 60, frequency: 'Monthly', emoji: '🚬' },
        { name: 'Alcohol', amount: 120, frequency: 'Monthly', emoji: '🍺' },
    ];

    const handlePresetClick = (p: any) => {
        let finalAmount = p.amount;
        let finalFreq = p.frequency;
        
        if (p.name === 'Daily Coffee') {
            finalAmount = 5 * 7; 
            finalFreq = 'Weekly';
        }

        onSelect({
            id: Math.random().toString(36).substr(2, 9),
            name: p.name,
            amount: finalAmount,
            frequency: finalFreq,
            isWant: true
        });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in-up" onClick={onClose} />
            <div className="relative w-full max-w-lg bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-fade-in-down p-6">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        <Zap className="w-5 h-5 text-[var(--primary)]" /> Quick Load
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {presets.map((p) => (
                        <button 
                            key={p.name}
                            onClick={() => handlePresetClick(p)}
                            className="flex items-center justify-between p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] hover:border-[var(--primary)] hover:bg-[var(--bg-card)] transition-all group text-left"
                        >
                            <div className="flex items-center gap-4">
                                <span className="text-2xl filter grayscale group-hover:grayscale-0 transition-all duration-300 scale-100 group-hover:scale-110">{p.emoji}</span>
                                <div>
                                    <div className="font-bold text-[var(--text-main)] text-sm group-hover:text-[var(--primary)]">{p.name}</div>
                                    <div className="text-[10px] text-[var(--text-muted)]">
                                        {p.name === 'Daily Coffee' ? '$5 / day' : `$${p.amount} / ${p.frequency?.toLowerCase().replace('ly', '')}`}
                                    </div>
                                </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const TheoryModal = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 z-[60] flex items-center justify-center px-4">
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in-up" onClick={onClose} />
            <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden animate-fade-in-down p-8">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2">
                        <BookOpen className="w-5 h-5 text-[var(--primary)]" /> The Methodology
                    </h2>
                    <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors"><X className="w-5 h-5 text-[var(--text-muted)]" /></button>
                </div>
                
                <div className="space-y-6 text-[var(--text-muted)] text-sm leading-relaxed">
                    <p>
                        This tool isn't just about saving money; it's about <strong className="text-[var(--text-main)]">opportunity cost</strong>. Every dollar spent on a fleeting "want" is a dollar that isn't working for you in the market.
                    </p>
                    
                    <div className="bg-[var(--bg-hover)] p-6 rounded-2xl">
                        <h3 className="text-[var(--text-main)] font-bold mb-4 text-xs uppercase tracking-wider">The Formula</h3>
                        
                        {/* Clean formula display */}
                        <div className="mb-4">
                            <div className="flex items-center justify-center space-x-2">
                                {/* Main formula line */}
                                <div className="text-xl font-mono text-[var(--primary)] font-semibold">
                                    FV = P × 
                                </div>
                                
                                {/* Fraction part */}
                                <div className="flex flex-col items-center">
                                    {/* Numerator */}
                                    <div className="font-mono text-[var(--primary)] px-2 py-1 border-b border-[var(--primary)] mx-auto">
                                        (1 + r)<span className="text-sm align-super">n</span> - 1
                                    </div>
                                    
                                    {/* Denominator */}
                                    <div className="font-mono text-[var(--primary)] px-2">
                                        r
                                    </div>
                                </div>
                            </div>
                        </div>
                        
                        {/* Variables explanation */}
                        <div className="grid grid-cols-2 gap-3 text-xs">
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[var(--primary)]">FV</span>
                                <span className="text-[var(--text-muted)]">Future Value</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[var(--primary)]">P</span>
                                <span className="text-[var(--text-muted)]">Monthly Contribution</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[var(--primary)]">r</span>
                                <span className="text-[var(--text-muted)]">Monthly Interest Rate</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <span className="font-mono font-bold text-[var(--primary)]">n</span>
                                <span className="text-[var(--text-muted)]">Total Months</span>
                            </div>
                        </div>
                    </div>

                    <div>
                        <h3 className="text-[var(--text-main)] font-bold mb-2 text-sm">Why it matters</h3>
                        <p>
                            Small habits compound negatively. A $5 daily coffee isn't just $1,825 a year. Invested at 10%, it's <span className="text-[var(--text-main)] font-bold">~$300,000</span> over 30 years. That's the regret gap.
                        </p>
                    </div>
                </div>
                
                <div className="mt-8 flex justify-end">
                    <button onClick={onClose} className="px-6 py-2 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-lg font-bold text-xs transition-colors">
                        Got it
                    </button>
                </div>
            </div>
        </div>
    );
};

const MILESTONE_START = 10000;
const MILESTONE_END = 11000;

// Keep this object stable so the Confetti component doesn't recreate its canvas
// instance on every Hero re-render (which would reset the particles).
const confettiGlobalOptions: ConfettiGlobalOptions = {
  resize: true,
  useWorker: true,
  disableForReducedMotion: true,
};

export const Hero: React.FC<HeroProps> = ({ onStart, onLoadPreset, decisionCount, theme }) => {
  const [showPreset, setShowPreset] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [animationComplete, setAnimationComplete] = useState(false);
  const confettiRef = useRef<ConfettiRef>(null);
  const confettiRafRef = useRef<number | null>(null);
  // Initialized far behind so the first rAF frame fires immediately.
  const confettiLastBurstRef = useRef(-300);

  // Show the confetti canvas only while the live decision count is in the
  // temporary 10k–11k milestone window. The canvas unmounts completely once
  // we cross 11k, and it only fires once per mount when entering the window.
  const showConfetti = decisionCount >= MILESTONE_START && decisionCount < MILESTONE_END;

  // Stagger the floating animation after the stat counters finish.
  useEffect(() => {
    const timer = setTimeout(() => setAnimationComplete(true), 1100);
    return () => clearTimeout(timer);
  }, []);

  // Temporary 10k–11k milestone celebration. Runs only while the live
  // Firebase decisionCount is between 10,000 and 10,999. Confetti fires
  // continuously from the top-left and top-right corners in a slower,
  // longer-lasting side-cannon style. The canvas removes itself at 11k.
  useEffect(() => {
    if (typeof window === 'undefined') return;

    if (!showConfetti) {
      if (confettiRafRef.current) {
        cancelAnimationFrame(confettiRafRef.current);
        confettiRafRef.current = null;
      }
      return;
    }

    if (confettiRafRef.current) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    if (prefersReducedMotion) return;

    const end = Date.now() + 3000; // 3s of active corner fire
    const isMobile = window.innerWidth < 768;
    const burstDelay = 100; // ms between bursts (fewer bursts ~ total ~25% fewer particles)
    const particleCount = isMobile ? 2 : 3;
    const colors = ['#a855f7', '#7c3aed', '#22c55e', '#3b82f6', '#f8fafc', '#facc15'];

    const defaults = {
      startVelocity: 30,
      spread: 55,
      ticks: 300,
      gravity: 0.5,
      decay: 0.96,
      colors,
    };

    const fireCorner = (x: 0 | 1, angle: number) => {
      confettiRef.current?.fire({
        ...defaults,
        particleCount,
        angle,
        origin: { x, y: 0 },
      });
    };

    const frame = (now: number) => {
      if (Date.now() > end) return;

      if (now - confettiLastBurstRef.current >= burstDelay) {
        confettiLastBurstRef.current = now;
        // 315° and 225° are the 45° diagonals shooting down and inward from the
        // top-left and top-right corners, respectively.
        fireCorner(0, 315); // top-left → down-right
        fireCorner(1, 225); // top-right → down-left
      }

      confettiRafRef.current = requestAnimationFrame(frame);
    };

    confettiRafRef.current = requestAnimationFrame(frame);

    return () => {
      if (confettiRafRef.current) {
        cancelAnimationFrame(confettiRafRef.current);
        confettiRafRef.current = null;
      }
    };
  }, [showConfetti]);

  // Theme-aware glow color
  const getGlowColor = () => {
    switch(theme) {
      case 'green': return 'rgba(20, 83, 45, 0.2)';
      case 'blue': return 'transparent';
      case 'purple': return 'rgba(88, 28, 135, 0.2)';
      default: return 'rgba(88, 28, 135, 0.2)';
    }
  };

  // Tiny fractional values that change with decisionCount so the fake StatCounters
  // see a value update and sync their count-up timing with the real one, while
  // still rendering the intended integer (960 / 667) thanks to Math.trunc.
  const fakeWaste = 960 + (decisionCount % 1_000_000) * 1e-9;
  const fakeYield = 667 + (decisionCount % 1_000_000) * 1e-9;

  return (
    <section className="min-h-dvh md:min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pt-8 md:pt-32 select-none" style={{ userSelect: 'none', WebkitUserSelect: 'none', MozUserSelect: 'none', msUserSelect: 'none' }}>

      {/* Temporary 10k–11k milestone confetti — pointer-events none, uses web worker.
           absolute (not fixed) so it scrolls with the Hero instead of following the viewport. */}
      {showConfetti && (
        <Confetti
          ref={confettiRef}
          manualstart
          className="absolute inset-0 z-[60] pointer-events-none size-full"
          globalOptions={confettiGlobalOptions}
        />
      )}

      {/* --- Background Elements - Desktop only for performance --- */}
      <div className="hidden md:block">
        <BackgroundGraph />
      </div>
      
      {/* 1. Central Glow - Simpler on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[var(--primary)] opacity-[0.05] md:opacity-[0.15] rounded-full blur-[40px] md:blur-[120px] -z-10 pointer-events-none" style={{ willChange: 'transform' }} />
      
      {/* 2. Animated Grid Pattern - Desktop only */}
      <div className="hidden md:block absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)] -z-20 pointer-events-none" />

      {/* --- Main Content --- */}

      {/* Beta Notice - Mobile Only - Absolutely positioned */}
      <div className="md:hidden absolute top-8 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-card)]/40 backdrop-blur-sm z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-[pulse_0.8s_ease-in-out_infinite]" />
        <span className="text-[9px] font-mono tracking-wider text-[var(--text-muted)] uppercase">Beta</span>
        <span className="text-[12px] text-[var(--text-muted)]">Best experience on desktop. Mobile is in beta.</span>
      </div>

      <h1 className="text-[clamp(2.5rem,_12.6vw,_3.754rem)] sm:text-8xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 text-[var(--text-main)] drop-shadow-2xl leading-[1.1] animate-fade-in-down z-10 max-w-4xl mt-12 md:mt-0 select-none">
        Calculated Growth.<br />
        <span className="text-[var(--primary)]">Zero Regret.</span>
      </h1>

      <div className="relative select-none">
        {/* Theme-aware Glow Effect - Relocated from AmbientBackground */}
        <div
          className="hidden md:block absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl rounded-full pointer-events-none z-0"
          style={{
            backgroundColor: getGlowColor()
          }}
        />

        <p className="text-[clamp(0.9rem,_3.7vw,_1.1rem)] sm:text-2xl md:text-2xl text-[var(--text-muted)] max-w-3xl mb-6 md:mb-12 leading-relaxed font-light animate-fade-in-down delay-100 z-10 px-4 select-none">
          See how the price of inaction grows over time. <br className="hidden md:block"/>
          Input your habits to see what waiting is <span className="text-[var(--text-main)] font-medium">really</span> costing you.
        </p>
      </div>

      {/* Button Cluster - Vertical list on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 animate-fade-in-down delay-200 w-full max-w-[clamp(280px,_90vw,_448px)] md:max-w-none justify-center mb-6 md:mb-16 z-20 px-[clamp(12px,_4vw,_24px)] md:px-6">
         
        {/* Mobile: Vertical list of wide buttons (Learn → Calculate → Presets) */}
        <div className="flex flex-col md:hidden gap-3 w-full">
          {/* 1. Learn - How it Works */}
          <button
            onClick={() => setShowTheory(true)}
            className="w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-main)] font-semibold text-[clamp(0.8rem,_3.2vw,_0.95rem)] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98] shadow-lg select-none"
          >
            <BookOpen className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] text-blue-400" />
            <span>How it Works</span>
          </button>

          {/* 2. Calculate - Main CTA */}
          <button
            onClick={onStart}
            className="group w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] font-bold text-white transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:bg-[var(--primary-hover)] active:scale-[0.98] shadow-xl shadow-[var(--primary)]/25 text-[clamp(0.8rem,_3.2vw,_0.95rem)] select-none"
          >
            <span>Calculate Your Regret</span>
            <ArrowDown className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          {/* 3. Presets - Quick Load */}
          <button
            onClick={() => setShowPreset(true)}
            className="w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-main)] font-semibold text-[clamp(0.8rem,_3.2vw,_0.95rem)] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98] shadow-lg select-none"
          >
            <Zap className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] text-yellow-400" />
            <span>Quick Load Presets</span>
          </button>

          {/* Mobile Stats Bar */}
          <div className="w-full mt-4 bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border)] rounded-2xl py-[clamp(12px,_3vw,_16px)] px-[clamp(8px,_2.5vw,_12px)] shadow-xl select-none">
            <div className="grid grid-cols-3 gap-3">
              <div className={`flex flex-col items-center justify-center ${animationComplete ? 'animate-float' : ''}`}>
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1 select-none">
                  <StatCounter value={decisionCount} suffix="+" glare />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight select-none">Decisions Analyzed</span>
              </div>
              <div className={`flex flex-col items-center justify-center border-x border-white/5 ${animationComplete ? 'animate-float' : ''}`}>
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1 select-none">
                  <StatCounter value={fakeWaste} suffix="M+" />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight select-none">Total Capital Wasted</span>
              </div>
              <div className={`flex flex-col items-center justify-center ${animationComplete ? 'animate-float' : ''}`}>
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1 select-none">
                  <StatCounter value={fakeYield} suffix="%+" />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight select-none">Avg. Annual Yield Missed</span>
              </div>
            </div>
          </div>

          {/* Mobile Legal Links */}
          <div className="flex gap-3 justify-center mb-4">
            <a
              href="/privacy"
              className="opacity-60 hover:opacity-100 px-5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-muted)] font-semibold text-[11px] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98]"
            >
              Privacy
            </a>
            <a
              href="/tos"
              className="opacity-60 hover:opacity-100 px-5 py-1.5 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-muted)] font-semibold text-[11px] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98]"
            >
              TOS
            </a>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex gap-4 items-center">
          {/* Left: Presets */}
          <button
            onClick={() => setShowPreset(true)}
            className="flex items-center gap-2 px-6 py-[13px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/40 text-[var(--text-muted)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all backdrop-blur-sm active:scale-[0.98] select-none"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Quick Load</span>
          </button>

          {/* Center: Main CTA */}
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-[13px] font-semibold text-white transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:bg-[var(--primary-hover)] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_var(--primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--bg-main)] shadow-xl select-none"
          >
            <span className="mr-3 text-base">Calculate Your Regret</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          {/* Right: Theory */}
          <button
            onClick={() => setShowTheory(true)}
            className="flex items-center gap-2 px-6 py-[13px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/40 text-[var(--text-muted)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all backdrop-blur-sm active:scale-[0.98] select-none"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>How it Works</span>
          </button>
        </div>
      </div>

      {/* Stats Bar (Desktop Only) */}
      <div className="w-full max-w-4xl mx-auto hidden md:block animate-fade-in-down delay-300 z-10 select-none">
          <div className="grid grid-cols-3 divide-x divide-white/5 bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border)] rounded-full py-5 px-8 shadow-2xl">
            <div className={`flex flex-col items-center justify-center group ${animationComplete ? 'animate-float' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors select-none">
                      <StatCounter value={decisionCount} suffix="+" glare />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest select-none">Decisions Analyzed</span>
            </div>
            <div className={`flex flex-col items-center justify-center group ${animationComplete ? 'animate-float' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors select-none">
                      <StatCounter value={fakeWaste} suffix="M+" />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest select-none">Total Capital Wasted</span>
            </div>
            <div className={`flex flex-col items-center justify-center group ${animationComplete ? 'animate-float' : ''}`}>
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors select-none">
                      <StatCounter value={fakeYield} suffix="%+" />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest select-none">Avg. Annual Yield Missed</span>
            </div>
          </div>

          <TestimonialTicker />
      </div>

      <PresetModal isOpen={showPreset} onClose={() => setShowPreset(false)} onSelect={onLoadPreset} />
      <TheoryModal isOpen={showTheory} onClose={() => setShowTheory(false)} />

    </section>
  );
};