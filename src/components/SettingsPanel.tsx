import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Settings, Info } from "lucide-react";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

interface SettingsPanelProps {
  annualReturn: number;
  setAnnualReturn: (value: number) => void;
  inflationRate: number;
  setInflationRate: (value: number) => void;
  useInflationAdjusted: boolean;
  setUseInflationAdjusted: (value: boolean) => void;
  horizonYears: number;
  setHorizonYears: (value: number) => void;
}

export function SettingsPanel({
  annualReturn,
  setAnnualReturn,
  inflationRate,
  setInflationRate,
  useInflationAdjusted,
  setUseInflationAdjusted,
  horizonYears,
  setHorizonYears,
}: SettingsPanelProps) {
  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-medium text-foreground flex items-center gap-2">
          <Settings className="h-5 w-5 text-muted-foreground" />
          Assumptions
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-6">
        {/* Annual Return */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              Expected Annual Return
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Historical S&P 500 returns average ~10% nominal. Adjust based on your investment assumptions.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <div className="flex items-center gap-2">
              <Input
                type="number"
                min="0"
                max="15"
                step="0.5"
                value={annualReturn}
                onChange={(e) => setAnnualReturn(Math.min(15, Math.max(0, parseFloat(e.target.value) || 0)))}
                className="w-16 h-8 text-center text-sm bg-background/50 border-border/50"
              />
              <span className="text-sm text-muted-foreground">%</span>
            </div>
          </div>
          <Slider
            value={[annualReturn]}
            onValueChange={([value]) => setAnnualReturn(value)}
            min={0}
            max={15}
            step={0.5}
            className="w-full"
          />
        </div>

        {/* Time Horizon */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              Investing Years
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Longer horizons make small leaks catastrophic. Time is your greatest asset—or liability.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <span className="text-sm font-medium text-foreground">{horizonYears} years</span>
          </div>
          <Slider
            value={[horizonYears]}
            onValueChange={([value]) => setHorizonYears(value)}
            min={1}
            max={50}
            step={1}
            className="w-full"
          />
          <p className="text-xs text-muted-foreground italic">
            Longer horizons make small leaks catastrophic.
          </p>
        </div>

        {/* Inflation Toggle */}
        <div className="p-3 rounded-lg bg-secondary/30 border border-border/30 space-y-3">
          <div className="flex items-center justify-between">
            <Label className="text-sm text-muted-foreground flex items-center gap-1.5">
              Inflation-adjusted (real dollars)
              <Tooltip>
                <TooltipTrigger asChild>
                  <Info className="h-3.5 w-3.5 cursor-help" />
                </TooltipTrigger>
                <TooltipContent className="max-w-xs">
                  <p>Shows purchasing power instead of headline dollars. More realistic for long-term planning.</p>
                </TooltipContent>
              </Tooltip>
            </Label>
            <Switch
              checked={useInflationAdjusted}
              onCheckedChange={setUseInflationAdjusted}
            />
          </div>

          {useInflationAdjusted && (
            <div className="flex items-center justify-between pt-2 border-t border-border/20">
              <Label className="text-sm text-muted-foreground">Inflation Rate</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  min="0"
                  max="10"
                  step="0.5"
                  value={inflationRate}
                  onChange={(e) => setInflationRate(Math.min(10, Math.max(0, parseFloat(e.target.value) || 0)))}
                  className="w-16 h-8 text-center text-sm bg-background/50 border-border/50"
                />
                <span className="text-sm text-muted-foreground">%</span>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
