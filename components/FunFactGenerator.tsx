import React, { useState } from 'react';
import { Lightbulb, RefreshCw, Quote } from 'lucide-react';

const FACTS = [
  "Compound interest is the eighth wonder of the world. He who understands it, earns it... he who doesn't... pays it. — Albert Einstein",
  "A $5 daily habit invested at 10% returns grows to over $300,000 in 30 years.",
  "The average American spends over $300/month on impulse purchases. That's $3,600/year working against you.",
  "If you invested the cost of a pack of cigarettes every day for 40 years, you'd have $1,000,000+.",
  "Rule of 72: Divide 72 by your interest rate to see how many years it takes to double your money. At 10%, it takes just 7.2 years.",
  "Time in the market beats timing the market. The best time to start was yesterday.",
  "Streaming services feel cheap, but 4 subscriptions at $15/mo is $30,000 of lost retirement potential.",
];

export const FunFactGenerator: React.FC = () => {
  const [index, setIndex] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);

  const nextFact = () => {
    setIsAnimating(true);
    setTimeout(() => {
      setIndex((prev) => (prev + 1) % FACTS.length);
      setIsAnimating(false);
    }, 300);
  };

  return (
    <div className="w-full bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl p-6 shadow-xl relative overflow-hidden group">
      {/* Decorative background blob */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-[var(--primary)] opacity-5 rounded-full blur-2xl group-hover:bg-[var(--primary)] group-hover:opacity-10 transition-colors" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center gap-2">
          <div className="bg-yellow-500/10 p-1.5 rounded-lg">
            <Lightbulb className="w-4 h-4 text-yellow-500" />
          </div>
          <span className="text-xs font-bold text-[var(--text-muted)] uppercase tracking-wider">Financial Wisdom</span>
        </div>
        <button 
          onClick={nextFact}
          className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors text-[var(--text-muted)] hover:text-[var(--text-main)]"
          title="Next Fact"
        >
          <RefreshCw className={`w-4 h-4 ${isAnimating ? 'animate-spin' : ''}`} />
        </button>
      </div>

      <div className={`relative z-10 min-h-[80px] flex items-center transition-opacity duration-300 ${isAnimating ? 'opacity-0' : 'opacity-100'}`}>
        <Quote className="absolute top-0 left-0 w-6 h-6 text-[var(--text-muted)] opacity-20 -translate-x-2 -translate-y-2" />
        <p className="text-sm text-[var(--text-muted)] font-medium leading-relaxed pl-4 border-l-2 border-[var(--primary)] border-opacity-30">
          {FACTS[index]}
        </p>
      </div>
    </div>
  );
};