"use client";

import { useEffect, useLayoutEffect, useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, useInView, useReducedMotion } from "framer-motion";
import { HelpCircle, TrendingUp } from "lucide-react";
import type { CalculationResult, Assumptions } from "../../types";

const AMBER = "var(--chart-amber, #e8b45a)";
const BLUE = "var(--chart-1, #489ffa)";
const EASE = [0.16, 1, 0.3, 1] as const;
const GREEN = "var(--chart-2, #4dbe95)";
const HAIRLINE = "var(--border)";
const SANS = "inherit";
const SURFACE = "var(--bg-card)";
const SURFACE_RAISED = "var(--bg-card)";
const TEXT = "var(--text-main)";
const TEXT_MUTED = "var(--text-muted)";

/** #78 Price Target Fan — adapted for the Regret Calculator.
 *
 *  Desktop follows the original prompt 1:1 in design: fixed 52-week LCG walk,
 *  original y-domain proportions (High near the top, Low near the bottom,
 *  Current ~28% up), original strokes/labels/fan. Only `current` and the three
 *  targets are plugged in from the calculator data.
 *
 *  Mobile (< 640px) keeps the compact bottom-legend layout it already has. */

interface PriceTargetFanProps {
  results?: CalculationResult | null;
  assumptions?: Assumptions | null;
}

type Target = { key: string; price: number; rate: number; color: string };

const MOBILE_H = 236;
const DESKTOP_H = 320;
const PAD = { l: 30, t: 16, b: 28 };
const CARD_W = 120;
const COMPACT_THRESHOLD = 640;
const MIN_LABEL_GAP = 22; // px between High/Mean/Low dots on desktop

const fmtValue = (p: number) => `$${p.toFixed(2)}`;

const fmtAxis = (v: number) => {
  const abs = Math.abs(v);
  if (abs >= 1_000_000) return `${(v / 1_000_000).toFixed(1)}M`;
  if (abs >= 1_000) return `${(v / 1_000).toFixed(1)}K`;
  return `${Math.round(v).toLocaleString()}`;
};

const formatDateLabel = (d: Date) => {
  const m = d.toLocaleDateString("en-US", { month: "short" });
  const y = d.getFullYear().toString().slice(-2);
  return `${m} '${y}`;
};

// Deterministic 52-week LCG walk.  `step` controls how volatile the walk is;
// larger step = bigger local spikes.  The prompt uses step=4.2, mobile keeps
// that; desktop uses a more exaggerated step so the price action fills the box.
function buildWalk(step: number) {
  let s = 17;
  let v = 150;
  const out: number[] = [];
  for (let i = 0; i < 52; i++) {
    s = (s * 16807) % 2147483647;
    v = v + ((s / 2147483647) - 0.44) * step;
    out.push(v);
  }
  const lo = Math.min(...out);
  const hi = Math.max(...out);
  return { out, lo, hi };
}

