import { Assumptions, CalculationResult, Expense, YearlyDataPoint } from '../types';

export const calculateResults = (
  expenses: Expense[],
  assumptions: Assumptions
): CalculationResult => {
  const { annualReturn, inflationAdjusted, inflationRate, timeHorizonYears } = assumptions;

  // 1. Calculate effective monthly rate
  // Nominal Annual Rate r
  const r = annualReturn / 100;
  
  let monthlyRate = 0;

  if (inflationAdjusted) {
    const i = inflationRate / 100;
    // Real Return r_real = (1+r)/(1+i) - 1
    const rReal = (1 + r) / (1 + i) - 1;
    // Monthly Real Rate = (1 + rReal)^(1/12) - 1
    monthlyRate = Math.pow(1 + rReal, 1 / 12) - 1;
  } else {
    // Monthly Nominal Rate = (1 + r)^(1/12) - 1
    monthlyRate = Math.pow(1 + r, 1 / 12) - 1;
  }

  // 2. Normalize expenses to monthly contributions (or initial lump sums)
  const totalMonths = timeHorizonYears * 12;
  const chartData: YearlyDataPoint[] = [];
  
  // Aggregate names for the summary (e.g., "Netflix and Gym")
  // Filter out empty names or zero amounts for the text summary
  const validExpenses = expenses.filter(e => e.name.trim() !== '' || e.amount > 0);
  const names = validExpenses.map(e => e.name.trim() || 'Untitled Expense');
  
  let expenseSummary = "";
  if (names.length === 0) expenseSummary = "your habits";
  else if (names.length === 1) expenseSummary = names[0];
  else if (names.length === 2) expenseSummary = `${names[0]} and ${names[1]}`;
  else expenseSummary = `${names.slice(0, names.length - 1).join(', ')}, and ${names[names.length - 1]}`;

  let totalMonthlyContribution = 0;

  // Pre-process expenses into monthly flow equivalent (Pm) and lump sums
  const activeExpenses = expenses.map(e => {
    let monthlyAmount = 0;
    let isOneTime = false;

    if (e.frequency === 'Weekly') monthlyAmount = (e.amount * 52) / 12;
    else if (e.frequency === 'Monthly') monthlyAmount = e.amount;
    else if (e.frequency === 'Yearly') monthlyAmount = e.amount / 12;
    else if (e.frequency === 'One-time') {
      isOneTime = true;
      monthlyAmount = e.amount; // Treated as initial principal at t=0
    }

    if (!isOneTime) {
      totalMonthlyContribution += monthlyAmount;
    }

    return { ...e, monthlyAmount, isOneTime };
  });

  // 3. Simulate month by month
  let currentInvested = 0; // Linear spend
  let currentValue = 0;    // Compound value

  for (let m = 0; m <= totalMonths; m++) {
    // Apply growth first (start of month balance grows)
    if (m > 0) {
        if (monthlyRate !== 0) {
            currentValue = currentValue * (1 + monthlyRate);
        }
    }

    // Add contributions
    activeExpenses.forEach(exp => {
      if (m === 0) {
        if (exp.isOneTime) {
          currentValue += exp.amount;
          currentInvested += exp.amount;
        }
      } else {
        if (!exp.isOneTime) {
          currentValue += exp.monthlyAmount;
          currentInvested += exp.monthlyAmount;
        }
      }
    });

    // Capture yearly data points (and month 0)
    if (m % 12 === 0) {
      chartData.push({
        year: m / 12,
        invested: Math.round(currentInvested),
        value: Math.round(currentValue),
      });
    }
  }

  return {
    totalCapitalWasted: currentInvested,
    potentialValueUnlocked: currentValue,
    totalProfitMissed: currentValue - currentInvested,
    chartData,
    expenseSummary,
    totalMonthlyContribution,
  };
};

export const formatCurrency = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(val);
};

export const formatCurrencyShort = (val: number) => {
    if (val >= 1000000000) {
        return '$' + (val / 1000000000).toFixed(1) + 'B';
    }
    if (val >= 1000000) {
        return '$' + (val / 1000000).toFixed(1) + 'M';
    }
    if (val >= 1000) {
        return '$' + (val / 1000).toFixed(0) + 'k';
    }
    return '$' + val.toFixed(0);
}