import { useState, useRef } from "react";
import { HeroSection } from "@/components/HeroSection";
import { DecisionInput } from "@/components/DecisionInput";
import { SettingsPanel } from "@/components/SettingsPanel";
import { ResultsDashboard } from "@/components/ResultsDashboard";
import { FAQSection } from "@/components/FAQSection";
import { Button } from "@/components/ui/button";
import { RefreshCw } from "lucide-react";
import type { Decision, CalculationResult } from "@/lib/calculations";
import { calculateOpportunityCost, generateId } from "@/lib/calculations";

const defaultDecision: Decision = {
  id: generateId(),
  name: "Subscription",
  amount: 15,
  frequency: "monthly",
  isWant: true,
};

export default function Index() {
  // Decisions state
  const [decisions, setDecisions] = useState<Decision[]>([{ ...defaultDecision, id: generateId() }]);
  
  // Settings state
  const [annualReturn, setAnnualReturn] = useState(10);
  const [inflationRate, setInflationRate] = useState(3);
  const [useInflationAdjusted, setUseInflationAdjusted] = useState(false);
  const [horizonYears, setHorizonYears] = useState(30);
  
  // Results state
  const [result, setResult] = useState<CalculationResult | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  
  // Refs for scrolling
  const inputRef = useRef<HTMLDivElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const scrollToInput = () => {
    inputRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  const handleAnalyze = () => {
    setIsAnalyzing(true);
    
    // Small delay for UX feel
    setTimeout(() => {
      const calcResult = calculateOpportunityCost({
        decisions,
        annualReturn: annualReturn / 100,
        inflationRate: inflationRate / 100,
        useInflationAdjusted,
        horizonYears,
      });
      
      setResult(calcResult);
      setIsAnalyzing(false);
      
      // Scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 100);
    }, 300);
  };

  const handleReset = () => {
    setDecisions([{ ...defaultDecision, id: generateId() }]);
    setAnnualReturn(10);
    setInflationRate(3);
    setUseInflationAdjusted(false);
    setHorizonYears(30);
    setResult(null);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Noise texture overlay */}
      <div 
        className="fixed inset-0 opacity-[0.02] pointer-events-none z-0"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />

      <main className="relative z-10">
        {/* Hero */}
        <HeroSection onCtaClick={scrollToInput} />

        {/* Input Section */}
        <section 
          ref={inputRef}
          className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto scroll-mt-8"
        >
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Decision Input - takes 2 columns on large screens */}
            <div className="lg:col-span-2">
              <DecisionInput
                decisions={decisions}
                onDecisionsChange={setDecisions}
                onAnalyze={handleAnalyze}
                isAnalyzing={isAnalyzing}
              />
            </div>

            {/* Settings Panel */}
            <div>
              <SettingsPanel
                annualReturn={annualReturn}
                setAnnualReturn={setAnnualReturn}
                inflationRate={inflationRate}
                setInflationRate={setInflationRate}
                useInflationAdjusted={useInflationAdjusted}
                setUseInflationAdjusted={setUseInflationAdjusted}
                horizonYears={horizonYears}
                setHorizonYears={setHorizonYears}
              />
            </div>
          </div>
        </section>

        {/* Results Section */}
        {result && (
          <section
            ref={resultsRef}
            className="px-4 sm:px-6 lg:px-8 py-16 max-w-6xl mx-auto scroll-mt-8"
          >
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold text-foreground">Your Results</h2>
              <Button
                variant="outline"
                size="sm"
                onClick={handleReset}
                className="gap-2 border-border/50"
              >
                <RefreshCw className="h-4 w-4" />
                Reset
              </Button>
            </div>
            
            <ResultsDashboard
              result={result}
              decisions={decisions}
              horizonYears={horizonYears}
            />
          </section>
        )}

        {/* FAQ Section */}
        <section className="px-4 sm:px-6 lg:px-8 py-20 border-t border-border/30">
          <FAQSection />
        </section>

        {/* Footer */}
        <footer className="px-4 sm:px-6 lg:px-8 py-8 text-center border-t border-border/20">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Compound Regret Calculator. For educational purposes only.
          </p>
        </footer>
      </main>
    </div>
  );
}
