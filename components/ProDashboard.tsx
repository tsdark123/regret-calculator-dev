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
    <div className="w-full pb-8 md:pb-12">
      {/* Responsive Layout - Vertical stack on mobile, horizontal on desktop */}
      <div className="flex flex-col md:flex-row justify-center gap-4 md:gap-6 max-w-7xl mx-auto px-0 md:px-0">
        <div className="w-full md:max-w-[500px]">
          <FireProjection results={results} theme={theme} />
        </div>
        <div className="w-full md:max-w-[500px]">
          <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
        </div>
      </div>
    </div>
  );
};
