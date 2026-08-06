import React, { useState, useEffect, useMemo } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { StockOption } from '../types';

interface StockSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stock: StockOption) => void;
  currentStockSymbol?: string;
}

type Sector = 'All' | 'ETF' | 'Tech' | 'Finance' | 'Consumer' | 'Healthcare' | 'Energy' | 'Industrial' | 'Crypto';
const SECTORS: Sector[] = ['All', 'ETF', 'Tech', 'Finance', 'Consumer', 'Healthcare', 'Energy', 'Industrial', 'Crypto'];

interface AssetEntry extends StockOption {
  sector: Exclude<Sector, 'All'>;
}

import stockData from '../src/data/stockData.json';
import stockReturns from '../src/data/stockReturns.json';

const DATA_VERSION = {
  asOf: stockReturns.lastUpdated ?? 'legacy',
  methodology:
    stockReturns.source === 'Alpha Vantage'
      ? `Approximate 10-yr CAGRs from Alpha Vantage adjusted monthly closes. Rolling refresh in progress; un-refreshed assets use curated fallbacks. Last refreshed: ${stockReturns.lastUpdated ?? 'unknown'}.`
      : 'Approximate 10-yr CAGRs, manually curated from public historical data. Not live.',
};

export const StockSelector: React.FC<StockSelectorProps> = ({ isOpen, onClose, onSelect, currentStockSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState<Sector>('All');
  const [liveReturns, setLiveReturns] = useState<Record<string, any>>(stockReturns.returns);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchTerm('');
      setActiveSector('All');
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  // Optional live override from Firebase RTDB. Falls back to bundled JSON for instant load.
  useEffect(() => {
    if (typeof window === 'undefined') return;
    if (!window.firebaseDB || !window.firebaseOnValue || !window.firebaseRef) return;

    const db = window.firebaseDB;
    const ref = window.firebaseRef(db, '/marketData/stocks');
    const unsubscribe = window.firebaseOnValue(ref, (snapshot: any) => {
      const val = snapshot.val();
      if (val) setLiveReturns((prev) => ({ ...prev, ...val }));
    });

    return unsubscribe;
  }, []);

  const STOCK_DATA = useMemo<AssetEntry[]>(() => {
    return (stockData as AssetEntry[]).map((asset) => {
      const override = liveReturns[asset.symbol];
      return { ...asset, avgReturn: override?.avgReturn ?? asset.avgReturn };
    });
  }, [liveReturns]);

  const filteredStocks = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return STOCK_DATA
      .filter(s => activeSector === 'All' || s.sector === activeSector)
      .filter(s => !lower || s.name.toLowerCase().includes(lower) || s.symbol.toLowerCase().includes(lower))
      .sort((a, b) => b.avgReturn - a.avgReturn);
  }, [searchTerm, activeSector, STOCK_DATA]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div className="absolute inset-0 backdrop-blur-md animate-fade-in-up" onClick={onClose} />

      {/* Modal */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[75vh] lg:max-h-[88vh] animate-fade-in-down">

        {/* Header */}
        <div className="p-4 lg:p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-3 lg:mb-4">
            <div>
              <h2 className="text-xl font-bold text-[var(--text-main)]">Select Investment</h2>
              <p className="text-[10px] text-[var(--text-muted)] mt-0.5">
                {STOCK_DATA.length} assets · sorted by historical return · data as of {DATA_VERSION.asOf}
              </p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>

          {/* Search */}
          <div className="relative mb-3">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-[var(--text-muted)]" />
            <input
              type="text"
              placeholder="Search stocks, ETFs, crypto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] text-[var(--text-main)] pl-11 pr-4 py-3 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-all placeholder:text-[var(--text-muted)] text-sm"
            />
          </div>

          {/* Sector filter tabs */}
          <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
            {SECTORS.map(sector => (
              <button
                key={sector}
                onClick={() => setActiveSector(sector)}
                className={`flex-shrink-0 px-3 py-1 rounded-lg text-xs font-semibold transition-all ${
                  activeSector === sector
                    ? 'bg-[var(--primary)] text-white'
                    : 'bg-[var(--bg-input)] text-[var(--text-muted)] hover:text-[var(--text-main)] border border-[var(--border)]'
                }`}
              >
                {sector}
              </button>
            ))}
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)] text-sm">
              No assets found{searchTerm ? ` matching "${searchTerm}"` : ''} in {activeSector}
            </div>
          ) : (
            <div className="space-y-0.5">
              {filteredStocks.map((stock) => {
                const isNegative = stock.avgReturn < 0;
                return (
                  <button
                    key={stock.symbol}
                    onClick={() => { onSelect(stock); onClose(); }}
                    className={`w-full flex items-center gap-3 px-3 py-3 rounded-xl transition-all hover:bg-[var(--bg-hover)] border ${currentStockSymbol === stock.symbol ? 'bg-[var(--bg-hover)] border-[var(--primary-50)]' : 'border-transparent'}`}
                  >
                    {/* Color avatar */}
                    <div className={`w-9 h-9 rounded-lg flex-shrink-0 flex items-center justify-center font-bold text-white text-xs shadow ${stock.color}`}>
                      {stock.symbol.replace('.', '')[0]}
                    </div>

                    <div className="flex-1 text-left min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="font-semibold text-[var(--text-main)] text-sm truncate">{stock.name}</span>
                        <span className="text-[9px] bg-[var(--bg-input)] px-1.5 py-0.5 rounded text-[var(--text-muted)] font-medium border border-[var(--border)] flex-shrink-0">{stock.type}</span>
                      </div>
                      <span className="text-[11px] text-[var(--text-muted)] font-mono">${stock.symbol}</span>
                    </div>

                    <div className="text-right flex-shrink-0">
                      <div className={`flex items-center justify-end gap-1 font-bold text-sm ${isNegative ? 'text-red-500' : 'text-green-500'}`}>
                        {isNegative ? <TrendingDown className="w-3 h-3" /> : <TrendingUp className="w-3 h-3" />}
                        {stock.avgReturn > 0 ? '+' : ''}{stock.avgReturn}%
                      </div>
                      <span className="text-[10px] text-[var(--text-muted)]">Ann. CAGR</span>
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-4 py-3 border-t border-[var(--border)] bg-[var(--bg-card)]">
          <p className="text-[10px] text-[var(--text-muted)] text-center leading-relaxed">
            *Annualized CAGR · Windows vary by asset (10-yr, since listing, or rolling multi-year).
            Pre-tax; may include dividends for comparability. Manually curated, not live market data.
            Past performance does not guarantee future results. Not financial advice.
          </p>
        </div>

      </div>
    </div>
  );
};