"use client";

import React from "react";

export interface TrendPoint {
  label: string;
  a: number;
  b: number;
}

interface TrendAreaChartProps {
  data: TrendPoint[];
  aLabel: string;
  bLabel: string;
  aColor?: string;
  bColor?: string;
  height?: number;
}

/**
 * Lightweight, dependency-free SVG area chart (no chart lib required).
 * Renders two overlapping smoothed area series against a shared y-scale.
 */
export function TrendAreaChart({
  data,
  aLabel,
  bLabel,
  aColor = "#00B15E",
  bColor = "#F97066",
  height = 220,
}: TrendAreaChartProps) {
  const width = 700;
  const padTop = 16;
  const padBottom = 28;
  const padLeft = 8;
  const padRight = 8;
  const chartH = height - padTop - padBottom;
  const chartW = width - padLeft - padRight;

  const max = Math.max(1, ...data.map((d) => Math.max(d.a, d.b))) * 1.15;

  const x = (i: number) => padLeft + (i / Math.max(1, data.length - 1)) * chartW;
  const y = (v: number) => padTop + chartH - (v / max) * chartH;

  const smoothPath = (values: number[]) => {
    if (values.length === 0) return "";
    const pts = values.map((v, i) => [x(i), y(v)]);
    let d = `M ${pts[0][0]},${pts[0][1]}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const [x0, y0] = pts[i];
      const [x1, y1] = pts[i + 1];
      const mx = (x0 + x1) / 2;
      d += ` Q ${mx},${y0} ${mx},${(y0 + y1) / 2} Q ${mx},${y1} ${x1},${y1}`;
    }
    return d;
  };

  const linePathA = smoothPath(data.map((d) => d.a));
  const linePathB = smoothPath(data.map((d) => d.b));
  const areaPathA = `${linePathA} L ${x(data.length - 1)},${y(0)} L ${x(0)},${y(0)} Z`;
  const gridLines = [0.25, 0.5, 0.75, 1];

  return (
    <div className="w-full">
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full" style={{ height }}>
        <defs>
          <linearGradient id="trendFillA" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={aColor} stopOpacity="0.18" />
            <stop offset="100%" stopColor={aColor} stopOpacity="0" />
          </linearGradient>
        </defs>

        {gridLines.map((g) => (
          <line
            key={g}
            x1={padLeft}
            x2={width - padRight}
            y1={padTop + chartH * (1 - g)}
            y2={padTop + chartH * (1 - g)}
            stroke="#E9ECE9"
            strokeWidth={1}
          />
        ))}

        <path d={areaPathA} fill="url(#trendFillA)" />
        <path d={linePathB} fill="none" stroke={bColor} strokeWidth={2} strokeDasharray="4 4" opacity={0.85} />
        <path d={linePathA} fill="none" stroke={aColor} strokeWidth={2.5} />

        {data.map((d, i) => (
          <g key={d.label}>
            <circle cx={x(i)} cy={y(d.a)} r={3} fill={aColor} />
            <circle cx={x(i)} cy={y(d.b)} r={2.5} fill={bColor} />
            <text
              x={x(i)}
              y={height - 8}
              textAnchor="middle"
              className="fill-muted-foreground"
              style={{ fontSize: 10, fontWeight: 600 }}
            >
              {d.label}
            </text>
          </g>
        ))}
      </svg>

      <div className="flex items-center gap-5 mt-1">
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
          <span className="size-2 rounded-full" style={{ backgroundColor: aColor }} /> {aLabel}
        </span>
        <span className="flex items-center gap-1.5 text-[11px] font-semibold text-foreground/70">
          <span className="size-2 rounded-full" style={{ backgroundColor: bColor }} /> {bLabel}
        </span>
      </div>
    </div>
  );
}
