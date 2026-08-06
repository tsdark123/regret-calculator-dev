import React, { useEffect, useState } from 'react';
import { ArrowLeft, ArrowRight, BarChart3, ChevronRight, Info } from 'lucide-react';
import { MobileStepCard } from './MobileStepCard';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { DebouncedSlider } from './SettingsPanel';
import { Assumptions } from '../types';

interface MobileAssumptionsStepProps {
  assumptions: Assumptions;
  onChange: (field: keyof Assumptions, value: any) => void;
  onOpenStockSelector: () => void;
  onBack: () => void;
  onNext: () => void;
}

export const MobileAssumptionsStep: React.FC<MobileAssumptionsStepProps> = ({
  assumptions,
  onChange,
  onOpenStockSelector,
  onBack,
  onNext,
}) => {
  const [displayAnnualReturn, setDisplayAnnualReturn] = useState(assumptions.annualReturn);
  const [displayTimeHorizon, setDisplayTimeHorizon] = useState(assumptions.timeHorizonYears);
  const [displayInflation, setDisplayInflation] = useState(assumptions.inflationRate);

  // Keep display values in sync when assumptions change from external sources (e.g., stock picker)
  useEffect(() => {
    setDisplayAnnualReturn(assumptions.annualReturn);
    setDisplayTimeHorizon(assumptions.timeHorizonYears);
    setDisplayInflation(assumptions.inflationRate);
  }, [assumptions.annualReturn, assumptions.timeHorizonYears, assumptions.inflationRate]);

  const footer = (
    <div className="flex w-full flex-col gap-2 sm:flex-row">
      <Button variant="outline" onClick={onBack} className="w-full sm:w-auto sm:flex-1">
        <ArrowLeft className="w-4 h-4" />
        Back
      </Button>
      <Button onClick={onNext} className="w-full sm:w-auto sm:flex-1">
        Next Step
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
  );

  return (
    <MobileStepCard
      step={2}
      title="Assumptions"
      description="Set your comparison and time horizon."
      footer={footer}
    >
      <div className="space-y-5">
        {/* Stock selector */}
        <div className="space-y-2">
          <Label>Compare Against</Label>
          <button
            onClick={onOpenStockSelector}
            className="w-full flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-3 hover:border-[var(--primary)] transition-all group text-left"
          >
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-white text-sm font-bold ${assumptions.selectedStock ? assumptions.selectedStock.color : 'bg-[var(--bg-input)]'}`}>
                {assumptions.selectedStock ? assumptions.selectedStock.symbol[0] : <BarChart3 className="w-5 h-5 text-[var(--text-muted)]" />}
              </div>
              <div>
                <p className="text-sm font-semibold text-[var(--text-main)] leading-tight">
                  {assumptions.selectedStock ? assumptions.selectedStock.name : 'Custom Return'}
                </p>
                <p className="text-xs text-[var(--text-muted)]">
                  {assumptions.selectedStock ? `Historical (10yr): ${assumptions.selectedStock.avgReturn}%` : 'Select a stock or fund'}
                </p>
              </div>
            </div>
            <ChevronRight className="w-4 h-4 text-[var(--text-muted)] group-hover:text-[var(--text-main)] transition-colors" />
          </button>
        </div>

        {/* Annual return */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm">Expected Annual Return</Label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                  The average yearly growth rate you expect from your investments.
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-1.5 min-w-[4.5rem] justify-center">
              <Input
                type="number"
                min={0}
                max={100}
                step={0.5}
                value={displayAnnualReturn}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  const clean = isNaN(val) ? 0 : Math.min(100, Math.max(0, val));
                  setDisplayAnnualReturn(clean);
                  if (assumptions.selectedStock && Math.abs(clean - assumptions.selectedStock.avgReturn) > 0.5) {
                    onChange('selectedStock', undefined);
                  }
                  onChange('annualReturn', clean);
                }}
                className="h-6 w-full border-0 bg-transparent p-0 text-center text-sm font-semibold text-[var(--text-main)] focus-visible:ring-0"
              />
              <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
            </div>
          </div>
          <DebouncedSlider
            value={assumptions.annualReturn}
            onChange={(val) => {
              if (assumptions.selectedStock && Math.abs(val - assumptions.selectedStock.avgReturn) > 0.5) {
                onChange('selectedStock', undefined);
              }
              onChange('annualReturn', val);
            }}
            onDisplayChange={setDisplayAnnualReturn}
            min={0}
            max={100}
            step={0.5}
            delay={400}
          />
        </div>

        {/* Time horizon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5">
              <Label className="text-sm">Investing Years</Label>
              <div className="group relative">
                <Info className="w-3.5 h-3.5 text-[var(--text-muted)] cursor-help" />
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-main)] hidden group-hover:block z-10 shadow-xl">
                  How long you plan to keep your money invested before withdrawing.
                </div>
              </div>
            </div>
            <div className="flex items-baseline gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-1.5 min-w-[5.5rem] justify-center">
              <Input
                type="number"
                min={1}
                max={50}
                step={1}
                value={displayTimeHorizon}
                onChange={(e) => {
                  const val = parseInt(e.target.value, 10);
                  const clean = isNaN(val) ? 1 : Math.min(50, Math.max(1, val));
                  setDisplayTimeHorizon(clean);
                  onChange('timeHorizonYears', clean);
                }}
                className="h-6 w-full border-0 bg-transparent p-0 text-center text-sm font-semibold text-[var(--text-main)] focus-visible:ring-0"
              />
              <span className="text-[var(--text-muted)] text-xs font-medium">yrs</span>
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
          <p className="text-xs text-[var(--text-muted)] italic opacity-70">
            Longer horizons make small leaks catastrophic.
          </p>
        </div>

        {/* Inflation toggle */}
        <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="inflation-toggle" className="text-sm">Adjust for Inflation</Label>
              <p className="text-xs text-[var(--text-muted)]">Include inflation in the calculation</p>
            </div>
            <Switch
              id="inflation-toggle"
              checked={assumptions.inflationAdjusted}
              onCheckedChange={(checked) => onChange('inflationAdjusted', checked)}
            />
          </div>

          {assumptions.inflationAdjusted && (
            <div className="space-y-2 animate-fade-in-down">
              <div className="flex items-center justify-between">
                <Label className="text-xs">Inflation Rate</Label>
                <div className="flex items-baseline gap-1 rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-3 py-1 min-w-[4rem] justify-center">
                  <Input
                    type="number"
                    min={0}
                    max={20}
                    step={0.1}
                    value={displayInflation}
                    onChange={(e) => {
                      const val = parseFloat(e.target.value);
                      const clean = isNaN(val) ? 0 : Math.min(20, Math.max(0, val));
                      setDisplayInflation(clean);
                      onChange('inflationRate', clean);
                    }}
                    className="h-5 w-full border-0 bg-transparent p-0 text-center text-sm font-semibold text-[var(--text-main)] focus-visible:ring-0"
                  />
                  <span className="text-[var(--text-muted)] text-sm font-medium">%</span>
                </div>
              </div>
              <DebouncedSlider
                value={assumptions.inflationRate}
                onChange={(val) => onChange('inflationRate', val)}
                onDisplayChange={setDisplayInflation}
                min={0}
                max={20}
                step={0.1}
                delay={200}
              />
            </div>
          )}
        </div>
      </div>
    </MobileStepCard>
  );
};
