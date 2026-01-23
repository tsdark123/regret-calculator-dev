import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Calculator, ChevronDown, Check, ChevronUp } from 'lucide-react';
import { Expense, Frequency } from '../types';

interface QueueModuleProps {
  expenses: Expense[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Expense, value: any) => void;
  onAnalyze: () => void;
}

// Internal Custom Amount Input Component
const AmountInput = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(Number((value + 1).toFixed(2)));
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    onChange(Number(Math.max(0, value - 1).toFixed(2)));
  };

  return (
    <div className="relative group w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm select-none">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={value === 0 ? '' : value}
        onChange={(e) => {
            const val = parseFloat(e.target.value);
            onChange(isNaN(val) ? 0 : val);
        }}
        placeholder="0"
        className="w-full bg-[var(--bg-input)] text-[var(--text-main)] pl-7 pr-8 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)] placeholder:opacity-50 text-sm font-medium appearance-none"
      />
      <div className="absolute right-2 top-1/2 -translate-y-1/2 flex flex-col gap-0.5 opacity-100 group-hover:opacity-100 md:opacity-0 focus-within:opacity-100 transition-opacity">
        <button
          onClick={handleIncrement}
          type="button"
          tabIndex={-1}
          className="w-5 h-3.5 flex items-center justify-center bg-[var(--bg-hover)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-t-sm cursor-pointer border border-[var(--border)] hover:border-[var(--primary)] transition-all"
        >
          <ChevronUp className="w-2.5 h-2.5" />
        </button>
        <button
          onClick={handleDecrement}
          type="button"
          tabIndex={-1}
          className="w-5 h-3.5 flex items-center justify-center bg-[var(--bg-hover)] hover:bg-[var(--primary)] text-[var(--text-muted)] hover:text-white rounded-b-sm cursor-pointer border border-[var(--border)] hover:border-[var(--primary)] transition-all"
        >
          <ChevronDown className="w-2.5 h-2.5" />
        </button>
      </div>
    </div>
  );
};

