import React, { useEffect, useRef, useState } from 'react';
import { Trash2, Plus, ArrowRight, ChevronUp, ChevronDown, Calculator } from 'lucide-react';
import { MobileStepCard } from './MobileStepCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Expense, Frequency } from '../types';

interface MobileQueueStepProps {
  expenses: Expense[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Expense, value: any) => void;
  onAnalyze: () => void;
  buttonText?: string;
  buttonIcon?: 'calculator' | 'arrow';
  initialMobileExpenseIndex?: number;
}

export const MobileQueueStep: React.FC<MobileQueueStepProps> = ({
  expenses,
  onAdd,
  onRemove,
  onUpdate,
  onAnalyze,
  buttonText = 'Analyze',
  buttonIcon = 'calculator',
  initialMobileExpenseIndex,
}) => {
  const [mobileExpenseIndex, setMobileExpenseIndex] = useState(() => {
    if (initialMobileExpenseIndex !== undefined) {
      return Math.max(0, Math.min(initialMobileExpenseIndex, expenses.length - 1));
    }
    return 0;
  });

  // Track previous expenses to detect externally added items (e.g., Quick Load presets)
  const prevExpensesRef = useRef(expenses);
  useEffect(() => {
    const prevExpenses = prevExpensesRef.current;
    const newLastIndex = expenses.length - 1;

    if (
      expenses.length > prevExpenses.length &&
      newLastIndex >= 0 &&
      mobileExpenseIndex !== newLastIndex
    ) {
      setMobileExpenseIndex(newLastIndex);
    } else if (mobileExpenseIndex >= expenses.length && expenses.length > 0) {
      setMobileExpenseIndex(newLastIndex);
    }

    prevExpensesRef.current = expenses;
  }, [expenses, mobileExpenseIndex]);

  const handleAdd = () => {
    if (expenses.length >= 3) return;
    const newIndex = expenses.length;
    onAdd();
    setMobileExpenseIndex(newIndex);
  };

  const handleDelete = (id: string) => {
    const deletingIndex = expenses.findIndex(e => e.id === id);
    onRemove(id);
    if (deletingIndex === mobileExpenseIndex && mobileExpenseIndex > 0) {
      setMobileExpenseIndex(mobileExpenseIndex - 1);
    } else if (deletingIndex < mobileExpenseIndex) {
      setMobileExpenseIndex(mobileExpenseIndex - 1);
    }
  };

  const expense = expenses[mobileExpenseIndex];

  // Local amount state with debounced commit to parent
  const [localAmount, setLocalAmount] = useState(expense?.amount ?? 0);
  const amountTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  useEffect(() => {
    setLocalAmount(expense?.amount ?? 0);
  }, [expense?.amount]);

  const commitAmount = (val = localAmount) => {
    if (expense) onUpdate(expense.id, 'amount', Number.isNaN(val) ? 0 : Math.max(0, val));
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    const value = isNaN(parsed) ? 0 : parsed;
    setLocalAmount(value);
    if (amountTimer.current) clearTimeout(amountTimer.current);
    amountTimer.current = setTimeout(() => commitAmount(value), 300);
  };

  const handleAmountBlur = () => {
    if (amountTimer.current) clearTimeout(amountTimer.current);
    commitAmount();
  };

  const adjustAmount = (delta: number) => {
    if (!expense) return;
    const newValue = Number(Math.max(0, (localAmount + delta)).toFixed(2));
    setLocalAmount(newValue);
    if (amountTimer.current) clearTimeout(amountTimer.current);
    commitAmount(newValue);
  };

  useEffect(() => {
    return () => {
      if (amountTimer.current) clearTimeout(amountTimer.current);
    };
  }, []);

  const footer = (
    <div className="flex w-full flex-col gap-2">
      <Button
        variant="outline"
        onClick={handleAdd}
        disabled={expenses.length >= 3}
        className="w-full"
      >
        <Plus className="w-4 h-4" />
        Add another
      </Button>
      <Button onClick={onAnalyze} className="w-full">
        {buttonIcon === 'arrow' ? <ArrowRight className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
        {buttonText}
      </Button>
    </div>
  );

  if (!expense) {
    return (
      <MobileStepCard step={1} title="Bad Decisions Analyzed" description="Add expenses you'd rather invest." footer={footer}>
        <div className="text-center text-[var(--text-muted)] py-8">No expenses yet.</div>
      </MobileStepCard>
    );
  }

  return (
    <MobileStepCard
      step={1}
      title="Bad Decisions Analyzed"
      description="Track spending you'd rather invest."
      footer={footer}
    >
      <div className="space-y-4">
        {/* Pagination */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {expenses.map((_, idx) => (
              <button
                key={idx}
                onClick={() => setMobileExpenseIndex(idx)}
                className={`h-2 rounded-full transition-all ${idx === mobileExpenseIndex ? 'w-4 bg-[var(--primary)]' : 'w-2 bg-[var(--border)]'}`}
              />
            ))}
          </div>
          <span className="text-xs font-medium text-[var(--text-muted)]">
            {mobileExpenseIndex + 1} of {expenses.length}
          </span>
          {mobileExpenseIndex === 0 ? (
            <div className="w-8" />
          ) : (
            <button
              onClick={() => handleDelete(expense.id)}
              className="p-2 text-[var(--text-muted)] hover:text-red-400 rounded-xl hover:bg-red-900/10 transition-colors"
              title="Remove decision"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Expense card */}
        <div className="space-y-4 rounded-xl border border-[var(--border)] bg-[var(--bg-hover)] p-4">
          <div className="space-y-2">
            <Label htmlFor="expense-name">Expense Name</Label>
            <Input
              id="expense-name"
              type="text"
              value={expense.name}
              onChange={(e) => onUpdate(expense.id, 'name', e.target.value)}
              placeholder="e.g. Netflix"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-amount">Amount</Label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm select-none">$</span>
              <Input
                id="expense-amount"
                type="number"
                min="0"
                step="0.01"
                value={localAmount === 0 ? '' : localAmount}
                onChange={handleAmountChange}
                onBlur={handleAmountBlur}
                placeholder="0"
                className="pl-7 pr-16"
              />
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5">
                <button
                  type="button"
                  onClick={() => adjustAmount(1)}
                  tabIndex={-1}
                  className="w-5 h-3.5 flex items-center justify-center bg-[var(--bg-card)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-t-sm border border-[var(--border)] transition-colors"
                >
                  <ChevronUp className="w-2.5 h-2.5" />
                </button>
                <button
                  type="button"
                  onClick={() => adjustAmount(-1)}
                  tabIndex={-1}
                  className="w-5 h-3.5 flex items-center justify-center bg-[var(--bg-card)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-b-sm border border-[var(--border)] transition-colors"
                >
                  <ChevronDown className="w-2.5 h-2.5" />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="expense-frequency">Frequency</Label>
            <div className="relative">
              <select
                id="expense-frequency"
                value={expense.frequency}
                onChange={(e) => onUpdate(expense.id, 'frequency', e.target.value as Frequency)}
                className="flex h-11 w-full appearance-none rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-2 text-sm text-[var(--text-main)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--bg-card)]"
              >
                {['Weekly', 'Monthly', 'Yearly', 'One-time'].map((option) => (
                  <option key={option} value={option} className="bg-[var(--bg-card)] text-[var(--text-main)]">
                    {option}
                  </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)] pointer-events-none" />
            </div>
          </div>

          <div className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-input)] px-4 py-3">
            <div className="space-y-0.5">
              <Label htmlFor="expense-want" className="text-sm">This is a want</Label>
              <p className="text-xs text-[var(--text-muted)]">Toggle if it's a need</p>
            </div>
            <Switch
              id="expense-want"
              checked={expense.isWant}
              onCheckedChange={(checked) => onUpdate(expense.id, 'isWant', checked)}
            />
          </div>
        </div>
      </div>
    </MobileStepCard>
  );
};
