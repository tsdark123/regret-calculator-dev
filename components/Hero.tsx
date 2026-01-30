import React, { useEffect, useState, useRef } from 'react';
import { ArrowDown, Zap, BookOpen, X, ChevronRight, Check } from 'lucide-react';
import { BackgroundGraph } from './BackgroundGraph';
import { Expense, Theme } from '../types';

interface HeroProps {
  onStart: () => void;
  onLoadPreset: (expense: Expense) => void;
  decisionCount: number;
  theme: Theme;
}

const StatCounter = ({ value, suffix = '', duration = 2000 }: { value: number, suffix?: string, duration?: number }) => {
  const [displayValue, setDisplayValue] = useState(0);
  const startValueRef = useRef(0);
  const startTimeRef = useRef<number | null>(null);

  useEffect(() => {
    // If it's a small increment (live update), make it fast. 
    // If it's a large jump (initial load), make it slow.
    const isInitial = startValueRef.current === 0;
    const currentDuration = isInitial ? duration : 500; 

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
  }, [value, duration]);

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

export const Hero: React.FC<HeroProps> = ({ onStart, onLoadPreset, decisionCount, theme }) => {
  const [showPreset, setShowPreset] = useState(false);
  const [showTheory, setShowTheory] = useState(false);
  
  // Theme-aware glow color
  const getGlowColor = () => {
    switch(theme) {
      case 'green': return 'rgba(20, 83, 45, 0.2)';
      case 'blue': return 'transparent';
      case 'purple': return 'rgba(88, 28, 135, 0.2)';
      default: return 'rgba(88, 28, 135, 0.2)';
    }
  };

  return (
    <section className="min-h-dvh md:min-h-[90vh] flex flex-col items-center justify-center text-center px-4 relative overflow-hidden pt-8 md:pt-32 select-none">
      
      {/* --- Background Elements - Desktop only for performance --- */}
      <div className="hidden md:block">
        <BackgroundGraph />
      </div>
      
      {/* 1. Central Glow - Simpler on mobile */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] md:w-[600px] h-[300px] md:h-[600px] bg-[var(--primary)] opacity-8 md:opacity-15 rounded-full blur-[40px] md:blur-[120px] -z-10 pointer-events-none" style={{ willChange: 'transform' }} />
      
      {/* 2. Animated Grid Pattern - Desktop only */}
      <div className="hidden md:block absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_70%_70%_at_50%_50%,black,transparent)] -z-20 pointer-events-none" />

      {/* 3. Left Side: Bar Graph Decoration - Desktop only */}
      <div className="absolute left-[5%] lg:left-[8%] top-[45vh] -translate-y-1/2 hidden xl:flex flex-col gap-4 opacity-60 -z-10 pointer-events-none select-none transition-opacity duration-700 hover:opacity-80">
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
      <div className="absolute right-[5%] lg:right-[8%] top-[45vh] -translate-y-1/2 hidden xl:flex flex-col opacity-60 -z-10 pointer-events-none select-none transition-opacity duration-700 hover:opacity-80">
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

      {/* Beta Notice - Mobile Only - Absolutely positioned */}
      <div className="md:hidden absolute top-16 left-0 right-0 flex items-center justify-center gap-2 px-4 py-3 bg-[var(--bg-card)]/40 backdrop-blur-sm z-20">
        <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-[pulse_0.8s_ease-in-out_infinite]" />
        <span className="text-[9px] font-mono tracking-wider text-[var(--text-muted)] uppercase">Beta</span>
        <span className="text-[12px] text-[var(--text-muted)]">Best experience on desktop. Mobile is in beta.</span>
      </div>

      <h1 className="text-[clamp(2.5rem,_12.6vw,_3.754rem)] sm:text-8xl md:text-8xl font-bold tracking-tighter mb-4 md:mb-8 text-[var(--text-main)] drop-shadow-2xl leading-[1.1] animate-fade-in-down z-10 max-w-4xl mt-20 md:mt-0">
        Calculated Growth.<br />
        <span className="text-[var(--primary)]">Zero Regret.</span>
      </h1>
      
      <div className="relative">
        {/* Theme-aware Glow Effect - Relocated from AmbientBackground */}
        <div 
          className="hidden md:block absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 blur-3xl rounded-full pointer-events-none z-0"
          style={{
            backgroundColor: getGlowColor()
          }}
        />
        
        <p className="text-[clamp(0.9rem,_3.7vw,_1.1rem)] sm:text-2xl md:text-2xl text-[var(--text-muted)] max-w-3xl mb-6 md:mb-12 leading-relaxed font-light animate-fade-in-up delay-100 opacity-0 z-10 px-4">
          See how the price of inaction grows over time. <br className="hidden md:block"/>
          Input your habits to see what waiting is <span className="text-[var(--text-main)] font-medium">really</span> costing you.
        </p>
      </div>

      {/* Button Cluster - Vertical list on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center gap-3 md:gap-4 animate-fade-in-up delay-200 opacity-0 w-full max-w-[clamp(280px,_90vw,_448px)] md:max-w-none justify-center mb-6 md:mb-16 z-20 px-[clamp(12px,_4vw,_24px)] md:px-6">
         
        {/* Mobile: Vertical list of wide buttons (Learn → Calculate → Presets) */}
        <div className="flex flex-col md:hidden gap-3 w-full">
          {/* 1. Learn - How it Works */}
          <button 
            onClick={() => setShowTheory(true)}
            className="w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-main)] font-semibold text-[clamp(0.8rem,_3.2vw,_0.95rem)] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98] shadow-lg"
          >
            <BookOpen className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] text-blue-400" />
            <span>How it Works</span>
          </button>

          {/* 2. Calculate - Main CTA */}
          <button
            onClick={onStart}
            className="group w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] font-bold text-white transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:bg-[var(--primary-hover)] active:scale-[0.98] shadow-xl shadow-[var(--primary)]/25 text-[clamp(0.8rem,_3.2vw,_0.95rem)]"
          >
            <span>Calculate Your Regret</span>
            <ArrowDown className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          {/* 3. Presets - Quick Load */}
          <button 
            onClick={() => setShowPreset(true)}
            className="w-full flex items-center justify-center gap-3 px-[clamp(12px,_4vw,_20px)] py-[clamp(10px,_3vw,_14px)] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/60 text-[var(--text-main)] font-semibold text-[clamp(0.8rem,_3.2vw,_0.95rem)] hover:bg-[var(--bg-hover)] transition-all backdrop-blur-sm active:scale-[0.98] shadow-lg"
          >
            <Zap className="w-[clamp(0.9rem,_3.5vw,_1.1rem)] h-[clamp(0.9rem,_3.5vw,_1.1rem)] text-yellow-400" />
            <span>Quick Load Presets</span>
          </button>

          {/* Mobile Stats Bar */}
          <div className="w-full mt-4 bg-[var(--bg-card)]/50 backdrop-blur-md border border-[var(--border)] rounded-2xl py-[clamp(12px,_3vw,_16px)] px-[clamp(8px,_2.5vw,_12px)] shadow-xl">
            <div className="grid grid-cols-3 gap-3">
              <div className="flex flex-col items-center justify-center">
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1">
                  <StatCounter value={decisionCount} suffix="+" />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight">Decisions Analyzed</span>
              </div>
              <div className="flex flex-col items-center justify-center border-x border-white/5">
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1">
                  <StatCounter value={960} suffix="M+" />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight">Total Capital Wasted</span>
              </div>
              <div className="flex flex-col items-center justify-center">
                <span className="text-[clamp(1rem,_4.5vw,_1.25rem)] font-bold text-[var(--text-main)] tracking-tight mb-1">
                  <StatCounter value={667} suffix="%+" />
                </span>
                <span className="text-[clamp(6px,_2vw,_8px)] text-[var(--text-muted)] font-semibold uppercase tracking-wider text-center leading-tight">Avg. Annual Yield Missed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Desktop: Horizontal layout */}
        <div className="hidden md:flex gap-4 items-center">
          {/* Left: Presets */}
          <button 
            onClick={() => setShowPreset(true)}
            className="flex items-center gap-2 px-6 py-[13px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/40 text-[var(--text-muted)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all backdrop-blur-sm active:scale-[0.98]"
          >
            <Zap className="w-4 h-4 text-yellow-400" />
            <span>Quick Load</span>
          </button>

          {/* Center: Main CTA */}
          <button
            onClick={onStart}
            className="group relative inline-flex items-center justify-center px-10 py-[13px] font-semibold text-white transition-all duration-300 bg-[var(--primary)] rounded-2xl hover:bg-[var(--primary-hover)] hover:scale-[1.02] active:scale-[0.98] hover:shadow-[0_0_30px_var(--primary)] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[var(--primary)] focus:ring-offset-[var(--bg-main)] shadow-xl"
          >
            <span className="mr-3 text-base">Calculate Your Regret</span>
            <ArrowDown className="w-4 h-4 group-hover:translate-y-1 transition-transform duration-300" />
          </button>

          {/* Right: Theory */}
          <button 
            onClick={() => setShowTheory(true)}
            className="flex items-center gap-2 px-6 py-[13px] rounded-2xl border border-[var(--border)] bg-[var(--bg-card)]/40 text-[var(--text-muted)] font-medium text-sm hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all backdrop-blur-sm active:scale-[0.98]"
          >
            <BookOpen className="w-4 h-4 text-blue-400" />
            <span>How it Works</span>
          </button>
        </div>
      </div>

      {/* Stats Bar (Desktop Only) */}
      <div className="w-full max-w-4xl mx-auto hidden md:block animate-fade-in-up delay-300 opacity-0 z-10">
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