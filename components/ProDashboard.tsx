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
      
      {/* Desktop Layout - With Technical Grid Background */}
      <div 
        className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-6 p-6 rounded-3xl 
                   bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)]
                   bg-[size:24px_24px]
                   border border-white/5"
      >
        <div className="lg:col-span-3">
          <FireProjection results={results} theme={theme} />
        </div>
        <div className="lg:col-span-2">
          <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
        </div>
      </div>
    </div>
  );
};
