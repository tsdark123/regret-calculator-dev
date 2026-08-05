import React from 'react';
import { ArrowLeft, Calculator, RefreshCw, Sparkles } from 'lucide-react';
import { MobileStepCard } from './MobileStepCard';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Expense, Assumptions } from '../types';

interface MobileFinalWisdomStepProps {
  expenses: Expense[];
  assumptions: Assumptions;
  financialWisdoms: string[];
  currentWisdomIndex: number;
  onCycleWisdom: () => void;
  onAnalyze: () => void;
  onBack: () => void;
}

const getMonthlyAmount = (expense: Expense, years: number) => {
  const amt = expense.amount || 0;
  if (expense.frequency === 'Weekly') return amt * 4.33;
  if (expense.frequency === 'Monthly') return amt;
  if (expense.frequency === 'Yearly') return amt / 12;
  if (expense.frequency === 'One-time') return amt / (years * 12);
  return 0;
};

export const MobileFinalWisdomStep: React.FC<MobileFinalWisdomStepProps> = ({
  expenses,
  assumptions,
  financialWisdoms,
  currentWisdomIndex,
  onCycleWisdom,
  onAnalyze,
  onBack,
}) => {
  const monthlyTotal = expenses.reduce((sum, exp) => sum + getMonthlyAmount(exp, assumptions.timeHorizonYears), 0);

  const footer = (
    <div className="flex w-full flex-col gap-2">
      <Button onClick={onAnalyze} className="w-full py-5 text-base">
        <Calculator className="w-5 h-5" />
        Analyze My Regret
      </Button>
      <Button variant="ghost" onClick={onBack} className="w-full">
        <ArrowLeft className="w-4 h-4" />
        Back to Start
      </Button>
    </div>
  );

  return (
    <MobileStepCard
      step={3}
      title="Final Wisdom"
      description="One last look before the truth."
      footer={footer}
    >
      <div className="space-y-4">
        <p className="text-sm text-[var(--text-muted)] leading-relaxed">
          You're about to see how{' '}
          <span className="font-semibold text-[var(--text-main)]">
            {expenses.length} decision{expenses.length !== 1 ? 's' : ''}
          </span>{' '}
          compound over{' '}
          <span className="font-semibold text-[var(--text-main)]">
            {assumptions.timeHorizonYears} years
          </span>.
        </p>

        <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-input)] p-4 space-y-3">
          <div className="flex items-center gap-2 text-[var(--text-muted)]">
            <Sparkles className="w-4 h-4 text-[var(--primary)]" />
            <span className="text-xs font-semibold uppercase tracking-wider">Your Expenses (Monthly Equivalent)</span>
          </div>
          <div className="space-y-2">
            {expenses.slice(0, 4).map((exp, i) => (
              <div key={exp.id} className="flex items-center justify-between text-sm">
                <span className="text-[var(--text-main)] truncate max-w-[160px]">
                  {exp.name || `Expense ${i + 1}`}
                </span>
                <span className="text-[var(--primary)] font-semibold">
                  ${getMonthlyAmount(exp, assumptions.timeHorizonYears).toFixed(2)}/mo
                </span>
              </div>
            ))}
            {expenses.length > 4 && (
              <p className="text-xs text-[var(--text-muted)]">+{expenses.length - 4} more...</p>
            )}
          </div>
          <div className="border-t border-[var(--border)] pt-2 flex items-center justify-between">
            <span className="text-xs text-[var(--text-muted)]">Est. Monthly Total</span>
            <span className="text-base font-bold text-[var(--text-main)]">${monthlyTotal.toFixed(2)}</span>
          </div>
        </div>

        <div className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-4">
          <p className="text-sm text-[var(--text-muted)] italic pr-8">
            "{financialWisdoms[currentWisdomIndex]}"
          </p>
          <button
            onClick={onCycleWisdom}
            className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-all active:scale-95 group"
            title="Next wisdom"
          >
            <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
          </button>
        </div>

        <p className="text-xs text-[var(--text-muted)] text-center">
          Every dollar spent today is a dollar that can't grow tomorrow.
        </p>
      </div>
    </MobileStepCard>
  );
};
