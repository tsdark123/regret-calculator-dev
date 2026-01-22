import { useEffect, useState, useMemo } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Line, ComposedChart } from "recharts";
import type { CalculationResult, Decision } from "@/lib/calculations";
import { formatCurrency } from "@/lib/calculations";
import { TrendingUp, DollarSign, Lightbulb, TrendingDown } from "lucide-react";

interface ResultsDashboardProps {
  result: CalculationResult;
  decisions: Decision[];
  horizonYears: number;
}

function AnimatedNumber({ value, duration = 1000 }: { value: number; duration?: number }) {
  const [displayValue, setDisplayValue] = useState(0);

  useEffect(() => {
    const startTime = Date.now();
    const startValue = 0;
    
    const animate = () => {
      const elapsed = Date.now() - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic
      const easeOut = 1 - Math.pow(1 - progress, 3);
      const current = startValue + (value - startValue) * easeOut;
      
      setDisplayValue(current);
      
      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };
    
    requestAnimationFrame(animate);
  }, [value, duration]);

  return <>{formatCurrency(displayValue)}</>;
}

function KPICard({ 
  title, 
  value, 
  icon: Icon, 
  variant = "default",
  delay = 0 
}: { 
  title: string; 
  value: number; 
  icon: React.ElementType; 
  variant?: "default" | "primary" | "muted";
  delay?: number;
}) {
  const variants = {
    default: "bg-card border-border/50",
    primary: "bg-primary/10 border-primary/30",
    muted: "bg-secondary/50 border-border/30",
  };

  const iconVariants = {
    default: "text-foreground",
    primary: "text-primary",
    muted: "text-muted-foreground",
  };

  return (
    <Card 
      className={`${variants[variant]} animate-fade-up`}
      style={{ animationDelay: `${delay}s` }}
    >
      <CardContent className="pt-6">
        <div className="flex items-start justify-between mb-2">
          <p className="text-sm text-muted-foreground">{title}</p>
          <Icon className={`h-5 w-5 ${iconVariants[variant]}`} />
        </div>
        <p className={`text-3xl md:text-4xl font-bold tracking-tight ${variant === 'primary' ? 'text-primary' : 'text-foreground'}`}>
          <AnimatedNumber value={value} duration={1500} />
        </p>
      </CardContent>
    </Card>
  );
}

function SageCallout({ decisions, missedProfit, horizonYears }: { decisions: Decision[]; missedProfit: number; horizonYears: number }) {
  // Find the biggest expense by monthly equivalent
  const biggestExpense = useMemo(() => {
    let biggest = decisions[0];
    let biggestMonthly = 0;

    for (const d of decisions) {
      let monthly = d.amount;
      if (d.frequency === 'weekly') monthly = d.amount * (52/12);
      else if (d.frequency === 'yearly') monthly = d.amount / 12;
      else if (d.frequency === 'one-time') monthly = d.amount / (horizonYears * 12);
      
      if (monthly > biggestMonthly) {
        biggestMonthly = monthly;
        biggest = d;
      }
    }

    return { decision: biggest, monthly: biggestMonthly };
  }, [decisions, horizonYears]);

  const frequencyLabel = {
    weekly: "per week",
    monthly: "per month",
    yearly: "per year",
    "one-time": "once",
  };

  return (
    <Card className="bg-primary/5 border-primary/20 animate-fade-up" style={{ animationDelay: '0.6s' }}>
      <CardContent className="pt-6">
        <div className="flex items-start gap-3">
          <div className="p-2 rounded-full bg-primary/10">
            <Lightbulb className="h-5 w-5 text-primary" />
          </div>
          <div className="space-y-2">
            <p className="font-medium text-foreground">Sage says...</p>
            <p className="text-muted-foreground leading-relaxed">
              I see you're spending{" "}
              <span className="text-foreground font-medium">
                {formatCurrency(biggestExpense.decision.amount)} {frequencyLabel[biggestExpense.decision.frequency]}
              </span>{" "}
              on {biggestExpense.decision.name || "this expense"}.
            </p>
            <p className="text-muted-foreground leading-relaxed">
              That massive purple gap? That's{" "}
              <span className="text-primary font-semibold">
                {formatCurrency(missedProfit)}
              </span>{" "}
              of potential future value you could have over {horizonYears} years.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function ResultsDashboard({ result, decisions, horizonYears }: ResultsDashboardProps) {
  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-popover border border-border rounded-lg p-3 shadow-lg">
          <p className="text-sm font-medium text-foreground mb-2">Year {label}</p>
          <div className="space-y-1">
            <p className="text-sm text-muted-foreground">
              Cumulative spent:{" "}
              <span className="text-foreground">{formatCurrency(payload[0]?.value || 0)}</span>
            </p>
            <p className="text-sm text-muted-foreground">
              If invested:{" "}
              <span className="text-primary font-medium">{formatCurrency(payload[1]?.value || 0)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <section className="space-y-8 animate-fade-in">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <KPICard
          title="Total Capital Wasted"
          value={result.totalSpent}
          icon={DollarSign}
          variant="muted"
          delay={0}
        />
        <KPICard
          title="Potential Value Unlocked"
          value={result.futureValue}
          icon={TrendingUp}
          variant="primary"
          delay={0.1}
        />
        <KPICard
          title="Total Profit Missed"
          value={result.missedProfit}
          icon={TrendingDown}
          variant="default"
          delay={0.2}
        />
        <KPICard
          title="Your Investment Worth"
          value={result.futureValue}
          icon={TrendingUp}
          variant="primary"
          delay={0.3}
        />
      </div>

      {/* Chart & Callout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="lg:col-span-2 border-border/50 animate-fade-up" style={{ animationDelay: '0.4s' }}>
          <CardHeader>
            <CardTitle className="text-lg font-medium text-foreground">
              Visualizing Compound Loss vs Linear Spend
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] md:h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <ComposedChart data={result.yearlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="purpleGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.4} />
                      <stop offset="95%" stopColor="hsl(270, 60%, 55%)" stopOpacity={0.05} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 15%, 20%)" opacity={0.5} />
                  <XAxis 
                    dataKey="year" 
                    stroke="hsl(220, 10%, 60%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                  />
                  <YAxis 
                    stroke="hsl(220, 10%, 60%)" 
                    fontSize={12}
                    tickLine={false}
                    axisLine={false}
                    tickFormatter={(value) => `$${(value / 1000).toFixed(0)}k`}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  
                  {/* Linear spending line */}
                  <Line
                    type="monotone"
                    dataKey="cumulativeSpent"
                    stroke="hsl(220, 10%, 45%)"
                    strokeWidth={2}
                    dot={false}
                    name="Cumulative Spent"
                  />
                  
                  {/* Investment value area (the purple gap) */}
                  <Area
                    type="monotone"
                    dataKey="investmentValue"
                    stroke="hsl(270, 60%, 55%)"
                    strokeWidth={2}
                    fill="url(#purpleGradient)"
                    name="Investment Value"
                    className="animate-pulse-glow"
                  />
                </ComposedChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Sage Callout */}
        <div className="space-y-4">
          <SageCallout 
            decisions={decisions} 
            missedProfit={result.missedProfit} 
            horizonYears={horizonYears}
          />
        </div>
      </div>
    </section>
  );
}
