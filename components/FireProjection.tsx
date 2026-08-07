import React, { useState, useMemo } from 'react';
import { Flame, HelpCircle, Zap, ChevronDown } from 'lucide-react';
import { CalculationResult, Theme } from '../types';
import { formatCurrency } from '../utils/financials';

// Format currency with k/M abbreviations for compact display
const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(2).replace(/\.?0+$/, '')}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(0)}k`;
  }
  return `$${value.toFixed(0)}`;
};

// 2026 Investment Strategy Options with Real Return Values
const INVESTMENT_STRATEGIES = [
  { id: 'roth', name: 'Aggressive Roth IRA', realReturn: 7.4, color: '#10b981' },
  { id: 'sp500', name: 'S&P 500 Index', realReturn: 5.5, color: '#6366f1' },
  { id: '401k', name: 'Standard 401(k)', realReturn: 4.2, color: '#8b5cf6' },
  { id: 'tiaa', name: 'TIAA-CREF / Pension', realReturn: 3.5, color: '#f59e0b' },
  { id: 'hysa', name: 'High-Yield Savings', realReturn: 1.2, color: '#64748b' },
];

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
  calculatedYears: number;
  isUnreachable: boolean;
  regretInjected: boolean;
  strategyColor: string;
}

function FIRadialChart({ progress, calculatedYears, isUnreachable, regretInjected, strategyColor }: FIRadialChartProps) {
  const size = 180;
  const center = size / 2;
  const strokeWidth = 16;
  const radius = center - strokeWidth / 2 - 8;
  const circumference = 2 * Math.PI * radius;
  const progressClamped = Math.min(100, Math.max(0, progress));
  const strokeDashoffset = circumference * (1 - progressClamped / 100);

  // Format the display value
  const displayValue = isUnreachable 
    ? '99+' 
    : calculatedYears.toFixed(1);

  return (
    <div className="relative flex items-center justify-center py-2">
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
          stroke={regretInjected ? '#10b981' : strategyColor}
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
        <span className={`text-3xl font-bold transition-colors duration-300 ${
          regretInjected ? 'text-emerald-400' : isUnreachable ? 'text-amber-400' : 'text-[var(--text-main)]'
        }`}>
          {displayValue}
        </span>
        <span className="text-xs text-[var(--text-muted)] uppercase tracking-wider mt-1 text-center px-4">
          {isUnreachable ? 'Increase Savings' : 'Years to hit $1M'}
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
    <div className="flex items-center justify-between py-1.5 group">
      <div className="flex items-center gap-3">
        <span 
          className="w-3 h-3 rounded-[3px]"
          style={{ backgroundColor: color }}
        />
        <span className="text-[15px] text-[var(--text-main)]">{label}</span>
      </div>
      <div className="flex items-center gap-4">
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value}
          onChange={(e) => onChange(Number(e.target.value))}
          className="w-24 h-1.5 rounded-lg appearance-none cursor-pointer"
          style={{
            background: `linear-gradient(to right, ${color} ${percentage}%, var(--bg-hover) ${percentage}%)`
          }}
        />
        <span className="text-[var(--text-muted)] text-sm font-medium w-16 text-right">
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
  
  // Investment strategy state
  const [selectedStrategy, setSelectedStrategy] = useState(INVESTMENT_STRATEGIES[1]); // Default to S&P 500
  const [isStrategyOpen, setIsStrategyOpen] = useState(false);
  
  // Regret injection toggle
  const [regretInjected, setRegretInjected] = useState(false);
  
  // Constants for FI calculation - using selected strategy's real return
  const realReturn = selectedStrategy.realReturn; // Already inflation-adjusted
  const fiTarget = 1000000; // $1M FI target
  
  // Get the regret value from results (totalWasted = potentialValueUnlocked)
  const totalWasted = results.potentialValueUnlocked;
  
  // Calculate principal: base is 0, add regret if injected
  const currentPrincipal = regretInjected ? totalWasted : 0;
  
  // Desired years (user's target timeline)
  const desiredYears = useMemo(() => {
    return Math.max(0, targetAge - currentAge);
  }, [targetAge, currentAge]);

  // Calculate TIME TO REACH $1M using the formula:
  // n = log((FV * r / PMT) + 1) / log(1 + r)
  // This solves for the number of periods needed to reach FV given PMT and r
  const calculatedYearsTo1M = useMemo(() => {
    // Monthly rate from annual real return
    const monthlyRate = Math.pow(1 + realReturn / 100, 1 / 12) - 1;
    
    // If we have starting principal, we need to adjust the formula
    // FV = PV(1+r)^n + PMT * ((1+r)^n - 1) / r
    // This is more complex, so we use iterative approach for accuracy
    
    if (monthlyRate <= 0) {
      // If no growth, simple division
      if (monthlyContribution <= 0) return Infinity;
      const monthsNeeded = (fiTarget - currentPrincipal) / monthlyContribution;
      return monthsNeeded > 0 ? monthsNeeded / 12 : 0;
    }
    
    if (monthlyContribution <= 0 && currentPrincipal <= 0) {
      return Infinity;
    }
    
    // For pure PMT (no principal), use closed-form formula:
    // n = log((FV * r / PMT) + 1) / log(1 + r)
    if (currentPrincipal === 0) {
      const n = Math.log((fiTarget * monthlyRate / monthlyContribution) + 1) / Math.log(1 + monthlyRate);
      return n / 12; // Convert months to years
    }
    
    // With principal, iterate to find months needed
    let months = 0;
    let balance = currentPrincipal;
    const maxMonths = 100 * 12; // Cap at 100 years
    
    while (balance < fiTarget && months < maxMonths) {
      balance = balance * (1 + monthlyRate) + monthlyContribution;
      months++;
    }
    
    return months >= maxMonths ? Infinity : months / 12;
  }, [monthlyContribution, realReturn, currentPrincipal, fiTarget]);

  // Safety check: is the goal unreachable (>100 years)?
  const isUnreachable = calculatedYearsTo1M === Infinity || calculatedYearsTo1M > 99;

  // Calculate projected portfolio value at TARGET AGE (desired timeline)
  // This shows what they'll actually have at their desired retirement age
  const projectedPortfolio = useMemo(() => {
    const monthlyRate = Math.pow(1 + realReturn / 100, 1 / 12) - 1;
    const months = desiredYears * 12;
    
    if (monthlyRate <= 0 || months === 0) return currentPrincipal;
    
    // Future value of monthly contributions
    const fvContributions = monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
    // Future value of current principal
    const fvPrincipal = currentPrincipal * Math.pow(1 + monthlyRate, months);
    
    return fvContributions + fvPrincipal;
  }, [monthlyContribution, realReturn, desiredYears, currentPrincipal]);

  // Progress ring: Desired Years / Calculated Years to $1M
  // 100% = on track or ahead, <100% = behind schedule
  const timelineProgress = useMemo(() => {
    if (isUnreachable) return 0;
    if (calculatedYearsTo1M <= 0) return 100;
    // If calculated time <= desired time, they're on track (100%)
    // If calculated time > desired time, show the ratio
    const ratio = (desiredYears / calculatedYearsTo1M) * 100;
    return Math.min(100, Math.max(0, ratio));
  }, [desiredYears, calculatedYearsTo1M, isUnreachable]);
  
  // Calculate the boost from regret injection
  const calculatedYearsWithoutRegret = useMemo(() => {
    const monthlyRate = Math.pow(1 + realReturn / 100, 1 / 12) - 1;
    if (monthlyRate <= 0 || monthlyContribution <= 0) return Infinity;
    const n = Math.log((fiTarget * monthlyRate / monthlyContribution) + 1) / Math.log(1 + monthlyRate);
    return n / 12;
  }, [monthlyContribution, realReturn, fiTarget]);
  
  const yearsSaved = regretInjected && !isUnreachable 
    ? Math.max(0, calculatedYearsWithoutRegret - calculatedYearsTo1M) 
    : 0;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-3">
          {/* Info tooltip - Mobile: before title */}
          <div className="relative group sm:hidden">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-0 top-full mt-2 px-3 py-3 
                          bg-[var(--bg-card)] border border-[var(--border)] rounded-lg
                          text-xs text-[var(--text-muted)] w-[200px] leading-relaxed
                          opacity-0 pointer-events-none group-hover:opacity-100 
                          transition-opacity duration-200 z-50 shadow-xl">
              This calculator shows how redirecting your regretful spending into investments could accelerate your path to financial independence.
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <Flame className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
            Retirement Freedom Bridge
          </h3>
          {/* Info tooltip - Desktop: after title */}
          <div className="relative group hidden sm:block">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-0 top-full mt-2 px-3 py-3 
                          bg-[var(--bg-card)] border border-[var(--border)] rounded-lg
                          text-xs text-[var(--text-muted)] w-[320px] leading-relaxed
                          opacity-0 pointer-events-none group-hover:opacity-100 
                          transition-opacity duration-200 z-50 shadow-xl">
              This calculator shows how redirecting your regretful spending into investments could accelerate your path to financial independence.
            </div>
          </div>
        </div>
      </div>

      {/* Portfolio Target & Strategy Row */}
      <div className="flex items-start justify-between gap-4 mb-3">
        {/* Portfolio Target - Left */}
        <div>
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1">Portfolio Target</p>
          <div className="flex items-baseline gap-1">
            <span className={`text-xl sm:text-2xl font-bold transition-colors duration-300 ${
              regretInjected ? 'text-emerald-400' : 'text-[var(--primary)]'
            }`}>
              {formatCompactCurrency(projectedPortfolio)}
            </span>
            <span className="text-sm text-[var(--text-muted)]">/</span>
            <span className="text-xl sm:text-2xl font-bold text-[var(--text-main)]">
              {formatCompactCurrency(fiTarget)}
            </span>
          </div>
        </div>

        {/* Investment Strategy Dropdown - Right */}
        <div className="relative">
          <p className="text-xs text-[var(--text-muted)] uppercase tracking-wider mb-1 flex items-center gap-1">
            Strategy
            <div className="relative group">
              <HelpCircle className="w-3 h-3 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100" />
              <div className="absolute right-0 top-full mt-1 px-2 py-2 
                            bg-[var(--bg-card)] border border-[var(--border)] rounded-lg
                            text-xs text-[var(--text-muted)] w-[180px] sm:w-[220px] leading-relaxed
                            opacity-0 pointer-events-none group-hover:opacity-100 
                            transition-opacity duration-200 z-50 shadow-xl">
                We use 2026 Capital Markets forecasts to ensure your target maintains today's buying power.
              </div>
            </div>
          </p>
          <button
            onClick={() => setIsStrategyOpen(!isStrategyOpen)}
            className="flex items-center gap-1.5 px-2 py-1 rounded-lg bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)]/30 transition-colors"
          >
            <span 
              className="w-2 h-2 rounded-full"
              style={{ backgroundColor: selectedStrategy.color }}
            />
            <span className="text-xs font-medium text-[var(--text-main)] max-w-[80px] sm:max-w-none truncate">
              {selectedStrategy.name}
            </span>
            <ChevronDown className={`w-3 h-3 text-[var(--text-muted)] transition-transform ${
              isStrategyOpen ? 'rotate-180' : ''
            }`} />
          </button>
          
          {/* Strategy Dropdown Menu - Smooth Animation */}
          <div 
            className={`absolute right-0 top-full mt-1 z-50 min-w-[160px] 
                       bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden
                       transition-all duration-200 origin-top
                       ${isStrategyOpen 
                         ? 'opacity-100 scale-y-100 translate-y-0' 
                         : 'opacity-0 scale-y-95 -translate-y-1 pointer-events-none'
                       }`}
          >
            <div className="p-1">
              {INVESTMENT_STRATEGIES.map((strategy) => (
                <button
                  key={strategy.id}
                  onClick={() => {
                    setSelectedStrategy(strategy);
                    setIsStrategyOpen(false);
                  }}
                  className={`w-full flex items-center gap-2 px-3 py-2 text-left rounded-lg transition-colors duration-150 ${
                    selectedStrategy.id === strategy.id ? 'bg-[var(--primary)]/10' : 'hover:bg-[var(--bg-hover)]'
                  }`}
                >
                  <span 
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: strategy.color }}
                  />
                  <div className="flex-1">
                    <span className="text-xs font-medium text-[var(--text-main)] block">{strategy.name}</span>
                    <span className="text-[10px] text-[var(--text-muted)]">{strategy.realReturn}% real</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Inflation Assumption Note */}
      <p className="text-[10px] text-[var(--text-muted)] mb-2 italic">
        Assumed inflation: 3.0% (Real return = Nominal − Inflation)
      </p>

      {/* Radial Chart */}
      <div className="flex justify-center mb-2">
        <FIRadialChart 
          progress={timelineProgress} 
          calculatedYears={calculatedYearsTo1M}
          isUnreachable={isUnreachable}
          regretInjected={regretInjected}
          strategyColor={selectedStrategy.color}
        />
      </div>

      {/* Trajectory Clarity Text */}
      <div className="text-center mb-3 px-2">
        {isUnreachable ? (
          <p className="text-sm text-amber-500 font-medium">
            At ${monthlyContribution.toLocaleString()}/mo, reaching $1M isn't feasible within your lifetime. 
            <span className="text-[var(--text-muted)] font-normal"> Consider increasing your monthly contribution.</span>
          </p>
        ) : calculatedYearsTo1M <= desiredYears ? (
          <p className="text-sm text-emerald-500 font-medium">
            You're on track to hit $1M by age {targetAge}! 
            <span className="text-[var(--text-muted)] font-normal"> You may even reach it {(desiredYears - calculatedYearsTo1M).toFixed(1)} years early.</span>
          </p>
        ) : (
          <p className="text-sm text-[var(--text-muted)]">
            At your current pace, you'll reach $1M <span className="text-amber-500 font-medium">{(calculatedYearsTo1M - desiredYears).toFixed(1)} years after</span> your target age of {targetAge}. 
            <span className="opacity-80"> Increase contributions or adjust your timeline.</span>
          </p>
        )}
      </div>

      {/* Input Sliders */}
      <div className="space-y-1 border-t border-[var(--border)] pt-3">
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

      {/* Regret Injection Toggle */}
      <div className="mt-3 pt-3 border-t border-[var(--border)]">
        <button
          onClick={() => setRegretInjected(!regretInjected)}
          className={`w-full flex items-center justify-between px-4 py-2.5 rounded-xl transition-all duration-300 ${
            regretInjected 
              ? 'bg-emerald-500/20 border border-emerald-500/40' 
              : 'bg-[var(--bg-input)] border border-[var(--border)] hover:border-[var(--primary)]/30'
          }`}
        >
          <div className="flex items-center gap-3">
            <Zap className={`w-5 h-5 transition-colors ${
              regretInjected ? 'text-emerald-400' : 'text-[var(--text-muted)]'
            }`} />
            <div className="text-left">
              <span className={`font-medium text-sm ${
                regretInjected ? 'text-emerald-400' : 'text-[var(--text-main)]'
              }`}>
                Regret Injection
              </span>
              <p className="text-xs text-[var(--text-muted)]">
                Add {formatCurrency(totalWasted)} to your starting principal
              </p>
            </div>
          </div>
          
          {/* Toggle Switch */}
          <div className={`relative w-12 h-6 rounded-full transition-colors duration-300 ${
            regretInjected ? 'bg-emerald-500' : 'bg-[var(--bg-hover)]'
          }`}>
            <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow-md transition-transform duration-300 ${
              regretInjected ? 'translate-x-7' : 'translate-x-1'
            }`} />
          </div>
        </button>
        
        {/* Impact message when toggled */}
        {regretInjected && yearsSaved > 0 && (
          <div className="mt-2 px-4 py-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
            <p className="text-sm text-emerald-400 font-medium">
              🚀 Recycling your regrets saves you <span className="font-bold">{yearsSaved.toFixed(1)} years</span>!
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
