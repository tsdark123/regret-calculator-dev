import React, { useState, useEffect, useRef } from 'react';
import { DollarSign, Clock, Target } from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/financials';
import * as THREE from 'three';
import DOTS from 'vanta/dist/vanta.dots.min';

// Helper for slider background matching SettingsPanel
const getBackgroundStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) * 100) / (max - min);
    return {
      background: `linear-gradient(to right, var(--primary) ${percentage}%, var(--bg-hover) ${percentage}%)`
    };
};

// --- Tool 1: Inflation Calculator ---
const InflationTool = () => {
    const [amount, setAmount] = useState(100);
    const [rate, setRate] = useState(3);
    const [years, setYears] = useState(10);
    
    const futureValue = amount * Math.pow(1 + rate / 100, years);

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <DollarSign className="w-6 h-6 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-wider">Inflation Reality</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed font-light">
                See how purchasing power erodes over time.
            </p>

            <div className="space-y-6 flex-grow">
                <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Current Cash ($)</label>
                    <input 
                        type="number" 
                        value={amount} 
                        onChange={e => setAmount(Number(e.target.value))} 
                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                    />
                </div>
                
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Inflation (%)</label>
                        <input 
                            type="number" 
                            value={rate} 
                            onChange={e => setRate(Number(e.target.value))} 
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Time (Years)</label>
                        <input 
                            type="number" 
                            value={years} 
                            onChange={e => setYears(Number(e.target.value))} 
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2">
                    <span className="text-sm text-[var(--text-muted)] font-medium">Future Cost Equivalent:</span>
                    <span className="text-[var(--primary)] font-bold text-3xl tracking-tight">{formatCurrency(futureValue)}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] italic">
                    You'll need {formatCurrency(futureValue)} in {years} years to buy what costs {formatCurrency(amount)} today.
                </p>
            </div>
        </div>
    );
};

// --- Tool 2: Rule of 72 ---
const RuleOf72Tool = () => {
    const [rate, setRate] = useState(10);
    const yearsToDouble = 72 / rate;

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <Clock className="w-6 h-6 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-wider">Rule of 72</h3>
            </div>
             <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed font-light">
                 A mental math shortcut to estimate years to double your money.
             </p>

            <div className="space-y-8 flex-grow">
                 <div>
                    <div className="flex justify-between items-center mb-4">
                        <label className="text-base font-medium text-[var(--text-muted)]">Expected Annual Return</label>
                         <div className="flex items-baseline gap-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] px-4 py-2 min-w-[5rem] justify-center">
                            <span className="text-[var(--text-main)] font-bold text-lg">{rate}</span>
                            <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
                        </div>
                    </div>
                    
                    <input
                        type="range"
                        min="1"
                        max="30"
                        step="0.5"
                        value={rate}
                        onChange={e => setRate(Number(e.target.value))}
                        style={getBackgroundStyle(rate, 1, 30)}
                        className="w-full h-2 rounded-lg appearance-none cursor-pointer"
                    />
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--border)] text-center">
                <div className="text-8xl font-black text-[var(--text-main)] mb-2 tracking-tighter">{yearsToDouble.toFixed(1)}</div>
                <div className="text-base text-[var(--text-muted)] uppercase tracking-widest font-bold">Years</div>
                <p className="text-xs text-[var(--text-muted)] mt-4 italic">Time to double your investment.</p>
            </div>
        </div>
    );
};

