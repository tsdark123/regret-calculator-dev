import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Hero } from './components/Hero';
import { Navbar } from './components/Navbar';
import { QueueModule } from './components/QueueModule';
import { SettingsPanel } from './components/SettingsPanel';
import { StockSelector } from './components/StockSelector';
import { Footer } from './components/Footer';
import { MobileFAQ } from './components/MobileFAQ';
import { TestimonialsSection } from './components/TestimonialsSection';
import { FeaturesReveal } from './components/FeaturesReveal';
import { GlobeSection } from './components/GlobeSection';
import { AmbientBackground } from './components/AmbientBackground';
import { FunFactGenerator } from './components/FunFactGenerator';
import { ToolsDashboard } from './components/ToolsDashboard';
import { Roadmap } from './components/Roadmap';
import { LoadingScreen } from './components/LoadingScreen';
import { PrivacyPolicy } from './components/PrivacyPolicy';
import { TermsOfService } from './components/TermsOfService';
import { ParticleBackground } from './components/ParticleBackground';
import { ThemeBackground } from './components/ThemeBackground';
import { SnowBackground } from './components/SnowBackground';
// Mobile maintenance removed - full responsive support enabled
import { AdminStats } from './components/AdminStats';
import { AnalyticsTracker } from './components/AnalyticsTracker';
import { MobileBottomNav } from './components/MobileBottomNav';
import { MobileIntro } from './components/MobileIntro';
import { StatusPanel } from './components/StatusPanel';
import { ArrowRight, Calculator, RefreshCw } from 'lucide-react';

import { ResultsDashboard } from './components/ResultsDashboard';
import { Expense, Assumptions, CalculationResult, StockOption, Theme } from './types';
import { calculateResults } from './utils/financials';
import { getStoredTheme, saveTheme } from './utils/theme';
import { useAnalytics } from './hooks/useAnalytics';

