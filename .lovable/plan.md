

## Pro Dashboard: Advanced Analysis & Projections

### Overview

This plan implements an expandable "Pro Dashboard" section that appears below the existing Results view when triggered. It follows the split-panel layout from the reference images but uses the site's dynamic theme variables exclusively.

---

### Architecture

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXISTING RESULTS DASHBOARD (ResultsDashboard.tsx)                          │
│  - KPI Cards, Chart, Narrative, Time Cost, Opportunity Cost, Methodology    │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  EXPAND BUTTON (centered, subtle styling)                                   │
│  "↓ Expand Advanced Analysis & Projections"                                 │
└─────────────────────────────────────────────────────────────────────────────┘
                                    │ (on click, animate open)
                                    ▼
┌─────────────────────────────────────────────────────────────────────────────┐
│  PRO DASHBOARD CONTAINER (hidden on mobile)                                 │
├────────────────────────────────┬────────────────────────────────────────────┤
│  LEFT PANEL (60%)              │  RIGHT PANEL (40%)                         │
│  FireProjection.tsx            │  ComparisonBattle.tsx                      │
│  ┌──────────────────────────┐  │  ┌──────────────────────────────────────┐  │
│  │ "Years of Freedom" Calc  │  │  │ Head-to-Head Battle                  │  │
│  │ Target Annual Spend Input│  │  │ "Vs. Habit Name" Input               │  │
│  │ Donut Chart (Recharts)   │  │  │ "Monthly Cost ($)" Input             │  │
│  │ "X.X Years Sacrificed"   │  │  │                                      │  │
│  └──────────────────────────┘  │  │ ┌──────────┐ VS ┌──────────────────┐ │  │
│                                │  │ │ Original │    │ New Habit        │ │  │
│                                │  │ │ $XXX,XXX │    │ $XXX,XXX         │ │  │
│                                │  │ └──────────┘    └──────────────────┘ │  │
│                                │  │ Winner highlight with primary glow   │  │
│                                │  └──────────────────────────────────────┘  │
└────────────────────────────────┴────────────────────────────────────────────┘
```

---

### Files to Create

| File | Purpose |
|------|---------|
| `components/ProDashboard.tsx` | Container with two-column grid layout |
| `components/FireProjection.tsx` | Left panel: retirement years calculation + donut chart |
| `components/ComparisonBattle.tsx` | Right panel: habit vs habit comparison |

### Files to Modify

| File | Changes |
|------|---------|
| `App.tsx` | Add `isProDashboardExpanded` state, render expand button + ProDashboard in results view |

---

### Implementation Details

#### 1. App.tsx Modifications

**New State:**
```typescript
const [isProDashboardExpanded, setIsProDashboardExpanded] = useState(false);
```

**New Import:**
```typescript
import { ProDashboard } from './components/ProDashboard';
```

**Placement**: The expand button and ProDashboard render inside the `viewMode === 'results'` block, after the `ResultsDashboard` component and before the `Footer`. The button will be centered with subtle styling:

```tsx
{/* Expand Button */}
<div className="flex justify-center my-8">
  <button
    onClick={() => setIsProDashboardExpanded(!isProDashboardExpanded)}
    className="flex items-center gap-2 px-6 py-3 border border-[var(--border)] 
               rounded-xl text-[var(--text-muted)] hover:text-[var(--text-main)] 
               hover:border-[var(--text-muted)] transition-all text-sm font-medium"
  >
    {isProDashboardExpanded ? '↑ Collapse' : '↓ Expand Advanced Analysis & Projections'}
  </button>
</div>

{/* Pro Dashboard - Animated */}
{isProDashboardExpanded && (
  <div className="animate-fade-in">
    <ProDashboard 
      results={results} 
      assumptions={assumptions} 
      theme={theme}
    />
  </div>
)}
```

---

#### 2. ProDashboard.tsx (Container)

**Purpose**: Wrapper component that handles the split-panel layout and mobile restriction.

**Props:**
```typescript
interface ProDashboardProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}
```

**Layout:**
- Uses CSS Grid: `grid-cols-1 lg:grid-cols-5` (60/40 split on desktop)
- Hidden on mobile with "Desktop Only" message: `hidden md:block`
- Inner panels use theme variables: `bg-[var(--bg-card)]`, `border-[var(--border)]`

**Structure:**
```tsx
<div className="w-full pb-12">
  {/* Mobile Restriction Message */}
  <div className="md:hidden text-center py-8">
    <p className="text-[var(--text-muted)] text-sm">
      Pro Dashboard is available on desktop only.
    </p>
  </div>
  
  {/* Desktop Layout */}
  <div className="hidden md:grid grid-cols-1 lg:grid-cols-5 gap-6">
    <div className="lg:col-span-3">
      <FireProjection results={results} theme={theme} />
    </div>
    <div className="lg:col-span-2">
      <ComparisonBattle results={results} assumptions={assumptions} theme={theme} />
    </div>
  </div>
</div>
```

---

#### 3. FireProjection.tsx (Left Panel)

**Purpose**: Calculate and visualize "Years of Freedom" wasted - how many years of retirement could have been funded.

**Props:**
```typescript
interface FireProjectionProps {
  results: CalculationResult;
  theme: Theme;
}
```

**State:**
```typescript
const [targetAnnualSpend, setTargetAnnualSpend] = useState(60000);
```

**Logic:**
```typescript
const yearsWasted = results.potentialValueUnlocked / targetAnnualSpend;
const yearsWastedDisplay = yearsWasted.toFixed(1);

