import React, { useState } from 'react';
import { DollarSign, Clock, Target } from 'lucide-react';
import { formatCurrency, formatCurrencyShort } from '../utils/financials';

// Helper for slider background matching SettingsPanel
const getBackgroundStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) * 100) / (max - min);
    return {
      background: `linear-gradient(to right, var(--primary) ${percentage}%, var(--bg-hover) ${percentage}%)`
    };
};

// Smart formatting that switches to scientific notation for extreme values
const formatSmartCurrency = (value: number): string => {
    if (!isFinite(value) || isNaN(value)) return '$0';
    const absValue = Math.abs(value);
    if (absValue >= 1e15) {
        return `$${value.toExponential(2)}`;
    }
    if (absValue >= 1e12) {
        return `$${(value / 1e12).toLocaleString(undefined, { maximumFractionDigits: 1 })}T`;
    }
    if (absValue >= 1e9) {
        return `$${(value / 1e9).toLocaleString(undefined, { maximumFractionDigits: 1 })}B`;
    }
    if (absValue >= 1e6) {
        return `$${(value / 1e6).toLocaleString(undefined, { maximumFractionDigits: 1 })}M`;
    }
    if (absValue >= 1e3) {
        return `$${(value / 1e3).toLocaleString(undefined, { maximumFractionDigits: 1 })}K`;
    }
    return `$${value.toLocaleString(undefined, { maximumFractionDigits: 0 })}`;
};

// Smart years formatting
const formatSmartYears = (value: number): string => {
    if (!isFinite(value) || isNaN(value) || value <= 0) return '∞';
    if (value >= 1e6) return value.toExponential(1);
    if (value >= 1000) return `${(value / 1000).toFixed(1)}K`;
    return value.toFixed(1);
};

// Dynamic text size based on string length
const getResultSizeClass = (text: string): string => {
    const len = text.length;
    if (len > 12) return 'text-xl';
    if (len > 9) return 'text-2xl';
    return 'text-3xl';
};

const getYearsSizeClass = (text: string): string => {
    const len = text.length;
    if (len > 6) return 'text-4xl';
    if (len > 4) return 'text-6xl';
    return 'text-8xl';
};

// --- Tool 1: Inflation Calculator ---
const InflationTool = () => {
    const [amount, setAmount] = useState(100);
    const [rate, setRate] = useState(3);
    const [years, setYears] = useState(10);
    
    const futureValue = amount * Math.pow(1 + rate / 100, years);

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors w-full min-w-0 overflow-hidden">
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

            <div className="mt-10 pt-8 border-t border-[var(--border)] overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2 min-w-0">
                    <span className="text-sm text-[var(--text-muted)] font-medium shrink-0">Future Cost Equivalent:</span>
                    <span className={`text-[var(--primary)] font-bold tracking-tight break-all ${getResultSizeClass(formatSmartCurrency(futureValue))}`} style={{ overflowWrap: 'anywhere' }}>
                        {formatSmartCurrency(futureValue)}
                    </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] italic break-all" style={{ overflowWrap: 'anywhere' }}>
                    You'll need {formatSmartCurrency(futureValue)} in {years.toLocaleString()} years to buy what costs {formatSmartCurrency(amount)} today.
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
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors w-full min-w-0 overflow-hidden">
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

            <div className="mt-10 pt-8 border-t border-[var(--border)] text-center overflow-hidden min-w-0">
                <div className={`font-black text-[var(--text-main)] mb-2 tracking-tighter break-all ${getYearsSizeClass(formatSmartYears(yearsToDouble))}`} style={{ overflowWrap: 'anywhere' }}>
                    {formatSmartYears(yearsToDouble)}
                </div>
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
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-8 shadow-2xl flex flex-col h-full hover:border-[var(--text-muted)] transition-colors w-full min-w-0 overflow-hidden md:col-span-2 md:max-w-[calc(50%-1.25rem)] md:justify-self-center lg:col-span-1 lg:max-w-none">
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

            <div className="mt-10 pt-8 border-t border-[var(--border)] overflow-hidden min-w-0">
                <div className="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2 mb-2 min-w-0">
                    <span className="text-sm text-[var(--text-muted)] font-medium shrink-0">Monthly Savings Needed:</span>
                    <span className={`text-green-400 font-bold tracking-tight break-all ${getResultSizeClass(formatSmartCurrency(monthlyContribution))}`} style={{ overflowWrap: 'anywhere' }}>
                        {formatSmartCurrency(monthlyContribution)}
                    </span>
                </div>
                <p className="text-xs text-[var(--text-muted)] italic break-all" style={{ overflowWrap: 'anywhere' }}>
                    Save this monthly to reach {formatSmartCurrency(goal)}.
                </p>
            </div>
        </div>
    );
};
interface ToolsDashboardProps {
    theme?: 'purple' | 'green' | 'blue';
}

export const ToolsDashboard: React.FC<ToolsDashboardProps> = ({ theme = 'purple' }) => {
    return (
        <div className="w-full animate-fade-in-up pb-12 relative min-h-screen" style={{ background: 'transparent' }}>
                <div className="text-center mb-20 pt-10 relative z-10">
                    <h2 className="text-5xl md:text-6xl font-bold text-[var(--text-main)] mb-6 tracking-tight">Financial Toolbox</h2>
                    <p className="text-[var(--text-muted)] max-w-3xl mx-auto text-xl font-light leading-relaxed">
                        Calculators to help you plan your future and understand the math behind your money.
                    </p>
                </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10 max-w-7xl mx-auto px-4 lg:px-0 relative z-10">
                <InflationTool />
                <RuleOf72Tool />
                <ReverseGoalTool />
            </div>
        </div>
    );
};