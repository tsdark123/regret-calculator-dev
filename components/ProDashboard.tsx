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
      
      {/* Desktop Layout - Equal 50/50 Split Centered */}
      <div className="hidden md:flex justify-center gap-6 max-w-7xl mx-auto">
        <div className="w-full max-w-[500px]">
          <FireProjection results={results} theme={theme} />
        </div>
        <div className="w-full max-w-[500px]">
          <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
        </div>
      </div>
    </div>
  );
};
