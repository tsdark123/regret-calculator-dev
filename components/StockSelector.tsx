import React, { useState, useEffect } from 'react';
import { Search, X, TrendingUp, TrendingDown } from 'lucide-react';
import { StockOption } from '../types';

interface StockSelectorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelect: (stock: StockOption) => void;
  currentStockSymbol?: string;
}

const STOCK_DATA: StockOption[] = [
  // Tech Giants
  { symbol: 'NVDA', name: 'NVIDIA', type: 'Stock', avgReturn: 60, color: 'bg-[#76B900]' },
  { symbol: 'META', name: 'Meta', type: 'Stock', avgReturn: 22, color: 'bg-[#0081FB]' },
  { symbol: 'GOOGL', name: 'Alphabet', type: 'Stock', avgReturn: 18, color: 'bg-[#EA4335]' },
  { symbol: 'AMZN', name: 'Amazon', type: 'Stock', avgReturn: 26, color: 'bg-[#FF9900]' },
  { symbol: 'MSFT', name: 'Microsoft', type: 'Stock', avgReturn: 24, color: 'bg-[#F25022]' },
  { symbol: 'TSLA', name: 'Tesla', type: 'Stock', avgReturn: 45, color: 'bg-[#E31937]' },
  { symbol: 'AAPL', name: 'Apple', type: 'Stock', avgReturn: 25, color: 'bg-[#A2AAAD]' },
  
  // Funds & Crypto
  { symbol: 'SPY', name: 'S&P 500', type: 'ETF', avgReturn: 10, color: 'bg-[#1A8754]' },
  { symbol: 'VWCE', name: 'FTSE All-World', type: 'ETF', avgReturn: 8, color: 'bg-[#BE3A34]' },
  { symbol: 'BTC', name: 'Bitcoin', type: 'Crypto', avgReturn: 55, color: 'bg-[#F7931A]' },
  { symbol: 'ETH', name: 'Ethereum', type: 'Crypto', avgReturn: 48, color: 'bg-[#627EEA]' },
];

export const StockSelector: React.FC<StockSelectorProps> = ({ isOpen, onClose, onSelect, currentStockSymbol }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredStocks, setFilteredStocks] = useState(STOCK_DATA);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      setSearchTerm('');
      setFilteredStocks(STOCK_DATA);
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isOpen]);

  useEffect(() => {
    const lower = searchTerm.toLowerCase();
    setFilteredStocks(STOCK_DATA.filter(s => 
      s.name.toLowerCase().includes(lower) || s.symbol.toLowerCase().includes(lower)
    ));
  }, [searchTerm]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-md animate-fade-in-up"
        onClick={onClose}
      />

      {/* Modal Content - Updated to use theme variables */}
      <div className="relative w-full max-w-2xl bg-[var(--bg-card)] border border-[var(--border)] rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[85vh] animate-fade-in-down">
        
        {/* Header / Search */}
        <div className="p-6 border-b border-[var(--border)]">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-[var(--text-main)]">Select Investment</h2>
            <button onClick={onClose} className="p-2 hover:bg-[var(--bg-hover)] rounded-full transition-colors">
              <X className="w-5 h-5 text-[var(--text-muted)]" />
            </button>
          </div>
          
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--text-muted)]" />
            <input
              type="text"
              autoFocus
              placeholder="Search for stocks, funds, or crypto..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[var(--bg-input)] text-[var(--text-main)] pl-12 pr-4 py-4 rounded-xl border border-[var(--border)] focus:border-[var(--primary)] focus:outline-none transition-all placeholder:text-[var(--text-muted)] text-lg"
            />
          </div>
        </div>

        {/* List */}
        <div className="flex-1 overflow-y-auto p-2 scroll-smooth">
          {filteredStocks.length === 0 ? (
            <div className="text-center py-12 text-[var(--text-muted)]">
              No assets found matching "{searchTerm}"
            </div>
          ) : (
            <div className="space-y-1">
              {filteredStocks.map((stock) => (
                <button
                  key={stock.symbol}
                  onClick={() => {
                    onSelect(stock);
                    onClose();
                  }}
                  className={`w-full flex items-center gap-4 p-4 rounded-xl transition-all group hover:bg-[var(--bg-hover)] border ${currentStockSymbol === stock.symbol ? 'bg-[var(--bg-hover)] border-[var(--primary-50)]' : 'border-transparent'}`}
                >
                  {/* Icon/Logo Placeholder */}
                  <div className={`w-10 h-10 rounded-lg flex items-center justify-center font-bold text-white text-sm shadow-lg ${stock.color}`}>
                    {stock.symbol[0]}
                  </div>

                  <div className="flex-1 text-left">
                    <div className="flex items-center gap-2">
                       <span className="font-bold text-[var(--text-main)]">{stock.name}</span>
                       <span className="text-[10px] bg-[var(--bg-input)] px-1.5 py-0.5 rounded text-[var(--text-muted)] font-medium border border-[var(--border)]">{stock.type}</span>
                    </div>
                    <span className="text-xs text-[var(--text-muted)] font-mono">${stock.symbol}</span>
                  </div>

                  <div className="text-right">
                     <div className="flex items-center justify-end gap-1 text-green-500 font-bold text-sm">
                        <TrendingUp className="w-3 h-3" />
                        {stock.avgReturn}%
                     </div>
                     <span className="text-[10px] text-[var(--text-muted)]">Avg. Annual Return</span>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[var(--border)] bg-[var(--bg-card)] text-center">
           <p className="text-[10px] text-[var(--text-muted)]">
             *Average returns based on historical performance over the last 5-10 years. Not financial advice.
           </p>
        </div>

      </div>
    </div>
  );
};