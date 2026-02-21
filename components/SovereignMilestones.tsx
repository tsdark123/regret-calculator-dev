import React, { useState, useMemo } from 'react';
import { Flag, HelpCircle, Shield, Laptop, Car, GraduationCap, Home } from 'lucide-react';
import { formatCurrency } from '../utils/financials';
import { AreaChart, Area, XAxis, YAxis, ResponsiveContainer, ReferenceLine, Tooltip } from 'recharts';

// ============================================================================
// TYPES & PROPS
// ============================================================================

export interface SovereignMilestonesProps {
  monthlyContribution: number;
  investingYears: number;
  annualReturn: number;
  totalCapitalWasted: number;
  habitName: string;
  investmentName: string;
}

type MilestoneData = {
  id: number;
  name: string;
  cost: number;
  icon: 'shield' | 'laptop' | 'car' | 'graduation' | 'home';
};

type MilestoneCalc = MilestoneData & {
  unlocked: boolean;
  yearsToUnlock: number | null;
  percentReached: number;
};

// ============================================================================
// MILESTONE DATA (Hardcoded Config)
// ============================================================================

const MILESTONES: MilestoneData[] = [
  { id: 1, name: "Starter Emergency Fund", cost: 1000, icon: "shield" },
  { id: 2, name: "High-End Tech Upgrade", cost: 2500, icon: "laptop" },
  { id: 3, name: "Used Car / Down Payment", cost: 6000, icon: "car" },
  { id: 4, name: "1 Year State Tuition", cost: 12000, icon: "graduation" },
  { id: 5, name: "Home Down Payment (5%)", cost: 25000, icon: "home" },
];

// ============================================================================
// ICON COMPONENT
// ============================================================================

const MilestoneIcon: React.FC<{ icon: MilestoneData['icon']; className?: string }> = ({ icon, className = 'w-4 h-4' }) => {
  const iconMap = {
    shield: Shield,
    laptop: Laptop,
    car: Car,
    graduation: GraduationCap,
    home: Home,
  };
  const IconComponent = iconMap[icon];
  return <IconComponent className={className} />;
};

// ============================================================================
// COMPACT CURRENCY FORMATTER
// ============================================================================

const formatCompactCurrency = (value: number): string => {
  if (value >= 1000000) {
    return `$${(value / 1000000).toFixed(1).replace(/\.0$/, '')}M`;
  } else if (value >= 1000) {
    return `$${(value / 1000).toFixed(1).replace(/\.0$/, '')}k`;
  }
  return `$${value.toFixed(0)}`;
};

// ============================================================================
// CALCULATION HELPERS
// ============================================================================

const calculateFVAtYear = (
  monthlyContribution: number,
  annualReturn: number,
  years: number
): number => {
  if (years <= 0) return 0;
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyContribution * months;
  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

const findYearsToUnlock = (
  monthlyContribution: number,
  annualReturn: number,
  targetCost: number,
  maxYears: number
): number | null => {
  const monthlyRate = Math.pow(1 + annualReturn, 1 / 12) - 1;
  let balance = 0;
  for (let month = 1; month <= maxYears * 12; month++) {
    balance = balance * (1 + monthlyRate) + monthlyContribution;
    if (balance >= targetCost) {
      return Math.round((month / 12) * 10) / 10; // Round to 1 decimal
    }
  }
  return null;
};

// ============================================================================
// MILESTONE BUTTON (Ladder Item)
// ============================================================================

const MilestoneButton: React.FC<{
  milestone: MilestoneCalc;
  isSelected: boolean;
  onClick: () => void;
}> = ({ milestone, isSelected, onClick }) => {
  const { unlocked, yearsToUnlock, name, icon } = milestone;
  
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center justify-between gap-3 px-4 py-3 rounded-xl border transition-all duration-200 ${
        isSelected
          ? 'bg-slate-800 border-[var(--primary)] shadow-[0_0_12px_rgba(139,92,246,0.25)]'
          : unlocked
            ? 'bg-[var(--bg-input)] border-[var(--primary)]/40 hover:border-[var(--primary)]'
            : 'bg-[var(--bg-input)] border-[var(--border)] hover:border-[var(--text-muted)]/50'
      }`}
    >
      <div className="flex items-center gap-3">
        <div className={`p-2 rounded-lg ${
          unlocked ? 'bg-[var(--primary)]/20 text-[var(--primary)]' : 'bg-[var(--bg-hover)] text-[var(--text-muted)]'
        }`}>
          <MilestoneIcon icon={icon} className="w-4 h-4" />
        </div>
        <span className={`text-sm font-medium ${
          unlocked ? 'text-[var(--text-main)]' : 'text-[var(--text-muted)]'
        }`}>
          {name}
        </span>
      </div>
      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
        unlocked
          ? 'bg-[var(--primary)]/20 text-[var(--primary)] border border-[var(--primary)]/30'
          : 'bg-[var(--bg-hover)] text-[var(--text-muted)] border border-[var(--border)]'
      }`}>
        {unlocked ? `Year ${yearsToUnlock}` : 'Locked'}
      </span>
    </button>
  );
};

