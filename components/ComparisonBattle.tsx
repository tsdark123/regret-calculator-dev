import React, { useState } from 'react';
import { Swords, Trophy, TrendingDown } from 'lucide-react';
import { CalculationResult, Assumptions, Theme } from '../types';
import { formatCurrency } from '../utils/financials';

interface ComparisonBattleProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}

export const ComparisonBattle: React.FC<ComparisonBattleProps> = ({ results, assumptions, theme }) => {
  const [vsHabitName, setVsHabitName] = useState('Daily DoorDash');
  const [vsMonthlyAmount, setVsMonthlyAmount] = useState(200);

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

  return (
    <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full flex flex-col shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-[var(--primary-20)]">
          <Swords className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-main)]">
            Head-to-Head Battle
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Compare your habits side by side
          </p>
        </div>
      </div>

      {/* Input Fields */}
      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Vs. Habit Name
          </label>
            <input
              type="text"
              value={vsHabitName}
              onChange={(e) => setVsHabitName(e.target.value)}
              placeholder="e.g. Daily Coffee"
              className="w-full bg-black/20 border-0 rounded-full px-4 py-3
                       shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
                       text-[var(--text-main)] placeholder-[var(--text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm"
            />
        </div>
        <div>
          <label className="block text-sm text-[var(--text-muted)] mb-2">
            Monthly Cost ($)
          </label>
          <div className="relative">
            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
            <input
              type="number"
              value={vsMonthlyAmount}
              onChange={(e) => setVsMonthlyAmount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-black/20 border-0 rounded-full px-4 py-3 pl-8
                       shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
                       text-[var(--text-main)] placeholder-[var(--text-muted)]
                       focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all text-sm"
              min="0"
            />
          </div>
        </div>
      </div>

      {/* Battle Cards */}
      <div className="flex-1 flex items-center">
        <div className="w-full grid grid-cols-[1fr_auto_1fr] gap-3 items-center">
          {/* Original Card - Neon Glow on Winner */}
          <div 
            className={`relative p-4 rounded-xl border-2 transition-all ${
              winner === 'original' 
                ? 'border-[var(--primary)] drop-shadow-[0_0_15px_var(--primary)] bg-[var(--primary)]/20' 
                : 'border-white/10 bg-white/5'
            }`}
          >
            {winner === 'original' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Trophy className="w-5 h-5 text-[var(--primary)]" />
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)] text-center mb-1">Your Regrets</p>
            <p className="text-lg font-bold text-[var(--text-main)] text-center truncate">
              {results.expenseSummary}
            </p>
            <p className={`text-2xl font-black tracking-tight text-center mt-2 ${
              winner === 'original' ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'
            }`}>
              {formatCurrency(originalResult)}
            </p>
            <p className="text-xs text-[var(--text-muted)] text-center">
              {assumptions.timeHorizonYears}yr value
            </p>
          </div>

          {/* VS Divider */}
          <div className="flex flex-col items-center justify-center px-2">
            <div className="w-8 h-8 rounded-full bg-[var(--bg-hover)] border border-[var(--border)] 
                          flex items-center justify-center">
              <span className="text-xs font-bold text-[var(--text-muted)]">VS</span>
            </div>
          </div>

          {/* Challenger Card - Neon Glow on Winner */}
          <div 
            className={`relative p-4 rounded-xl border-2 transition-all ${
              winner === 'vs' 
                ? 'border-[var(--primary)] drop-shadow-[0_0_15px_var(--primary)] bg-[var(--primary)]/20' 
                : 'border-white/10 bg-white/5'
            }`}
          >
            {winner === 'vs' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                <Trophy className="w-5 h-5 text-[var(--primary)]" />
              </div>
            )}
            <p className="text-xs text-[var(--text-muted)] text-center mb-1">Alternative</p>
            <p className="text-lg font-bold text-[var(--text-main)] text-center truncate">
              {vsHabitName || 'New Habit'}
            </p>
            <p className={`text-2xl font-black tracking-tight text-center mt-2 ${
              winner === 'vs' ? 'text-[var(--primary)]' : 'text-[var(--text-main)]'
            }`}>
              {formatCurrency(vsResult)}
            </p>
            <p className="text-xs text-[var(--text-muted)] text-center">
              {assumptions.timeHorizonYears}yr value
            </p>
          </div>
        </div>
      </div>

      {/* Verdict */}
      <div className="mt-6 p-4 bg-[var(--bg-hover)] rounded-xl border border-white/10 text-center">
        <div className="flex items-center justify-center gap-2 text-sm">
          <TrendingDown className="w-4 h-4 text-[var(--primary)]" />
          <p className="text-[var(--text-muted)]">
            {winner === 'original' ? (
              <>
                Your current habits cost{' '}
                <span className="text-[var(--primary)] font-semibold">
                  {formatCurrency(originalResult - vsResult)} more
                </span>
                {' '}in the long run
              </>
            ) : (
              <>
                <span className="text-[var(--text-main)] font-semibold">{vsHabitName}</span>
                {' '}would cost{' '}
                <span className="text-[var(--primary)] font-semibold">
                  {formatCurrency(vsResult - originalResult)} more
                </span>
              </>
            )}
          </p>
        </div>
      </div>
    </div>
  );
};
