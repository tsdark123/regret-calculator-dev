import React from 'react';

export const LoadingScreen: React.FC = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[var(--bg-main)]/90 backdrop-blur-sm">
      <div className="relative flex items-center justify-center">
        {/* Central Core */}
        <div className="w-4 h-4 bg-[var(--primary)] rounded-full animate-pulse z-10 shadow-[0_0_20px_var(--primary)]"></div>
        
        {/* Ripple 1 */}
        <div className="absolute border border-[var(--primary)] opacity-50 rounded-full animate-ripple"></div>
        
        {/* Ripple 2 */}
        <div className="absolute border border-[var(--primary)] opacity-30 rounded-full animate-ripple delay-300"></div>
        
        {/* Ripple 3 */}
        <div className="absolute border border-[var(--primary)] opacity-10 rounded-full animate-ripple delay-600"></div>
      </div>
      
      <div className="mt-12 text-center space-y-2 animate-fade-in-up">
        <p className="text-sm font-bold text-[var(--text-main)] tracking-widest uppercase">Calculating Opportunity Cost</p>
        <p className="text-xs text-[var(--text-muted)]">Compounding your decisions...</p>
      </div>
    </div>
  );
};