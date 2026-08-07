import React, { useEffect } from 'react';

const privacySections = [
  { id: 'overview', label: 'Overview' },
  { id: 'no-collect', label: 'Data We Do Not Collect' },
  { id: 'do-track', label: 'What We Do Track' },
  { id: 'market-data', label: 'Market Data' },
  { id: 'local-storage', label: 'Local Storage' },
  { id: 'third-party', label: 'Third-Party Services' },
  { id: 'children', label: "Children's Privacy" },
  { id: 'changes', label: 'Changes to This Policy' },
  { id: 'contact', label: 'Contact' },
];

export const PrivacyPolicy: React.FC = () => {
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
                {privacySections.map(s => (
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
                <p className="text-xs text-[var(--text-muted)] leading-relaxed">We collect virtually nothing. All calculations run locally in your browser.</p>
              </div>
            </div>
          </aside>

          {/* RIGHT: Content */}
          <div className="flex-1 min-w-0">
            <h1 className="text-3xl md:text-4xl font-bold mb-1">Privacy Policy</h1>
            <p className="text-[var(--text-muted)] text-xs mb-10">Last updated: August 2026</p>

            <div className="space-y-10 text-sm text-[var(--text-muted)] leading-relaxed">

              <section id="overview">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Overview</h2>
                <p>Regret Calculator is a free, educational tool built to help you visualize the long-term opportunity cost of everyday spending. Your privacy is straightforward here: <span className="text-[var(--text-main)]">we collect virtually nothing about you.</span></p>
              </section>

              <section id="no-collect">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Data We Do Not Collect</h2>
                <p>All calculations run entirely in your browser. No expense data, habit inputs, assumptions, or results are ever sent to any server. We do not collect:</p>
                <ul className="mt-3 ml-4 space-y-1.5 list-disc">
                  <li>Names, email addresses, or account information</li>
                  <li>Your expense or financial inputs</li>
                  <li>Your calculation results</li>
                  <li>Device identifiers or advertising IDs</li>
                </ul>
              </section>

              <section id="do-track">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">What We Do Track</h2>
                <p>We track a <span className="text-[var(--text-main)]">global, anonymous counter</span> of how many analyses have been run across all users. Additionally, for locations that have not previously used the site, we may store one anonymous city/country entry to map usage geography. No personal identifiers, expense data, or calculation results are ever collected or stored.</p>
              </section>

              <section id="market-data">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Market Data</h2>
                <p>Stock, ETF, and crypto return data is bundled with the app so calculations can run instantly in your browser. The bundled data is derived from publicly available historical prices and may include approximate historical CAGRs. The app can optionally fetch live return overrides from Firebase, but only the asset symbol and return value are transmitted; no personal data or search queries are sent. We do not collect or store your searches, selections, or portfolio information.</p>
              </section>

              <section id="local-storage">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Local Storage</h2>
                <p>We store your selected color theme (purple, green, or blue) in your browser's <code className="text-[var(--primary)] text-xs bg-[var(--bg-card)] px-1 py-0.5 rounded">localStorage</code> so your preference persists across visits. No personal data is stored here.</p>
              </section>

              <section id="third-party">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Third-Party Services</h2>
                <p>We use <span className="text-[var(--text-main)]">Firebase</span> (by Google) to maintain the global analysis counter, store the optional live market data override, and record one anonymous city/country entry for new usage locations. Firebase may log standard request metadata (e.g. IP address) per their own privacy policy. We do not use Google Analytics, advertising networks, or any tracking pixels.</p>
              </section>

              <section id="children">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Children's Privacy</h2>
                <p>This tool is not directed at children under 13. We do not knowingly collect any information from children.</p>
              </section>

              <section id="changes">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Changes to This Policy</h2>
                <p>If this policy changes materially, the "Last updated" date at the top of this page will reflect the update. Continued use of the site constitutes acceptance of the updated policy.</p>
              </section>

              <section id="contact">
                <h2 className="text-[var(--text-main)] font-semibold text-lg mb-3">Contact</h2>
                <p>Questions? Reach out via <a href="https://www.linkedin.com/in/sepehrzunoubi" target="_blank" rel="noopener noreferrer" className="text-[var(--primary)] hover:underline">LinkedIn</a>.</p>
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