// Extend Window interface for global firebase functions
declare global {
  interface Window {
    setGlobalDecisionCount?: React.Dispatch<React.SetStateAction<number>>;
    latestDecisionCount?: number;
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

function RoadmapLayout() {
  const roadmapColRef = useRef<HTMLDivElement>(null);
  const [roadmapHeight, setRoadmapHeight] = useState<number | null>(450); // Default height for 1 expanded item

  useEffect(() => {
    const el = roadmapColRef.current;
    if (!el) return;
    let cardObs: ResizeObserver | null = null;

    // Immediately measure initial height to prevent flash
    const card = el.querySelector('.roadmap-card') as HTMLElement | null;
    if (card) {
      setRoadmapHeight(card.offsetHeight);
    }

    const colObs = new ResizeObserver(() => {
      const card = el.querySelector('.roadmap-card') as HTMLElement | null;
      if (card) {
        setRoadmapHeight(card.offsetHeight);
        if (!cardObs) {
          cardObs = new ResizeObserver(() => setRoadmapHeight(card.offsetHeight));
          cardObs.observe(card);
        }
      }
    });
    colObs.observe(el);
    return () => { colObs.disconnect(); cardObs?.disconnect(); };
  }, []);

  return (
    <div className="fixed inset-0 z-40 pt-16 animate-fade-in-up">
      {/* Desktop: side-by-side layout */}
      <div className="hidden md:flex w-full h-full items-center justify-center gap-6 px-6 overflow-y-auto py-6">
        <div className="flex-shrink-0" style={{ width: 380, height: roadmapHeight ?? undefined }}>
          <StatusPanel />
        </div>
        <div ref={roadmapColRef} className="flex-1 max-w-4xl">
          <Roadmap cardClassName="roadmap-card" />
        </div>
      </div>
      {/* Mobile: roadmap only */}
      <div className="md:hidden w-full h-full">
        <Roadmap />
      </div>
    </div>
  );
}

// Main calculator app component
function MainApp() {
  const { decisionCount, incrementDecisionCount, logActivityEvent } = useAnalytics();
  
  // Mobile intro state - only show on first visit for mobile users
  const [showMobileIntro, setShowMobileIntro] = useState(() => {
    if (typeof window === 'undefined') return false;
    const isMobile = window.innerWidth < 768;
    const hasSeenIntro = sessionStorage.getItem('hasSeenIntro');
    const isHomePath = window.location.pathname === '/' || window.location.pathname === '';
    return isMobile && !hasSeenIntro && isHomePath;
  });

  const handleIntroComplete = () => {
    sessionStorage.setItem('hasSeenIntro', 'true');
    setShowMobileIntro(false);
  };

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
  
  // View State: 'input' | 'results' | 'tools' | 'roadmap'
  // Initialize based on current path for proper refresh behavior
  const [viewMode, setViewMode] = useState<'input' | 'results' | 'tools' | 'roadmap'>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/tools' || path.startsWith('/tools')) return 'tools';
      if (path === '/roadmap' || path.startsWith('/roadmap')) return 'roadmap';
      if (path === '/results' || path.startsWith('/results')) return 'results';
    }
    return 'input';
  });
  
  // Route state for mobile navigation
  const [currentPath, setCurrentPath] = useState<string>(() => {
    if (typeof window !== 'undefined') {
      return window.location.pathname;
    }
    return '/';
  });
  
  // Active tab state - sync with current path on mount
  const [activeTab, setActiveTab] = useState<NavTab>(() => {
    if (typeof window !== 'undefined') {
      const path = window.location.pathname;
      if (path === '/calculate' || path.startsWith('/calculate')) return 'calculate';
      if (path === '/results' || path.startsWith('/results')) return 'calculate';
      if (path === '/tools' || path.startsWith('/tools')) return 'tools';
      if (path === '/roadmap' || path.startsWith('/roadmap')) return 'roadmap';
    }
    return 'home';
  });
  
  // Mobile wizard step state (1: Decisions, 2: Assumptions, 3: Final Wisdom)
  const [mobileStep, setMobileStep] = useState<1 | 2 | 3>(1);
  
  // Loading State
  const [isLoading, setIsLoading] = useState(false);

  // Scroll to top on page reload for desktop users
  useEffect(() => {
    // Disable browser's automatic scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Check if this is a page reload (not initial load)
    const isReload = window.performance && (
      window.performance.navigation.type === 1 || // TYPE_RELOAD
      (window.performance.getEntriesByType && 
       (window.performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming)?.type === 'reload')
    );
    
    if (isReload) {
      // Page was reloaded - force scroll to top multiple times
      window.scrollTo({ top: 0, behavior: 'instant' });
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Additional scroll after a short delay to override browser restoration
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
        document.documentElement.scrollTop = 0;
        document.body.scrollTop = 0;
      }, 100);
      
      // Final scroll after React renders
      setTimeout(() => {
        window.scrollTo({ top: 0, behavior: 'instant' });
      }, 500);
    }
  }, []);

  // Financial wisdom quotes
  const financialWisdoms = [
    "The best time to start investing was yesterday. The second best time is now.",
    "Compound interest is the eighth wonder of the world. He who understands it, earns it; he who doesn't, pays it.",
    "Do not save what is left after spending, but spend what is left after saving.",
    "An investment in knowledge pays the best interest.",
    "The stock market is a device for transferring money from the impatient to the patient.",
    "Price is what you pay. Value is what you get.",
    "The individual investor should act consistently as an investor and not as a speculator.",
    "Risk comes from not knowing what you're doing.",
    "Time in the market beats timing the market.",
    "The four most dangerous words in investing are: 'This time it's different.'",
    "Wide diversification is only required when investors do not understand what they are doing.",
    "Never invest in a business you cannot understand.",
    "The biggest risk of all is not taking one.",
    "It's not how much money you make, but how much money you keep.",
    "Investing should be more like watching paint dry or watching grass grow. If you want excitement, take $800 and go to Las Vegas.",
    "The goal of a successful trader is to make the best trades. Money is secondary.",
    "Every dollar you don't spend today is a seed for your financial forest tomorrow.",
    "Small leaks sink great ships. Small expenses destroy great fortunes.",
    "The pain of discipline weighs ounces. The pain of regret weighs tons.",
    "Your future self is watching your decisions today. Make them proud.",
    "Wealth is not about having a lot of money; it's about having a lot of options.",
    "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order, trains to forethought.",
    "Financial freedom is available to those who learn about it and work for it.",
    "Don't wait to buy real estate. Buy real estate and wait."
  ];
  const [currentWisdomIndex, setCurrentWisdomIndex] = useState(0);

  const cycleWisdom = () => {
    setCurrentWisdomIndex((prev) => (prev + 1) % financialWisdoms.length);
  };

  // Mobile detection for responsive adaptations (no longer blocks the app)
  const [isMobileView, setIsMobileView] = useState(() => {
    if (typeof window !== 'undefined') {
       return window.innerWidth < 768;
    }
    return false;
  });

  // Listen for route changes
  useEffect(() => {
    const handlePopState = () => {
      setCurrentPath(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  // Guardrail: Redirect from /results if no results data exists
  useEffect(() => {
    if ((currentPath === '/results' || currentPath.startsWith('/results')) && !results) {
      // No results data - redirect to home
      window.history.replaceState({}, '', '/');
      setCurrentPath('/');
      setActiveTab('home'); // Bug fix: sync nav icon to home
      setViewMode('input');
      setMobileStep(1);
    }
  }, [currentPath, results]);

  // Removed auto-expand ProDashboard - users should manually expand if they want to see advanced analysis

  // Disable scroll on /calculate and /roadmap for mobile. Home / uses scroll-snap container.
  // /results and /tools can scroll normally.
  useEffect(() => {
    if (window.innerWidth < 1024) {
      const isScrollLocked = currentPath === '/calculate' || currentPath.startsWith('/calculate') ||
                             currentPath === '/roadmap' || currentPath.startsWith('/roadmap');
      if (isScrollLocked) {
        // Lock scroll completely - Safari-compatible fix
        document.documentElement.classList.add('scroll-locked');
        document.documentElement.style.overflow = 'hidden';
        document.documentElement.style.height = '100%';
        document.body.style.overflow = 'hidden';
        document.body.style.height = '100%';
        document.body.style.position = 'fixed';
        document.body.style.width = '100%';
        document.body.style.top = '0';
        document.body.style.left = '0';
        // Safari-specific: prevent touch scrolling and overscroll bounce
        document.body.style.touchAction = 'none';
        document.body.style.overscrollBehavior = 'none';
        document.documentElement.style.overscrollBehavior = 'none';
      } else {
        // Other pages (/results, /tools): enable scroll
        document.documentElement.classList.remove('scroll-locked');
        document.documentElement.style.overflow = 'auto';
        document.documentElement.style.height = 'auto';
        document.body.style.overflow = 'auto';
        document.body.style.height = 'auto';
        document.body.style.position = 'static';
        document.body.style.width = 'auto';
        document.body.style.top = '';
        document.body.style.left = '';
        document.body.style.touchAction = '';
        document.body.style.overscrollBehavior = '';
        document.documentElement.style.overscrollBehavior = '';
      }
    } else {
      // Desktop: always enable scroll
      document.documentElement.classList.remove('scroll-locked');
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    }

    return () => {
      document.documentElement.classList.remove('scroll-locked');
      document.documentElement.style.overflow = 'auto';
      document.documentElement.style.height = 'auto';
      document.body.style.overflow = 'auto';
      document.body.style.height = 'auto';
      document.body.style.position = 'static';
      document.body.style.width = 'auto';
      document.body.style.top = '';
      document.body.style.left = '';
      document.body.style.touchAction = '';
      document.body.style.overscrollBehavior = '';
      document.documentElement.style.overscrollBehavior = '';
    };
  }, [currentPath]);

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

  // Monitor Window Resize for Mobile Detection
  useEffect(() => {
    const handleResize = () => {
        setIsMobileView(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Prevent horizontal scrolling with arrow keys
  useEffect(() => {
    const preventHorizontalArrowScroll = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        // Only prevent if not in an input/textarea
        const target = e.target as HTMLElement;
        if (target.tagName !== 'INPUT' && target.tagName !== 'TEXTAREA') {
          e.preventDefault();
        }
      }
    };

    window.addEventListener('keydown', preventHorizontalArrowScroll);
    return () => window.removeEventListener('keydown', preventHorizontalArrowScroll);
  }, []);

  const handleStart = () => {
    // Mobile: Navigate to /calculate route
    if (window.innerWidth < 1024) {
      window.history.pushState({}, '', '/calculate');
      setCurrentPath('/calculate');
      setActiveTab('calculate');
      setViewMode('input');
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // Desktop: If on /tools or /roadmap, redirect to home
    if (currentPath === '/tools' || currentPath.startsWith('/tools') || 
        currentPath === '/roadmap' || currentPath.startsWith('/roadmap')) {
        window.location.href = '/';
        return;
    }

    // Desktop: Scroll to input section
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
        
        // Mobile: Navigate to /results route
        if (window.innerWidth < 1024) {
            window.history.pushState({}, '', '/results');
            setCurrentPath('/results');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        } else {
            // Desktop: Just scroll
            if (inputSectionRef.current) {
                inputSectionRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }
        }
    }, 2000);
  };

  const handleEditInputs = () => {
      setViewMode('input');
  };


  // Navigate to tools page with projections view (client-side to preserve state)
  const handleGoToProjections = useCallback(() => {
    window.history.pushState({}, '', '/tools?view=projections');
    setCurrentPath('/tools');
    setActiveTab('tools');
    setViewMode('tools');
    
    // Ensure scroll happens after DOM updates
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'instant' });
    });
  }, []);
  const handleReset = () => {
    setExpenses([{ id: '1', name: 'Subscription', amount: 15, frequency: 'Monthly', isWant: true }]);
    setResults(null);
    setViewMode('input');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (tab: NavTab) => {
      setActiveTab(tab);
      if (tab === 'home') {
          // Desktop: If on /tools or /roadmap, redirect to home
          if (window.innerWidth >= 1024 && (currentPath === '/tools' || currentPath.startsWith('/tools') || 
              currentPath === '/roadmap' || currentPath.startsWith('/roadmap'))) {
              window.location.href = '/';
              return;
          }
          // Mobile: Navigate back to home route
          if (window.innerWidth < 1024) {
              window.history.pushState({}, '', '/');
              setCurrentPath('/');
              setViewMode('input');
              setMobileStep(1);
              window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
              // Desktop: Just scroll to top
              setViewMode('input');
              window.scrollTo({ top: 0, behavior: 'smooth' });
          }
      } else if (tab === 'calculate') {
          handleStart();
      } else if (tab === 'tools') {
          // Client-side navigation to preserve state (results/assumptions)
          window.history.pushState({}, '', '/tools');
          setCurrentPath('/tools');
          setViewMode('tools');
          window.scrollTo({ top: 0, behavior: 'smooth' });
      } else if (tab === 'roadmap') {
          // Desktop: Full page redirect for performance
          if (window.innerWidth >= 1024) {
              window.location.href = '/roadmap';
              return;
          }
          // Mobile: Navigate to /roadmap route
          window.history.pushState({}, '', '/roadmap');
          setCurrentPath('/roadmap');
          setViewMode('roadmap'); 
          window.scrollTo({ top: 0, behavior: 'smooth' });
      }
  };

  return (
    <>
      {showMobileIntro && <MobileIntro onComplete={handleIntroComplete} />}
      <AnalyticsTracker />
      <div className={`flex flex-col theme-${theme} min-h-screen font-sans selection:bg-[var(--primary)] selection:text-white relative bg-[var(--bg-main)] text-[var(--text-main)] transition-colors duration-500 ${(window.innerWidth < 1024 && (currentPath === '/calculate' || currentPath.startsWith('/calculate') || currentPath === '/roadmap' || currentPath.startsWith('/roadmap') || ((currentPath === '/' || currentPath === '') && viewMode === 'input'))) ? 'overflow-hidden h-screen' : ''}`}>
        {/* Full-Viewport Particle Background - Outside all containers */}
        <ParticleBackground theme={theme} />
        
        {/* Snow Particle Effect - Mobile only, behind all UI */}
        <SnowBackground theme={theme} />
        
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
                <ToolsDashboard 
                  theme={theme} 
                  results={results}
                  assumptions={assumptions}
                  onNavigateHome={() => handleNavigate('home')}
                />
              </div>
            ) : viewMode === 'roadmap' ? (
              /* Roadmap view: side-by-side on desktop, roadmap only on mobile */
              <RoadmapLayout />
            ) : (
              /* VIEW: CALCULATOR (HERO + MAIN) */
              <>
                  {/* MOBILE HOME: scroll-snap card-by-card experience (lg:hidden) */}
                  {viewMode === 'input' && window.innerWidth < 1024 && (currentPath === '/' || currentPath === '') && (
                    <div className="mobile-snap-container lg:hidden">
                      <section className="mobile-snap-card">
                        <Hero
                          onStart={handleStart}
                          onLoadPreset={handleLoadPreset}
                          decisionCount={decisionCount}
                          theme={theme}
                        />
                      </section>
                      <section className="mobile-snap-card">
                        <FeaturesReveal />
                      </section>
                      <section className="mobile-snap-card">
                        <GlobeSection theme={theme} />
                      </section>
                      <section className="mobile-snap-card">
                        <TestimonialsSection />
                      </section>
                      <section className="mobile-snap-card">
                        <MobileFAQ />
                      </section>
                    </div>
                  )}

                  {/* Hero Section - Hidden on /calculate and /results routes for mobile; also hidden on mobile home (handled by snap container above) */}
                  {(window.innerWidth >= 1024 || (currentPath === '/' || currentPath === '')) && !(window.innerWidth < 1024 && (currentPath === '/results' || currentPath.startsWith('/results'))) && !(window.innerWidth < 1024 && (currentPath === '/' || currentPath === '')) && (
                    <>
                      {/* Theme-aware Beam for Hero Section - Fixed positioning so it stays with hero text */}
                      <div 
                        className="fixed top-[20vh] left-[50%] -translate-x-1/2 w-[500px] h-[500px] blur-[100px] rounded-full pointer-events-none z-[5]"
                        style={{
                          backgroundColor: theme === 'green' ? 'rgba(20, 83, 45, 0.05)' : theme === 'blue' ? 'transparent' : 'rgba(88, 28, 135, 0.05)'
                        }}
                      />
                      
                      <Hero 
                          onStart={handleStart} 
                          onLoadPreset={handleLoadPreset} 
                          decisionCount={decisionCount}
                          theme={theme}
                      />
                    </>
                  )}
                  
                  {!(window.innerWidth < 1024 && (currentPath === '/' || currentPath === '') && viewMode === 'input') && (
                  <main className={`px-4 md:px-8 w-full min-h-[600px] relative ${(window.innerWidth < 1024 && (currentPath === '/calculate' || currentPath.startsWith('/calculate'))) ? 'pt-28 pb-24' : (window.innerWidth < 1024 && (currentPath === '/results' || currentPath.startsWith('/results'))) ? 'pt-20 pb-24' : 'py-8'}`} ref={inputSectionRef}>
                      <AmbientBackground />
                      {/* Theme-aware backgrounds for /calculate on mobile only */}
                      {(currentPath === '/calculate' || currentPath.startsWith('/calculate')) && (
                        <ThemeBackground theme={theme} />
                      )}
                      <div className="max-w-[96rem] mx-auto space-y-8 relative z-10">
                          
                          {viewMode === 'input' && (
                              <>
                                {/* Desktop: Side-by-side layout */}
                                <div className="hidden lg:grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch animate-fade-in-up">
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

                                {/* Mobile: 3-Step Wizard with Lightweight CSS Animations */}
                                {/* Key forces remount when navigating to /calculate, triggering animation like Financial Toolbox */}
                                <div 
                                    key={`mobile-wizard-${currentPath === '/calculate' || currentPath.startsWith('/calculate') ? 'calculate' : 'other'}`}
                                    className="lg:hidden animate-fade-in-up"
                                    style={{ animationDuration: '0.5s' }}
                                >
                                    {mobileStep === 1 && (
                                        <div key="step-1" className="animate-fade-in-up" style={{ animationDuration: '0.35s' }}>
                                            <QueueModule
                                                expenses={expenses}
                                                onAdd={addExpense}
                                                onRemove={removeExpense}
                                                onUpdate={updateExpense}
                                                onAnalyze={() => setMobileStep(2)}
                                                buttonText="Next Step →"
                                                buttonIcon="arrow"
                                            />
                                        </div>
                                    )}

                                    {mobileStep === 2 && (
                                        <div 
                                            key="step-2"
                                            className="animate-fade-in-up"
                                            style={{ animationDuration: '0.35s' }}
                                        >
                                            <SettingsPanel 
                                                assumptions={assumptions} 
                                                onChange={updateAssumptions} 
                                                onOpenStockSelector={() => setIsStockModalOpen(true)}
                                                showStepNumber={2}
                                            />
                                            <div className="flex flex-col sm:flex-row gap-3 mt-4 pt-2">
                                                <button
                                                    onClick={() => setMobileStep(3)}
                                                    className="flex-1 py-2.5 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold shadow-lg shadow-[var(--primary)]/20 transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-sm"
                                                >
                                                    <ArrowRight className="w-4 h-4" />
                                                    Next Step
                                                </button>
                                            </div>
                                        </div>
                                    )}

                                    {mobileStep === 3 && (
                                        <div 
                                            key="step-3"
                                            className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl md:rounded-3xl p-4 md:p-5 shadow-2xl backdrop-blur-sm animate-fade-in-up min-h-[400px] flex flex-col"
                                            style={{ animationDuration: '0.35s' }}
                                        >
                                            <div className="flex items-center gap-3 mb-3 md:mb-4">
                                                <div className="w-6 h-6 rounded-full bg-[var(--primary)] bg-opacity-10 flex items-center justify-center text-[var(--primary)] font-bold text-xs ring-1 ring-[var(--primary)] ring-opacity-20">3</div>
                                                <h2 className="text-xs md:text-sm font-bold text-[var(--text-main)] uppercase tracking-wider">Final Wisdom</h2>
                                            </div>
                                            <div className="space-y-3 text-[var(--text-muted)] text-sm mb-4 flex-grow">
                                                <p>You're about to see how <span className="text-[var(--text-main)] font-semibold">{expenses.length} decision{expenses.length !== 1 ? 's' : ''}</span> compound over <span className="text-[var(--text-main)] font-semibold">{assumptions.timeHorizonYears} years</span>.</p>
                                                <p>Remember: Every dollar spent today is a dollar that can't grow tomorrow.</p>
                                                
                                                {/* Analysis Preview */}
                                                <div className="bg-[var(--bg-input)] p-3 rounded-xl border border-[var(--border)] mt-3">
                                                    <p className="text-[10px] uppercase tracking-wider text-[var(--text-muted)] font-semibold mb-2">Your Expenses (Monthly Equivalent)</p>
                                                    <div className="space-y-1.5">
                                                        {expenses.slice(0, 3).map((exp, i) => {
                                                            const amt = exp.amount || 0;
                                                            let monthlyAmt = 0;
                                                            if (exp.frequency === 'Weekly') monthlyAmt = amt * 4.33;
                                                            else if (exp.frequency === 'Monthly') monthlyAmt = amt;
                                                            else if (exp.frequency === 'Yearly') monthlyAmt = amt / 12;
                                                            else if (exp.frequency === 'One-time') monthlyAmt = amt / (assumptions.timeHorizonYears * 12);
                                                            return (
                                                                <div key={exp.id} className="flex items-center justify-between text-xs">
                                                                    <span className="text-[var(--text-main)] truncate max-w-[140px]">{exp.name || `Expense ${i + 1}`}</span>
                                                                    <span className="text-[var(--primary)] font-semibold">${monthlyAmt.toFixed(2)}/mo</span>
                                                                </div>
                                                            );
                                                        })}
                                                        {expenses.length > 3 && (
                                                            <p className="text-[10px] text-[var(--text-muted)]">+{expenses.length - 3} more...</p>
                                                        )}
                                                    </div>
                                                    <div className="border-t border-[var(--border)] mt-2 pt-2 flex items-center justify-between">
                                                        <span className="text-[10px] text-[var(--text-muted)]">Est. Monthly Total</span>
                                                        <span className="text-sm font-bold text-[var(--text-main)]">
                                                            ${expenses.reduce((sum, exp) => {
                                                                const amt = exp.amount || 0;
                                                                if (exp.frequency === 'Weekly') return sum + (amt * 4.33);
                                                                if (exp.frequency === 'Monthly') return sum + amt;
                                                                if (exp.frequency === 'Yearly') return sum + (amt / 12);
                                                                if (exp.frequency === 'One-time') return sum + (amt / (assumptions.timeHorizonYears * 12));
                                                                return sum;
                                                            }, 0).toFixed(2)}
                                                        </span>
                                                    </div>
                                                </div>

                                                <div className="bg-[var(--bg-hover)] p-4 rounded-xl border border-[var(--border)] mt-3 relative">
                                                    <p className="text-xs text-[var(--text-muted)] italic pr-8">
                                                        "{financialWisdoms[currentWisdomIndex]}"
                                                    </p>
                                                    <button
                                                        onClick={cycleWisdom}
                                                        className="absolute top-3 right-3 p-1.5 rounded-lg hover:bg-[var(--bg-card)] transition-all active:scale-95 group"
                                                        title="Next wisdom"
                                                    >
                                                        <RefreshCw className="w-3.5 h-3.5 text-[var(--text-muted)] group-hover:text-[var(--primary)] transition-colors" />
                                                    </button>
                                                </div>
                                            </div>
                                            <div className="flex flex-col gap-3 pt-2 mt-auto">
                                                <button
                                                    onClick={handleAnalyze}
                                                    className="w-full py-4 bg-[var(--primary)] hover:bg-[var(--primary-hover)] text-white rounded-xl font-bold shadow-lg transition-all flex items-center justify-center gap-2 active:scale-[0.98] text-base"
                                                >
                                                    <Calculator className="w-5 h-5" />
                                                    Analyze My Regret
                                                </button>
                                                <button
                                                    onClick={() => setMobileStep(1)}
                                                    className="w-full py-2 text-[var(--text-muted)] hover:text-[var(--text-main)] transition-colors text-sm"
                                                >
                                                    ← Back to Start
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </div>
                              </>
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
                                  
                                  {/* CTA Button to Tools - Advanced Projections */}
                                  <div className="flex justify-center -mt-4 mb-4">
                                    <motion.button
                                      onClick={handleGoToProjections}
                                      whileHover={{ scale: 1.02 }}
                                      whileTap={{ scale: 0.98 }}
                                      className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] 
                                                 rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] 
                                                 hover:border-[var(--text-muted)] transition-colors text-sm font-medium"
                                    >
                                      <span>Analyze Projections in Toolbox</span>
                                      <span>→</span>
                                    </motion.button>
                                  </div>
                              </div>
                          )}
                      </div>
                  </main>
                  )}
                  {!(window.innerWidth < 1024 && (currentPath === '/' || currentPath === '') && viewMode === 'input') && (
                    <>
                      {viewMode === 'input' && <FeaturesReveal />}
                      {viewMode === 'input' && <GlobeSection theme={theme} />}
                      {viewMode === 'input' && <TestimonialsSection />}
                      {viewMode !== 'results' && <Footer />}
                    </>
                  )}
              </>
            )}
        </div>
        
        {/* Mobile Bottom Navigation - Removed, now in top Navbar */}
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

  // Render privacy policy page if on /privacy route
  if (currentPath === '/privacy') {
    return <PrivacyPolicy />;
  }

  // Render terms of service page if on /tos route
  if (currentPath === '/tos') {
    return <TermsOfService />;
  }

  return <MainApp />;
}

export default App;
