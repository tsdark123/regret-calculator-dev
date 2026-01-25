import React, { useState, useMemo } from 'react';
import { Flame, HelpCircle, Zap } from 'lucide-react';
import { CalculationResult, Theme } from '../types';
import { formatCurrency } from '../utils/financials';

interface FireProjectionProps {
  results: CalculationResult;
  theme: Theme;
}

// FI calculation parameters
interface FIParams {
  currentAge: number;
  targetAge: number;
  monthlyContribution: number;
  currentPrincipal: number;
  annualReturn: number;
  inflationRate: number;
}

// Fisher Equation: Real Rate = (1 + nominal) / (1 + inflation) - 1
const calculateRealReturn = (nominalRate: number, inflationRate: number): number => {
  return (1 + nominalRate / 100) / (1 + inflationRate / 100) - 1;
};

// Calculate years to reach FI number using inflation-adjusted (real) returns
const calculateYearsToFI = (params: FIParams, fiTarget: number): number => {
  const { currentPrincipal, monthlyContribution, annualReturn, inflationRate } = params;
  
  // Fisher Equation for real return
  const realAnnualRate = calculateRealReturn(annualReturn, inflationRate);
  const realMonthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;
  
  if (realMonthlyRate <= 0) {
    // If real return is zero or negative, simple division
    if (monthlyContribution <= 0) return Infinity;
    return (fiTarget - currentPrincipal) / (monthlyContribution * 12);
  }
  
  // Future Value formula: FV = PV(1+r)^n + PMT * ((1+r)^n - 1) / r
  // Solve for n (months) when FV = fiTarget
  // This requires iterative approach or logarithmic solution
  
  let months = 0;
  let currentValue = currentPrincipal;
  const maxMonths = 100 * 12; // Cap at 100 years
  
  while (currentValue < fiTarget && months < maxMonths) {
    currentValue = currentValue * (1 + realMonthlyRate) + monthlyContribution;
    months++;
  }
  
  return months / 12;
};

// Calculate current FI progress percentage
const calculateFIProgress = (params: FIParams, fiTarget: number): number => {
  const { currentPrincipal, monthlyContribution, annualReturn, inflationRate, currentAge, targetAge } = params;
  
  const yearsToTarget = targetAge - currentAge;
  if (yearsToTarget <= 0) return 100;
  
  const realAnnualRate = calculateRealReturn(annualReturn, inflationRate);
  const realMonthlyRate = Math.pow(1 + realAnnualRate, 1 / 12) - 1;
  const months = yearsToTarget * 12;
  
  // Project current trajectory
  let projectedValue = currentPrincipal;
  for (let m = 0; m < months; m++) {
    projectedValue = projectedValue * (1 + realMonthlyRate) + monthlyContribution;
  }
  
  return Math.min(100, (projectedValue / fiTarget) * 100);
};

// Radial FI Progress Chart
interface FIRadialChartProps {
  progress: number;
  yearsToFreedom: number;
  regretInjected: boolean;
}

function FIRadialChart({ progress, yearsToFreedom, regretInjected }: FIRadialChartProps) {
  // Responsive size - smaller on mobile
  const size = typeof window !== 'undefined' && window.innerWidth < 640 ? 160 : 200;
  const center = size / 2;
  const strokeWidth = size < 200 ? 12 : 16;
  const radius = center - strokeWidth / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const progressClamped = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - progressClamped / 100);

  return (
    <div className="relative flex items-center justify-center py-2 md:py-4">
      <svg width={size} height={size} className="transform -rotate-90">
        {/* Background track */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke="var(--bg-hover)"
          strokeWidth={strokeWidth}
          strokeLinecap="round"
        />
        {/* Progress arc */}
        <circle
          cx={center}
          cy={center}
          r={radius}
          fill="none"
          stroke={regretInjected ? '#10b981' : 'var(--primary)'}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          className="transition-all duration-700 ease-out"
        />
        {/* Inner glow ring when regret injected */}
        {regretInjected && (
          <circle
            cx={center}
            cy={center}
            r={radius - strokeWidth}
            fill="none"
            stroke="#10b981"
            strokeWidth={2}
            strokeLinecap="round"
            strokeDasharray={circumference * 0.6}
            strokeDashoffset={circumference * 0.2}
            className="opacity-40"
          />
        )}
      </svg>
      
      {/* Center content */}
      <div className="absolute inset-0 flex flex-col items-center justify-center">
        <span className={`text-3xl sm:text-4xl font-bold transition-colors duration-300 ${
          regretInjected ? 'text-emerald-400' : 'text-[var(--text-main)]'
        }`}>
          {yearsToFreedom === Infinity ? '∞' : yearsToFreedom.toFixed(1)}
        </span>
        <span className="text-[10px] sm:text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1">
          Years to Freedom
        </span>
      </div>
    </div>
  );
}

