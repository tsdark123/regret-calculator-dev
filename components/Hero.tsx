import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, Zap, BookOpen, X, ChevronRight, Check } from 'lucide-react';
import { BackgroundGraph } from './BackgroundGraph';
import { Expense } from '../types';

interface HeroProps {
  onStart: () => void;
  onLoadPreset: (expense: Expense) => void;
  decisionCount: number;
}

// Mobile-optimized: Use simpler animation or static values on mobile to reduce lag
const StatCounter = ({ value, suffix = '', duration = 2000, isMobile = false }: { value: number, suffix?: string, duration?: number, isMobile?: boolean }) => {
  const [displayValue, setDisplayValue] = useState(isMobile ? value : 0);
  const startValueRef = useRef(isMobile ? value : 0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // On mobile, skip animation for initial load to prevent choppiness
    if (isMobile && startValueRef.current === 0) {
      setDisplayValue(value);
      startValueRef.current = value;
      return;
    }

    // If it's a small increment (live update), make it fast. 
    // If it's a large jump (initial load), make it slow.
    const isInitial = startValueRef.current === 0;
    const currentDuration = isMobile ? 300 : (isInitial ? duration : 500); 

    const startVal = startValueRef.current;
    const endVal = value;
    
    // Reset animation frame reference
    startTimeRef.current = null;

    const step = (timestamp: number) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const progress = Math.min((timestamp - startTimeRef.current) / currentDuration, 1);
      
      // Easing: Cubic ease out
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      
      const current = Math.floor(startVal + (endVal - startVal) * easeProgress);
      setDisplayValue(current);

      if (progress < 1) {
        window.requestAnimationFrame(step);
      } else {
        startValueRef.current = endVal; // Update ref for next animation
      }
    };
    
    window.requestAnimationFrame(step);
  }, [value, duration, isMobile]);

  return <span>{displayValue.toLocaleString()}{suffix}</span>;

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
        <div className="mt-12 h-14 flex flex-col items-center justify-center">
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
                    
                    <div className="bg-[var(--bg-hover)] p-6 rounded-2xl border border-[var(--border)]">
                        <h3 className="text-[var(--text-main)] font-bold mb-4 text-xs uppercase tracking-wider">The Formula</h3>
                        <div className="font-mono text-lg text-[var(--primary)] mb-2">FV = P × [((1 + r)^n - 1) / r]</div>
                        <p className="text-[10px] text-[var(--text-muted)] italic">
                            Where <span className="text-[var(--text-main)]">FV</span> is Future Value, <span className="text-[var(--text-main)]">P</span> is your monthly contribution, <span className="text-[var(--text-main)]">r</span> is the monthly interest rate, and <span className="text-[var(--text-main)]">n</span> is the total number of months.
                        </p>
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

