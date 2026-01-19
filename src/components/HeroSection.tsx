import { Button } from "@/components/ui/button";
import { ArrowDown } from "lucide-react";

interface HeroSectionProps {
  onCtaClick: () => void;
}

export function HeroSection({ onCtaClick }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex flex-col items-center justify-center px-6 py-20 overflow-hidden">
      {/* Subtle noise texture overlay */}
      <div 
        className="absolute inset-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
        }}
      />
      
      {/* Subtle purple glow in background */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-primary/5 rounded-full blur-3xl pointer-events-none" />
      
      <div className="relative z-10 max-w-3xl text-center space-y-8">
        <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-foreground animate-fade-up">
          Calculated Growth.
          <br />
          <span className="text-primary">Zero Regret.</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto animate-fade-up" style={{ animationDelay: '0.15s' }}>
          See how the price of inaction grows over time. Input your expenses to see what waiting is really costing you.
        </p>
        
        <div className="animate-fade-up" style={{ animationDelay: '0.3s' }}>
          <Button 
            variant="hero"
            size="xl"
            onClick={onCtaClick}
            className="group gap-2"
          >
            Add a decision
            <ArrowDown className="h-5 w-5 transition-transform group-hover:translate-y-1" />
          </Button>
        </div>
      </div>
    </section>
  );
}
