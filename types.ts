export type Frequency = 'Weekly' | 'Monthly' | 'Yearly' | 'One-time';
export type Theme = 'purple' | 'green' | 'blue';

export interface Expense {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  isWant: boolean;
}

export interface StockOption {
  symbol: string;
  name: string;
  type: 'Stock' | 'ETF' | 'Crypto';
  avgReturn: number; // Percentage
  color: string;
}

export interface Assumptions {
  annualReturn: number; // Percentage, e.g., 10 for 10%
  inflationAdjusted: boolean;
  inflationRate: number; // Percentage, e.g., 3 for 3%
  timeHorizonYears: number;
  selectedStock?: StockOption;
}

export interface YearlyDataPoint {
  year: number;
  invested: number; // Linear total spent
  value: number; // Compounded future value
}

export interface CalculationResult {
  totalCapitalWasted: number;
  potentialValueUnlocked: number;
  totalProfitMissed: number;
  chartData: YearlyDataPoint[];
  expenseSummary: string; // "Netflix and Gym"
  totalMonthlyContribution: number;
}