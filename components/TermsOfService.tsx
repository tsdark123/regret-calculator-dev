import React, { useEffect } from 'react';

const tosSections = [
  { id: 'acceptance', label: 'Acceptance of Terms' },
  { id: 'not-advice', label: 'Not Financial Advice' },
  { id: 'use', label: 'Use of the Site' },
  { id: 'accuracy', label: 'Accuracy of Calculations' },
  { id: 'ip', label: 'Intellectual Property' },
  { id: 'liability', label: 'Limitation of Liability' },
  { id: 'modifications', label: 'Modifications' },
  { id: 'contact', label: 'Contact' },
];

export const TermsOfService: React.FC = () => {
  useEffect(() => {
    document.documentElement.style.visibility = 'visible';
  }, []);

  return (
    <div className="min-h-screen bg-[var(--bg-main)] text-[var(--text-main)]">
      <div className="max-w-6xl mx-auto px-5 md:px-10 py-10">

        {/* Back button */}
        <a
          href="/"
          className="inline-flex items-center gap-2 text-xs text-[var(--text-muted)] hover:text-[var(--text-main)] mb-10 transition-colors"
        >
          <svg className="w-3.5 h-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M15 18l-6-6 6-6"/></svg>
          Back to Home
        </a>

        {/* Desktop: two-column | Mobile: single column */}
        <div className="flex flex-col md:flex-row gap-12">

          {/* LEFT: Sticky sidebar (desktop only) */}
          <aside className="hidden md:block w-56 flex-shrink-0">
            <div className="sticky top-10">
              <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-4">On this page</p>
              <nav className="space-y-1">
                {tosSections.map(s => (
                  <a
                    key={s.id}
                    href={`#${s.id}`}
                    className="block text-xs text-[var(--text-muted)] hover:text-[var(--primary)] py-1 transition-colors"
                  >
                    {s.label}
                  </a>
                ))}
              </nav>
              <div className="mt-8 p-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
                <p className="text-[10px] font-bold uppercase tracking-widest text-[var(--text-muted)] mb-2">Summary</p>
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">Educational tool only. Not financial advice. All calculations are hypothetical.</p>
              </div>
            </div>
          </aside>

          {/* RIGHT: Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">Terms of Service</h1>
            <p className="text-[var(--text-muted)] text-xs mb-10">Last updated: June 2026</p>

            <div className="space-y-10 text-sm text-[var(--text-muted)] leading-relaxed">

              <section id="acceptance">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Acceptance of Terms</h2>
                <p>By accessing or using Regret Calculator ("the Site"), you agree to be bound by these Terms of Service. If you do not agree, please do not use the Site.</p>
              </section>

              <section id="not-advice">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Not Financial Advice</h2>
                <p>Regret Calculator is an <span className="text-[var(--text-main)]">educational simulation tool only.</span> Nothing on this site constitutes financial, investment, tax, or legal advice. All projections are hypothetical and based on assumed rates of return. Past market performance does not guarantee future results. Always consult a qualified financial professional before making investment decisions.</p>
              </section>

              <section id="use">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Use of the Site</h2>
                <p>You agree to use this Site for lawful, personal purposes only. You may not:</p>
                <ul className="mt-3 ml-4 space-y-1.5 list-disc">
                  <li>Attempt to reverse-engineer, scrape, or copy the Site's code or content for commercial use</li>
                  <li>Use automated bots or scripts to access the Site</li>
                  <li>Misrepresent the tool's outputs as professional financial guidance</li>
                </ul>
              </section>

              <section id="accuracy">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Accuracy of Calculations</h2>
                <p>While we strive to ensure our calculations are mathematically sound, we make no warranty that results are error-free or suitable for any particular purpose. Calculations assume constant rates of return and do not account for taxes, fees, market volatility, or other real-world factors.</p>
              </section>

              <section id="ip">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Intellectual Property</h2>
                <p>All content, design, code, and branding on this Site are the property of <span className="text-[var(--text-main)]">Sepehr Zunoubi / Compound Labs</span> and are protected by applicable copyright laws. You may not reproduce or redistribute any part of this Site without explicit written permission.</p>
              </section>

              <section id="liability">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Limitation of Liability</h2>
                <p>To the fullest extent permitted by law, Regret Calculator and its creator shall not be liable for any direct, indirect, incidental, or consequential damages arising from your use of the Site or reliance on its outputs.</p>
              </section>

              <section id="modifications">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Modifications</h2>
                <p>We reserve the right to update these terms at any time. The "Last updated" date above will reflect any changes. Continued use of the Site after updates constitutes acceptance of the revised terms.</p>
              </section>

              <section id="contact">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Contact</h2>
                <p>For questions about these terms, reach out via <a href="https://www.linkedin.com/in/sepehrzunoubi" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">LinkedIn</a>.</p>
              </section>

            </div>

            <div className="mt-12 pt-6 border-t border-[var(--border)]">
              <p className="text-[10px] text-[var(--text-muted)] uppercase tracking-widest opacity-60">
                Regret Calculator &copy; 2026 &mdash; Sepehr Zunoubi
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};
