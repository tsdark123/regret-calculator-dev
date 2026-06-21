import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const FAQ_ITEMS = [
  {
    question: "Is this financial advice?",
    answer: "No. This is an educational simulation to visualize opportunity cost, not personalized advice or a prediction. Investment markets vary and carry risk.",
  },
  {
    question: "What assumptions are you using?",
    answer: "We assume a default nominal annual return of 10% (comparable to historical S&P 500 averages with dividends reinvested). You can adjust this rate. If 'Inflation-adjusted' is on, we discount the growth rate by 3% inflation.",
  },
  {
    question: "Do you store my data?",
    answer: "All calculations run locally in your browser. No expense data, habit inputs, or results are sent to any server. We track a global analysis counter and, for new locations, may store one anonymous city/country entry to map usage geography. No personal identifiers are ever collected.",
  },
  {
    question: "How accurate are the stock returns?",
    answer: "Historical CAGRs are sourced from verified financial data. They represent past performance and are not a guarantee of future results. We display the source period for full transparency.",
  },
];

const FAQRow = ({ question, answer }: { question: string; answer: string }) => {
  const [open, setOpen] = useState(false);
  return (
    <div className="border-b border-[var(--border)] last:border-0">
      <button
        className="w-full py-4 flex items-center justify-between text-left focus:outline-none"
        onClick={() => setOpen(!open)}
      >
        <span className="text-sm font-medium text-[var(--text-main)] pr-4 leading-snug">{question}</span>
        <ChevronDown
          className="w-4 h-4 text-[var(--text-muted)] flex-shrink-0 transition-transform duration-200"
          style={{ transform: open ? 'rotate(180deg)' : 'rotate(0deg)' }}
        />
      </button>
      {open && (
        <div className="pb-4 text-xs text-[var(--text-muted)] leading-relaxed">
          {answer}
        </div>
      )}
    </div>
  );
};

export const MobileFAQ: React.FC = () => (
  <div className="w-full flex flex-col justify-between px-5 py-8 select-none" style={{ minHeight: 'calc(100dvh - 64px)' }}>
    <div className="flex-1 flex flex-col justify-center">
      <h2 className="text-2xl font-semibold text-[var(--text-main)] mb-1">Common Questions</h2>
      <p className="text-sm text-[var(--text-muted)] mb-6">Everything you need to know.</p>

      <div className="rounded-2xl border border-[var(--border)] px-4 py-1" style={{ background: 'var(--bg-faq)' }}>
        {FAQ_ITEMS.map((item) => (
          <FAQRow key={item.question} question={item.question} answer={item.answer} />
        ))}
      </div>
    </div>

    <div className="text-center space-y-3 pt-6">
      <div className="flex justify-center items-center gap-6 text-xs">
        <a href="/privacy" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          Privacy Policy
        </a>
        <span className="text-[var(--text-muted)] opacity-30">•</span>
        <a href="/tos" className="text-[var(--text-muted)] hover:text-[var(--primary)] transition-colors">
          Terms of Service
        </a>
      </div>
      <div className="space-y-1">
        <p className="text-xs text-[var(--text-muted)]">Regret Calculator, Sepehr Zunoubi © 2026</p>
        <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest opacity-60">
          Past performance does not guarantee future results.
        </p>
      </div>
    </div>
  </div>
);
