import React, { useState } from 'react';
import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Flame, TrendingUp } from 'lucide-react';
import { CalculationResult, Theme } from '../types';
import { formatCurrency } from '../utils/financials';

interface FireProjectionProps {
  results: CalculationResult;
  theme: Theme;
}

export const FireProjection: React.FC<FireProjectionProps> = ({ results, theme }) => {
  const [targetAnnualSpend, setTargetAnnualSpend] = useState(60000);

  // Calculate years of retirement wasted
  const yearsWasted = results.potentialValueUnlocked / targetAnnualSpend;
  const yearsWastedDisplay = yearsWasted.toFixed(1);

  // For donut chart: show ratio of wasted vs remaining 25-year retirement
  const maxRetirementYears = 25;
  const wastedPercent = Math.min((yearsWasted / maxRetirementYears) * 100, 100);
  const remainingPercent = 100 - wastedPercent;

  const chartData = [
    { name: 'Wasted', value: wastedPercent },
    { name: 'Remaining', value: remainingPercent }
  ];

  // Get primary color based on theme for the chart
  const getPrimaryColor = () => {
    switch (theme) {
      case 'green': return '#22c55e';
      case 'blue': return '#3b82f6';
      default: return '#a855f7';
    }
  };

  return (
    <div className="bg-[var(--bg-card)]/60 backdrop-blur-xl border border-white/10 rounded-2xl p-6 h-full shadow-2xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="p-2.5 rounded-xl bg-[var(--primary-20)]">
          <Flame className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <div>
          <h3 className="text-lg font-semibold text-[var(--text-main)]">
            FIRE / Retirement Projection
          </h3>
          <p className="text-xs text-[var(--text-muted)]">
            Years of financial freedom sacrificed
          </p>
        </div>
      </div>

      {/* Input Field - Recessed Pill Style */}
      <div className="mb-6">
        <label className="block text-sm text-[var(--text-muted)] mb-2">
          Target Annual Retirement Spend ($)
        </label>
        <div className="relative">
          <span className="absolute left-5 top-1/2 -translate-y-1/2 text-[var(--text-muted)]">$</span>
          <input
            type="number"
            value={targetAnnualSpend}
            onChange={(e) => setTargetAnnualSpend(Math.max(1, Number(e.target.value)))}
            className="w-full bg-black/20 border-0 rounded-full px-6 py-3 pl-10 
                     shadow-[inset_0_2px_4px_rgba(0,0,0,0.3)]
                     text-[var(--text-main)] placeholder-[var(--text-muted)]
                     focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/50 transition-all"
            min="1"
          />
        </div>
      </div>

      {/* Chart and Stats Row */}
      <div className="flex items-center gap-6">
        {/* Donut Chart - Thin Modern Ring (75% inner radius) */}
        <div className="relative w-40 h-40 flex-shrink-0">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={chartData}
                innerRadius={56}
                outerRadius={75}
                paddingAngle={2}
                dataKey="value"
                startAngle={90}
                endAngle={-270}
              >
                <Cell fill={getPrimaryColor()} />
                <Cell fill="var(--border)" />
              </Pie>
            </PieChart>
          </ResponsiveContainer>
          {/* Center Text - Heavy Typography */}
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black tracking-tighter text-[var(--primary)]">{yearsWastedDisplay}</span>
            <span className="text-xs text-[var(--text-muted)]">years</span>
          </div>
        </div>

        {/* Stats - Premium Typography */}
        <div className="flex-1 space-y-4">
          <div>
            <p className="text-6xl font-black tracking-tighter text-[var(--primary)]">
              {yearsWastedDisplay}
            </p>
            <p className="text-sm text-[var(--text-muted)]">
              years of retirement sacrificed
            </p>
          </div>
          
          <div className="flex items-center gap-2 text-sm text-[var(--text-muted)]">
            <TrendingUp className="w-4 h-4 text-[var(--primary)]" />
            <span>
              Based on {formatCurrency(results.potentialValueUnlocked)} potential value
            </span>
          </div>
        </div>
      </div>

      {/* Explanation */}
      <div className="mt-6 p-4 bg-[var(--bg-hover)] rounded-xl border border-white/10">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          <strong className="text-[var(--text-main)]">FIRE Methodology:</strong> Financial Independence, Retire Early. 
          This calculation shows how many years of retirement spending you could have funded with the compounded 
          value of your expenses. At {formatCurrency(targetAnnualSpend)}/year, your habits cost you{' '}
          <span className="text-[var(--primary)] font-semibold">{yearsWastedDisplay} years</span> of freedom.
        </p>
      </div>
    </div>
  );
};