// Compound growth calculation utilities

export type Frequency = 'weekly' | 'monthly' | 'yearly' | 'one-time';

export interface Decision {
  id: string;
  name: string;
  amount: number;
  frequency: Frequency;
  isWant: boolean;
}

export interface CalculationParams {
  decisions: Decision[];
  annualReturn: number; // as decimal, e.g., 0.10 for 10%
  inflationRate: number; // as decimal, e.g., 0.03 for 3%
  useInflationAdjusted: boolean;
  horizonYears: number;
}

export interface CalculationResult {
  totalSpent: number;
  futureValue: number;
  missedProfit: number;
  yearlyData: YearlyDataPoint[];
}

export interface YearlyDataPoint {
  year: number;
  cumulativeSpent: number;
  investmentValue: number;
}

// Convert any frequency to monthly equivalent
export function toMonthlyAmount(amount: number, frequency: Frequency): number {
  switch (frequency) {
    case 'weekly':
      return amount * (52 / 12);
    case 'monthly':
      return amount;
    case 'yearly':
      return amount / 12;
    case 'one-time':
      return 0; // handled separately
  }
}

// Calculate monthly rate from annual rate
export function getMonthlyRate(annualRate: number): number {
  return Math.pow(1 + annualRate, 1 / 12) - 1;
}

// Calculate real (inflation-adjusted) return
export function getRealReturn(nominalRate: number, inflationRate: number): number {
  return (1 + nominalRate) / (1 + inflationRate) - 1;
}

// Future value of recurring monthly payments
export function futureValueAnnuity(
  monthlyPayment: number,
  monthlyRate: number,
  months: number
): number {
  if (monthlyRate === 0) {
    return monthlyPayment * months;
  }
  return monthlyPayment * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
}

// Future value of a single lump sum
export function futureValueLumpSum(
  principal: number,
  monthlyRate: number,
  months: number
): number {
  return principal * Math.pow(1 + monthlyRate, months);
}

// Main calculation function
export function calculateOpportunityCost(params: CalculationParams): CalculationResult {
  const { decisions, annualReturn, inflationRate, useInflationAdjusted, horizonYears } = params;
  
  // Determine the effective annual return
  const effectiveAnnualReturn = useInflationAdjusted 
    ? getRealReturn(annualReturn, inflationRate)
    : annualReturn;
  
  const monthlyRate = getMonthlyRate(effectiveAnnualReturn);
  const totalMonths = horizonYears * 12;
  
  // Calculate totals for all decisions
  let totalSpent = 0;
  let futureValue = 0;
  
  for (const decision of decisions) {
    if (decision.frequency === 'one-time') {
      // One-time expense: spent once, invested for full horizon
      totalSpent += decision.amount;
      futureValue += futureValueLumpSum(decision.amount, monthlyRate, totalMonths);
    } else {
      // Recurring expense
      const monthlyAmount = toMonthlyAmount(decision.amount, decision.frequency);
      totalSpent += monthlyAmount * totalMonths;
      futureValue += futureValueAnnuity(monthlyAmount, monthlyRate, totalMonths);
    }
  }
  
  // Generate yearly data points for the chart
  const yearlyData: YearlyDataPoint[] = [];
  
  for (let year = 0; year <= horizonYears; year++) {
    const monthsElapsed = year * 12;
    let yearlySpent = 0;
    let yearlyInvestment = 0;
    
    for (const decision of decisions) {
      if (decision.frequency === 'one-time') {
        yearlySpent += decision.amount;
        yearlyInvestment += futureValueLumpSum(decision.amount, monthlyRate, monthsElapsed);
      } else {
        const monthlyAmount = toMonthlyAmount(decision.amount, decision.frequency);
        yearlySpent += monthlyAmount * monthsElapsed;
        yearlyInvestment += futureValueAnnuity(monthlyAmount, monthlyRate, monthsElapsed);
      }
    }
    
    yearlyData.push({
      year,
      cumulativeSpent: Math.round(yearlySpent * 100) / 100,
      investmentValue: Math.round(yearlyInvestment * 100) / 100,
    });
  }
  
  return {
    totalSpent: Math.round(totalSpent * 100) / 100,
    futureValue: Math.round(futureValue * 100) / 100,
    missedProfit: Math.round((futureValue - totalSpent) * 100) / 100,
    yearlyData,
  };
}

// Format currency
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

// Generate unique ID
export function generateId(): string {
  return Math.random().toString(36).substring(2, 9);
}
