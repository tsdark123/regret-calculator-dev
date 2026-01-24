import React, { useState, useRef, useEffect } from 'react';
import { Swords, BarChart3, ChevronDown, Check, HelpCircle } from 'lucide-react';
import { CalculationResult, Assumptions, Theme } from '../types';
import { formatCurrency } from '../utils/financials';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// Diverse challenger options with varied frequencies (all normalized to monthly)
const CHALLENGER_OPTIONS = [
  {
    id: 'netflix',
    name: 'Netflix',
    monthlyCost: 17.99,
    displayCost: '$17.99/mo',
    icon: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/netflix.svg',
    isEmoji: false,
    color: '#E50914',
    isPlural: false,
  },
  {
    id: 'doordash',
    name: 'Daily DoorDash',
    monthlyCost: 25 * 30,
    displayCost: '$25/day',
    icon: '/logos/doordash-logo.png',
    isEmoji: false,
    color: '#FF3008',
    isPlural: false,
    needsInvert: true,
  },
  {
    id: 'gym',
    name: 'Gym Membership',
    monthlyCost: 49.99,
    displayCost: '$49.99/mo',
    icon: '🏋️',
    isEmoji: true,
    color: '#6366F1',
    isPlural: false,
  },
  {
    id: 'cigarettes',
    name: 'Cigarettes',
    monthlyCost: (9.50 / 7) * 30,
    displayCost: '$9.50/pack/wk',
    icon: '🚬',
    isEmoji: true,
    color: '#8B7355',
    isPlural: true,
  },
  {
    id: 'coffee',
    name: 'Daily Starbucks',
    monthlyCost: 6.50 * 22,
    displayCost: '$6.50/day',
    icon: '/logos/starbucks-logo.png',
    isEmoji: false,
    color: '#00704A',
    isPlural: false,
    needsInvert: true,
  },
  {
    id: 'uber',
    name: 'Weekly Uber Rides',
    monthlyCost: 35 * 4.3,
    displayCost: '$35/week',
    icon: '/logos/uber-logo.png',
    isEmoji: false,
    color: '#6B7280',
    isPlural: false,
    needsInvert: true,
  },
  {
    id: 'lottery',
    name: 'Lottery Tickets',
    monthlyCost: 20 * 4.3,
    displayCost: '$20/week',
    icon: '🎰',
    isEmoji: true,
    color: '#F59E0B',
    isPlural: true,
  },
  {
    id: 'fastfood',
    name: 'Fast Food Lunches',
    monthlyCost: 12 * 22,
    displayCost: '$12/lunch',
    icon: '🍔',
    isEmoji: true,
    color: '#EF4444',
    isPlural: true,
  },
];

interface ComparisonBattleProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}

