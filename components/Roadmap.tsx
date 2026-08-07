import React, { useState, useRef, useEffect } from "react";
import {
  ChevronDown,
  ChevronRight,
  Loader2,
  Check,
  Zap,
  Smartphone,
  Lock,
  BrainCircuit,
  TerminalSquare,
  Code,
} from "lucide-react";

export type PlanStepStatus = "pending" | "active" | "success" | "error";

export interface PlanStep {
  id: string;
  title: string;
  content?: React.ReactNode;
  status: PlanStepStatus;
  icon?: React.ReactNode;
  duration?: string;
  defaultExpanded?: boolean;
}

const STEPS: PlanStep[] = [
  {
    id: "v3",
    title: "v3.0 — 10K Users, New Tools & API Update",
    status: "success",
    duration: "Aug 2026",
    icon: <Code className="w-3.5 h-3.5" />,
    defaultExpanded: true,
    content: (
      <div className="space-y-3 font-mono text-[14px] mt-2">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>10,000 users and a major tooling milestone.</span>
        </div>
        <div className="p-3 rounded-md bg-[var(--bg-main)]/40 text-[var(--text-muted)]">
          <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-semibold">All features deployed</div>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>12-Month Value Target Fan (new projections tool)</li>
            <li>200+ stock options powered by a new formula and API-backed calculations</li>
            <li>10,000 user celebration — mobile & desktop UI/UX refinements</li>
            <li>Unified top-tool frame and mobile calculate page cleanup</li>
            <li>Responsive auto-scaling charts and info tooltips</li>
            <li className="hidden md:block">Cross-device compatibility improvements</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "v2",
    title: "v2.0.0 — Mobile & Retirement Update",
    status: "success",
    duration: "Jun 2026",
    icon: <Smartphone className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-3 font-mono text-[14px] mt-2">
        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5" />
          <span>Biggest update yet. Full mobile + retirement tools.</span>
        </div>
        <div className="p-3 rounded-md bg-[var(--bg-main)]/40 text-[var(--text-muted)]">
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Retirement Freedom Bridge (Time-to-$1M Calculator)</li>
            <li>Full Mobile Navigation & 3-Step Wizard</li>
            <li>Sovereign Snow Particle Effect</li>
            <li className="hidden md:block">Simplified Theme System & Smooth Animations</li>
            <li className="hidden md:block">Head-to-Head Battle UI Polish</li>
            <li className="hidden md:block">Investment Strategy Selector with Real Returns</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "v1.2",
    title: "v1.2.0 — Theming & Export Update",
    status: "success",
    duration: "Mar 2026",
    icon: <TerminalSquare className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-3 font-mono text-[14px] mt-2">
        <div className="flex items-center gap-2">
          <span className="text-[var(--text-muted)]">Shipped:</span>
          <span className="px-1.5 py-0.5 rounded-md bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-1">
            <TerminalSquare className="w-3 h-3" />
            6 features
          </span>
        </div>
        <div className="p-3 rounded-md bg-[var(--bg-main)]/40 text-[var(--text-muted)]">
          <div className="text-emerald-600 dark:text-emerald-400 mb-2 font-semibold">All features deployed</div>
          <ul className="space-y-1.5 list-disc list-inside">
            <li>Dynamic Theme Engine (Matrix & Ocean)</li>
            <li>PNG Export System (Regret Reports)</li>
            <li>Opportunity Cost Methodology Model</li>
            <li>Theme Persistence via Local Storage</li>
            <li>Enhanced UI Tooltips & Dynamic Arrows</li>
            <li>Responsive Design Optimization</li>
          </ul>
        </div>
      </div>
    ),
  },
  {
    id: "v1",
    title: "v1.0.0 — Genesis Update",
    status: "success",
    duration: "Jan 2026",
    icon: <Zap className="w-3.5 h-3.5" />,
    content: (
      <div className="space-y-2 font-mono text-[14px] text-[var(--text-muted)] mt-2">
        <div className="flex items-start gap-2 text-emerald-600 dark:text-emerald-400 font-medium">
          <Check className="w-3.5 h-3.5 mt-0.5 shrink-0" />
          <span>Foundation deployed. Core regret engine live.</span>
        </div>
        <div className="grid grid-cols-[80px_1fr] gap-1.5 mt-3 bg-[var(--bg-main)]/40 p-2.5 rounded-md">
          <span className="text-[var(--text-muted)] font-medium">Engine:</span>
          <span className="text-[var(--text-main)]">V1 Regret Algorithm, Compound Engine</span>
          <span className="text-[var(--text-muted)] font-medium">Data:</span>
          <span className="text-[var(--text-main)]">Market Data Hooks, Real-Time Analytics</span>
          <span className="text-[var(--text-muted)] font-medium">Perf:</span>
          <span className="text-amber-600 dark:text-amber-400">Latency reduced 40%, Dark Mode</span>
        </div>
      </div>
    ),
  },
  {
    id: "v4",
    title: "v4.0 — The Social Compound",
    status: "pending",
    icon: <Lock className="w-3.5 h-3.5" />,
  },
];

