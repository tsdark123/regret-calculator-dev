import React, { useEffect, useState, useRef } from 'react';
import { CalculationResult, StockOption, Assumptions, Theme } from '../types';
import { formatCurrency, formatCurrencyShort } from '../utils/financials';
import { ResultsChart } from './Chart';
import { RefreshCcw, TrendingUp, TrendingDown, DollarSign, Lightbulb, Pencil, Share2, Copy, Check, Clock, ShoppingBag, Info, Download } from 'lucide-react';
import { toPng } from 'html-to-image';

interface ResultsDashboardProps {
  results: CalculationResult;
  assumptions: Assumptions;
  horizon: number;
  onReset: () => void;
  onEdit: () => void;
  selectedStock?: StockOption;
  theme: Theme;
}

// Internal Component for Number Animation
const AnimatedCounter = ({ value, duration = 1500 }: { value: number; duration?: number }) => {
  const [count, setCount] = useState(0);

  useEffect(() => {
    let startTimestamp: number | null = null;
    const step = (timestamp: number) => {
      if (!startTimestamp) startTimestamp = timestamp;
      const progress = Math.min((timestamp - startTimestamp) / duration, 1);
      const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
      setCount(Math.floor(easeProgress * value));
      if (progress < 1) {
        window.requestAnimationFrame(step);
      }
    };
    window.requestAnimationFrame(step);
  }, [value, duration]);

  return <>{formatCurrency(count)}</>;
};

// Helper for dynamic font sizing on KPI cards
const getValueSizeClass = (val: number) => {
    const len = formatCurrency(val).length;
    if (len > 20) return "text-sm sm:text-base break-all leading-tight"; // > 100 Quadrillion
    if (len > 15) return "text-lg sm:text-xl break-all leading-tight"; // > 1 Trillion
    if (len > 13) return "text-2xl leading-tight"; // > 10 Billion
    return "text-3xl";
};

