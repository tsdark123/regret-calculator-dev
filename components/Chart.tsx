import React from 'react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { YearlyDataPoint, Theme } from '../types';
import { formatCurrencyShort, formatCurrency } from '../utils/financials';

interface ChartProps {
  data: YearlyDataPoint[];
  theme: Theme;
}

const CustomTooltip = ({ active, payload, label, theme }: any) => {
  if (active && payload && payload.length) {
    const value = payload[0].value;
    const invested = payload[1].value;
    const gap = value - invested;

    return (
      <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 rounded-lg shadow-xl backdrop-blur-md bg-opacity-95">
        <p className="text-[var(--text-muted)] text-xs mb-3 font-semibold uppercase tracking-wider">Year {label}</p>
        <div className="space-y-2">
          <div className="flex justify-between gap-8">
             <span className="text-[var(--primary)] font-bold text-sm">Potential Value:</span>
             <span className="text-[var(--text-main)] font-mono">{formatCurrency(value)}</span>
          </div>
          <div className="flex justify-between gap-8">
             <span className="text-[var(--text-muted)] font-medium text-xs">Actual Spent:</span>
             <span className="text-[var(--text-muted)] font-mono text-xs">{formatCurrency(invested)}</span>
          </div>
          <div className="h-px bg-[var(--border)] my-2" />
          <div className="flex justify-between gap-8">
             <span className="text-[var(--primary)] font-bold text-xs uppercase tracking-wider">The Gap:</span>
             <span className="text-[var(--primary)] font-mono font-bold text-sm">{formatCurrency(gap)}</span>
          </div>
        </div>
      </div>
    );
  }
  return null;
};

export const ResultsChart: React.FC<ChartProps> = ({ data, theme }) => {
  
  // Map theme to color hex for Recharts
  const getThemeColor = (t: Theme) => {
      switch(t) {
          case 'purple': return '#a855f7';
          case 'green': return '#22c55e';
          case 'blue': return '#2563eb';
          default: return '#a855f7';
      }
  };

  const primaryColor = getThemeColor(theme);

  // Calculate dynamic YAxis width based on max value
  const maxValue = Math.max(...data.map(d => d.value));
  const maxFormattedLabel = formatCurrencyShort(maxValue);
  // Estimate width: ~9px per character + 8px padding
  const yAxisWidth = Math.max(50, maxFormattedLabel.length * 9 + 8);

  return (
    <div className="w-full h-[280px] md:h-[320px] outline-none focus:outline-none" tabIndex={-1}>
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={primaryColor} stopOpacity={0.4} />
              <stop offset="95%" stopColor={primaryColor} stopOpacity={0.05} />
            </linearGradient>
            <linearGradient id="colorInvested" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.2} />
              <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} opacity={0.5} />
          <XAxis 
            dataKey="year" 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickLine={false}
            axisLine={false}
            minTickGap={30}
            dy={10}
          />
          <YAxis 
            stroke="var(--text-muted)" 
            tick={{ fill: 'var(--text-muted)', fontSize: 12 }} 
            tickFormatter={(val) => formatCurrencyShort(val)}
            tickLine={false}
            axisLine={false}
            width={yAxisWidth}
          />
          <Tooltip content={<CustomTooltip theme={theme} />} cursor={{ stroke: primaryColor, strokeDasharray: '4 4', strokeWidth: 1 }} />
          
          {/* Compound Value (The Gap) */}
          <Area
            type="monotone"
            dataKey="value"
            stroke={primaryColor}
            strokeWidth={3}
            fillOpacity={1}
            fill="url(#colorValue)"
            animationDuration={1500}
            isAnimationActive={true}
          />
          
          {/* Linear Spend */}
          <Area
            type="monotone"
            dataKey="invested"
            stroke="#64748b"
            strokeWidth={2}
            fillOpacity={1}
            fill="url(#colorInvested)"
            animationDuration={1500}
             isAnimationActive={true}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
};