const getStatusColor = (status: PlanStepStatus) => {
  switch (status) {
    case "success":
      return "bg-emerald-500/20 text-emerald-400";
    case "active":
      return "bg-blue-500/20 text-blue-400";
    case "error":
      return "bg-rose-500/20 text-rose-400";
    case "pending":
      return "bg-[var(--bg-hover)] text-[var(--text-muted)]";
  }
};

export const Roadmap: React.FC<{ cardClassName?: string }> = ({ cardClassName }) => {
  const mainContentRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  // Detect mobile device
  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  // Wave animation
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let time = 0;
    let animId: number;

    const waveData = Array.from({ length: 8 }).map(() => ({
      value: Math.random() * 0.5 + 0.1,
      targetValue: Math.random() * 0.5 + 0.1,
      speed: Math.random() * 0.02 + 0.01,
    }));

    function resize() {
      canvas!.width = canvas!.parentElement?.offsetWidth || 0;
      canvas!.height = canvas!.parentElement?.offsetHeight || 0;
    }

    function update() {
      waveData.forEach(d => {
        if (Math.random() < 0.01) d.targetValue = Math.random() * 0.7 + 0.1;
        d.value += (d.targetValue - d.value) * d.speed;
      });
    }

    function draw() {
      ctx!.clearRect(0, 0, canvas!.width, canvas!.height);
      waveData.forEach((d, i) => {
        const freq = d.value * 7;
        ctx!.beginPath();
        for (let x = 0; x < canvas!.width; x++) {
          const nx = (x / canvas!.width) * 2 - 1;
          const px = nx + i * 0.04 + freq * 0.03;
          const py = Math.sin(px * 10 + time) * Math.cos(px * 2) * freq * 0.1 * ((i + 1) / 8);
          const y = (py + 1) * canvas!.height / 2;
          x === 0 ? ctx!.moveTo(x, y) : ctx!.lineTo(x, y);
        }
        const intensity = Math.min(1, freq * 0.3);
        const r = 40 + intensity * 60;
        const g = 40 + intensity * 80;
        ctx!.lineWidth = 0.8 + i * 0.2;
        ctx!.strokeStyle = `rgba(${r},${g},229,0.08)`;
        ctx!.shadowColor = `rgba(${r},${g},229,0.04)`;
        ctx!.shadowBlur = 2;
        ctx!.stroke();
        ctx!.shadowBlur = 0;
      });
    }

    function animate() {
      time += 0.02;
      update();
      draw();
      animId = requestAnimationFrame(animate);
    }

    const observer = new ResizeObserver(resize);
    observer.observe(canvas.parentElement!);
    resize();
    animate();

    return () => {
      cancelAnimationFrame(animId);
      observer.disconnect();
    };
  }, []);

  const [expandedSteps, setExpandedSteps] = useState<Record<string, boolean>>(
    STEPS.reduce((acc, step) => {
      // On both mobile and desktop, use defaultExpanded
      acc[step.id] = step.defaultExpanded || false;
      return acc;
    }, {} as Record<string, boolean>)
  );

  // Update expandedSteps when isMobile changes
  useEffect(() => {
    setExpandedSteps(
      STEPS.reduce((acc, step) => {
        acc[step.id] = step.defaultExpanded || false;
        return acc;
      }, {} as Record<string, boolean>)
    );
  }, [isMobile]);

  const toggleStep = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setExpandedSteps((prev) => {
      const isCurrentlyExpanded = prev[id];
      const expandedCount = Object.values(prev).filter(Boolean).length;
      const maxExpanded = 2;

      if (!isCurrentlyExpanded && expandedCount >= maxExpanded) {
        // Find the first expanded step that's not the one being toggled and close it
        const expandedIds = Object.keys(prev).filter((key) => prev[key] && key !== id);
        if (expandedIds.length > 0) {
          const toClose = expandedIds[0];
          return { ...prev, [toClose]: false, [id]: true };
        }
      }

      return { ...prev, [id]: !prev[id] };
    });
  };

  const hasActive = STEPS.some((s) => s.status === "active");
  const allSuccess = STEPS.every((s) => s.status === "success");

  return (
    <div className="w-full h-full flex items-center justify-center px-4 py-6 overflow-hidden relative select-none">
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full pointer-events-none opacity-100" />
      <div className="w-full max-w-4xl mx-auto my-4 font-sans text-[var(--text-main)] relative z-10 select-none">
        {/* Outer Card */}
        <div className={`bg-[var(--bg-card)] border border-[var(--border)] shadow-sm rounded-xl overflow-hidden transition-all duration-300 select-none${cardClassName ? ` ${cardClassName}` : ''}`}>

          {/* Top Header */}
          <div className="flex items-center justify-between px-4 py-3.5 select-none bg-[var(--bg-hover)]/30 border-b border-gray-500/10">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center w-5 h-5">
                {hasActive ? (
                  <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                ) : allSuccess ? (
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                ) : (
                  <BrainCircuit className="w-4 h-4 text-[var(--text-muted)]" />
                )}
              </div>
              <span className="text-[15px] font-semibold text-[var(--text-main)]/90 tracking-tight">
                Regret Calculator Roadmap
              </span>
            </div>
          </div>

          {/* Timeline Area */}
          <div className="bg-[var(--bg-card)]">
              <div ref={mainContentRef} className="p-10 flex flex-col">

                {STEPS.map((step, index) => {
                  const isStepExpanded = expandedSteps[step.id];
                  const isLast = index === STEPS.length - 1;

                  return (
                    <div
                      key={step.id}
                      className={`relative flex gap-8 animate-fade-in-up
                        ${step.status === "pending" ? "opacity-60 grayscale" : "opacity-100"}
                      `}
                      style={{ animationDelay: `${index * 80}ms`, animationFillMode: "backwards" }}
                    >
                      {/* Timeline connecting line */}
                      {!isLast && (
                        <div className="absolute left-[18px] top-3 bottom-0 w-[2px] bg-gray-500/10 z-0" />
                      )}

                      {/* Icon Column */}
                      <div className="relative z-10 flex-none w-10 h-10">
                        <div
                          className={`flex items-center justify-center w-full h-full rounded-full transition-colors duration-300 ${getStatusColor(step.status)}`}
                          style={{ boxShadow: "0 0 0 6px var(--bg-card)" }}
                        >
                          {step.status === "success" ? (
                            <Check className="w-5.5 h-5.5" />
                          ) : step.status === "active" ? (
                            <Loader2 className="w-5.5 h-5.5 animate-spin" />
                          ) : (
                            step.icon || <div className="w-2.5 h-2.5 rounded-full bg-current" />
                          )}
                        </div>
                      </div>

                      {/* Content Column */}
                      <div className="flex-1 pb-6">
                        {/* Step Header */}
                        <div
                          className={`flex items-center justify-between group rounded-md -mx-2 px-2 py-1 transition-colors
                            ${step.content ? "cursor-pointer hover:bg-[var(--bg-hover)]/50" : ""}
                          `}
                          onClick={(e) => step.content && toggleStep(step.id, e)}
                        >
                          <span
                            className={`text-[14px] tracking-tight transition-colors duration-200
                              ${step.status === "active" ? "text-[var(--text-main)] font-semibold" :
                                step.status === "error" ? "text-rose-600 dark:text-rose-400 font-semibold" :
                                "text-[var(--text-main)]/80 group-hover:text-[var(--text-main)] font-medium"}
                            `}
                          >
                            {step.title}
                          </span>

                          <div className="flex items-center gap-3">
                            {step.duration && (
                              <span className="text-[14px] font-mono text-[var(--text-muted)] tabular-nums">
                                {step.duration}
                              </span>
                            )}
                            {step.content && (
                              <div className="text-[var(--text-muted)]/40 group-hover:text-[var(--text-muted)] transition-colors">
                                {isStepExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Step Expanded Content */}
                        {step.content && (
                          <div
                            className={`grid transition-all duration-400 ease-in-out ${
                              isStepExpanded ? "grid-rows-[1fr] mt-2 opacity-100" : "grid-rows-[0fr] mt-0 opacity-0"
                            }`}
                          >
                            <div className="overflow-hidden">
                              <div className="pt-1 pb-2">{step.content}</div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}

              </div>
          </div>
        </div>
      </div>
    </div>
  );
};
