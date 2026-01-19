import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Plus, Trash2, AlertCircle } from "lucide-react";
import type { Decision, Frequency } from "@/lib/calculations";
import { generateId } from "@/lib/calculations";

interface DecisionInputProps {
  decisions: Decision[];
  onDecisionsChange: (decisions: Decision[]) => void;
  onAnalyze: () => void;
  isAnalyzing?: boolean;
}

export function DecisionInput({ decisions, onDecisionsChange, onAnalyze, isAnalyzing }: DecisionInputProps) {
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addDecision = () => {
    const newDecision: Decision = {
      id: generateId(),
      name: "",
      amount: 0,
      frequency: "monthly",
      isWant: true,
    };
    onDecisionsChange([...decisions, newDecision]);
  };

  const updateDecision = (id: string, field: keyof Decision, value: string | number | boolean) => {
    // Clear error when user starts typing
    if (errors[`${id}-${field}`]) {
      setErrors(prev => {
        const next = { ...prev };
        delete next[`${id}-${field}`];
        return next;
      });
    }

    onDecisionsChange(
      decisions.map(d => 
        d.id === id ? { ...d, [field]: value } : d
      )
    );
  };

  const removeDecision = (id: string) => {
    onDecisionsChange(decisions.filter(d => d.id !== id));
  };

  const validateAndAnalyze = () => {
    const newErrors: Record<string, string> = {};
    
    decisions.forEach(d => {
      if (!d.name.trim()) {
        newErrors[`${d.id}-name`] = "Name required";
      }
      if (d.amount <= 0) {
        newErrors[`${d.id}-amount`] = "Must be positive";
      }
    });

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setErrors({});
    onAnalyze();
  };

  const isEmpty = decisions.length === 0;

  return (
    <Card className="border-border/50 bg-card/80 backdrop-blur-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-xl font-semibold text-foreground flex items-center gap-2">
          <span className="inline-flex items-center justify-center w-8 h-8 rounded-full bg-primary/10 text-primary text-sm font-bold">
            {decisions.length}
          </span>
          Bad Decisions Analyzed
        </CardTitle>
      </CardHeader>
      
      <CardContent className="space-y-4">
        {isEmpty ? (
          <div className="text-center py-12 text-muted-foreground">
            <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-40" />
            <p className="text-lg mb-2">Your queue is empty</p>
            <p className="text-sm">Add your first recurring expense to see its true cost.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {decisions.map((decision, index) => (
              <div 
                key={decision.id}
                className="p-4 rounded-lg bg-secondary/30 border border-border/30 space-y-4 animate-slide-in"
                style={{ animationDelay: `${index * 0.05}s` }}
              >
                <div className="flex items-start gap-4">
                  {/* Name */}
                  <div className="flex-1 space-y-1.5">
                    <Label htmlFor={`name-${decision.id}`} className="text-xs text-muted-foreground">
                      Expense Name
                    </Label>
                    <Input
                      id={`name-${decision.id}`}
                      placeholder="e.g., Netflix, Energy drinks..."
                      value={decision.name}
                      onChange={(e) => updateDecision(decision.id, "name", e.target.value)}
                      className={`bg-background/50 border-border/50 ${errors[`${decision.id}-name`] ? 'border-destructive' : ''}`}
                    />
                    {errors[`${decision.id}-name`] && (
                      <p className="text-xs text-destructive">{errors[`${decision.id}-name`]}</p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="w-32 space-y-1.5">
                    <Label htmlFor={`amount-${decision.id}`} className="text-xs text-muted-foreground">
                      Amount ($)
                    </Label>
                    <Input
                      id={`amount-${decision.id}`}
                      type="number"
                      min="0"
                      step="0.01"
                      placeholder="0.00"
                      value={decision.amount || ""}
                      onChange={(e) => updateDecision(decision.id, "amount", parseFloat(e.target.value) || 0)}
                      className={`bg-background/50 border-border/50 ${errors[`${decision.id}-amount`] ? 'border-destructive' : ''}`}
                    />
                    {errors[`${decision.id}-amount`] && (
                      <p className="text-xs text-destructive">{errors[`${decision.id}-amount`]}</p>
                    )}
                  </div>

                  {/* Frequency */}
                  <div className="w-32 space-y-1.5">
                    <Label className="text-xs text-muted-foreground">Frequency</Label>
                    <Select
                      value={decision.frequency}
                      onValueChange={(value: Frequency) => updateDecision(decision.id, "frequency", value)}
                    >
                      <SelectTrigger className="bg-background/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="weekly">Weekly</SelectItem>
                        <SelectItem value="monthly">Monthly</SelectItem>
                        <SelectItem value="yearly">Yearly</SelectItem>
                        <SelectItem value="one-time">One-time</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {/* Delete */}
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => removeDecision(decision.id)}
                    className="mt-6 text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>

                {/* Want/Need toggle */}
                <div className="flex items-center gap-3 text-sm">
                  <Switch
                    checked={decision.isWant}
                    onCheckedChange={(checked) => updateDecision(decision.id, "isWant", checked)}
                  />
                  <span className="text-muted-foreground">
                    {decision.isWant ? "This is a want" : "This is a need"}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Action buttons */}
        <div className="flex flex-col sm:flex-row gap-3 pt-4">
          <Button
            variant="outline"
            onClick={addDecision}
            className="flex-1 border-border/50 hover:bg-secondary/50"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add another
          </Button>
          
          <Button
            onClick={validateAndAnalyze}
            disabled={isEmpty || isAnalyzing}
            className="flex-1 bg-primary hover:bg-primary/90 text-primary-foreground"
          >
            {isAnalyzing ? "Analyzing..." : "Analyze"}
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