export default function PriceTargetFan({ results, assumptions }: PriceTargetFanProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const [W, setW] = useState(0);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hotT, setHotT] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [revealComplete, setRevealComplete] = useState(false);

  const isInView = useInView(containerRef, { once: true, amount: 0.4 });

  useLayoutEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const width = el.clientWidth;
    if (width) setW(Math.max(320, width));
  }, []);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;
    const update = () => {
      const width = el.clientWidth;
      if (width) setW(Math.max(320, width));
    };
    update();
    const obs = new ResizeObserver(update);
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  // Auto-cycle the spotlight across High/Mean/Low when in view and not hovered.
  useEffect(() => {
    if (reduced || !isInView || isHovering) return;
    let idx = 0;
    const timer = setInterval(() => {
      setHotT(idx);
      idx = (idx + 1) % 3;
    }, 2600);
    return () => clearInterval(timer);
  }, [reduced, isInView, isHovering]);

  // Once the initial staggered entrance has played, remove the per-item delays
  // so that subsequent auto-cycle/hover spotlight changes stay in sync with the overlay.
  useEffect(() => {
    if (reduced) {
      setRevealComplete(true);
      return;
    }
    const t = setTimeout(() => setRevealComplete(true), 1300);
    return () => clearTimeout(t);
  }, [reduced]);

  const isCompact = W > 0 && W < COMPACT_THRESHOLD;
  const chartH = isCompact ? MOBILE_H : DESKTOP_H;

  const {
    current,
    targets,
    history,
    y,
    pct,
    axisTicks,
    dateLabels,
    geo,
    meanTarget,
  } = useMemo(() => {
    // Mobile: fixed 520 viewBox. Desktop: actual pixel width.
    const chartW = isCompact ? 520 : Math.max(520, W);
    const padR = isCompact ? 44 : Math.max(80, Math.min(120, chartW * 0.2));

    // Fallback to the prompt's example numbers when rendered without data (Demo).
    const fallbackCurrent = 178.52;
    const fallbackReturn = 0.148;

    const current =
      results && results.totalMonthlyContribution > 0
        ? results.totalMonthlyContribution
        : results && results.totalCapitalWasted > 0
          ? results.totalCapitalWasted
          : fallbackCurrent;

    const nominalR =
      assumptions && typeof assumptions.annualReturn === "number"
        ? assumptions.annualReturn / 100
        : fallbackReturn;

    // Mirror the real-return logic used in the main calculator.
    let r = nominalR;
    if (assumptions && assumptions.inflationAdjusted && typeof assumptions.inflationRate === "number") {
      const i = assumptions.inflationRate / 100;
      r = (1 + nominalR) / (1 + i) - 1;
    }
    if (!isFinite(r)) r = 0.1;

    // 12-month targets: optimistic (2x return), expected (1x), conservative (-0.4x).
    const scenarios = [r * 2, r, -r * 0.4].sort((a, b) => b - a);
    const targetKeys = ["High", "Mean", "Low"];
    const targetColors = [GREEN, BLUE, AMBER];
    const targets: Target[] = scenarios.map((ret, i) => ({
      key: targetKeys[i],
      price: Math.max(0, current * (1 + ret)),
      rate: Math.round(ret * 100),
      color: targetColors[i],
    }));

    // Desktop y-domain: High pinned near the top (8% from the edge), bottom
    // opened down to at least 70% of `current`. This tightens the y-range so the
    // white price action line and the fan lines are more vertically spread in
    // the same box. Mobile uses the original prompt's "fit all data + 12% pad".
    let yMin = 0;
    let yMax = 0;

    if (!isCompact) {
      const tMin = targets[2].price;
      const tMax = targets[0].price;
      // Classic 18%-from-top / 18%-from-bottom proportions as a baseline.
      const classicR = Math.max(tMax - tMin, current * 0.05) / 0.64;
      const classicYMin = Math.max(0, tMin - 0.18 * classicR);
      // Open the floor down to 70% of the current value to give the white line
      // a long runway, but never below zero.
      yMin = Math.min(classicYMin, current * 0.7);
      // Pin High only 8% from the top so the scale is larger in the same height.
      const R = (tMax - yMin) / 0.92;
      yMax = yMin + R;
    }

    // Mobile: prompt's original smooth walk.  Desktop: more volatile step so
    // the white line is spiky and fills the vertical space.
    const { out, lo: walkLo, hi: walkHi } = buildWalk(isCompact ? 4.2 : 11.0);

    let history: number[];
    if (isCompact) {
      const range = Math.max(current * 0.15, 20);
      const base = Math.max(0, current - range / 2);
      const scaled = out.map((x) => base + ((x - walkLo) / (walkHi - walkLo)) * range);
      const shift = current - scaled[scaled.length - 1];
      history = scaled.map((x) => x + shift);
    } else {
      // Stretch the volatile walk from just above the yMin floor to `current`.
      const R = yMax - yMin;
      const base = yMin + R * 0.02;
      const range = current - base;
      const scaled = out.map((x) => base + ((x - walkLo) / (walkHi - walkLo)) * range);
      const shift = current - scaled[scaled.length - 1];
      history = scaled.map((x) => x + shift);
    }

    if (isCompact) {
      const allValues = [...history, current, ...targets.map((t) => t.price)];
      const dataMin = Math.min(...allValues);
      const dataMax = Math.max(...allValues);
      const pad = (dataMax - dataMin) * 0.12 || current * 0.12;
      yMin = Math.max(0, dataMin - pad);
      yMax = dataMax + pad;
    }

    const y = (value: number) => {
      if (yMax === yMin) return PAD.t + (chartH - PAD.t - PAD.b) / 2;
      return PAD.t + (1 - (value - yMin) / (yMax - yMin)) * (chartH - PAD.t - PAD.b);
    };

    const pct = (p: number) => (current > 0 ? ((p - current) / current) * 100 : 0);

    const histW = (chartW - PAD.l - padR) * 0.56;
    const hx = (i: number) => PAD.l + (i / (history.length - 1)) * histW;
    const nowX = hx(history.length - 1);
    const nowY = y(current);
    const endX = chartW - padR;

    const line = history
      .map((val, i) => `${i === 0 ? "M" : "L"}${hx(i).toFixed(1)},${y(val).toFixed(1)}`)
      .join(" ");

    // Desktop: nudge High/Mean/Low dot Ys apart so the right-side labels don't
    // clump together when the target prices are close.  Mobile keeps exact.
    const rawProj = targets.map((t) => y(t.price));
    const adjustedTy = isCompact
      ? rawProj
      : (() => {
          const indices = rawProj.map((_, i) => i).sort((a, b) => rawProj[a] - rawProj[b]);
          const sorted = indices.map((i) => rawProj[i]);
          for (let i = 1; i < sorted.length; i++) {
            if (sorted[i] - sorted[i - 1] < MIN_LABEL_GAP) {
              sorted[i] = sorted[i - 1] + MIN_LABEL_GAP;
            }
          }
          const out = new Array(3).fill(0);
          indices.forEach((idx, i) => (out[idx] = sorted[i]));
          return out;
        })();

    const proj = targets.map((t, i) => {
      const ty = adjustedTy[i];
      const cx = nowX + (endX - nowX) * 0.5;
      const cy = nowY + (ty - nowY) * 0.15;
      return { ...t, ty, d: `M${nowX},${nowY} Q${cx},${cy} ${endX},${ty}`, cx, cy };
    });

    const hi = proj[0];
    const lo = proj[2];
    const band = `M${nowX},${nowY} Q${hi.cx},${hi.cy} ${endX},${hi.ty} L${endX},${lo.ty} Q${lo.cx},${lo.cy} ${nowX},${nowY} Z`;

    // Axis ticks: on desktop the top tick is pinned to the High target so the
    // High dot always horizontally lines up with its left-axis label; the
    // remaining three ticks are evenly spaced down to yMin. Mobile uses the
    // original prompt's "fit all data + 12% pad" approach.
    const R = yMax - yMin;
    const tMax = targets[0].price;
    const desktopStep = (tMax - yMin) / 3;
    const axisTicks = isCompact
      ? (() => {
          const step = R / 3;
          return [0, 1, 2, 3].map((i) => yMax - i * step);
        })()
      : [0, 1, 2, 3].map((i) => tMax - i * desktopStep).filter((v) => v >= yMin - 0.001);

    const now = new Date();
    const start = new Date(now);
    start.setMonth(now.getMonth() - 12);
    const mid = new Date(now);
    mid.setMonth(now.getMonth() - 6);
    const end = new Date(now);
    end.setMonth(now.getMonth() + 12);

    const dateLabels = [
      { x: hx(0), t: formatDateLabel(start), a: "start" as const },
      { x: hx(26), t: formatDateLabel(mid), a: "middle" as const },
      { x: nowX, t: "Now", a: "middle" as const },
      { x: endX, t: formatDateLabel(end), a: isCompact ? ("end" as const) : ("middle" as const) },
    ];

    return {
      current,
      targets,
      history,
      y,
      pct,
      axisTicks,
      dateLabels,
      geo: { hx, nowX, nowY, endX, line, proj, band, chartW },
      meanTarget: targets[1].price,
    };
  }, [results, assumptions, W, isCompact]);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current;
    if (!el || !W) return;
    const r = el.getBoundingClientRect();
    if (!r.width) return;
    const scale = geo.chartW / r.width;
    const px = (e.clientX - r.left) * scale;
    if (px > geo.nowX + 6) {
      setScrub(null);
      return;
    }
    const histW = geo.nowX - PAD.l;
    setScrub(
      Math.max(0, Math.min(history.length - 1, Math.round(((px - PAD.l) / histW) * (history.length - 1)))),
    );
  };

  // Overlay card — target hover wins over scrub; flips to the side that keeps it in view.
  const overlay = (() => {
    if (hotT !== null) {
      const p = geo.proj[hotT];
      const up = p.price >= current;
      return {
        px: geo.endX,
        py: p.ty,
        value: fmtValue(p.price),
        context: `${p.key} · ${up ? "+" : ""}${pct(p.price).toFixed(1)}% · ${p.rate}% annual return`,
        color: p.color,
      };
    }
    if (scrub !== null) {
      const ago = history.length - 1 - scrub;
      return {
        px: geo.hx(scrub),
        py: y(history[scrub]),
        value: fmtValue(history[scrub]),
        context: ago === 0 ? "now" : `${ago}w ago`,
        color: undefined as string | undefined,
      };
    }
    return null;
  })();

  return (
    <div ref={containerRef} className="w-full" style={{ fontFamily: SANS }}>
      {/* header — tool title row */}
      <div className="mb-3 flex items-center gap-3">
        {/* Mobile: info icon to the left of the title */}
        <div className="relative group sm:hidden">
          <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
          <div className="absolute left-0 top-full mt-2 px-3 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)] w-[200px] leading-relaxed normal-case opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
            A 12-month forward projection based on your expected annual return, with optimistic (High), expected (Mean), and conservative (Low) price targets.
          </div>
        </div>
        {/* Theme-colored spiking arrow logo */}
        <div className="p-2 rounded-lg bg-[var(--primary)]/10">
          <TrendingUp className="w-5 h-5 text-[var(--primary)]" />
        </div>
        <h3 className="text-xl font-bold text-[var(--text-main)] tracking-tight">
          12-Month Value Target
        </h3>
        {/* Desktop: info icon to the right of the title */}
        <div className="relative group hidden sm:block">
          <HelpCircle className="w-4 h-4 text-[var(--text-muted)] cursor-help opacity-60 hover:opacity-100 transition-opacity" />
          <div className="absolute left-0 top-full mt-2 px-3 py-3 bg-[var(--bg-card)] border border-[var(--border)] rounded-lg text-xs text-[var(--text-muted)] w-[320px] leading-relaxed normal-case opacity-0 pointer-events-none group-hover:opacity-100 transition-opacity duration-200 z-50 shadow-xl">
            A 12-month forward projection based on your expected annual return, with optimistic (High), expected (Mean), and conservative (Low) price targets.
          </div>
        </div>
      </div>

      {/* mean target + upside vs current spend */}
      <div className="mb-1 flex items-end justify-between px-1">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Price target · 12mo</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--text-main)]">
              {W > 0 ? fmtValue(meanTarget) : "--"}
            </span>
            {W > 0 && (
              <span className="text-[12px] font-medium tabular-nums" style={{ color: GREEN }}>
                {`${meanTarget >= current ? "+" : ""}${pct(meanTarget).toFixed(1)}%`}
              </span>
            )}
          </div>
        </div>
        <div className="text-right text-[11px] tabular-nums" style={{ color: TEXT_MUTED }}>
          {W > 0 ? `Now ${fmtValue(current)}` : "Now --"}
        </div>
      </div>

      {W === 0 ? (
        <div className="relative mx-auto" style={{ height: chartH }} />
      ) : (
        <>
          <div
            className="relative mx-auto"
            style={{
              width: isCompact ? "100%" : geo.chartW,
              maxWidth: isCompact ? "520px" : undefined,
              height: chartH,
            }}
          >
            <svg
              ref={svgRef}
              width={isCompact ? "100%" : geo.chartW}
              height={chartH}
              viewBox={`0 0 ${geo.chartW} ${chartH}`}
              preserveAspectRatio={isCompact ? "xMidYMid meet" : "none"}
              className="block cursor-crosshair"
              onPointerMove={onMove}
              onPointerLeave={() => setScrub(null)}
              onMouseEnter={() => setIsHovering(true)}
              onMouseLeave={() => { setIsHovering(false); setHotT(null); }}
            >
              {/* faint gridlines + left price axis */}
              {axisTicks.map((v) => (
                <g key={v}>
                  <line
                    x1={PAD.l}
                    y1={y(v)}
                    x2={geo.endX}
                    y2={y(v)}
                    stroke="color-mix(in srgb, var(--text-main) 4%, transparent)"
                    strokeDasharray="2 5"
                  />
                  <text
                    x={PAD.l - 7}
                    y={y(v) + 3}
                    textAnchor="end"
                    fontSize={8.5}
                    fill="color-mix(in srgb, var(--text-main) 32%, transparent)"
                    className="tabular-nums"
                  >
                    {fmtAxis(v)}
                  </text>
                </g>
              ))}

              {/* bottom date axis — history → now → 12mo target horizon */}
              {dateLabels.map((d, i) => (
                <text
                  key={d.t + i}
                  x={d.x}
                  y={chartH - 8}
                  textAnchor={d.a}
                  fontSize={8.5}
                  fill="color-mix(in srgb, var(--text-main) 30%, transparent)"
                >
                  {d.t}
                </text>
              ))}

              {/* projection band */}
              <motion.path
                d={geo.band}
                fill={`color-mix(in srgb, ${BLUE} 6%, transparent)`}
                initial={{ opacity: reduced ? 1 : 0 }}
                animate={{ opacity: reduced ? 1 : (isInView ? (hotT === null ? 1 : 0.22) : 0) }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: revealComplete ? 0 : 0.9 }}
              />

              {/* now marker */}
              <line
                x1={geo.nowX}
                y1={PAD.t}
                x2={geo.nowX}
                y2={chartH - PAD.b}
                stroke="color-mix(in srgb, var(--text-main) 12%, transparent)"
                strokeWidth={1}
                strokeDasharray="3 3"
              />

              {/* history — desktop gets a bolder, more prominent stroke */}
              <motion.path
                d={geo.line}
                fill="none"
                stroke={
                  isCompact
                    ? "color-mix(in srgb, var(--text-main) 78%, transparent)"
                    : "color-mix(in srgb, var(--text-main) 92%, transparent)"
                }
                strokeWidth={isCompact ? 1.5 : 2.2}
                vectorEffect="non-scaling-stroke"
                initial={{ pathLength: reduced ? 1 : 0 }}
                animate={{ pathLength: reduced || isInView ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { duration: 0.9, ease: EASE }}
              />

              {/* projections + target labels */}
              {geo.proj.map((p, i) => {
                const on = hotT === i;
                const dim = hotT !== null && !on;
                return (
                  <motion.g
                    key={p.key}
                    initial={{ opacity: reduced ? 1 : 0 }}
                    animate={{ opacity: reduced ? 1 : (isInView ? (dim ? 0.26 : 1) : 0) }}
                    transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: revealComplete ? 0 : 0.9 + i * 0.12 }}
                    onMouseEnter={() => setHotT(i)}
                    style={{ cursor: "default" }}
                  >
                    <path d={p.d} fill="none" stroke="transparent" strokeWidth={16} />
                    <path
                      d={p.d}
                      fill="none"
                      stroke={p.color}
                      strokeWidth={on ? 3 : 2.2}
                      strokeOpacity={on ? 1 : 0.88}
                      strokeDasharray="2 4"
                      vectorEffect="non-scaling-stroke"
                    />
                    <motion.circle
                      cx={geo.endX}
                      cy={p.ty}
                      initial={{ r: 0, opacity: 0 }}
                      animate={{ r: on ? 5 : 4, opacity: reduced ? 1 : (isInView ? 1 : 0) }}
                      transition={reduced ? { duration: 0 } : { duration: 0.4, ease: EASE, delay: revealComplete ? 0 : 0.9 + i * 0.12 }}
                      fill={SURFACE}
                      stroke={p.color}
                      strokeWidth={1.8}
                    />
                    {!isCompact && (
                      <>
                        <text
                          x={geo.endX + 10}
                          y={p.ty - 4}
                          fontSize={8}
                          fill="color-mix(in srgb, var(--text-main) 40%, transparent)"
                        >
                          {p.key}
                        </text>
                        <text
                          x={geo.endX + 10}
                          y={p.ty + 10}
                          fontSize={10.5}
                          fontWeight={600}
                          fill={p.color}
                          className="tabular-nums"
                        >
                          {fmtAxis(p.price)}
                        </text>
                      </>
                    )}
                  </motion.g>
                );
              })}

              {/* now dot */}
              <motion.circle
                cx={geo.nowX}
                cy={geo.nowY}
                r={isCompact ? 3.2 : 4}
                fill="var(--text-main)"
                initial={{ opacity: reduced ? 1 : 0 }}
                animate={{ opacity: reduced || isInView ? 1 : 0 }}
                transition={reduced ? { duration: 0 } : { delay: 0.85 }}
              />

              {/* scrub crosshair */}
              {scrub !== null && (
                <g pointerEvents="none">
                  <line
                    x1={geo.hx(scrub)}
                    y1={PAD.t}
                    x2={geo.hx(scrub)}
                    y2={chartH - PAD.b}
                    stroke="color-mix(in srgb, var(--text-main) 22%, transparent)"
                    strokeWidth={1}
                  />
                  <circle
                    cx={geo.hx(scrub)}
                    cy={y(history[scrub])}
                    r={3.2}
                    fill="var(--text-main)"
                    stroke={SURFACE}
                    strokeWidth={1.5}
                  />
                </g>
              )}
            </svg>

            {/* overlay — value big, context muted (KPI-card read) */}
            {overlay && (() => {
              const renderedW = svgRef.current?.getBoundingClientRect().width ?? geo.chartW;
              const renderedH = svgRef.current?.getBoundingClientRect().height ?? chartH;
              const sx = renderedW / geo.chartW;
              const sy = renderedH / chartH;
              const pxCss = overlay.px * sx;
              const pyCss = overlay.py * sy;
              return (
                <div
                  className="pointer-events-none absolute z-10 rounded-lg border px-2.5 py-1.5"
                  style={{
                    width: CARD_W,
                    left:
                      pxCss < renderedW / 2
                        ? Math.min(renderedW - CARD_W - 4, pxCss + 14)
                        : Math.max(4, pxCss - CARD_W - 14),
                    top: Math.max(2, Math.min(renderedH - 44, pyCss - 18)),
                    background: SURFACE_RAISED,
                    borderColor: HAIRLINE,
                  }}
                >
                  <div className="text-[13px] font-semibold tabular-nums" style={{ color: overlay.color ?? TEXT }}>
                    {overlay.value}
                  </div>
                  <div className="mt-0.5 text-[10px]" style={{ color: TEXT_MUTED }}>
                    {overlay.context}
                  </div>
                </div>
              );
            })()}
          </div>

          {/* Compact target legend below chart */}
          {isCompact && (
            <div className="mt-3 flex flex-wrap items-center justify-center gap-3 px-1">
              {targets.map((t) => {
                const pctValue = pct(t.price);
                return (
                  <div key={t.key} className="flex items-center gap-1.5 text-xs">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: t.color }} />
                    <span className="text-[var(--text-muted)]">{t.key}</span>
                    <span className="font-semibold tabular-nums" style={{ color: t.color }}>
                      {fmtValue(t.price)}
                    </span>
                    <span className="text-[var(--text-muted)] tabular-nums">
                      ({t.price >= current ? "+" : ""}{pctValue.toFixed(0)}%)
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}
    </div>
  );
}

export function Demo() {
  return (
    <div className="flex min-h-[280px] w-full items-center justify-center p-6">
      <PriceTargetFan />
    </div>
  );
}

export { PriceTargetFan as Component };
