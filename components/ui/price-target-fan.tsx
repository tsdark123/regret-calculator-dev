"use client";

import { useMemo, useRef, useState, type PointerEvent } from "react";
import { motion, useReducedMotion } from "framer-motion";
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
 *  Takes the user's monthly spending (or total capital wasted) as the "now"
 *  value and fans out three 12-month value targets: optimistic, expected and
 *  conservative. The message is: "We know the regret — here is what this
 *  month's money could become if you redirect it." */

interface PriceTargetFanProps {
  results?: CalculationResult | null;
  assumptions?: Assumptions | null;
}

type Target = { key: string; price: number; analysts: number; color: string };

const W = 520;
const H = 236;
const PAD = { l: 30, r: 104, t: 16, b: 28 };
const CARD_W = 120;

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

export default function PriceTargetFan({ results, assumptions }: PriceTargetFanProps) {
  const reduced = useReducedMotion();
  const svgRef = useRef<SVGSVGElement>(null);
  const [scrub, setScrub] = useState<number | null>(null);
  const [hotT, setHotT] = useState<number | null>(null);

  const { current, targets, history, y, pct, axisTicks, dateLabels, geo, meanTarget, nowX, endX } = useMemo(() => {
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
    if (!isFinite(r)) r = 0.1; // sane fallback for malformed inputs

    // 12-month targets: optimistic, expected and conservative scenarios.
    // Scenarios are sorted descending so High/Mean/Low always map correctly even
    // when the selected investment has a negative expected return.
    const scenarios = [r * 2, r, -r * 0.4].sort((a, b) => b - a);
    const targetKeys = ["High", "Mean", "Low"];
    const targetColors = [GREEN, BLUE, AMBER];
    const targets: Target[] = scenarios.map((ret, i) => ({
      key: targetKeys[i],
      price: Math.max(0, current * (1 + ret)),
      analysts: Math.round(ret * 100),
      color: targetColors[i],
    }));

    // Deterministic weekly history ending exactly at the current value.
    let s = 17;
    let v = 150;
    const out: number[] = [];
    for (let i = 0; i < 52; i++) {
      s = (s * 16807) % 2147483647;
      v = v + ((s / 2147483647) - 0.44) * 4.2;
      out.push(v);
    }
    const histMin = Math.min(...out);
    const histMax = Math.max(...out);
    const range = Math.max(current * 0.15, 20);
    const base = Math.max(0, current - range / 2);
    const scaled = out.map((x) => base + ((x - histMin) / (histMax - histMin)) * range);
    const shift = current - scaled[scaled.length - 1];
    const history = scaled.map((x) => x + shift);

    // Dynamic Y-axis domain.
    const allValues = [...history, current, ...targets.map((t) => t.price)];
    const dataMin = Math.min(...allValues);
    const dataMax = Math.max(...allValues);
    const pad = (dataMax - dataMin) * 0.12 || current * 0.12;
    const yMin = Math.max(0, dataMin - pad);
    const yMax = dataMax + pad;

    const y = (value: number) => {
      if (yMax === yMin) return PAD.t + (H - PAD.t - PAD.b) / 2;
      return PAD.t + (1 - (value - yMin) / (yMax - yMin)) * (H - PAD.t - PAD.b);
    };

    const pct = (p: number) => (current > 0 ? ((p - current) / current) * 100 : 0);

    const histW = (W - PAD.l - PAD.r) * 0.56;
    const hx = (i: number) => PAD.l + (i / (history.length - 1)) * histW;
    const nowX = hx(history.length - 1);
    const nowY = y(current);
    const endX = W - PAD.r;

    const line = history
      .map((val, i) => `${i === 0 ? "M" : "L"}${hx(i).toFixed(1)},${y(val).toFixed(1)}`)
      .join(" ");

    const proj = targets.map((t) => {
      const ty = y(t.price);
      const cx = nowX + (endX - nowX) * 0.5;
      const cy = nowY + (ty - nowY) * 0.15;
      return { ...t, ty, d: `M${nowX},${nowY} Q${cx},${cy} ${endX},${ty}`, cx, cy };
    });

    const hiProj = proj[0];
    const loProj = proj[2];
    const band = `M${nowX},${nowY} Q${hiProj.cx},${hiProj.cy} ${endX},${hiProj.ty} L${endX},${loProj.ty} Q${loProj.cx},${loProj.cy} ${nowX},${nowY} Z`;

    const axisTicks = [0, 1, 2, 3].map((i) => yMax - i * ((yMax - yMin) / 3));

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
      { x: endX, t: formatDateLabel(end), a: "middle" as const },
    ];

    return {
      current,
      targets,
      history,
      y,
      pct,
      axisTicks,
      dateLabels,
      geo: { hx, nowX, nowY, endX, line, proj, band },
      meanTarget: targets[1].price,
      nowX,
      endX,
    };
  }, [results, assumptions]);

  const onMove = (e: PointerEvent<SVGSVGElement>) => {
    const el = svgRef.current;
    if (!el) return;
    const r = el.getBoundingClientRect();
    const px = ((e.clientX - r.left) / r.width) * W;
    if (px > geo.nowX + 6) {
      setScrub(null);
      return;
    }
    const histW = geo.nowX - PAD.l;
    setScrub(
      Math.max(0, Math.min(history.length - 1, Math.round(((px - PAD.l) / histW) * (history.length - 1)))),
    );
  };

  const overlay = (() => {
    if (hotT !== null) {
      const p = geo.proj[hotT];
      const up = p.price >= current;
      return {
        px: geo.endX,
        py: p.ty,
        value: fmtValue(p.price),
        context: `${p.key} · ${up ? "+" : ""}${pct(p.price).toFixed(1)}% · ${p.analysts}% annual return`,
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
    <div className="mx-auto w-[520px]" style={{ fontFamily: SANS }}>
      {/* header — mean target + upside vs current spend */}
      <div className="mb-1 flex items-end justify-between px-1">
        <div>
          <div className="text-[10px] uppercase tracking-[0.14em] text-[var(--text-muted)]">Value target · 12mo</div>
          <div className="mt-1 flex items-baseline gap-2">
            <span className="text-[22px] font-semibold tabular-nums tracking-[-0.02em] text-[var(--text-main)]">
              {fmtValue(meanTarget)}
            </span>
            <span className="text-[12px] font-medium tabular-nums" style={{ color: GREEN }}>
              {`${meanTarget >= current ? "+" : ""}${pct(meanTarget).toFixed(1)}%`}
            </span>
          </div>
        </div>
        <div className="text-right text-[11px] tabular-nums" style={{ color: TEXT_MUTED }}>
          Now {fmtValue(current)}
        </div>
      </div>

      <div className="relative mx-auto w-[520px]">
        <svg
          ref={svgRef}
          width={W}
          height={H}
          viewBox={`0 0 ${W} ${H}`}
          className="block cursor-crosshair"
          onPointerMove={onMove}
          onPointerLeave={() => setScrub(null)}
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
          {dateLabels.map((d) => (
            <text
              key={d.t}
              x={d.x}
              y={H - 8}
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
            animate={{ opacity: hotT === null ? 1 : 0.22 }}
            transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.9 }}
          />

          {/* now marker */}
          <line
            x1={geo.nowX}
            y1={PAD.t}
            x2={geo.nowX}
            y2={H - PAD.b}
            stroke="color-mix(in srgb, var(--text-main) 12%, transparent)"
            strokeWidth={1}
            strokeDasharray="3 3"
          />

          {/* history */}
          <motion.path
            d={geo.line}
            fill="none"
            stroke="color-mix(in srgb, var(--text-main) 78%, transparent)"
            strokeWidth={1.5}
            vectorEffect="non-scaling-stroke"
            initial={{ pathLength: reduced ? 1 : 0 }}
            animate={{ pathLength: 1 }}
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
                animate={{ opacity: dim ? 0.26 : 1 }}
                transition={reduced ? { duration: 0 } : { duration: 0.5, ease: EASE, delay: 0.9 + i * 0.12 }}
                onMouseEnter={() => setHotT(i)}
                onMouseLeave={() => setHotT(null)}
                style={{ cursor: "default" }}
              >
                <path d={p.d} fill="none" stroke="transparent" strokeWidth={16} />
                <path
                  d={p.d}
                  fill="none"
                  stroke={p.color}
                  strokeWidth={on ? 2.2 : 1.4}
                  strokeOpacity={on ? 1 : 0.7}
                  strokeDasharray="2 4"
                  vectorEffect="non-scaling-stroke"
                />
                <circle
                  cx={geo.endX}
                  cy={p.ty}
                  r={on ? 4 : 3.2}
                  fill={SURFACE}
                  stroke={p.color}
                  strokeWidth={1.6}
                />
                <text
                  x={geo.endX + 10}
                  y={p.ty - 2.5}
                  fontSize={8}
                  fill="color-mix(in srgb, var(--text-main) 40%, transparent)"
                >
                  {p.key}
                </text>
                <text
                  x={geo.endX + 10}
                  y={p.ty + 8}
                  fontSize={10.5}
                  fontWeight={600}
                  fill={p.color}
                  className="tabular-nums"
                >
                  {fmtAxis(p.price)}
                </text>
              </motion.g>
            );
          })}

          {/* now dot */}
          <motion.circle
            cx={geo.nowX}
            cy={geo.nowY}
            r={3.2}
            fill="var(--text-main)"
            initial={{ opacity: reduced ? 1 : 0 }}
            animate={{ opacity: 1 }}
            transition={reduced ? { duration: 0 } : { delay: 0.85 }}
          />

          {/* scrub crosshair */}
          {scrub !== null && (
            <g pointerEvents="none">
              <line
                x1={geo.hx(scrub)}
                y1={PAD.t}
                x2={geo.hx(scrub)}
                y2={H - PAD.b}
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
        {overlay && (
          <div
            className="pointer-events-none absolute z-10 rounded-lg border px-2.5 py-1.5"
            style={{
              width: CARD_W,
              left:
                overlay.px < W / 2
                  ? Math.min(W - CARD_W - 4, overlay.px + 14)
                  : Math.max(4, overlay.px - CARD_W - 14),
              top: Math.max(2, Math.min(H - 44, overlay.py - 18)),
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
        )}
      </div>
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