export const Hero: React.FC<HeroProps> = ({ onStart, onLoadPreset, decisionCount }) => {
  const [showPreset, setShowPreset] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' && window.innerWidth < 768);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return (
    // Mobile: tighter layout, less padding, no excessive min-height to avoid "boxed" look
    <section className="min-h-[55vh] md:min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pt-4 md:pt-32 pb-6 md:pb-0 select-none">
      
      {/* --- Background Elements --- */}
      {/* Desktop only: heavy background effects */}
      <div className="hidden md:block">
        <BackgroundGraph />
      </div>
      
      {/* 1. Central Glow - Disabled on mobile for performance */}
      <div className="hidden md:block absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[var(--primary)] opacity-15 rounded-full blur-[120px] -z-10 pointer-events-none" />
      
      {/* 2. Animated Grid Pattern - Simpler/hidden on mobile */}
      <div className="hidden md:block absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)] -z-20 pointer-events-none" />

      {/* 3. Left Side: Bar Graph Decoration - Desktop only */}
      <div className="absolute left-[5%] lg:left-[8%] top-1/2 -translate-y-1/2 hidden xl:flex flex-col gap-4 opacity-60 -z-10 pointer-events-none select-none transition-opacity duration-700 hover:opacity-80">
        <div className="w-56 p-5 rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/80 backdrop-blur-sm transform -rotate-6 shadow-2xl">
            <div className="flex items-end gap-3 h-32 mb-3 px-2 border-b border-[var(--border)] pb-2">
                <div className="w-1/4 bg-slate-800 rounded-t-sm h-[30%] animate-pulse"></div>
                <div className="w-1/4 bg-slate-700 rounded-t-sm h-[50%] animate-pulse delay-75"></div>
                <div className="w-1/4 bg-[var(--primary)] opacity-50 rounded-t-sm h-[40%] animate-pulse delay-150"></div>
                <div className="w-1/4 bg-[var(--primary)] rounded-t-sm h-[85%] shadow-[0_0_15px_var(--primary)] animate-pulse delay-200"></div>
            </div>
            <div className="flex gap-2">
               <div className="h-1.5 w-12 bg-slate-800 rounded-full"></div>
               <div className="h-1.5 w-8 bg-slate-800 rounded-full"></div>
            </div>
        </div>
      </div>

      {/* 4. Right Side: Abstract Radial UI - Desktop only */}
      <div className="absolute right-[5%] lg:right-[8%] top-1/2 -translate-y-1/2 hidden xl:flex flex-col opacity-60 -z-10 pointer-events-none select-none transition-opacity duration-700 hover:opacity-80">
        <div className="relative w-64 h-64 flex items-center justify-center transform rotate-12">
            {/* Outer Ring */}
            <div className="absolute inset-0 rounded-full border border-dashed border-[var(--border)] animate-[spin_20s_linear_infinite]"></div>
            
            {/* Inner Floating Card */}
            <div className="w-40 h-40 bg-[var(--bg-card)]/80 backdrop-blur-md rounded-2xl border border-[var(--border)] shadow-2xl flex items-center justify-center relative overflow-hidden">
                <div className="absolute inset-0 bg-[var(--primary)] opacity-10"></div>
                <div className="text-center space-y-2 relative z-10">
                   <div className="text-3xl font-bold text-[var(--text-main)] tracking-tight">+124%</div>
                   <div className="text-[10px] text-[var(--primary)] uppercase tracking-widest bg-[var(--bg-input)] px-2 py-1 rounded-full border border-[var(--primary)]">Growth</div>
                </div>
            </div>

            {/* Orbiting Dot */}
            <div className="absolute w-full h-full animate-[spin_8s_linear_infinite]">
                 <div className="w-3 h-3 bg-[var(--primary)] rounded-full shadow-[0_0_10px_var(--primary)] absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1.5"></div>
            </div>
        </div>
      </div>


      {/* --- Main Content --- */}

      {/* Mobile: smaller text, tighter spacing, no heavy animations */}
      <h1 className="text-3xl sm:text-4xl md:text-8xl font-bold tracking-tighter mb-3 md:mb-8 text-[var(--text-main)] leading-[1.1] md:drop-shadow-2xl md:animate-fade-in-down z-10">
        Calculated Growth.<br />
        <span className="text-[var(--primary)]">Zero Regret.</span>
      </h1>
      
      <p className="text-sm sm:text-base md:text-2xl text-[var(--text-muted)] max-w-3xl mb-4 md:mb-12 leading-relaxed font-light md:animate-fade-in-up md:delay-100 z-10 px-2">
        See how the price of inaction grows over time. <br className="hidden md:block"/>
        Input your habits to see what waiting is <span className="text-[var(--text-main)] font-medium">really</span> costing you.
      </p>

      {/* MOBILE EXCLUSIVE: Stats - Static values, no animation for performance */}
      <div className="block md:hidden w-full max-w-xs mx-auto mb-4 z-10">
          <div className="flex justify-between gap-2 bg-[var(--bg-card)]/60 border border-[var(--border)] rounded-xl p-3 shadow-lg">
             <div className="flex flex-col items-center flex-1">
                 <span className="text-base font-bold text-[var(--text-main)]"><StatCounter value={decisionCount} suffix="+" isMobile={isMobile} /></span>
                 <span className="text-[8px] text-[var(--text-muted)] font-semibold uppercase tracking-wide">Analyzed</span>
             </div>
             <div className="w-px bg-[var(--border)]" />
             <div className="flex flex-col items-center flex-1">
                 <span className="text-base font-bold text-[var(--text-main)]"><StatCounter value={960} suffix="M" isMobile={isMobile} /></span>
                 <span className="text-[8px] text-[var(--text-muted)] font-semibold uppercase tracking-wide">Wasted</span>
             </div>
             <div className="w-px bg-[var(--border)]" />
             <div className="flex flex-col items-center flex-1">
                 <span className="text-base font-bold text-[var(--text-main)]"><StatCounter value={667} suffix="%" isMobile={isMobile} /></span>
                 <span className="text-[8px] text-[var(--text-muted)] font-semibold uppercase tracking-wide">Missed</span>
             </div>
          </div>
      </div>

      {/* Button Cluster - Mobile optimized with 48px+ touch targets */}
      <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4 md:animate-fade-in-up md:delay-200 w-full max-w-sm md:max-w-none justify-center mb-4 md:mb-16 z-20 px-4">
         
         {/* Center: Main CTA - First on mobile for prominence */}
         <button
          onClick={onStart}
          className="group relative inline-flex items-center justify-center px-6 py-3.5 md:px-10 md:py-3.5 font-semibold text-white transition-all duration-300 bg-[var(--primary)] rounded-xl md:rounded-2xl md:hover:bg-[var(--primary-hover)] md:hover:scale-[1.02] active:scale-[0.98] md:hover:shadow-[0_0_30px_var(--primary)] focus:outline-none shadow-lg md:shadow-xl w-full md:w-auto order-first md:order-none min-h-[48px]"
        >
          <span className="mr-2 text-sm md:text-base">Calculate Your Regret</span>
          <ArrowDown className="w-4 h-4 md:group-hover:translate-y-1 transition-transform duration-300" />
        </button>

        {/* Secondary buttons row on mobile */}
        <div className="flex gap-2 w-full md:contents">
          {/* Left: Presets */}
          <button 
            onClick={() => setShowPreset(true)}
            className="flex-1 md:flex-none flex items-center gap-2 px-3 py-3 md:px-6 rounded-xl md:rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-muted)] font-medium text-xs md:text-sm md:hover:bg-[var(--bg-hover)] md:hover:text-[var(--text-main)] transition-all justify-center min-h-[44px] active:scale-[0.98]"
          >
            <Zap className="w-3.5 h-3.5 text-yellow-400" />
            <span>Presets</span>
          </button>

          {/* Right: Theory */}
          <button 
            onClick={() => setShowTheory(true)}
            className="flex-1 md:flex-none flex items-center gap-2 px-3 py-3 md:px-6 rounded-xl md:rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-muted)] font-medium text-xs md:text-sm md:hover:bg-[var(--bg-hover)] md:hover:text-[var(--text-main)] transition-all justify-center min-h-[44px] active:scale-[0.98]"
          >
            <BookOpen className="w-3.5 h-3.5 text-blue-400" />
            <span>Learn</span>
          </button>
        </div>
      </div>

      {/* Stats Bar (Desktop Only) */}
      <div className="w-full max-w-4xl mx-auto hidden md:block animate-fade-in-up delay-300 z-10">
          <div className="grid grid-cols-3 divide-x divide-white/5 bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border)] rounded-full py-5 px-8 shadow-2xl">
            <div className="flex flex-col items-center justify-center group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors">
                      <StatCounter value={decisionCount} suffix="+" />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest">Decisions Analyzed</span>
            </div>
            <div className="flex flex-col items-center justify-center group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors">
                      <StatCounter value={960} suffix="M+" />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest">Total Capital Wasted</span>
            </div>
            <div className="flex flex-col items-center justify-center group">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-3xl font-bold text-[var(--text-main)] tracking-tight group-hover:text-[var(--primary)] transition-colors">
                      <StatCounter value={667} suffix="%+" />
                  </span>
                </div>
                <span className="text-[10px] text-[var(--text-muted)] font-semibold uppercase tracking-widest">Avg. Annual Yield Missed</span>
            </div>
          </div>

          <TestimonialTicker />
      </div>

      <PresetModal isOpen={showPreset} onClose={() => setShowPreset(false)} onSelect={onLoadPreset} />
      <TheoryModal isOpen={showTheory} onClose={() => setShowTheory(false)} />

    </section>
  );
};