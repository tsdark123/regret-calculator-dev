import React, { useState, useRef, useEffect } from 'react';
import { Swords, BarChart3, ChevronDown, Check } from 'lucide-react';
import { CalculationResult, Assumptions, Theme } from '../types';
import { formatCurrency } from '../utils/financials';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

// 2026 subscription data with logos
const CHALLENGER_OPTIONS = [
  {
    id: 'netflix',
    name: 'Netflix',
    monthlyCost: 17.99,
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/netflix.svg',
    color: '#E50914',
  },
  {
    id: 'spotify',
    name: 'Spotify Premium',
    monthlyCost: 12.99,
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/spotify.svg',
    color: '#1DB954',
  },
  {
    id: 'disney',
    name: 'Disney+',
    monthlyCost: 18.99,
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/disney-plus.svg',
    color: '#113CCF',
  },
  {
    id: 'youtube',
    name: 'YouTube Premium',
    monthlyCost: 15.99,
    logo: 'https://cdn.jsdelivr.net/gh/walkxcode/dashboard-icons/svg/youtube.svg',
    color: '#FF0000',
  },
];

interface ComparisonBattleProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}

export const ComparisonBattle: React.FC<ComparisonBattleProps> = ({ results, assumptions, theme }) => {
  const [selectedChallenger, setSelectedChallenger] = useState(CHALLENGER_OPTIONS[0]);
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
  const winner = originalResult > vsResult ? 'original' : 'vs';
  
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
        </div>
        <div className="flex items-center gap-2">
          <span className="text-2xl font-bold text-[var(--text-main)]">{originalPercent}%</span>
          <BarChart3 className="w-5 h-5 text-[var(--text-muted)]" />
        </div>
      </div>

      {/* Status Badge */}
      <div className="flex items-center gap-3 mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-medium border ${
          winner === 'original' 
            ? 'text-[var(--primary)] border-[var(--primary)]/30 bg-[var(--primary)]/5' 
            : 'text-[var(--text-muted)] border-[var(--border)] bg-[var(--bg-hover)]'
        }`}>
          {winner === 'original' ? 'Your regrets lead' : 'Challenger leads'}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="flex items-center gap-3 mb-6">
        <div className="flex-1 h-2 bg-[var(--border)] rounded-full overflow-hidden">
          <div 
            className="h-full bg-[var(--primary)] rounded-full transition-all duration-500"
            style={{ width: `${originalPercent}%` }}
          />
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

      {/* Challenger Dropdown */}
      <div className="mb-4" ref={dropdownRef}>
        <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
          Compare Against
        </label>
        <div className="relative">
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full flex items-center justify-between gap-3 px-4 py-3 
                     bg-[var(--bg-input)] border border-[var(--border)] rounded-xl
                     text-[var(--text-main)] hover:border-[var(--primary)]/50
                     focus:outline-none focus:border-[var(--primary)] 
                     transition-all duration-200"
          >
            <div className="flex items-center gap-3">
              <img 
                src={selectedChallenger.logo} 
                alt={selectedChallenger.name}
                className="w-6 h-6 object-contain"
              />
              <span className="font-medium text-sm">{selectedChallenger.name}</span>
              <span className="text-[var(--text-muted)] text-sm">
                ${selectedChallenger.monthlyCost}/mo
              </span>
            </div>
            <ChevronDown 
              className={`w-4 h-4 text-[var(--text-muted)] transition-transform duration-200 ${
                isDropdownOpen ? 'rotate-180' : ''
              }`}
            />
          </button>

          {/* Dropdown Menu */}
          <div 
            className={`absolute z-50 top-full left-0 right-0 mt-2 
                       bg-[var(--bg-card)] border border-[var(--border)] rounded-xl 
                       shadow-xl overflow-hidden
                       transition-all duration-200 origin-top
                       ${isDropdownOpen 
                         ? 'opacity-100 scale-y-100 translate-y-0' 
                         : 'opacity-0 scale-y-95 -translate-y-2 pointer-events-none'
                       }`}
          >
            {CHALLENGER_OPTIONS.map((option, index) => (
              <button
                key={option.id}
                onClick={() => handleSelectChallenger(option)}
                className={`w-full flex items-center justify-between gap-3 px-4 py-3
                          hover:bg-[var(--bg-hover)] transition-colors duration-150
                          ${index !== CHALLENGER_OPTIONS.length - 1 ? 'border-b border-[var(--border)]/50' : ''}
                          ${selectedChallenger.id === option.id ? 'bg-[var(--primary)]/5' : ''}`}
              >
                <div className="flex items-center gap-3">
                  <img 
                    src={option.logo} 
                    alt={option.name}
                    className="w-6 h-6 object-contain"
                  />
                  <span className="font-medium text-sm text-[var(--text-main)]">
                    {option.name}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[var(--text-muted)] text-sm">
                    ${option.monthlyCost}/mo
                  </span>
                  {selectedChallenger.id === option.id && (
                    <Check className="w-4 h-4 text-[var(--primary)]" />
                  )}
                </div>
              </button>
            ))}
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
            <Line 
              type="monotone" 
              dataKey="original" 
              stroke="var(--primary)" 
              strokeWidth={2.5}
              dot={false}
              name={results.expenseSummary || 'Your Regrets'}
            />
            <Line 
              type="monotone" 
              dataKey="challenger" 
              stroke="var(--text-muted)" 
              strokeWidth={2}
              strokeDasharray="6 4"
              dot={false}
              name={vsHabitName || 'Challenger'}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Footer - Verdict */}
      <div className="mt-4 pt-4 border-t border-[var(--border)] flex items-center justify-between">
        <p className="text-sm text-[var(--text-muted)]">
          {winner === 'original' ? (
            <>
              Your regrets cost{' '}
              <span className="text-[var(--primary)] font-semibold">
                {formatCurrency(originalResult - vsResult)} more
              </span>
            </>
          ) : (
            <>
              {vsHabitName} costs{' '}
              <span className="text-[var(--primary)] font-semibold">
                {formatCurrency(vsResult - originalResult)} more
              </span>
            </>
          )}
        </p>
        <span className="text-xs text-[var(--text-muted)]">
          {assumptions.timeHorizonYears} year projection
        </span>
      </div>
    </div>
  );
};