// Slider input component matching design system
interface SliderInputProps {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  unit?: string;
  color: string;
}

function SliderInput({ label, value, onChange, min, max, step = 1, unit = '', color }: SliderInputProps) {
  const percentage = ((value - min) * 100) / (max - min);
  
  return (
    <div className="flex flex-col sm:flex-row sm:items-center justify-between py-2 gap-2 sm:gap-0 group">
      <div className="flex items-center gap-3">
        <span 
          className="w-3 h-3 rounded-[3px] flex-shrink-0"
          style={{ backgroundColor: color }}
        />
        <span className="text-sm sm:text-[15px] text-[var(--text-main)]">{label}</span>
      </div>
      <div className="flex items-center gap-3 sm:gap-4 pl-6 sm:pl-0">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="flex-1 sm:w-24 h-2 sm:h-1.5 rounded-lg appearance-none cursor-pointer touch-pan-x"
          style={{
            background: `linear-gradient(to right, ${color} ${percentage}%, var(--bg-hover) ${percentage}%)`
          }}
        />
        <span className="text-[var(--text-muted)] text-sm font-medium w-16 text-right flex-shrink-0">
          {unit === '$' ? formatCurrency(value) : `${value}${unit}`}
        </span>
      </div>
    </div>
  );
}

export const FireProjection: React.FC<FireProjectionProps> = ({ results, theme }) => {
  // Input state - using regular useState for immediate updates
  const [currentAge, setCurrentAge] = useState(30);
  const [targetAge, setTargetAge] = useState(55);
  const [monthlyContribution, setMonthlyContribution] = useState(500);
  
  // Regret injection toggle
  const [regretInjected, setRegretInjected] = useState(false);
  
  // Constants for FI calculation
  const annualReturn = 10; // 10% nominal
  const inflationRate = 3; // 3% inflation
  const fiTarget = 1000000; // $1M FI target (25x $40k annual spend)
  
  // Get the regret value from results (totalWasted = potentialValueUnlocked)
  const totalWasted = results.potentialValueUnlocked;
  
  // Calculate principal: base is 0, add regret if injected
  const currentPrincipal = regretInjected ? totalWasted : 0;
  
  // FI Parameters
  const fiParams: FIParams = useMemo(() => ({
    currentAge,
    targetAge,
    monthlyContribution,
    currentPrincipal,
    annualReturn,
    inflationRate,
  }), [currentAge, targetAge, monthlyContribution, currentPrincipal]);
  
  // Calculate years to freedom and progress
  const yearsToFreedom = useMemo(() => 
    calculateYearsToFI(fiParams, fiTarget), 
    [fiParams]
  );
  
  const fiProgress = useMemo(() => 
    calculateFIProgress(fiParams, fiTarget), 
    [fiParams]
  );
  
  // Calculate the "saved" years when regret is injected
  const baseYears = useMemo(() => {
    const baseParams = { ...fiParams, currentPrincipal: 0 };
    return calculateYearsToFI(baseParams, fiTarget);
  }, [fiParams]);
  
  const yearsSaved = regretInjected ? baseYears - yearsToFreedom : 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-4 sm:p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3 sm:mb-4">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="p-1.5 sm:p-2 rounded-lg bg-[var(--primary)]/10">
            <Flame className="w-4 h-4 sm:w-5 sm:h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-base sm:text-xl font-bold text-[var(--text-main)] tracking-tight">
            Retirement Freedom Bridge
          </h3>
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
                          bg-[var(--bg-card)] border border-[var(--border)] rounded-lg
                          text-xs text-[var(--text-muted)] whitespace-nowrap
                          opacity-0 pointer-events-none group-hover:opacity-100 
                          transition-opacity duration-200 z-50 shadow-lg">
              See how recycling your regretful spending accelerates financial freedom.
            </div>
          </div>
        </div>
      </div>

      {/* Primary Stat Display */}
      <div className="flex gap-6 sm:gap-8 mb-2">
        <div>
          <div className="flex items-baseline">
            <span className={`text-3xl sm:text-5xl font-bold leading-none transition-colors duration-300 ${
              regretInjected ? 'text-emerald-400' : 'text-[var(--text-main)]'
            }`}>
              {yearsToFreedom === Infinity ? '∞' : yearsToFreedom.toFixed(1)}
            </span>
            <span className="text-base sm:text-xl text-[var(--text-muted)] ml-1">yrs</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">Years to Freedom</p>
        </div>
        <div>
          <div className="flex items-baseline">
            <span className="text-3xl sm:text-5xl font-bold text-[var(--text-main)] leading-none">
              {fiProgress.toFixed(0)}
            </span>
            <span className="text-base sm:text-xl text-[var(--text-muted)] ml-0.5">%</span>
          </div>
          <p className="text-xs sm:text-sm text-[var(--text-muted)] mt-1">FI Progress</p>
        </div>
      </div>

      {/* Radial Chart */}
      <div className="flex justify-center mb-2">
        <FIRadialChart 
          progress={fiProgress} 
          yearsToFreedom={yearsToFreedom}
          regretInjected={regretInjected}
        />
      </div>

      {/* Input Sliders */}
      <div className="space-y-1 sm:space-y-1 border-t border-[var(--border)] pt-3 sm:pt-4">
        <SliderInput
          label="Current Age"
          value={currentAge}
          onChange={setCurrentAge}
          min={18}
          max={80}
          unit=" yrs"
          color="#5b5fc7"
        />
        <SliderInput
          label="Target Freedom Age"
          value={targetAge}
          onChange={setTargetAge}
          min={25}
          max={90}
          unit=" yrs"
          color="#f472b6"
        />
        <SliderInput
          label="Monthly Contribution"
          value={monthlyContribution}
          onChange={setMonthlyContribution}
          min={0}
          max={10000}
          step={50}
          unit="$"
          color="#f87171"
        />
      </div>

      {/* Regret Injection Toggle - Prominent on mobile */}
      <div className="mt-3 sm:mt-4 pt-3 sm:pt-4 border-t border-[var(--border)]">
        <button
          onClick={() => setRegretInjected(!regretInjected)}
          className={`w-full flex items-center justify-between px-3 sm:px-4 py-3 sm:py-3 rounded-xl transition-all duration-300 active:scale-[0.98] ${
            regretInjected 
              ? 'bg-emerald-500/20 border border-emerald-500/40' 
              : 'bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)]/30'
          }`}
        >
          <div className="flex items-center gap-2 sm:gap-3">
            <Zap className={`w-5 h-5 flex-shrink-0 transition-colors ${
              regretInjected ? 'text-emerald-400' : 'text-[var(--text-muted)]'
            }`} />
            <div className="text-left min-w-0">
              <span className={`font-medium text-sm ${
                regretInjected ? 'text-emerald-400' : 'text-[var(--text-main)]'
              }`}>
                Regret Injection
              </span>
              <p className="text-xs text-[var(--text-muted)] truncate">
                Add {formatCurrency(totalWasted)} to principal
              </p>
            </div>
          </div>
          
          {/* Toggle Switch - Larger touch target on mobile */}
          <div className={`relative w-12 h-7 sm:h-6 rounded-full transition-colors duration-300 flex-shrink-0 ${
            regretInjected ? 'bg-emerald-500' : 'bg-[var(--bg-hover)]'
          }`}>
            <div className={`absolute top-1 sm:top-1 w-5 sm:w-4 h-5 sm:h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
              regretInjected ? 'translate-x-6 sm:translate-x-7' : 'translate-x-1'
            }`} />
          </div>
        </button>
        
        {/* Impact message when toggled */}
        {regretInjected && yearsSaved > 0 && (
          <div className="mt-3 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium">
              🚀 Recycling your regrets saves you <span className="font-bold">{yearsSaved.toFixed(1)} years</span>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
