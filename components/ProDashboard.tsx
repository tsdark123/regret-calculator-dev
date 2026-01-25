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
    <div className="w-full pb-4 md:pb-12">
      {/* Mobile Layout - Vertically Stacked */}
      <div className="flex flex-col md:hidden gap-6 px-2">
        <div className="w-full">
          <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
        </div>
        <div className="w-full">
          <FireProjection results={results} theme={theme} />
        </div>
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
