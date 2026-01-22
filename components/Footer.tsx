import React, { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQItem = ({ question, answer }: { question: string; answer: string }) => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none group"
        onClick={() => setIsOpen(!isOpen)}
      >
        <span className="text-[var(--text-main)] font-medium group-hover:text-[var(--primary)] transition-colors">{question}</span>
        {isOpen ? (
          <ChevronUp className="w-4 h-4 text-[var(--text-muted)]" />
        ) : (
          <ChevronDown className="w-4 h-4 text-[var(--text-muted)]" />
        )}
      </button>
      {isOpen && (
        <div className="pb-4 text-[var(--text-muted)] text-sm leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export const Footer: React.FC = () => {
  return (
    <footer 
        className="mt-24 pb-12 px-6 border-t border-[var(--border)]"
        style={{ background: 'var(--bg-footer)' }}
    >
      <div className="max-w-3xl mx-auto pt-16">
        <h3 className="text-xl font-bold text-[var(--text-main)] mb-8">Common Questions</h3>
        <div 
            className="rounded-2xl border border-[var(--border)] px-6 py-2 mb-12 shadow-sm"
            style={{ background: 'var(--bg-faq)' }}
        >
          <FAQItem
            question="Is this financial advice?"
            answer="No. This is an educational simulation to visualize opportunity cost, not personalized advice or a prediction. Investment markets vary and carry risk."
          />
          <FAQItem
            question="What assumptions are you using?"
            answer="We assume a default nominal annual return of 10% (comparable to historical S&P 500 averages with dividends reinvested). You can adjust this rate. If 'Inflation-adjusted' is on, we discount the growth rate by 3% inflation."
          />
          <FAQItem
            question="Do you store my data?"
            answer="No. All calculations run locally in your browser. No inputs are sent to any server. What happens in this tab stays in this tab. The only metric we track is the global count of analyses performed, never the content."
          />
        </div>

        <div className="text-center space-y-2">
            <p className="text-xs text-[var(--text-muted)]">
                Regret Calculator, Sepehr Zunoubi &copy; 2026
            </p>
            <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest opacity-70">
                Past performance does not guarantee future results.
            </p>
        </div>
      </div>
    </footer>
  );
};