// Internal Custom Dropdown Component
const CustomSelect = ({ 
  value, 
  onChange, 
  options 
}: { 
  value: string; 
  onChange: (val: string) => void; 
  options: string[] 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="relative w-full" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full flex items-center justify-between bg-[var(--bg-input)] text-[var(--text-main)] px-4 py-3 rounded-xl border border-[var(--border)] hover:border-[var(--primary)] transition-all text-sm font-medium focus:outline-none"
      >
        <span>{value}</span>
        <ChevronDown className={`w-3.5 h-3.5 text-[var(--text-muted)] transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>

      {isOpen && (
        <div className="absolute z-50 mt-2 w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-xl shadow-xl overflow-hidden animate-fade-in-down py-1">
          {options.map((option) => (
            <button
              key={option}
              onClick={() => {
                onChange(option);
                setIsOpen(false);
              }}
              className="w-full text-left px-4 py-2.5 text-sm font-medium text-[var(--text-muted)] hover:bg-[var(--primary)] hover:text-white transition-colors flex items-center justify-between group"
            >
              {option}
              {value === option && <Check className="w-3.5 h-3.5 text-[var(--primary)] group-hover:text-white" />}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export const QueueModule: React.FC<QueueModuleProps> = ({
  expenses,
  onAdd,
  onRemove,
  onUpdate,
  onAnalyze,
}) => {
  // Ensure we display at least 5 rows (filled + ghost)
  const minRows = 5;
  const ghostRowCount = Math.max(0, minRows - expenses.length);
  const ghostRows = Array.from({ length: ghostRowCount });

  return (
    <div id="queue-module" className="w-full h-full">
      <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-sm relative overflow-visible h-full flex flex-col">
        
        {/* Header - More Compact */}
        <div className="flex items-center gap-3 mb-3 md:mb-4">
            <div className="w-6 h-6 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)] font-bold text-xs ring-1 ring-[var(--primary)] ring-opacity-20">1</div>
            <h2 className="text-xs md:text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Bad Decisions Analyzed</h2>
        </div>

        {/* List of expenses - Mobile optimized */}
        <div className="space-y-3 md:space-y-2 mb-4 flex-grow overflow-y-auto max-h-[50vh] md:max-h-none">
          {expenses.map((expense) => (
            <div
              key={expense.id}
              className="group flex flex-col gap-3 p-4 md:p-3 rounded-xl md:rounded-2xl bg-[var(--bg-hover)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200"
            >
              {/* Mobile: Stack vertically, Desktop: Single row with all elements */}
              <div className="flex flex-col md:flex-row md:items-end gap-3">
                {/* Expense Name */}
                <div className="flex-1 w-full">
                  <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Expense Name</label>
                  <input
                    type="text"
                    value={expense.name}
                    onChange={(e) => onUpdate(expense.id, 'name', e.target.value)}
                    placeholder="e.g. Netflix"
                    className="w-full bg-[var(--bg-input)] text-[var(--text-main)] px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)] placeholder:opacity-50 text-sm font-medium"
                  />
                </div>

                {/* Amount */}
                <div className="flex-1 md:flex-none md:w-32">
                  <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Amount</label>
                  <AmountInput 
                    value={expense.amount} 
                    onChange={(val) => onUpdate(expense.id, 'amount', val)} 
                  />
                </div>

                {/* Frequency */}
                <div className="flex-1 md:flex-none md:w-40 relative">
                  <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Frequency</label>
                  <CustomSelect 
                    value={expense.frequency}
                    options={['Weekly', 'Monthly', 'Yearly', 'One-time']}
                    onChange={(val) => onUpdate(expense.id, 'frequency', val as Frequency)}
                  />
                </div>

                {/* Want Toggle - aligned with input boxes */}
                <div className="flex items-center h-[46px]">
                  <label className="relative inline-flex items-center cursor-pointer group">
                    <input 
                      type="checkbox" 
                      checked={expense.isWant}
                      onChange={(e) => onUpdate(expense.id, 'isWant', e.target.checked)}
                      className="sr-only peer" 
                    />
                    <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-muted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bg-input)] peer-checked:after:bg-[var(--primary)] transition-colors border border-[var(--border)]"></div>
                    <span className="ml-2 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider group-hover:text-[var(--text-main)] transition-colors">{expense.isWant ? 'WANT' : 'NEED'}</span>
                  </label>
                </div>

                {/* Delete button - aligned with input boxes */}
                <div className="flex items-center h-[46px]">
                  <button
                    onClick={() => onRemove(expense.id)}
                    className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-lg hover:bg-red-900/10 flex items-center justify-center active:scale-95"
                    title="Remove decision"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}

          {/* GHOST ROWS: Visual placeholders to fill space, hidden on mobile */}
          {ghostRows.map((_, idx) => (
            <div key={`ghost-${idx}`} className="hidden md:flex flex-row items-end gap-3 p-3 rounded-2xl border border-dashed border-[var(--border)] opacity-40 select-none pointer-events-none">
               <div className="flex-1">
                <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1 ml-1 uppercase tracking-wider">Expense Name</label>
                <div className="w-full bg-[var(--bg-input)] text-[var(--text-muted)] px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium italic">
                  Empty Slot
                </div>
              </div>

              <div className="w-32">
                 <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1 ml-1 uppercase tracking-wider">Amount</label>
                <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm">$</span>
                    <div className="w-full bg-[var(--bg-input)] text-[var(--text-muted)] pl-7 pr-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium">0</div>
                </div>
              </div>

              <div className="w-40 relative">
                <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1 ml-1 uppercase tracking-wider">Frequency</label>
                <div className="w-full flex items-center justify-between bg-[var(--bg-input)] text-[var(--text-muted)] px-4 py-3 rounded-xl border border-[var(--border)] text-sm font-medium">
                  <span>Monthly</span>
                  <ChevronDown className="w-3.5 h-3.5 text-[var(--text-muted)]" />
                </div>
              </div>

              <div className="flex items-center h-[46px]">
                 <div className="w-11 h-6 bg-[var(--bg-input)] rounded-full relative border border-[var(--border)]">
                    <div className="absolute top-1/2 -translate-y-1/2 left-[2px] bg-[var(--text-muted)] rounded-full h-5 w-5 opacity-50"></div>
                 </div>
              </div>
              
              <div className="p-2 h-[46px] flex items-center text-[var(--text-muted)] rounded-lg">
                <Trash2 className="w-4 h-4" />
              </div>
            </div>
          ))}
        </div>

        {/* Action Buttons - Mobile optimized touch targets */}
        <div className="flex flex-col sm:flex-row gap-3 mt-auto pt-2">
          <button
            onClick={onAdd}
            className="flex-none sm:w-40 py-2.5 border border-[var(--border)] bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all flex items-center justify-center gap-2 text-xs active:scale-[0.98]"
          >
            <Plus className="w-4 h-4" />
            Add another
          </button>
          
          <button
            onClick={onAnalyze}
            className="flex-1 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
          >
            <Calculator className="w-4 h-4" />
            Analyze
          </button>
        </div>
      </div>
    </div>
  );
};