// --- Tool 3: Reverse Goal Calculator ---
const ReverseGoalTool = () => {
    const [goal, setGoal] = useState(1000000);
    const [years, setYears] = useState(20);
    const [rate, setRate] = useState(8);

    // PMT Formula roughly: P = (FV * r) / ((1 + r)^n - 1)
    // Monthly rate
    const r = rate / 100 / 12;
    const n = years * 12;
    // Handle edge case where r is 0
    const monthlyContribution = r === 0 
        ? goal / n 
        : (goal * r) / (Math.pow(1 + r, n) - 1);

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors">
            <div className="flex items-center gap-3 mb-3">
                <Target className="w-6 h-6 text-[var(--text-muted)]" />
                <h3 className="text-lg font-bold text-[var(--text-main)] uppercase tracking-wider">Reverse Goal</h3>
            </div>
            <p className="text-sm text-[var(--text-muted)] mb-8 leading-relaxed font-light">
                Calculate required monthly savings to hit a target.
            </p>

            <div className="space-y-6 flex-grow">
                <div>
                    <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Target Goal ($)</label>
                    <input 
                        type="number" 
                        value={goal} 
                        onChange={e => setGoal(Number(e.target.value))} 
                        className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                    />
                </div>
                <div className="grid grid-cols-2 gap-6">
                     <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Time (Years)</label>
                        <input 
                            type="number" 
                            value={years} 
                            onChange={e => setYears(Number(e.target.value))} 
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                    <div>
                        <label className="text-xs text-[var(--text-muted)] uppercase font-bold mb-2 block tracking-wider">Return (%)</label>
                        <input 
                            type="number" 
                            value={rate} 
                            onChange={e => setRate(Number(e.target.value))} 
                            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-xl px-5 py-4 text-[var(--text-main)] text-base focus:border-[var(--primary)] outline-none transition-colors"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 pt-8 border-t border-[var(--border)]">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2">
                    <span className="text-sm text-[var(--text-muted)] font-medium">Monthly Savings Needed:</span>
                    <span className="text-green-400 font-bold text-3xl tracking-tight">{formatCurrency(monthlyContribution)}</span>
                </div>
                <p className="text-xs text-[var(--text-muted)] italic">
                    Save this monthly to reach {formatCurrencyShort(goal)}.
                </p>
            </div>
        </div>
    );
};

interface ToolsDashboardProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ theme = 'purple' }) => {
    const vantaRef = useRef<HTMLDivElement>(null);
    const vantaEffect = useRef<any>(null);

    useEffect(() => {
        if (!vantaRef.current) return;

        // Cleanup previous effect
        if (vantaEffect.current) {
            try {
                vantaEffect.current.destroy();
            } catch (e) {
                // Ignore cleanup errors
            }
            vantaEffect.current = null;
        }

        try {
            // Initialize Vanta DOTS inline with neutral colors
            vantaEffect.current = DOTS({
                el: vantaRef.current,
                THREE: THREE,
                mouseControls: true,
                touchControls: true,
                gyroControls: false,
                minHeight: 200.00,
                minWidth: 200.00,
                scale: 1.00,
                scaleMobile: 1.00,
                color: 0x888888,
                color2: 0x666666,
                backgroundColor: 0x0,
                size: 3,
                spacing: 20,
                showLines: false,
            });
        } catch (error) {
            console.warn('Failed to initialize Vanta:', error);
        }

        return () => {
            if (vantaEffect.current) {
                try {
                    vantaEffect.current.destroy();
                } catch (e) {
                    // Ignore cleanup errors
                }
                vantaEffect.current = null;
            }
        };
    }, [theme]);

    return (
        <section style={{ position: 'relative', minHeight: '600px' }} className="w-full animate-fade-in-up overflow-hidden">
            {/* Vanta Dots Background - inline integration */}
            <div 
                ref={vantaRef}
                style={{
                    position: 'absolute',
                    inset: 0,
                    zIndex: 0,
                }}
            />
            
            <div className="text-center mb-20 pt-10" style={{ position: 'relative', zIndex: 1 }}>
                <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-main)] mb-6 tracking-tight">Financial Toolbox</h2>
                <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-xl font-light leading-relaxed">
                    Calculators to help you plan your future and understand the math behind your money.
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-4 lg:px-0" style={{ position: 'relative', zIndex: 1 }}>
                <InflationTool />
                <RuleOf72Tool />
                <ReverseGoalTool />
            </div>
        </section>
    );
};