// For donut chart: show ratio of wasted vs remaining 25-year retirement
const maxRetirementYears = 25;
const wastedPercent = Math.min((yearsWasted / maxRetirementYears) * 100, 100);
const remainingPercent = 100 - wastedPercent;
```

**Visual Elements:**
1. **Header**: Icon + "FIRE / Retirement Projection" title
2. **Input Field**: "Target Annual Retirement Spend ($)" with default $60,000
3. **Donut Chart**: Using Recharts `<PieChart>` with two segments:
   - "Wasted Years" segment in `var(--primary)` color
   - "Remaining" segment in muted gray
4. **Big Number**: "You sacrificed X.X Years of Retirement" in large `text-[var(--primary)]`
5. **Context Text**: Explanation of the FIRE methodology

**Donut Chart Implementation:**
```tsx
<PieChart>
  <Pie
    data={[
      { name: 'Wasted', value: wastedPercent },
      { name: 'Remaining', value: remainingPercent }
    ]}
    innerRadius={60}
    outerRadius={80}
    dataKey="value"
  >
    <Cell fill="var(--primary)" />
    <Cell fill="var(--border)" />
  </Pie>
</PieChart>
```

---

#### 4. ComparisonBattle.tsx (Right Panel)

**Purpose**: Compare current regret against a hypothetical alternative habit in a "Vs." battle format.

**Props:**
```typescript
interface ComparisonBattleProps {
  results: CalculationResult;
  assumptions: Assumptions;
  theme: Theme;
}
```

**State:**
```typescript
const [vsHabitName, setVsHabitName] = useState('Daily DoorDash');
const [vsMonthlyAmount, setVsMonthlyAmount] = useState(200);
```

**Logic:**
Calculate the alternative habit's 30-year potential using the same compounding formula:
```typescript
const calculateFutureValue = (monthlyContribution: number, annualReturn: number, years: number) => {
  const monthlyRate = Math.pow(1 + annualReturn / 100, 1 / 12) - 1;
  const months = years * 12;
  if (monthlyRate === 0) return monthlyContribution * months;
  return monthlyContribution * ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate);
};

const vsResult = calculateFutureValue(vsMonthlyAmount, assumptions.annualReturn, assumptions.timeHorizonYears);
const originalResult = results.potentialValueUnlocked;
const winner = originalResult > vsResult ? 'original' : 'vs';
```

**Visual Elements:**
1. **Header**: Icon + "Head-to-Head Battle" title
2. **Input Fields Row**:
   - "Vs. Habit Name" (text input)
   - "Monthly Cost ($)" (number input)
3. **Battle Cards**:
   ```text
   ┌─────────────────┐    VS    ┌─────────────────┐
   │    Original     │          │  [Habit Name]   │
   │  $XXX,XXX,XXX   │          │  $XXX,XXX,XXX   │
   │   30yr value    │          │   30yr value    │
   └─────────────────┘          └─────────────────┘
   ```
4. **Winner Highlight**: The higher-value card gets a subtle glow using `shadow-[0_0_20px_var(--primary-50)]` and `border-[var(--primary)]`
5. **Verdict Text**: "Your [original/alternative] habits cost you more in the long run"

---

### Styling Guidelines

All components will use **only** the theme CSS variables:

| Variable | Usage |
|----------|-------|
| `var(--bg-card)` | Panel backgrounds |
| `var(--bg-input)` | Input field backgrounds |
| `var(--bg-hover)` | Hover states, secondary backgrounds |
| `var(--border)` | All borders |
| `var(--text-main)` | Primary text |
| `var(--text-muted)` | Secondary text, labels |
| `var(--primary)` | Accent color, winner highlights, chart segments |
| `var(--primary-20)` | Subtle accent backgrounds (20% opacity) |
| `var(--primary-50)` | Medium accent for glows |

---

### Mobile Handling

- The entire `ProDashboard` component shows a centered message on screens below `md` breakpoint: "Pro Dashboard is available on desktop only."
- The expand button remains visible on all screen sizes but leads to this message on mobile
- This aligns with the existing mobile restriction pattern in the codebase

---

### Animation

- The ProDashboard uses the existing `animate-fade-in` class defined in the tailwind keyframes
- The expand button smoothly transitions icon direction with the toggle state
- Chart elements animate on mount via Recharts' built-in animation

---

### Component Relationships

```text
App.tsx
├── ResultsDashboard (existing)
├── Expand Button (new, inline)
└── ProDashboard (new component)
    ├── FireProjection
    │   └── PieChart (Recharts)
    └── ComparisonBattle
        └── Future value calculation (inline)
```

---

### Summary

This implementation creates a powerful analysis extension that:
1. Calculates "Years of Retirement Sacrificed" with a visual donut chart
2. Enables head-to-head habit comparisons with real-time calculations
3. Maintains full theme compatibility across all three themes (Purple, Matrix, Ocean)
4. Gracefully degrades on mobile with a clear "Desktop Only" message
5. Uses smooth fade-in animation when expanded