// ============================================================================
// INTEL PANEL (Chart + Copy)
// ============================================================================

const IntelPanel: React.FC<{
  milestone: MilestoneCalc;
  monthlyContribution: number;
  annualReturn: number;
  investingYears: number;
  totalCapitalWasted: number;
  habitName: string;
  investmentName: string;
}> = ({ milestone, monthlyContribution, annualReturn, investingYears, totalCapitalWasted, habitName, investmentName }) => {
  
  // Generate chart data
  const chartData = useMemo(() => {
    const data = [];
    const step = Math.max(1, Math.floor(investingYears / 10));
    for (let year = 0; year <= investingYears; year += step) {
      data.push({
        year,
        value: calculateFVAtYear(monthlyContribution, annualReturn, year),
      });
    }
    if (data[data.length - 1]?.year !== investingYears) {
      data.push({
        year: investingYears,
        value: calculateFVAtYear(monthlyContribution, annualReturn, investingYears),
      });
    }
    return data;
  }, [monthlyContribution, annualReturn, investingYears]);

  const { unlocked, yearsToUnlock, percentReached, cost, name } = milestone;
  
  // Calculate prorated wasted capital
  const wastedAtUnlock = yearsToUnlock 
    ? Math.round(totalCapitalWasted * (yearsToUnlock / investingYears))
    : totalCapitalWasted;

  return (
    <div className="flex flex-col h-full">
      {/* Chart */}
      <div className="h-[180px] w-full mb-4">
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
            <defs>
              <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="var(--primary)" stopOpacity={0.05}/>
              </linearGradient>
            </defs>
            <XAxis 
              dataKey="year" 
              axisLine={false}
              tickLine={false}
              tick={{ fill: 'var(--text-muted)', fontSize: 10 }}
              tickFormatter={(v) => `${v}y`}
            />
            <YAxis hide domain={[0, 'auto']} />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'var(--bg-card)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                fontSize: '11px',
              }}
              formatter={(value: number) => [formatCompactCurrency(value), 'Portfolio']}
              labelFormatter={(label) => `Year ${label}`}
            />
            <ReferenceLine 
              y={cost} 
              stroke="#f472b6" 
              strokeDasharray="6 4" 
              strokeWidth={2}
              label={{ 
                value: formatCompactCurrency(cost), 
                position: 'right', 
                fill: '#f472b6', 
                fontSize: 10,
                fontWeight: 600 
              }}
            />
            <Area 
              type="monotone" 
              dataKey="value" 
              stroke="var(--primary)" 
              strokeWidth={2.5}
              fill="url(#purpleGradient)"
              dot={false}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Dynamic Copy */}
      <div className="flex-1">
        {unlocked && yearsToUnlock ? (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-main)] leading-relaxed">
              At your current pace, your recycled <span className="font-semibold text-[var(--primary)]">{habitName}</span> money covers this <span className="font-semibold text-emerald-400">{formatCurrency(cost)}</span> goal in <span className="font-bold text-[var(--primary)]">{yearsToUnlock} Years</span>.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              In that same time, you would have burnt <span className="text-pink-400 font-medium">{formatCurrency(wastedAtUnlock)}</span> just keeping the habit.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-[var(--text-muted)] leading-relaxed">
              With your current timeline of <span className="text-[var(--text-main)] font-semibold">{investingYears} Years</span>, this goal remains out of reach.
            </p>
            <p className="text-xs text-[var(--text-muted)]">
              You reach <span className="text-pink-400 font-semibold">{Math.round(percentReached)}%</span> of the target. Extend your horizon or boost contributions to unlock it.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const SovereignMilestones: React.FC<SovereignMilestonesProps> = ({
  monthlyContribution,
  investingYears,
  annualReturn,
  totalCapitalWasted,
  habitName,
  investmentName,
}) => {
  const [selectedId, setSelectedId] = useState<number>(1);

  // Calculate milestone progress
  const milestonesCalc = useMemo<MilestoneCalc[]>(() => {
    const finalValue = calculateFVAtYear(monthlyContribution, annualReturn, investingYears);
    
    return MILESTONES.map((m) => {
      const yearsToUnlock = findYearsToUnlock(monthlyContribution, annualReturn, m.cost, investingYears);
      return {
        ...m,
        unlocked: yearsToUnlock !== null,
        yearsToUnlock,
        percentReached: Math.min(100, (finalValue / m.cost) * 100),
      };
    });
  }, [monthlyContribution, annualReturn, investingYears]);

  const selectedMilestone = milestonesCalc.find((m) => m.id === selectedId) || milestonesCalc[0];
  const unlockedCount = milestonesCalc.filter((m) => m.unlocked).length;

  return (
    <div className="bg-[var(--bg-card)] border border-[var(--border)] rounded-2xl p-6 h-full flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <div className="relative group md:hidden">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-0 top-full mt-2 px-3 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)] w-[200px] leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
              Real-world goals your recycled regret could fund.
            </div>
          </div>
          <div className="p-2 rounded-lg bg-[var(--primary)]/10">
            <Flag className="w-5 h-5 text-[var(--primary)]" />
          </div>
          <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
            Sovereign Milestones
          </h3>
          <div className="relative group hidden md:block">
            <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
            <div className="absolute left-0 top-full mt-2 px-3 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)] w-[280px] leading-relaxed opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
              Real-world goals your recycled regret could fund.
            </div>
          </div>
        </div>
      </div>

      {/* Subtitle */}
      <p className="text-sm text-[var(--text-muted)] mb-1">
        Real-world goals your recycled regrets could fund.
      </p>

      {/* Powered by badge */}
      <p className="text-[10px] text-[var(--text-muted)]/70 mb-5">
        Powered by your <span className="text-[var(--text-main)]">{habitName}</span> → <span className="text-[var(--text-main)]">{investmentName}</span> projection.
      </p>

      {/* Main Content: Split View */}
      <div className="flex-1 flex flex-col md:flex-row gap-6 min-h-0">
        {/* Left: Milestone Ladder */}
        <div className="md:w-[40%] flex flex-col gap-2 overflow-y-auto max-h-[300px] md:max-h-none pr-1">
          {milestonesCalc.map((m) => (
            <MilestoneButton
              key={m.id}
              milestone={m}
              isSelected={selectedId === m.id}
              onClick={() => setSelectedId(m.id)}
            />
          ))}
        </div>

        {/* Right: Intel Panel */}
        <div className="md:w-[60%] md:pl-6 md:border-l md:border-[var(--border)] flex flex-col min-h-0">
          <IntelPanel
            milestone={selectedMilestone}
            monthlyContribution={monthlyContribution}
            annualReturn={annualReturn}
            investingYears={investingYears}
            totalCapitalWasted={totalCapitalWasted}
            habitName={habitName}
            investmentName={investmentName}
          />
        </div>
      </div>

      {/* Bottom Summary */}
      <div className="mt-4 pt-4 border-t border-[var(--border)]">
        <p className="text-xs text-[var(--text-muted)]">
          {unlockedCount > 0 ? (
            <>
              <span className="text-[var(--primary)] font-semibold">{unlockedCount} of {MILESTONES.length}</span> milestones unlocked with your current plan.
            </>
          ) : (
            <>No milestones unlocked yet. Extend your timeline or increase contributions.</>
          )}
        </p>
      </div>
    </div>
  );
};
