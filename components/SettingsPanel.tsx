import React from 'react';
import { Settings, Info, ChevronRight, BarChart3 } from 'lucide-react';
import { Assumptions } from '../types';

interface SettingsPanelProps {
  assumptions: Assumptions;
  onChange: (field: keyof Assumptions, value: any) => void;
  onOpenStockSelector: () => void;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  assumptions,
  onChange,
  onOpenStockSelector,
}) => {
  // Helper to calculate gradient percentage for the slider track
  const getBackgroundStyle = (value: number, min: number, max: number) => {
    const percentage = ((value - min) * 100) / (max - min);
    // Use CSS variable in gradient? Browsers support it.
    // For simplicity, we assume primary color is accessible via var(--primary) but linear-gradient syntax needs color values.
    // We will use a fallback or try to read the computed style if needed, but here let's stick to inline style with the primary color variable if possible or just use a solid color.
    // Actually, linear-gradient with CSS vars works fine.
    return {
      background: `linear-gradient(to right, var(--primary) ${percentage}%, var(--bg-hover) ${percentage}%)`
    };
  };

  return (
    <div className="w-full h-full">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
        <div className="flex items-center gap-2 mb-6">
          <Settings className="w-4 h-4 text-[var(--text-muted)]" />
          <h3 className="text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Assumptions</h3>
        </div>

        <div className="space-y-7 flex-grow">
          
          {/* Stock Selector Button */}
          <div>
            <label className="text-sm font-medium text-[var(--text-muted)] mb-2 block">Compare Against</label>
            <button 
              onClick={onOpenStockSelector}
              className="w-full flex items-center justify-between bg-[var(--bg-hover)] border border-[var(--border)] p-3 rounded-xl hover:border-[var(--primary)] transition-all group"
            >
              <div className="flex items-center gap-3">
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold ${assumptions.selectedStock ? assumptions.selectedStock.color : 'bg-slate-700'}`}>
                  {assumptions.selectedStock ? assumptions.selectedStock.symbol[0] : <BarChart3 className="w-4 h-4" />}
                </div>
                <div className="text-left">
                  <p className="text-sm font-bold text-[var(--text-main)] leading-tight">
                    {assumptions.selectedStock ? assumptions.selectedStock.name : 'Custom Return'}
                  </p>
                  <p className="text-[10px] text-[var(--text-muted)]">
                    {assumptions.selectedStock ? `Historical Avg: ${assumptions.selectedStock.avgReturn}%` : 'Select a stock or fund'}
                  </p>
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
            </button>
          </div>

          {/* Annual Return */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1.5 group cursor-help">
                Expected Annual Return
                <Info className="w-3.5 h-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--primary)]" />
              </label>
              
              {/* Display Pill */}
              <div className="flex items-baseline gap-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] px-3 py-1.5 min-w-[4.5rem] justify-center">
                 <span className="text-[var(--text-main)] font-semibold text-sm">{assumptions.annualReturn}</span>
                 <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
              </div>
            </div>
            
            <input
              type="range"
              min="0"
              max="100" 
              step="0.5"
              value={assumptions.annualReturn}
              onChange={(e) => {
                 if (assumptions.selectedStock && Math.abs(parseFloat(e.target.value) - assumptions.selectedStock.avgReturn) > 0.5) {
                   onChange('selectedStock', undefined);
                 }
                 onChange('annualReturn', parseFloat(e.target.value))
              }}
              style={getBackgroundStyle(assumptions.annualReturn, 0, 100)}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            />
          </div>

          {/* Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <label className="text-sm font-medium text-[var(--text-muted)] flex items-center gap-1.5 group cursor-help">
                Investing Years
                <Info className="w-3.5 h-3.5 text-[var(--text-muted)] transition-colors group-hover:text-[var(--primary)]" />
              </label>
              
              {/* Display Pill */}
              <div className="flex items-baseline gap-1.5 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] px-3 py-1.5 min-w-[5.5rem] justify-center">
                  <span className="text-[var(--text-main)] font-semibold text-sm">{assumptions.timeHorizonYears}</span>
                  <span className="text-[var(--text-muted)] text-sm font-medium">years</span>
              </div>
            </div>

            <input
              type="range"
              min="1"
              max="50"
              value={assumptions.timeHorizonYears}
              onChange={(e) => onChange('timeHorizonYears', parseInt(e.target.value))}
              style={getBackgroundStyle(assumptions.timeHorizonYears, 1, 50)}
              className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
            />
            
            <p className="text-[10px] text-[var(--text-muted)] mt-2 italic opacity-60 font-medium">
              Longer horizons make small leaks catastrophic.
            </p>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-auto pt-4">
            <div className="h-px bg-[var(--border)] mb-3" />

            {/* Inflation Toggle */}
            <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                    <span className="text-sm font-medium text-[var(--text-muted)]">Inflation-adjusted</span>
                    <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                        Adjusts results to today's purchasing power (assuming {assumptions.inflationRate}% inflation).
                    </div>
                    </div>
                </div>
                
                <label className="relative inline-flex items-center cursor-pointer">
                    <input 
                    type="checkbox" 
                    checked={assumptions.inflationAdjusted}
                    onChange={(e) => onChange('inflationAdjusted', e.target.checked)}
                    className="sr-only peer" 
                    />
                    <div className="w-9 h-5 bg-[var(--bg-input)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-muted)] after:border-[var(--text-muted)] after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[var(--primary-50)] peer-checked:border-[var(--primary)] peer-checked:after:bg-[var(--primary)] peer-checked:after:border-[var(--primary)]"></div>
                </label>
            </div>
            
            {assumptions.inflationAdjusted && (
                <div className="flex justify-end pt-2 animate-fade-in-down">
                    <div className="flex items-baseline gap-1 bg-[var(--bg-input)] rounded-lg border border-[var(--border)] px-3 py-1 w-20 justify-end">
                    <span className="text-[var(--text-main)] font-semibold text-sm">{assumptions.inflationRate}</span>
                    <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
                    </div>
                </div>
            )}
        </div>
      </div>
    </div>
  );
};