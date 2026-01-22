import React, { useState, useRef, useEffect } from 'react';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { MobileNav } from './components/MobileNav';
import { QueueModule } from './components/QueueModule';
import { SettingsPanel } from './components/SettingsPanel';
import { ResultsDashboard } from './components/ResultsDashboard';
import { StockSelector } from './components/StockSelector';
import { Footer } from './components/Footer';
import { AmbientBackground } from './components/AmbientBackground';
import { FunFactGenerator } from './components/FunFactGenerator';
import { ToolsDashboard } from './components/ToolsDashboard';
import { Roadmap } from './components/Roadmap';
import { LoadingScreen } from './components/LoadingScreen';
import { ParticleBackground } from './components/ParticleBackground';
import { Expense, Assumptions, CalculationResult, StockOption, Theme } from './types';
import { calculateResults } from './utils/financials';

// Extend Window interface for global firebase functions
declare global {
  interface Window {
    setGlobalDecisionCount?: React.Dispatch<React.SetStateAction<number>>;
    incrementCounter?: () => void;
  }
}

type NavTab = 'home' | 'calculate' | 'tools' | 'roadmap';

function App() {
  const [theme, setTheme] = useState<Theme>('purple');
  const [expenses, setExpenses] = useState<Expense[]>([
    { id: '1', name: 'Subscription', amount: 15, frequency: 'Monthly', isWant: true },
  ]);

  const [assumptions, setAssumptions] = useState<Assumptions>({
    annualReturn: 10,
    inflationAdjusted: false,
    inflationRate: 3,
    timeHorizonYears: 30,
    selectedStock: undefined,
  });

  const [results, setResults] = useState<CalculationResult | null>(null);
  const [resultsKey, setResultsKey] = useState(0);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  
  // View State: 'input' | 'results' | 'tools' | 'roadmap'
  const [viewMode, setViewMode] = useState<'input' | 'results' | 'tools' | 'roadmap'>('input');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Global Decisions Count (Live Simulation + Real Input)
  const [decisionCount, setDecisionCount] = useState(543);

  // Mobile Detection State - now used for responsive adjustments, not blocking
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
       return window.innerWidth < 768;
    }
    return false;
  });

  const inputSectionRef = useRef<HTMLDivElement>(null);

  // Register the local state setter function globally so index.html can use it
  useEffect(() => {
    if (typeof window !== 'undefined') {
        window.setGlobalDecisionCount = setDecisionCount;
    }
  }, []);

  // Monitor Window Resize for Mobile Detection
  useEffect(() => {
    const handleResize = () => {
        setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const handleStart = () => {
    setActiveTab('calculate');
    const scrollOffset = 180;

    // Reset view mode if currently on other pages
    if (viewMode === 'tools' || viewMode === 'roadmap') {
        setViewMode('input');
        setTimeout(() => {
            if (inputSectionRef.current) {
                const top = inputSectionRef.current.getBoundingClientRect().top + window.scrollY - scrollOffset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        }, 50);
        return;
    }

    if (viewMode === 'results') {
        setViewMode('input');
    }
    
    if (inputSectionRef.current) {
        const top = inputSectionRef.current.getBoundingClientRect().top + window.scrollY - scrollOffset;
        window.scrollTo({ top, behavior: 'smooth' });
    }
  };

  const handleLoadPreset = (expense: Expense) => {
      setExpenses(prev => [...prev, expense]);
      handleStart(); 
  };

  const generateId = () => Math.random().toString(36).substr(2, 9);

  const addExpense = () => {
    const newExpense: Expense = {
      id: generateId(),
      name: '',
      amount: 0,
      frequency: 'Monthly',
      isWant: true,
    };
    setExpenses([...expenses, newExpense]);
  };

  const removeExpense = (id: string) => {
    setExpenses(expenses.filter((e) => e.id !== id));
  };

  const updateExpense = (id: string, field: keyof Expense, value: any) => {
    setExpenses(
      expenses.map((e) => (e.id === id ? { ...e, [field]: value } : e))
    );
  };

  const updateAssumptions = (field: keyof Assumptions, value: any) => {
    setAssumptions((prev) => ({ ...prev, [field]: value }));
  };

  const handleStockSelect = (stock: StockOption) => {
    setAssumptions(prev => ({
      ...prev,
      selectedStock: stock,
      annualReturn: stock.avgReturn // Auto-update return rate
    }));
  };

  const handleAnalyze = () => {
    // 1. Increment the Global Counter via Firebase if available
    if (typeof window.incrementCounter === 'function') {
      window.incrementCounter();
    } else {
      // Fallback if firebase isn't loaded
      setDecisionCount(prev => prev + 1);
    }
    
    setIsLoading(true);
    setTimeout(() => {
        const calculated = calculateResults(expenses, assumptions);
        setResults(calculated);
        setResultsKey(prev => prev + 1);
        setIsLoading(false);
        setViewMode('results');
        if (inputSectionRef.current) {
            inputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 2000);
  };

  const handleEditInputs = () => {
      setViewMode('input');
  };

  const handleReset = () => {
    setExpenses([{ id: '1', name: 'Subscription', amount: 15, frequency: 'Monthly', isWant: true }]);
    setResults(null);
    setViewMode('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavTab) => {
      setActiveTab(tab);
      if (tab === 'home') {
          setViewMode('input');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tab === 'calculate') {
          handleStart();
      } else if (tab === 'tools') {
          setViewMode('tools');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tab === 'roadmap') {
          setViewMode('roadmap'); 
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <div className={`flex flex-col theme-${theme} min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white relative text-[var(--text-main)] transition-colors duration-500 pb-20 md:pb-0`} style={{ background: 'transparent' }}>
      {/* Full-Viewport Particle Background - Outside all containers */}
      <ParticleBackground theme={theme} />
      
      {/* Desktop Navbar */}
      <div className="hidden md:block">
        <Navbar 
          activeTab={activeTab} 
          onNavigate={handleNavigate} 
          currentTheme={theme}
          onThemeChange={setTheme}
        />
      </div>
      
      {/* Mobile Bottom Nav */}
      <MobileNav 
        activeTab={activeTab} 
        onNavigate={handleNavigate} 
        currentTheme={theme}
        onThemeChange={setTheme}
      />
      
      {isLoading && <LoadingScreen />}

      <StockSelector 
        isOpen={isStockModalOpen} 
        onClose={() => setIsStockModalOpen(false)} 
        onSelect={handleStockSelect}
        currentStockSymbol={assumptions.selectedStock?.symbol}
      />

      {/* Main Content Router */}
      <div className="flex-grow">
          {viewMode === 'tools' ? (
            <div className="pt-24 px-4 pb-12 w-full max-w-[96rem] mx-auto animate-fade-in-up">
              <ToolsDashboard theme={theme} />
            </div>
          ) : viewMode === 'roadmap' ? (
            /* Roadmap now takes full control of positioning to center itself */
            <div className="fixed inset-0 z-40 bg-[var(--bg-main)] pt-16 animate-fade-in-up">
                <Roadmap />
            </div>
          ) : (
            /* VIEW: CALCULATOR (HERO + MAIN) */
            <>
                <Hero 
                    onStart={handleStart} 
                    onLoadPreset={handleLoadPreset} 
                    decisionCount={decisionCount} 
                />
                
                <main className="px-4 py-8 md:px-8 w-full min-h-[600px] relative" ref={inputSectionRef}>
                    <AmbientBackground />
                    <div className="max-w-[96rem] mx-auto space-y-8 relative z-10">
                        
                        {viewMode === 'input' && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in-up">
                                {/* Left Block: Inputs */}
                                <div className="lg:col-span-7 xl:col-span-8">
                                    <QueueModule
                                        expenses={expenses}
                                        onAdd={addExpense}
                                        onRemove={removeExpense}
                                        onUpdate={updateExpense}
                                        onAnalyze={handleAnalyze}
                                    />
                                </div>
                                
                                {/* Right Block: Assumptions + Fun Fact */}
                                <div className="lg:col-span-5 xl:col-span-4 flex flex-col gap-6">
                                    <div className="flex-1">
                                        <SettingsPanel 
                                            assumptions={assumptions} 
                                            onChange={updateAssumptions} 
                                            onOpenStockSelector={() => setIsStockModalOpen(true)}
                                        />
                                    </div>
                                    <FunFactGenerator />
                                </div>
                            </div>
                        )}

                        {viewMode === 'results' && results && (
                            <div key={resultsKey} className="w-full animate-fade-in-up">
                                <ResultsDashboard 
                                    results={results} 
                                    assumptions={assumptions}
                                    horizon={assumptions.timeHorizonYears}
                                    onReset={handleReset}
                                    onEdit={handleEditInputs}
                                    selectedStock={assumptions.selectedStock}
                                    theme={theme}
                                />
                            </div>
                        )}
                    </div>
                </main>
                <Footer />
            </>
          )}
      </div>
    </div>
  );
}

export default App;