const OpportunityCostSection = ({ totalValue }: { totalValue: number }) => {
    const itemCatalog = {
        low: [
            { name: 'AirPods Max', price: 550, icon: '🎧' },
            { name: 'PS5 Pro', price: 700, icon: '🎮' },
            { name: 'iPhone 16 Pro', price: 999, icon: '📱' },
            { name: 'M4 MacBook Pro', price: 1600, icon: '💻' },
        ],
        mid: [
            { name: 'Dream Vacation', price: 5000, icon: '✈️' },
            { name: 'Rolex Submariner', price: 9150, icon: '⌚' },
            { name: 'Used Tesla Model 3', price: 25000, icon: '🚗' },
        ],
        high: [
            { name: 'Porsche 911', price: 120000, icon: '🏎️' },
            { name: 'Home Down Payment', price: 150000, icon: '🏠' },
        ],
        elite: [
            { name: 'Private Island Rental', price: 15000, icon: '🏝️', suffix: '/night' },
            { name: 'Early Retirement (5 Years)', price: 250000, icon: '🌴' },
        ],
    };

    const selectDynamicItems = () => {
        const allItems = Object.values(itemCatalog).flat();
        const validItems: Array<{ name: string; price: number; icon: string; suffix?: string; count: number }> = [];

        allItems.forEach(item => {
            const count = Math.floor(totalValue / item.price);
            if (count >= 1 && count <= 50) {
                validItems.push({ ...item, count });
            }
        });

        // Sort by count descending for impact, take top 4
        validItems.sort((a, b) => b.count - a.count);
        
        // If we have fewer than 4 valid items, also include items with count > 50 but cap display
        if (validItems.length < 4) {
            allItems.forEach(item => {
                const count = Math.floor(totalValue / item.price);
                if (count > 50 && !validItems.find(v => v.name === item.name)) {
                    validItems.push({ ...item, count: Math.min(count, 99) });
                }
            });
            validItems.sort((a, b) => b.count - a.count);
        }

        return validItems.slice(0, 4);
    };

    const selectedItems = selectDynamicItems();

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-5 rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-2 mb-4">
                <ShoppingBag className="w-4 h-4 text-pink-400" />
                <h3 className="text-sm font-bold text-[var(--text-main)]">Alternative Reality</h3>
            </div>
            <p className="text-xs text-[var(--text-muted)] mb-4">Instead of this result, you could have purchased:</p>
            
            <div className="space-y-3 flex-grow overflow-y-auto pr-1 custom-scrollbar min-h-[200px]">
                {selectedItems.length > 0 ? (
                    selectedItems.map(item => (
                        <div key={item.name} className="flex items-center justify-between bg-[var(--bg-hover)] p-3 rounded-xl border border-[var(--border)]">
                            <div className="flex items-center gap-3">
                                <span className="text-xl">{item.icon}</span>
                                <div>
                                    <div className="text-[var(--text-main)] text-xs font-bold">
                                        {item.name}{item.suffix ? ` ${item.suffix}` : ''}
                                    </div>
                                    <div className="text-[10px] text-[var(--text-muted)]">{formatCurrency(item.price)} ea</div>
                                </div>
                            </div>
                            <div className="bg-[var(--primary-20)] text-[var(--primary)] text-xs font-bold px-2 py-1 rounded-lg">
                                x{item.count}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="text-center text-xs text-[var(--text-muted)] italic py-4">
                        Keep saving... not enough for cool toys yet.
                    </div>
                )}
            </div>
        </div>
    );
};

const TimeCostSection = ({ totalInvested }: { totalInvested: number }) => {
    const [hourlyWage, setHourlyWage] = useState(25);
    const hoursLost = Math.floor(totalInvested / hourlyWage);
    const daysLost = (hoursLost / 8).toFixed(1);

    const getNumberSizeClass = (val: number) => {
        const len = val.toLocaleString().length;
        if (len > 15) return "text-lg break-all";
        if (len > 12) return "text-2xl";
        if (len > 9) return "text-3xl"; 
        return "text-4xl";
    }

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-2xl h-full flex flex-col">
            <div className="flex items-center gap-2 mb-3 sm:mb-4">
                <Clock className="w-4 h-4 text-blue-400" />
                <h3 className="text-sm font-bold text-[var(--text-main)]">Time Cost</h3>
            </div>
            <div className="flex items-center justify-between mb-3 sm:mb-4 bg-[var(--bg-hover)] p-2.5 sm:p-2 rounded-lg border border-[var(--border)]">
                <span className="text-xs text-[var(--text-muted)] pl-1">Your Hourly Wage:</span>
                <div className="flex items-center">
                    <span className="text-[var(--text-muted)] text-xs mr-1">$</span>
                    <input 
                        type="number" 
                        value={hourlyWage} 
                        onChange={(e) => setHourlyWage(Math.max(1, parseInt(e.target.value) || 0))}
                        className="w-14 sm:w-12 bg-transparent text-right text-[var(--text-main)] text-sm sm:text-xs font-bold focus:outline-none border-b border-slate-700 focus:border-[var(--primary)]"
                    />
                </div>
            </div>

            <div className="flex-grow flex flex-col justify-center items-center text-center space-y-2">
                 <div className={`${getNumberSizeClass(hoursLost)} font-black text-[var(--text-main)] tracking-tighter transition-all`}>
                    {hoursLost.toLocaleString()}
                 </div>
                 <div className="text-xs text-[var(--text-muted)] uppercase tracking-widest font-bold">Work Hours Wasted</div>
                 <div className="text-[10px] text-[var(--text-muted)]">
                    That's ~<span className="text-[var(--text-main)] font-bold">{daysLost}</span> full work days just to pay for these habits.
                 </div>
            </div>
        </div>
    );
};

