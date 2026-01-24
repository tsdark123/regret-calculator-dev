import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
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
import { MobileMaintenance } from './components/MobileMaintenance';
import { AdminStats } from './components/AdminStats';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { ProDashboard } from './components/ProDashboard';
import { Expense, Assumptions, CalculationResult, StockOption, Theme } from './types';
import { calculateResults } from './utils/financials';
import { getStoredTheme, saveTheme } from './utils/theme';
import { useAnalytics } from './hooks/useAnalytics';

// Extend Window interface for global firebase functions
declare global {
  interface Window {
    setGlobalDecisionCount?: React.Dispatch<React.SetStateAction<number>>;
    incrementCounter?: () => void;
    logActivityEvent?: (data: { city: string; regretAmount: number; expenseName: string }) => void;
    userCity?: string;
    firebaseDB?: any;
    firebaseAuth?: any;
    firebaseRef?: any;
    firebaseOnValue?: any;
    firebaseRunTransaction?: any;
    firebasePush?: any;
    firebaseSet?: any;
    firebaseRemove?: any;
    firebaseOnDisconnect?: any;
    firebaseQuery?: any;
    firebaseLimitToLast?: any;
    firebaseOrderByChild?: any;
    firebaseSignIn?: any;
    firebaseSignOut?: any;
    firebaseOnAuthStateChanged?: any;
  }
}

type NavTab = 'home' | 'calculate' | 'tools' | 'roadmap';

// Main calculator app component
function MainApp() {
  const { decisionCount, incrementDecisionCount, logActivityEvent } = useAnalytics();
  
  const [theme, setTheme] = useState<Theme>(() => getStoredTheme());
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
  const [isProDashboardExpanded, setIsProDashboardExpanded] = useState(false);
  const proDashboardRef = useRef<HTMLDivElement>(null);
  
  // View State: 'input' | 'results' | 'tools' | 'roadmap'
  const [viewMode, setViewMode] = useState<'input' | 'results' | 'tools' | 'roadmap'>('input');
  const [activeTab, setActiveTab] = useState<NavTab>('home');
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Mobile Detection State - catches phones in BOTH portrait AND landscape orientations
  // Uses smaller dimension to prevent bypass by rotating phone
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
       const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
       return smallerDimension < 768;
    }
    return false;
  });

  const inputSectionRef = useRef<HTMLDivElement>(null);

  // Save theme to localStorage whenever it changes
  useEffect(() => {
    saveTheme(theme);
    // Also update the document class for CSS variables
    document.documentElement.className = `theme-${theme}`;
  }, [theme]);

  // Remove visibility hidden set by index.html flash prevention
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);

  // Monitor Window Resize for Mobile Detection (checks smaller dimension for orientation bypass prevention)
  useEffect(() => {
    const handleResize = () => {
        const smallerDimension = Math.min(window.innerWidth, window.innerHeight);
        setIsMobileView(smallerDimension < 768);
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
    incrementDecisionCount();
    
    setIsLoading(true);
    setTimeout(() => {
        const calculated = calculateResults(expenses, assumptions);
        setResults(calculated);
        setResultsKey(prev => prev + 1);
        setIsLoading(false);
        setViewMode('results');
        
        // 2. Log activity event with city, regret amount, and first expense name
        const firstExpenseName = expenses[0]?.name || 'Expense';
        logActivityEvent({
          city: window.userCity || 'Unknown',
          regretAmount: calculated.potentialValueUnlocked,
          expenseName: firstExpenseName
        });
        
        if (inputSectionRef.current) {
            inputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }, 2000);
  };

  const handleEditInputs = () => {
      setViewMode('input');
  };

  const handleToggleProDashboard = useCallback(() => {
    if (!isProDashboardExpanded) {
      setIsProDashboardExpanded(true);
      // Wait for state update and DOM render, then scroll
      setTimeout(() => {
        if (proDashboardRef.current) {
          const yOffset = -180; // Increased offset to scroll higher
          const y = proDashboardRef.current.getBoundingClientRect().top + window.pageYOffset + yOffset;
          window.scrollTo({ top: y, behavior: 'smooth' });
        }
      }, 100);
    } else {
      // Just collapse without scrolling
      setIsProDashboardExpanded(false);
    }
  }, [isProDashboardExpanded]);
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

  // Show maintenance screen on mobile
  if (isMobileView) {
    return <MobileMaintenance />;
  }

  return (
    <>
      <AnalyticsTracker />
      <div className={`flex flex-col theme-${theme} min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white relative bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500`}>
        {/* Full-Viewport Particle Background - Outside all containers */}
        <ParticleBackground theme={theme} />
        
        {/* Desktop Navbar */}
        <Navbar 
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
              <div className="fixed inset-0 z-40 pt-16 animate-fade-in-up">
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
                                  
                                  {/* Expand Button for Pro Dashboard */}
                                  <div className="flex justify-center -mt-4 mb-12">
                                    <motion.button
                                      onClick={handleToggleProDashboard}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] 
                                                 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] 
                                                 hover:border-[var(--text-muted)] transition-colors text-sm font-medium"
                                    >
                                      <motion.span
                                        animate={{ rotate: isProDashboardExpanded ? 180 : 0 }}
                                        transition={{ duration: 0.3, ease: "easeInOut" }}
                                      >
                                        ↓
                                      </motion.span>
                                      {isProDashboardExpanded ? 'Collapse' : 'Expand Advanced Analysis & Projections'}
                                    </motion.button>
                                  </div>

                                  {/* Pro Dashboard - Animated with Framer Motion */}
                                  <div ref={proDashboardRef}>
                                    <AnimatePresence mode="wait">
                                      {isProDashboardExpanded && (
                                        <motion.div
                                          initial={{ opacity: 0, scaleY: 0.95, y: -20 }}
                                          animate={{ 
                                            opacity: 1, 
                                            scaleY: 1, 
                                            y: 0,
                                            transition: {
                                              duration: 0.35,
                                              ease: [0.25, 0.46, 0.45, 0.94],
                                              opacity: { duration: 0.3 },
                                              scaleY: { duration: 0.35 },
                                              y: { duration: 0.35 }
                                            }
                                          }}
                                          exit={{ 
                                            opacity: 0, 
                                            scaleY: 0.95,
                                            y: -15,
                                            transition: {
                                              duration: 0.25,
                                              ease: [0.55, 0.085, 0.68, 0.53],
                                              opacity: { duration: 0.2 }
                                            }
                                          }}
                                          style={{ originY: 0 }}
                                          className="will-change-transform"
                                        >
                                          <ProDashboard 
                                            results={results} 
                                            assumptions={assumptions} 
                                            theme={theme}
                                          />
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                              </div>
                          )}
                      </div>
                  </main>
                  <Footer />
              </>
            )}
        </div>
      </div>
    </>
  );
}

// Root App component with path-based routing
function App() {
  const [currentPath, setCurrentPath] = useState(() => window.location.pathname);

  useEffect(() => {
    const handlePopState = () => setCurrentPath(window.location.pathname);
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Render admin page if on /admin-stats route
  if (currentPath === '/admin-stats') {
    return <AdminStats />;
  }

  return <MainApp />;
}

export default App;
