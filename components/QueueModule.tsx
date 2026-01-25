import React, { useState, useRef, useEffect } from 'react';
import { Trash2, Plus, Calculator, ChevronDown, Check, ChevronUp, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import { Expense, Frequency } from '../types';

interface QueueModuleProps {
  expenses: Expense[];
  onAdd: () => void;
  onRemove: (id: string) => void;
  onUpdate: (id: string, field: keyof Expense, value: any) => void;
  onAnalyze: () => void;
  buttonText?: string;
  buttonIcon?: 'calculator' | 'arrow';
}

// Internal Debounced Name Input Component
const NameInput = ({ value, onChange }: { value: string; onChange: (val: string) => void }) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Update local value when prop changes (e.g., switching expenses)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalValue(newValue);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced update
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, 150); // Short delay for name input
  };

  // Flush immediately on blur to commit value before navigation
  const handleBlur = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  // Cleanup and flush on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  return (
    <input
      type="text"
      value={localValue}
      onChange={handleChange}
      onBlur={handleBlur}
      placeholder="e.g. Netflix"
      className="w-full bg-[var(--bg-input)] text-[var(--text-main)] px-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-colors placeholder:text-[var(--text-muted)] placeholder:opacity-50 text-sm font-medium"
    />
  );
};

// Internal Custom Amount Input Component - Simplified direct pattern like NameInput
const AmountInput = ({ value, onChange }: { value: number; onChange: (val: number) => void }) => {
  const [localValue, setLocalValue] = useState(value);
  const debounceTimer = useRef<NodeJS.Timeout>();

  // Sync local value when prop changes (component remount handles expense switching)
  useEffect(() => {
    setLocalValue(value);
  }, [value]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const parsed = parseFloat(e.target.value);
    const newValue = isNaN(parsed) ? 0 : Math.max(0, parsed);
    setLocalValue(newValue);
    
    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    
    // Set new timer for debounced update to parent
    debounceTimer.current = setTimeout(() => {
      onChange(newValue);
    }, 300);
  };

  // Flush immediately on blur to commit value before navigation
  const handleBlur = () => {
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }
    if (localValue !== value) {
      onChange(localValue);
    }
  };

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  const handleIncrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newValue = Number((localValue + 1).toFixed(2));
    setLocalValue(newValue);
    onChange(newValue); // Immediate update for button clicks
  };

  const handleDecrement = (e: React.MouseEvent) => {
    e.preventDefault();
    const newValue = Number(Math.max(0, localValue - 1).toFixed(2));
    setLocalValue(newValue);
    onChange(newValue); // Immediate update for button clicks
  };

  return (
    <div className="relative group w-full">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--text-muted)] text-sm select-none">$</span>
      <input
        type="number"
        min="0"
        step="0.01"
        value={localValue === 0 ? '' : localValue}
        onChange={handleChange}
        onBlur={handleBlur}
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
  buttonText = 'Analyze',
  buttonIcon = 'calculator',
}) => {
  // Mobile: Track which expense is currently visible
  const [mobileExpenseIndex, setMobileExpenseIndex] = useState(0);
  const isMobile = typeof window !== 'undefined' && window.innerWidth < 1024;

  // When expenses change, ensure index is valid
  useEffect(() => {
    if (mobileExpenseIndex >= expenses.length && expenses.length > 0) {
      setMobileExpenseIndex(expenses.length - 1);
    }
  }, [expenses.length, mobileExpenseIndex]);

  // Navigate to next expense on mobile
  const goToNextExpense = () => {
    if (mobileExpenseIndex < expenses.length - 1) {
      setMobileExpenseIndex(mobileExpenseIndex + 1);
    }
  };

  // Navigate to previous expense on mobile
  const goToPrevExpense = () => {
    if (mobileExpenseIndex > 0) {
      setMobileExpenseIndex(mobileExpenseIndex - 1);
    }
  };

  // Handle add with navigation to new expense - optimized for instant feedback
  // Mobile limit: max 3 expenses during beta
  const handleAddExpense = () => {
    if (isMobile && expenses.length >= 3) return; // Mobile hard limit
    const newIndex = expenses.length; // Capture before state update
    onAdd();
    setMobileExpenseIndex(newIndex); // Navigate immediately, no delay
  };

  // Handle delete with proper index adjustment
  const handleDeleteExpense = (id: string) => {
    const deletingIndex = expenses.findIndex(e => e.id === id);
    onRemove(id);
    
    // Adjust index after deletion
    if (deletingIndex === mobileExpenseIndex && mobileExpenseIndex > 0) {
      setMobileExpenseIndex(mobileExpenseIndex - 1);
    } else if (deletingIndex < mobileExpenseIndex) {
      setMobileExpenseIndex(mobileExpenseIndex - 1);
    }
  };

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

        {/* List of expenses - Desktop: scrollable list, Mobile: single card with navigation */}
        <div className="space-y-3 md:space-y-2 mb-4 flex-grow md:overflow-y-auto md:max-h-none">
          {/* Desktop: Show all expenses */}
          <div className="hidden md:block space-y-2">
            {expenses.map((expense) => (
              <div
                key={expense.id}
                className="group flex flex-col gap-3 p-3 rounded-2xl bg-[var(--bg-hover)] border border-[var(--border)] hover:border-[var(--primary)] transition-all duration-200"
              >
                <div className="flex flex-row items-end gap-3">
                  {/* Expense Name */}
                  <div className="flex-1">
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
                  <div className="w-32">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Amount</label>
                    <AmountInput 
                      value={expense.amount} 
                      onChange={(val) => onUpdate(expense.id, 'amount', val)} 
                    />
                  </div>

                  {/* Frequency */}
                  <div className="w-40 relative">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Frequency</label>
                    <CustomSelect 
                      value={expense.frequency}
                      options={['Weekly', 'Monthly', 'Yearly', 'One-time']}
                      onChange={(val) => onUpdate(expense.id, 'frequency', val as Frequency)}
                    />
                  </div>

                  {/* Want Toggle */}
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

                  {/* Delete button */}
                  <div className="flex items-center h-[46px]">
                    <button
                      onClick={() => handleDeleteExpense(expense.id)}
                      className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-xl hover:bg-red-900/10 flex items-center justify-center active:scale-95"
                      title="Remove decision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Mobile: Single expense card with navigation arrows */}
          <div className="md:hidden">
            {expenses.length > 0 && expenses[mobileExpenseIndex] && (
              <div className="relative" key={expenses[mobileExpenseIndex].id}>
                {/* Navigation indicator */}
                <div className="flex items-center justify-center gap-2 mb-3">
                  {expenses.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={() => setMobileExpenseIndex(idx)}
                      className={`w-2 h-2 rounded-full transition-all ${idx === mobileExpenseIndex ? 'bg-[var(--primary)] w-4' : 'bg-[var(--border)]'}`}
                    />
                  ))}
                </div>

                <div className="group flex flex-col gap-3 p-4 rounded-xl bg-[var(--bg-hover)] border border-[var(--border)] transition-all duration-200">
                  {/* Top row: Trash on left, pagination info center, Next arrow on right */}
                  <div className="flex items-center justify-between mb-2">
                    <button
                      onClick={() => handleDeleteExpense(expenses[mobileExpenseIndex].id)}
                      className="p-2 text-[var(--text-muted)] hover:text-red-400 transition-colors rounded-xl hover:bg-red-900/10 flex items-center justify-center active:scale-95"
                      title="Remove decision"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                    
                    <span className="text-xs text-[var(--text-muted)] font-medium">
                      {mobileExpenseIndex + 1} of {expenses.length}
                    </span>

                    {/* Right arrow - subtle bounce animation when there are more expenses */}
                    {expenses.length > 1 && mobileExpenseIndex < expenses.length - 1 ? (
                      <button
                        onClick={goToNextExpense}
                        className="p-2 mt-1 text-[var(--primary)] hover:text-[var(--primary-hover)] transition-colors rounded-xl hover:bg-[var(--primary)]/10 flex items-center justify-center active:scale-95 animate-[subtleBounceSmall_2s_ease-in-out_infinite]"
                        title="Next expense"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    ) : mobileExpenseIndex > 0 ? (
                      <button
                        onClick={goToPrevExpense}
                        className="p-2 text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors rounded-xl hover:bg-[var(--primary)]/10 flex items-center justify-center active:scale-95"
                        title="Previous expense"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                    ) : (
                      <div className="w-9 h-9" /> // Placeholder for alignment
                    )}
                  </div>

                  {/* Expense Name */}
                  <div className="w-full">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Expense Name</label>
                    <NameInput
                      value={expenses[mobileExpenseIndex].name}
                      onChange={(val) => onUpdate(expenses[mobileExpenseIndex].id, 'name', val)}
                    />
                  </div>

                  {/* Amount */}
                  <div className="w-full">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Amount</label>
                    <AmountInput 
                      value={expenses[mobileExpenseIndex].amount} 
                      onChange={(val) => onUpdate(expenses[mobileExpenseIndex].id, 'amount', val)} 
                    />
                  </div>

                  {/* Frequency */}
                  <div className="w-full relative">
                    <label className="block text-[10px] font-semibold text-[var(--text-muted)] mb-1.5 ml-1 uppercase tracking-wider">Frequency</label>
                    <CustomSelect 
                      value={expenses[mobileExpenseIndex].frequency}
                      options={['Weekly', 'Monthly', 'Yearly', 'One-time']}
                      onChange={(val) => onUpdate(expenses[mobileExpenseIndex].id, 'frequency', val as Frequency)}
                    />
                  </div>

                  {/* Want Toggle */}
                  <div className="flex items-center">
                    <label className="relative inline-flex items-center cursor-pointer group">
                      <input 
                        type="checkbox" 
                        checked={expenses[mobileExpenseIndex].isWant}
                        onChange={(e) => onUpdate(expenses[mobileExpenseIndex].id, 'isWant', e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-[var(--bg-input)] peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-[var(--text-muted)] after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-[var(--bg-input)] peer-checked:after:bg-[var(--primary)] transition-colors border border-[var(--border)]"></div>
                      <span className="ml-2 text-xs text-[var(--text-muted)] font-medium uppercase tracking-wider group-hover:text-[var(--text-main)] transition-colors">{expenses[mobileExpenseIndex].isWant ? 'WANT' : 'NEED'}</span>
                    </label>
                  </div>
                </div>
              </div>
            )}
          </div>

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
          {/* Mobile: Hide button when limit reached, Desktop: Always show */}
          {!(isMobile && expenses.length >= 3) && (
            <button
              onClick={handleAddExpense}
              className="flex-none sm:w-40 py-2.5 border border-[var(--border)] bg-[var(--bg-input)] rounded-xl text-[var(--text-muted)] font-medium hover:bg-[var(--bg-hover)] hover:text-[var(--text-main)] transition-all flex items-center justify-center gap-2 text-xs active:scale-[0.98]"
            >
              <Plus className="w-4 h-4" />
              Add another
            </button>
          )}
          
          <button
            onClick={onAnalyze}
            className="flex-1 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
          >
            {buttonIcon === 'arrow' ? <ArrowRight className="w-4 h-4" /> : <Calculator className="w-4 h-4" />}
            {buttonText}
          </button>
        </div>
      </div>
    </div>
  );
};