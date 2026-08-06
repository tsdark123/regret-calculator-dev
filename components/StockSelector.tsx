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

// ─── Returns are approximate annualized CAGRs, manually curated. ──────────────
// Windows vary: most US stocks/ETFs use ~10-year historical data through
// 2024–2026; newer stocks use CAGR since listing; crypto uses a rolling
// multi-year window. Pre-tax; may include dividends for comparability.
// NOT live market data. Past performance does not guarantee future results.
// Last full review: 2024–2026.

const DATA_VERSION = {
  asOf: '2024–2026 (mixed windows)',
  methodology:
    'Approximate annualized CAGRs, manually curated from public historical data. Not live.',
};

const STOCK_DATA: AssetEntry[] = [

  // ── ETFs ──────────────────────────────────────────────────────────────────
  { symbol: 'QQQ',   name: 'Nasdaq 100 ETF',      type: 'ETF',    avgReturn: 18, color: 'bg-[#5865F2]', sector: 'ETF' },
  { symbol: 'SPY',   name: 'S&P 500 ETF',          type: 'ETF',    avgReturn: 13, color: 'bg-[#1A8754]', sector: 'ETF' },
  { symbol: 'VOO',   name: 'Vanguard S&P 500',      type: 'ETF',    avgReturn: 13, color: 'bg-[#1A6E3C]', sector: 'ETF' },
  { symbol: 'SCHD',  name: 'Schwab Dividend ETF',   type: 'ETF',    avgReturn: 12, color: 'bg-[#0077B5]', sector: 'ETF' },
  { symbol: 'VTI',   name: 'Vanguard Total Market', type: 'ETF',    avgReturn: 12, color: 'bg-[#2E6DA4]', sector: 'ETF' },
  { symbol: 'VYM',   name: 'Vanguard Dividend ETF', type: 'ETF',    avgReturn: 11, color: 'bg-[#1D5FAD]', sector: 'ETF' },
  { symbol: 'GLD',   name: 'Gold ETF',              type: 'ETF',    avgReturn:  7, color: 'bg-[#D4AF37]', sector: 'ETF' },
  { symbol: 'VNQ',   name: 'Vanguard Real Estate',  type: 'ETF',    avgReturn:  8, color: 'bg-[#7B5EA7]', sector: 'ETF' },
  { symbol: 'VWCE',  name: 'FTSE All-World ETF',    type: 'ETF',    avgReturn:  8, color: 'bg-[#BE3A34]', sector: 'ETF' },
  { symbol: 'ARKK',  name: 'ARK Innovation ETF',    type: 'ETF',    avgReturn:  6, color: 'bg-[#00B4D8]', sector: 'ETF' },
  { symbol: 'IEMG',  name: 'Emerging Markets ETF',  type: 'ETF',    avgReturn:  4, color: 'bg-[#E76F51]', sector: 'ETF' },
  { symbol: 'BND',   name: 'US Bond ETF',           type: 'ETF',    avgReturn:  2, color: 'bg-[#6C757D]', sector: 'ETF' },

  // ── Tech ──────────────────────────────────────────────────────────────────
  { symbol: 'NVDA',  name: 'NVIDIA',               type: 'Stock',  avgReturn: 65, color: 'bg-[#76B900]', sector: 'Tech' },
  { symbol: 'AMD',   name: 'AMD',                  type: 'Stock',  avgReturn: 48, color: 'bg-[#ED1C24]', sector: 'Tech' },
  { symbol: 'AVGO',  name: 'Broadcom',             type: 'Stock',  avgReturn: 42, color: 'bg-[#CC0000]', sector: 'Tech' },
  { symbol: 'TSLA',  name: 'Tesla',                type: 'Stock',  avgReturn: 40, color: 'bg-[#E31937]', sector: 'Tech' },
  { symbol: 'MSFT',  name: 'Microsoft',            type: 'Stock',  avgReturn: 28, color: 'bg-[#F25022]', sector: 'Tech' },
  { symbol: 'NFLX',  name: 'Netflix',              type: 'Stock',  avgReturn: 26, color: 'bg-[#E50914]', sector: 'Tech' },
  { symbol: 'AAPL',  name: 'Apple',                type: 'Stock',  avgReturn: 24, color: 'bg-[#555555]', sector: 'Tech' },
  { symbol: 'AMZN',  name: 'Amazon',               type: 'Stock',  avgReturn: 24, color: 'bg-[#FF9900]', sector: 'Tech' },
  { symbol: 'ADBE',  name: 'Adobe',                type: 'Stock',  avgReturn: 22, color: 'bg-[#FF0000]', sector: 'Tech' },
  { symbol: 'META',  name: 'Meta',                 type: 'Stock',  avgReturn: 20, color: 'bg-[#0081FB]', sector: 'Tech' },
  { symbol: 'GOOGL', name: 'Alphabet (Google)',    type: 'Stock',  avgReturn: 18, color: 'bg-[#EA4335]', sector: 'Tech' },
  { symbol: 'SHOP',  name: 'Shopify',              type: 'Stock',  avgReturn: 18, color: 'bg-[#96BF48]', sector: 'Tech' },
  { symbol: 'CRM',   name: 'Salesforce',           type: 'Stock',  avgReturn: 15, color: 'bg-[#00A1E0]', sector: 'Tech' },
  { symbol: 'ORCL',  name: 'Oracle',               type: 'Stock',  avgReturn: 14, color: 'bg-[#F80000]', sector: 'Tech' },
  { symbol: 'QCOM',  name: 'Qualcomm',             type: 'Stock',  avgReturn: 14, color: 'bg-[#3253DC]', sector: 'Tech' },
  { symbol: 'INTC',  name: 'Intel',                type: 'Stock',  avgReturn:  1, color: 'bg-[#0068B5]', sector: 'Tech' },

  // ── Finance ───────────────────────────────────────────────────────────────
  { symbol: 'SPGI',  name: 'S&P Global',           type: 'Stock',  avgReturn: 22, color: 'bg-[#1E3A5F]', sector: 'Finance' },
  { symbol: 'MA',    name: 'Mastercard',            type: 'Stock',  avgReturn: 20, color: 'bg-[#EB001B]', sector: 'Finance' },
  { symbol: 'V',     name: 'Visa',                 type: 'Stock',  avgReturn: 18, color: 'bg-[#1A1F71]', sector: 'Finance' },
  { symbol: 'BLK',   name: 'BlackRock',            type: 'Stock',  avgReturn: 16, color: 'bg-[#000000]', sector: 'Finance' },
  { symbol: 'AXP',   name: 'American Express',     type: 'Stock',  avgReturn: 15, color: 'bg-[#016FD0]', sector: 'Finance' },
  { symbol: 'JPM',   name: 'JPMorgan Chase',       type: 'Stock',  avgReturn: 14, color: 'bg-[#003087]', sector: 'Finance' },
  { symbol: 'BAC',   name: 'Bank of America',      type: 'Stock',  avgReturn: 14, color: 'bg-[#E31837]', sector: 'Finance' },
  { symbol: 'BRK.B', name: 'Berkshire Hathaway',   type: 'Stock',  avgReturn: 13, color: 'bg-[#6B3A2A]', sector: 'Finance' },
  { symbol: 'GS',    name: 'Goldman Sachs',        type: 'Stock',  avgReturn: 11, color: 'bg-[#7399C6]', sector: 'Finance' },
  { symbol: 'WFC',   name: 'Wells Fargo',          type: 'Stock',  avgReturn:  8, color: 'bg-[#D71E2B]', sector: 'Finance' },

  // ── Consumer ──────────────────────────────────────────────────────────────
  { symbol: 'CMG',   name: 'Chipotle',             type: 'Stock',  avgReturn: 28, color: 'bg-[#441500]', sector: 'Consumer' },
  { symbol: 'LULU',  name: 'Lululemon',            type: 'Stock',  avgReturn: 22, color: 'bg-[#E31837]', sector: 'Consumer' },
  { symbol: 'LOW',   name: "Lowe's",               type: 'Stock',  avgReturn: 20, color: 'bg-[#004990]', sector: 'Consumer' },
  { symbol: 'COST',  name: 'Costco',               type: 'Stock',  avgReturn: 20, color: 'bg-[#005DAA]', sector: 'Consumer' },
  { symbol: 'HD',    name: 'Home Depot',           type: 'Stock',  avgReturn: 18, color: 'bg-[#F96302]', sector: 'Consumer' },
  { symbol: 'WMT',   name: 'Walmart',              type: 'Stock',  avgReturn: 12, color: 'bg-[#0071CE]', sector: 'Consumer' },
  { symbol: 'MCD',   name: "McDonald's",           type: 'Stock',  avgReturn: 12, color: 'bg-[#FFC72C]', sector: 'Consumer' },
  { symbol: 'PEP',   name: 'PepsiCo',              type: 'Stock',  avgReturn: 10, color: 'bg-[#004B93]', sector: 'Consumer' },
  { symbol: 'KO',    name: 'Coca-Cola',            type: 'Stock',  avgReturn:  9, color: 'bg-[#F40009]', sector: 'Consumer' },
  { symbol: 'NKE',   name: 'Nike',                 type: 'Stock',  avgReturn:  8, color: 'bg-[#111111]', sector: 'Consumer' },
  { symbol: 'TGT',   name: 'Target',               type: 'Stock',  avgReturn:  8, color: 'bg-[#CC0000]', sector: 'Consumer' },
  { symbol: 'SBUX',  name: 'Starbucks',            type: 'Stock',  avgReturn:  7, color: 'bg-[#00704A]', sector: 'Consumer' },

  // ── Healthcare ────────────────────────────────────────────────────────────
  { symbol: 'LLY',   name: 'Eli Lilly',            type: 'Stock',  avgReturn: 38, color: 'bg-[#D52B1E]', sector: 'Healthcare' },
  { symbol: 'ISRG',  name: 'Intuitive Surgical',   type: 'Stock',  avgReturn: 22, color: 'bg-[#0066CC]', sector: 'Healthcare' },
  { symbol: 'UNH',   name: 'UnitedHealth',         type: 'Stock',  avgReturn: 20, color: 'bg-[#005B8E]', sector: 'Healthcare' },
  { symbol: 'TMO',   name: 'Thermo Fisher',        type: 'Stock',  avgReturn: 17, color: 'bg-[#0059A0]', sector: 'Healthcare' },
  { symbol: 'ABBV',  name: 'AbbVie',               type: 'Stock',  avgReturn: 15, color: 'bg-[#071D49]', sector: 'Healthcare' },
  { symbol: 'AMGN',  name: 'Amgen',                type: 'Stock',  avgReturn: 10, color: 'bg-[#0060AE]', sector: 'Healthcare' },
  { symbol: 'JNJ',   name: 'Johnson & Johnson',    type: 'Stock',  avgReturn:  5, color: 'bg-[#D51900]', sector: 'Healthcare' },
  { symbol: 'PFE',   name: 'Pfizer',               type: 'Stock',  avgReturn:  3, color: 'bg-[#0093D0]', sector: 'Healthcare' },

  // ── Energy ────────────────────────────────────────────────────────────────
  { symbol: 'PSX',   name: 'Phillips 66',          type: 'Stock',  avgReturn: 13, color: 'bg-[#E05206]', sector: 'Energy' },
  { symbol: 'NEE',   name: 'NextEra Energy',       type: 'Stock',  avgReturn: 12, color: 'bg-[#0077C8]', sector: 'Energy' },
  { symbol: 'EOG',   name: 'EOG Resources',        type: 'Stock',  avgReturn: 10, color: 'bg-[#004F8B]', sector: 'Energy' },
  { symbol: 'CVX',   name: 'Chevron',              type: 'Stock',  avgReturn:  8, color: 'bg-[#009DD9]', sector: 'Energy' },
  { symbol: 'XOM',   name: 'ExxonMobil',           type: 'Stock',  avgReturn:  8, color: 'bg-[#C0392B]', sector: 'Energy' },

  // ── Industrial ────────────────────────────────────────────────────────────
  { symbol: 'DE',    name: 'Deere & Co.',          type: 'Stock',  avgReturn: 18, color: 'bg-[#367C2B]', sector: 'Industrial' },
  { symbol: 'CAT',   name: 'Caterpillar',          type: 'Stock',  avgReturn: 16, color: 'bg-[#FFCD11]', sector: 'Industrial' },
  { symbol: 'LMT',   name: 'Lockheed Martin',      type: 'Stock',  avgReturn: 14, color: 'bg-[#1C3B6E]', sector: 'Industrial' },
  { symbol: 'HON',   name: 'Honeywell',            type: 'Stock',  avgReturn: 11, color: 'bg-[#E31837]', sector: 'Industrial' },
  { symbol: 'RTX',   name: 'Raytheon',             type: 'Stock',  avgReturn: 10, color: 'bg-[#003087]', sector: 'Industrial' },
  { symbol: 'UPS',   name: 'UPS',                  type: 'Stock',  avgReturn:  8, color: 'bg-[#351C15]', sector: 'Industrial' },
  { symbol: 'BA',    name: 'Boeing',               type: 'Stock',  avgReturn: -4, color: 'bg-[#1D5799]', sector: 'Industrial' },

  // ── Crypto ────────────────────────────────────────────────────────────────
  { symbol: 'SOL',   name: 'Solana',               type: 'Crypto', avgReturn: 72, color: 'bg-[#9945FF]', sector: 'Crypto' },
  { symbol: 'BNB',   name: 'BNB Chain',            type: 'Crypto', avgReturn: 65, color: 'bg-[#F3BA2F]', sector: 'Crypto' },
  { symbol: 'AVAX',  name: 'Avalanche',            type: 'Crypto', avgReturn: 62, color: 'bg-[#E84142]', sector: 'Crypto' },
  { symbol: 'BTC',   name: 'Bitcoin',              type: 'Crypto', avgReturn: 55, color: 'bg-[#F7931A]', sector: 'Crypto' },
  { symbol: 'ETH',   name: 'Ethereum',             type: 'Crypto', avgReturn: 48, color: 'bg-[#627EEA]', sector: 'Crypto' },
  { symbol: 'DOGE',  name: 'Dogecoin',             type: 'Crypto', avgReturn: 42, color: 'bg-[#C2A633]', sector: 'Crypto' },
  { symbol: 'ADA',   name: 'Cardano',              type: 'Crypto', avgReturn: 25, color: 'bg-[#0033AD]', sector: 'Crypto' },
  { symbol: 'XRP',   name: 'XRP',                  type: 'Crypto', avgReturn: 12, color: 'bg-[#00AAE4]', sector: 'Crypto' },
];

export const StockSelector: React.FC<StockSelectorProps> = ({ isOpen, onClose, onSelect, currentStockSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSector, setActiveSector] = useState<Sector>('All');

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

  const filteredStocks = useMemo(() => {
    const lower = searchTerm.toLowerCase();
    return STOCK_DATA
      .filter(s => activeSector === 'All' || s.sector === activeSector)
      .filter(s => !lower || s.name.toLowerCase().includes(lower) || s.symbol.toLowerCase().includes(lower))
      .sort((a, b) => b.avgReturn - a.avgReturn);
  }, [searchTerm, activeSector]);

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