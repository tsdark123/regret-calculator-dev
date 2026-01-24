import React from 'react';
import { CalculationResult, Assumptions, Theme } from '../types';
import { FireProjection } from './FireProjection';
import { ComparisonBattle } from './ComparisonBattle';

interface ProDashboardProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}

export const ProDashboard: React.FC<ProDashboardProps> = ({ results, assumptions, theme }) => {
  return (
    <div className="w-full pb-12">
      {/* Mobile Restriction Message */}
      <div className="md:hidden text-center py-8">
        <p className="text-[var(--text-muted)] text-sm">
          Pro Dashboard is available on desktop only.
        </p>
      </div>
      
      {/* Desktop Layout - With Ambient Light */}
      <div className="hidden md:block relative overflow-hidden rounded-3xl p-6
                      bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                      bg-[size:24px_24px]
                      border border-white/5">
        
        {/* Ambient Light Orb 1 - Top Left (Primary Color) */}
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] 
                        bg-[var(--primary)]/20 blur-[120px] rounded-full pointer-events-none" />
        
        {/* Ambient Light Orb 2 - Bottom Right (Blue Accent) */}
        <div className="absolute -bottom-[20%] -right-[10%] w-[400px] h-[400px] 
                        bg-blue-500/10 blur-[100px] rounded-full pointer-events-none" />
        
        {/* Content Grid */}
        <div className="relative z-10 grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Gradient Border Wrapper - FireProjection */}
          <div className="lg:col-span-3 p-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-transparent">
            <FireProjection results={results} theme={theme} />
          </div>
          
          {/* Gradient Border Wrapper - ComparisonBattle */}
          <div className="lg:col-span-2 p-[1px] rounded-2xl bg-gradient-to-b from-white/20 to-transparent">
            <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
          </div>
        </div>
      </div>
    </div>
  );
};