export const ComparisonBattle: React.FC<ComparisonBattleProps> = ({ results, assumptions, theme }) => {
  // Default to Cigarettes (index 3)
  const [selectedChallenger, setSelectedChallenger] = useState(CHALLENGER_OPTIONS[3]);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const vsHabitName = selectedChallenger.name;
  const vsMonthlyAmount = selectedChallenger.monthlyCost;

  // Calculate future value using the same compounding formula
  const calculateFutureValue = (monthlyContribution: number, annualReturn: number, years: number) => {
    const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
    const months = years * 12;
    if (monthlyRate === 0) return monthlyContribution * months;
    return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
  };

  const vsResult = calculateFutureValue(vsMonthlyAmount, assumptions.annualReturn, assumptions.timeHorizonYears);
  const originalResult = results.potentialValueUnlocked;
  
  // Determine the "deadlier" (more expensive) habit
  const originalIsDeadlier = originalResult > vsResult;
  const deadlierAmount = originalIsDeadlier ? originalResult : vsResult;
  const cheaperAmount = originalIsDeadlier ? vsResult : originalResult;
  const deadlierName = originalIsDeadlier ? (results.expenseSummary || 'Your Regrets') : vsHabitName;
  const cheaperName = originalIsDeadlier ? vsHabitName : (results.expenseSummary || 'Your Regrets');
  const difference = deadlierAmount - cheaperAmount;
  
  // Calculate regret multiplier (how many times more expensive)
  const regretMultiplier = cheaperAmount > 0 ? (deadlierAmount / cheaperAmount).toFixed(1) : '∞';
  
  // Calculate percentage for progress bar (original vs challenger)
  const total = originalResult + vsResult;
  const originalPercent = Math.round((originalResult / total) * 100);

  // Generate chart data points for the competing lines
  const chartData = [];
  const years = assumptions.timeHorizonYears;
  const originalMonthly = results.totalMonthlyContribution || 0;
  
  for (let year = 0; year <= years; year += Math.max(1, Math.floor(years / 6))) {
    const originalValue = calculateFutureValue(originalMonthly, assumptions.annualReturn, year);
    const vsValue = calculateFutureValue(vsMonthlyAmount, assumptions.annualReturn, year);
    chartData.push({
      year: `Year ${year}`,
      original: originalValue,
      challenger: vsValue,
    });
  }
  // Ensure final year is included
  if (chartData[chartData.length - 1]?.year !== `Year ${years}`) {
    chartData.push({
      year: `Year ${years}`,
      original: originalResult,
      challenger: vsResult,
    });
  }

  const handleSelectChallenger = (option: typeof CHALLENGER_OPTIONS[0]) => {
    setSelectedChallenger(option);
    setIsDropdownOpen(false);
  };

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 h-full flex flex-col">
      {/* Header - Matching Reference Style */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <Swords className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
            Head-to-Head Battle
          </h3>
          {/* Info tooltip */}
          <div className="relative group">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 px-3 py-2 
                          bg-[var(--bg-card)] border border-[var(--border)] rounded-lg
                          text-xs text-[var(--text-muted)] whitespace-nowrap
                          opacity-0 pointer-events-none group-hover:opacity-100 
                          transition-opacity duration-200 z-50 shadow-lg">
              Compare your regrets against another habit to see which costs more over time.
            </div>
          </div>
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span 
          className="px-3 py-1 rounded-full text-xs font-medium bg-transparent border border-[var(--border)]"
          style={{ 
            color: originalIsDeadlier ? 'var(--primary)' : selectedChallenger.color
          }}
        >
          {deadlierName} {originalIsDeadlier ? (results.expenses.length > 1 ? 'are' : 'is') : (selectedChallenger.isPlural ? 'are' : 'is')} the deadlier habit
        </span>
      </div>

      {/* Segmented Distribution Bar */}
      <div className="mb-6">
        <div className="flex h-2 rounded-full overflow-hidden">
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${originalPercent}%`,
              backgroundColor: 'var(--primary)'
            }}
          />
          <div 
            className="h-full transition-all duration-500"
            style={{ 
              width: `${100 - originalPercent}%`,
              backgroundColor: selectedChallenger.color
            }}
          />
        </div>
        <div className="flex items-center justify-between mt-2">
          <span className="text-xs text-[var(--text-muted)]">
            {originalPercent.toFixed(0)}% / {(100 - originalPercent).toFixed(0)}%
          </span>
          <div className="flex items-center gap-2">
            <span 
              className="text-lg font-bold"
              style={{ color: originalIsDeadlier ? 'var(--primary)' : selectedChallenger.color }}
            >{regretMultiplier}x</span>
            <span className="text-xs text-[var(--text-muted)]">
              {parseFloat(regretMultiplier as string) >= 1 ? 'more expensive' : 'as expensive'}
            </span>
          </div>
        </div>
      </div>

      {/* Legend */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-[var(--primary)]" />
            <span className="text-sm text-[var(--text-main)] font-medium">
              {results.expenseSummary || 'Your Regrets'}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: selectedChallenger.color }}
            />
            <span className="text-sm text-[var(--text-muted)]">
              {vsHabitName}
            </span>
          </div>
        </div>
      </div>

      {/* Challenger Dropdown - Rounded Pill Style */}
      <div className="mb-4" ref={dropdownRef}>
        <div className="relative inline-block">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className={`flex items-center gap-2.5 px-3.5 py-2.5 
                     rounded-xl focus:outline-none transition-all duration-200
                     ${theme === 'blue' 
                       ? '!bg-sky-100/50 !border !border-sky-200/40 backdrop-blur-md shadow-sm !text-sky-800 hover:!bg-sky-100/60' 
                       : 'bg-black/25 border border-[var(--border)] text-[var(--text-main)] hover:border-[var(--primary)]/30'
                     }`}
          >
            {selectedChallenger.isEmoji ? (
              <span className="text-base">{selectedChallenger.icon}</span>
            ) : (
              <img 
                src={selectedChallenger.icon} 
                alt={selectedChallenger.name}
                className={`w-4 h-4 object-contain ${selectedChallenger.needsInvert && theme !== 'blue' ? 'invert' : ''}`}
              />
            )}
            <span className="font-medium text-sm">{selectedChallenger.name}</span>
            <span className="text-[var(--text-muted)] text-xs">
              {selectedChallenger.displayCost}
            </span>
            <ChevronDown 
              className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu - Rounded Style */}
          <div 
            className={`absolute z-50 top-full left-0 mt-2 min-w-[260px]
                       ${theme === 'blue'
                         ? 'bg-white border border-gray-200/60'
                         : 'bg-[var(--bg-card)] border border-[var(--border)]'
                       } rounded-2xl shadow-2xl overflow-hidden
                       transition-all duration-200 origin-top
                       ${isDropdownOpen 
                         ? 'opacity-100 scale-y-100 translate-y-0' 
                         : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                       }`}
          >
            <div className="p-1.5">
              {CHALLENGER_OPTIONS.map((option) => (
                <button
                  key={option.id}
                  onClick={() => handleSelectChallenger(option)}
                  className={`w-full flex items-center justify-between gap-3 px-3 py-2.5
                            rounded-xl transition-colors duration-150
                            ${selectedChallenger.id === option.id 
                              ? 'bg-[var(--primary)]/10' 
                              : 'hover:bg-[var(--bg-hover)]'
                            }`}
                >
                  <div className="flex items-center gap-2.5">
                    {option.isEmoji ? (
                      <span className="text-base w-5 text-center">{option.icon}</span>
                    ) : (
                      <img 
                        src={option.icon} 
                        alt={option.name}
                        className={`w-5 h-5 object-contain ${option.needsInvert && theme !== 'blue' ? 'invert' : ''}`}
                      />
                    )}
                    <span className="font-medium text-sm text-[var(--text-main)]">
                      {option.name}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[var(--text-muted)] text-xs">
                      {option.displayCost}
                    </span>
                    {selectedChallenger.id === option.id && (
                      <Check className="w-3.5 h-3.5 text-[var(--primary)]" />
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Line Chart - Competing Lines */}
      <div className="flex-1 min-h-[180px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <XAxis 
              dataKey="year" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 11 }}
            />
            <YAxis 
              hide={true}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '12px',
              }}
              formatter={(value: number) => formatCurrency(value)}
            />
            {/* User's regrets - dotted primary theme line */}
            <Line 
              type="monotone" 
              dataKey="original" 
              stroke="var(--primary)" 
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name={results.expenseSummary || 'Your Regrets'}
            />
            {/* Challenger - solid brand color line */}
            <Line 
              type="monotone" 
              dataKey="challenger" 
              stroke={selectedChallenger.color}
              strokeWidth={2.5}
              dot={false}
              name={vsHabitName || 'Challenger'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer - Verdict */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          Over{' '}
          <span className="text-[var(--text-main)] font-medium">
            {assumptions.timeHorizonYears} years
          </span>
          ,{' '}
          <span 
            className="font-semibold"
            style={{ color: originalIsDeadlier ? 'var(--primary)' : selectedChallenger.color }}
          >
            {deadlierName}
          </span>
          {' '}would cost you{' '}
          <span className="text-[var(--primary)] font-semibold">
            {formatCurrency(difference)}
          </span>
          {' '}more in lost potential than{' '}
          <span 
            className="font-medium"
            style={{ color: originalIsDeadlier ? selectedChallenger.color : 'var(--primary)' }}
          >
            {cheaperName}
          </span>
          .
        </p>
      </div>
    </div>
  );
};