const ShareSection = ({ results, horizon, dashboardRef }: { results: CalculationResult, horizon: number, dashboardRef: React.RefObject<HTMLDivElement> }) => {
    const [copied, setCopied] = useState(false);
    const [exporting, setExporting] = useState(false);

    const shareText = `I could have had ${formatCurrencyShort(results.potentialValueUnlocked)} by investing my ${results.expenseSummary} money! Calculate your regret with the Compound Regret Calculator:`;
    const link = "calculated-growth.vercel.app";
    const fullText = `${shareText} ${link}`;

    const handleCopy = () => {
        navigator.clipboard.writeText(fullText);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    const handleExport = async () => {
        if (!dashboardRef.current) return;
        
        setExporting(true);
        try {
            // Capture the original element
            const dataUrl = await toPng(dashboardRef.current, {
                cacheBust: true,
                backgroundColor: '#0a0a0f',
                pixelRatio: 2,
            });
            
            // Add padding by drawing onto a larger canvas
            const padding = 64; // 32px * 2 for retina
            const img = new Image();
            img.src = dataUrl;
            
            await new Promise((resolve) => { img.onload = resolve; });
            
            const canvas = document.createElement('canvas');
            canvas.width = img.width + padding * 2;
            canvas.height = img.height + padding * 2;
            
            const ctx = canvas.getContext('2d');
            if (ctx) {
                ctx.fillStyle = '#0a0a0f';
                ctx.fillRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, padding, padding);
            }
            
            const paddedDataUrl = canvas.toDataURL('image/png');
            
            const link = document.createElement('a');
            link.download = 'my-regret-report.png';
            link.href = paddedDataUrl;
            link.click();
        } catch (error) {
            console.error('Failed to export:', error);
        } finally {
            setExporting(false);
        }
    };

    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 h-fit flex-none">
            <h3 className="text-sm font-bold text-[var(--text-main)] mb-2">Spread the Awareness</h3>
            <p className="text-xs text-[var(--text-muted)] mb-4">
                Help friends realize the true cost of their habits.
            </p>
            
            <div className="flex flex-col gap-3">
                {/* Export Button */}
                <button 
                    onClick={handleExport}
                    disabled={exporting}
                    className="flex items-center justify-center gap-2 w-full px-6 h-12 rounded-xl font-bold text-xs transition-all shadow-lg bg-[var(--primary)] hover:opacity-90 text-white disabled:opacity-50"
                >
                    {exporting ? (
                        <>
                            <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            Generating...
                        </>
                    ) : (
                        <>
                            <Download className="w-3.5 h-3.5" />
                            Export My Regret Report
                        </>
                    )}
                </button>

                {/* Share text + Copy button row */}
                <div className="flex flex-col md:flex-row gap-3">
                    <div className="flex-1 bg-[var(--bg-input)] border border-[var(--border)] rounded-xl p-3 flex items-center group cursor-pointer hover:border-[var(--primary)] transition-colors h-12" onClick={handleCopy}>
                        <div className="text-xs text-[var(--text-muted)] font-mono leading-tight overflow-hidden text-ellipsis whitespace-nowrap md:whitespace-normal line-clamp-2 w-full">
                            <span className="text-[var(--primary)]">"</span>{shareText}<span className="text-[var(--primary)]">"</span>
                        </div>
                    </div>

                    <button 
                        onClick={handleCopy}
                        className={`flex-none flex items-center justify-center gap-2 px-6 h-12 rounded-xl font-bold text-xs transition-all shadow-lg min-w-[120px] ${copied ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-[var(--bg-hover)] hover:bg-[var(--bg-card)] border border-[var(--border)] text-[var(--text-main)] hover:text-[var(--primary)]'}`}
                    >
                        {copied ? (
                            <>
                                <Check className="w-3.5 h-3.5" /> Copied
                            </>
                        ) : (
                            <>
                                <Copy className="w-3.5 h-3.5" /> Copy
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

const MethodologySection = ({ assumptions, monthlyContribution }: { assumptions: Assumptions, monthlyContribution: number }) => {
    const isCustom = !assumptions.selectedStock;
    const rate = assumptions.annualReturn;
    
    return (
        <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-5 flex flex-col flex-grow min-h-0">
            <div className="flex items-center gap-2 mb-4 flex-none">
                <Info className="w-4 h-4 text-[var(--text-muted)]" />
                <h3 className="text-sm font-bold text-[var(--text-muted)] uppercase tracking-wider">How we calculated this</h3>
            </div>
            
            <div className="space-y-4 text-xs leading-relaxed text-[var(--text-muted)] overflow-y-auto pr-1 custom-scrollbar">
                <p>
                    <strong className="text-[var(--text-main)]">1. The Principal:</strong> We took your total monthly habit cost of <span className="text-[var(--text-main)] border-b border-[var(--border)]">{formatCurrency(monthlyContribution)}</span> and treated it as a recurring monthly investment contribution.
                </p>
                <p>
                    <strong className="text-[var(--text-main)]">2. The Growth Rate:</strong> We applied an annual return rate of <span className="text-green-400 font-bold">{rate}%</span>. 
                    {isCustom ? (
                        <span> This is based on the custom rate you set in the slider.</span>
                    ) : (
                        <span> This is based on <strong className="text-[var(--text-main)]">{assumptions.selectedStock?.name}</strong>'s historical average return over the last 5-10 years.</span>
                    )}
                </p>
                <p>
                    <strong className="text-[var(--text-main)]">3. The Compound:</strong> Using the formula <span className="font-mono text-[10px] text-[var(--text-muted)] bg-[var(--bg-hover)] px-1 rounded">FV = P × [((1 + r)^n - 1) / r]</span>, we calculated the future value over <span className="text-[var(--text-main)]">{assumptions.timeHorizonYears} years</span>.
                </p>
                {assumptions.inflationAdjusted && (
                     <p className="bg-[var(--bg-hover)] p-2 rounded-lg border border-[var(--border)]">
                        <strong className="text-[var(--primary)]">Note:</strong> You enabled inflation adjustment. We discounted the growth rate by <span className="text-[var(--text-main)]">{assumptions.inflationRate}%</span> to show results in today's purchasing power.
                    </p>
                )}
            </div>
             <div className="mt-auto pt-4 flex-none">
                <p className="text-[10px] text-[var(--text-muted)] italic">
                    *Hypothetical projection. Past performance does not guarantee future results.
                </p>
            </div>
        </div>
    );
};

export const ResultsDashboard: React.FC<ResultsDashboardProps> = ({
  results,
  assumptions,
  horizon,
  onReset,
  onEdit,
  selectedStock,
  theme,
}) => {
  const dashboardRef = useRef<HTMLDivElement>(null);
  const comparisonName = selectedStock ? selectedStock.name : "the market";
  const comparisonColor = selectedStock ? selectedStock.color.replace('bg-', 'text-') : 'text-[var(--primary)]';

  return (
    <div ref={dashboardRef} className="w-full pb-8 sm:pb-12">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end mb-6 sm:mb-8 gap-4 border-b border-[var(--border)] pb-4 sm:pb-6">
        <div>
           <h2 className="text-2xl sm:text-3xl font-bold text-[var(--text-main)] mb-1 sm:mb-2">Your Results</h2>
           <p className="text-[var(--text-muted)] text-xs sm:text-sm">
             Projected over <span className="text-[var(--text-main)] font-semibold">{horizon} years</span> comparing against <span className={`font-semibold ${comparisonColor}`}>{comparisonName}</span>
            </p>
        </div>
        
        <div className="flex items-center gap-2 sm:gap-3 w-full sm:w-auto">
            <button
            onClick={onEdit}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-[var(--text-main)] hover:bg-[var(--bg-hover)] transition-all text-xs font-semibold px-4 py-3 sm:py-2.5 border border-[var(--border)] rounded-xl active:scale-[0.98]"
            >
            <Pencil className="w-3.5 h-3.5" />
            Edit Inputs
            </button>
            <button
            onClick={onReset}
            className="flex-1 sm:flex-none flex items-center justify-center gap-2 text-[var(--text-muted)] hover:text-red-400 hover:bg-red-500/10 transition-all text-xs font-semibold px-4 py-3 sm:py-2.5 border border-transparent rounded-xl active:scale-[0.98]"
            >
            <RefreshCcw className="w-3.5 h-3.5" />
            Start Over
            </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6 sm:mb-8">
        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:border-[var(--text-muted)] transition-colors">
          <div className="flex justify-between items-start mb-1 sm:mb-2">
             <p className="text-[var(--text-muted)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Total Capital Wasted</p>
             <DollarSign className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700" />
          </div>
          <p className={`font-bold text-[var(--text-main)] tracking-tight text-lg sm:text-2xl lg:${getValueSizeClass(results.totalCapitalWasted)}`}>
            <AnimatedCounter value={results.totalCapitalWasted} />
          </p>
          <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">Money spent linearly without growth</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:border-[var(--primary)] transition-colors">
           <div className="flex justify-between items-start mb-1 sm:mb-2">
              <p className="text-[var(--primary)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Potential Value</p>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--primary)] opacity-40" />
           </div>
          <p className={`font-bold text-[var(--primary)] tracking-tight text-lg sm:text-2xl lg:${getValueSizeClass(results.potentialValueUnlocked)}`}>
            <AnimatedCounter value={results.potentialValueUnlocked} />
          </p>
           <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">What this money could become</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:border-[var(--text-muted)] transition-colors">
           <div className="flex justify-between items-start mb-1 sm:mb-2">
              <p className="text-[var(--text-muted)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Profit Missed</p>
              <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4 text-slate-700" />
           </div>
          <p className={`font-bold text-[var(--text-main)] tracking-tight text-lg sm:text-2xl lg:${getValueSizeClass(results.totalProfitMissed)}`}>
            <AnimatedCounter value={results.totalProfitMissed} />
          </p>
           <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">The gap between spending and investing</p>
        </div>

        <div className="bg-[var(--bg-card)] border border-[var(--border)] p-3 sm:p-5 rounded-xl sm:rounded-2xl relative overflow-hidden group hover:border-[var(--primary)] transition-colors shadow-[0_0_20px_var(--chart-gradient-end)]">
           <div className="flex justify-between items-start mb-1 sm:mb-2">
              <p className="text-[var(--text-muted)] text-[9px] sm:text-[10px] font-bold uppercase tracking-wider">Final Portfolio</p>
              <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4 text-[var(--primary)]" />
           </div>
          <p className={`font-bold text-[var(--primary)] tracking-tight text-lg sm:text-2xl lg:${getValueSizeClass(results.potentialValueUnlocked)}`}>
            <AnimatedCounter value={results.potentialValueUnlocked} />
          </p>
           <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] mt-1 hidden sm:block">Compound growth result</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 sm:gap-8 mb-6 sm:mb-8">
        {/* Chart Section */}
        <div className="lg:col-span-2 bg-[var(--bg-card)] border border-[var(--border)] p-3 sm:p-4 rounded-xl sm:rounded-2xl">
          <div className="mb-3 sm:mb-4 pl-1 sm:pl-2">
            <h3 className="text-[10px] sm:text-xs font-bold text-[var(--text-main)] uppercase tracking-wider">Compound Loss vs Linear Spend</h3>
          </div>
          <ResultsChart data={results.chartData} theme={theme} />
        </div>

        {/* Narrative / Sage Section */}
        <div className="lg:col-span-1 flex flex-col gap-4">
          <div className="bg-[var(--bg-card)] border border-[var(--border)] p-4 sm:p-5 rounded-xl sm:rounded-2xl flex-1">
             <div className="flex items-center gap-2 mb-2 sm:mb-3">
              <Lightbulb className="w-4 h-4 text-[var(--primary)]" />
              <h3 className="text-sm font-bold text-[var(--text-main)]">Reality Check</h3>
            </div>
            
            <div className="text-[var(--text-muted)] text-xs sm:text-sm leading-relaxed space-y-2 sm:space-y-3">
               <p>
                  You're currently spending <span className="text-[var(--text-main)] font-bold">{formatCurrency(results.totalMonthlyContribution)}/mo</span> on <span className="text-[var(--text-main)] italic">{results.expenseSummary}</span>.
               </p>
               <p>
                 If you invested that in <span className={`font-bold ${comparisonColor}`}>{comparisonName}</span> instead, you'd have an extra <span className="text-[var(--primary)] font-bold text-sm sm:text-base"><AnimatedCounter value={results.totalProfitMissed} /></span> in your pocket after {horizon} years.
               </p>
            </div>

            <div className="mt-3 sm:mt-4 pt-2 sm:pt-3 border-t border-[var(--border)]">
                <p className="text-[9px] sm:text-[10px] text-[var(--text-muted)] italic">
                "The best time to plant a tree was 20 years ago. The second best time is now."
              </p>
            </div>
          </div>
          
          {/* New Time Cost Section */}
          <div className="flex-1">
             <TimeCostSection totalInvested={results.totalCapitalWasted} />
          </div>
        </div>
      </div>

      {/* Alternative Visualizations + Methodology */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-8 items-stretch">
         {/* Left Column: Variable height based on content */}
         <OpportunityCostSection totalValue={results.potentialValueUnlocked} />
         
         {/* Right Column: Stacks and fills height */}
         <div className="flex flex-col gap-4 h-full">
            <MethodologySection assumptions={assumptions} monthlyContribution={results.totalMonthlyContribution} />
            <ShareSection results={results} horizon={horizon} dashboardRef={dashboardRef} />
         </div>
      </div>

    </div>
  );
};