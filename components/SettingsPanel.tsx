import React from 'react';
import { Settings, Info, ChevronRight, BarChart3 } from 'lucide-react';
import { Assumptions } from '../types';

// Simple Debounced Slider Component with Real-time Display
const DebouncedSlider = ({ 
  value, 
  onChange, 
  onDisplayChange, // New callback for real-time display updates
  min, 
  max, 
  step = 0.5,
  delay = 400 
}: {
  value: number;
  onChange: (val: number) => void;
  onDisplayChange?: (val: number) => void; // Real-time display updates
  min: number;
  max: number;
  step?: number;
  delay?: number;
}) => {
  const [localValue, setLocalValue] = React.useState(value);
  const [isDragging, setIsDragging] = React.useState(false);
  const debounceTimer = React.useRef<NodeJS.Timeout>();

  // Sync local state with parent value ONLY when not dragging
  React.useEffect(() => {
    if (!isDragging && localValue !== value) {
      setLocalValue(value);
    }
  }, [value, isDragging, localValue]);

  const getBackgroundStyle = (val: number) => {
    const percentage = ((val - min) * 100) / (max - min);
    return {
      background: `linear-gradient(to right, var(--primary) ${percentage}%, var(--bg-hover) ${percentage}%)`
    };
  };

  const handlePointerDown = () => {
    setIsDragging(true);
    // Clear any pending timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
  };

  const handlePointerUp = () => {
    setIsDragging(false);
    // Trigger onChange immediately when drag ends
    onChange(localValue);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseFloat(e.target.value);
    setLocalValue(newValue); // Instant visual update
    
    // Real-time display update
    if (onDisplayChange) {
      onDisplayChange(newValue);
    }
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer for debounced update (only when not dragging)
    if (!isDragging) {
      debounceTimer.current = setTimeout(() => {
        onChange(newValue);
      }, delay);
    }
  };

  // Global pointer up cleanup
  React.useEffect(() => {
    const handleGlobalPointerUp = () => {
      if (isDragging) {
        setIsDragging(false);
        onChange(localValue);
      }
    };

    if (isDragging) {
      document.addEventListener('mouseup', handleGlobalPointerUp);
      document.addEventListener('touchend', handleGlobalPointerUp);
      return () => {
        document.removeEventListener('mouseup', handleGlobalPointerUp);
        document.removeEventListener('touchend', handleGlobalPointerUp);
      };
    }
  }, [isDragging, localValue, onChange]);

  // Cleanup timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <input
      type="range"
      min={min}
      max={max} 
      step={step}
      value={localValue}
      onChange={handleChange}
      onMouseDown={handlePointerDown}
      onMouseUp={handlePointerUp}
      onTouchStart={handlePointerDown}
      onTouchEnd={handlePointerUp}
      style={getBackgroundStyle(localValue)}
      className="w-full h-1.5 rounded-lg appearance-none cursor-pointer"
    />
  );
};

interface SettingsPanelProps {
  assumptions: Assumptions;
  onChange: (field: keyof Assumptions, value: any) => void;
  onOpenStockSelector: () => void;
  showStepNumber?: number;
}

export const SettingsPanel: React.FC<SettingsPanelProps> = ({
  assumptions,
  onChange,
  onOpenStockSelector,
  showStepNumber,
}) => {
  // Local state for real-time display updates
  const [displayAnnualReturn, setDisplayAnnualReturn] = React.useState(assumptions.annualReturn);
  const [displayTimeHorizon, setDisplayTimeHorizon] = React.useState(assumptions.timeHorizonYears);

  // Sync display values when assumptions change (but not during user interaction)
  React.useEffect(() => {
    setDisplayAnnualReturn(assumptions.annualReturn);
    setDisplayTimeHorizon(assumptions.timeHorizonYears);
  }, [assumptions.annualReturn, assumptions.timeHorizonYears]);

  return (
    <div className="w-full h-full">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-2xl backdrop-blur-sm h-full flex flex-col">
        <div className="flex items-center gap-3 mb-6">
          {showStepNumber ? (
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)] font-bold text-xs ring-1 ring-[var(--primary)] ring-opacity-20">{showStepNumber}</div>
          ) : (
            <Settings className="w-4 h-4 text-[var(--text-muted)]" />
          )}
          <h3 className="text-xs md:text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Assumptions</h3>
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
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[var(--text-muted)]">Expected Annual Return</span>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                    The average yearly growth rate you expect from your investments.
                  </div>
                </div>
              </div>
              
              {/* Display Pill */}
              <div className="flex items-baseline gap-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] px-3 py-1.5 min-w-[4.5rem] justify-center">
                 <span className="text-[var(--text-main)] font-semibold text-sm">{displayAnnualReturn}</span>
                 <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
              </div>
            </div>
            
            <DebouncedSlider
              value={assumptions.annualReturn}
              onChange={(val) => {
                 if (assumptions.selectedStock && Math.abs(val - assumptions.selectedStock.avgReturn) > 0.5) {
                   onChange('selectedStock', undefined);
                 }
                 onChange('annualReturn', val)
              }}
              onDisplayChange={setDisplayAnnualReturn}
              min={0}
              max={100}
              step={0.5}
              delay={400}
            />
          </div>

          {/* Time Horizon */}
          <div>
            <div className="flex justify-between items-center mb-3">
              <div className="flex items-center gap-1.5">
                <span className="text-sm font-medium text-[var(--text-muted)]">Investing Years</span>
                <div className="group relative">
                  <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                  <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                    How long you plan to keep your money invested before withdrawing.
                  </div>
                </div>
              </div>
              
              {/* Display Pill */}
              <div className="flex items-baseline gap-1.5 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] px-3 py-1.5 min-w-[5.5rem] justify-center">
                  <span className="text-[var(--text-main)] font-semibold text-sm">{displayTimeHorizon}</span>
                  <span className="text-[var(--text-muted)] text-sm font-medium">years</span>
              </div>
            </div>

            <DebouncedSlider
              value={assumptions.timeHorizonYears}
              onChange={(val) => onChange('timeHorizonYears', val)}
              onDisplayChange={setDisplayTimeHorizon}
              min={1}
              max={50}
              step={1}
              delay={300}
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
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input 
                        type="checkbox" 
                        checked={assumptions.inflationAdjusted}
                        onChange={(e) => onChange('inflationAdjusted', e.target.checked)}
                        className="sr-only peer" 
                        />
                        <div className="w-11 h-6 bg-[var(--bg-input)] border border-[var(--border)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-muted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bg-input)] peer-checked:after:bg-[var(--primary)] transition-colors"></div>
                    </label>
                    <span className="text-sm font-medium text-[var(--text-muted)]">Inflation-adjusted</span>
                    <div className="group relative">
                    <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                    <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                        Adjusts results to today's purchasing power (assuming {assumptions.inflationRate}% inflation).
                    </div>
                    </div>
                </div>
                
                {assumptions.inflationAdjusted && (
                    <div className="flex items-baseline gap-1 bg-[var(--bg-input)] rounded-xl border border-[var(--border)] px-3 py-1.5 min-w-[4.5rem] justify-center animate-fade-in-down">
                        <span className="text-[var(--text-main)] font-semibold text-sm">{assumptions.inflationRate}</span>
                        <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
                    </div>
                )}
            </div>
        </div>
      </div>
    </div>
  );
};