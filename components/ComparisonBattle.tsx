import React, { useState } from 'react';
import { Swords, BarChart3 } from 'lucide-react';
import { CalculationResult, Assumptions, Theme } from '../types';
import { formatCurrency } from '../utils/financials';
import { LineChart, Line, XAxis, YAxis, ResponsiveContainer, Tooltip, Legend } from 'recharts';

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
  
  // Calculate percentage for progress bar (original vs challenger)
  const total = originalResult + vsResult;
  const originalPercent = Math.round((originalResult / total) * 100);

  // Generate chart data points for the competing lines
  const chartData = [];
  const years = assumptions.timeHorizonYears;
  const originalMonthly = results.totalMonthly || 0;
  
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
            <div className="w-3 h-3 rounded-full bg-[var(--text-muted)]" />
            <span className="text-sm text-[var(--text-muted)]">
              {vsHabitName || 'Challenger'}
            </span>
          </div>
        </div>
      </div>

      {/* Input Fields - Compact */}
      <div className="grid grid-cols-2 gap-3 mb-4">
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
            Challenger Name
          </label>
          <input
            type="text"
            value={vsHabitName}
            onChange={(e) => setVsHabitName(e.target.value)}
            placeholder="e.g. Daily Coffee"
            className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2
                     text-[var(--text-main)] placeholder-[var(--text-muted)]
                     focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
          />
        </div>
        <div>
          <label className="block text-xs text-[var(--text-muted)] mb-1.5 font-medium">
            Monthly Cost
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
            <input
              type="number"
              value={vsMonthlyAmount}
              onChange={(e) => setVsMonthlyAmount(Math.max(0, Number(e.target.value)))}
              className="w-full bg-[var(--bg-input)] border border-[var(--border)] rounded-lg px-3 py-2 pl-7
                       text-[var(--text-main)] placeholder-[var(--text-muted)]
                       focus:outline-none focus:border-[var(--primary)] transition-colors text-sm"
              min="0"
            />
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
