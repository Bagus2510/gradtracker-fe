"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import type { Student } from "@/types";
import { useI18n } from "@/context/i18n-context";

const RADIUS = 80;
const STROKE = 12;
const CIRCUMFERENCE = Math.PI * RADIUS; // semicircle arc length

function getArcPath(cx: number, cy: number, r: number) {
  return `M ${cx - r} ${cy} A ${r} ${r} 0 0 1 ${cx + r} ${cy}`;
}

const riskConfig: Record<
  Student["riskLabel"],
  { color: string; label: string; labelClass: string; trackClass: string }
> = {
  Low: {
    color: "#22c55e",
    label: "Risiko Rendah",
    labelClass: "text-secondary dark:text-secondary",
    trackClass: "fill-secondary dark:fill-secondary",
  },
  Medium: {
    color: "#ffc300",
    label: "Risiko Sedang",
    labelClass: "text-accent dark:text-accent",
    trackClass: "fill-accent dark:fill-accent",
  },
  High: {
    color: "#ff5f00",
    label: "Risiko Tinggi",
    labelClass: "text-destructive dark:text-destructive",
    trackClass: "fill-destructive dark:fill-destructive",
  },
};

export function RiskGauge({ student }: { student: Student }) {
  const { t } = useI18n();
  const cx = 110;
  const cy = 102;
  const fillLength = (student.riskScore / 100) * CIRCUMFERENCE;
  const cfg = riskConfig[student.riskLabel];

  return (
    <Card className="flex flex-col">
      <CardHeader className="pb-0">
        <CardTitle className="text-sm font-semibold">
          ML Risk Probability
        </CardTitle>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col items-center justify-center gap-3 pt-2">
        <svg
          width={220}
          height={130}
          aria-label={`Risk gauge: ${student.riskScore}%`}
          viewBox="0 0 220 130"
        >
          {/* Background arc */}
          <path
            d={getArcPath(cx, cy, RADIUS)}
            fill="none"
            stroke="currentColor"
            strokeWidth={STROKE}
            strokeLinecap="round"
            className="text-muted/60"
          />
          {/* Filled arc */}
          <path
            d={getArcPath(cx, cy, RADIUS)}
            fill="none"
            stroke={cfg.color}
            strokeWidth={STROKE}
            strokeLinecap="round"
            strokeDasharray={`${fillLength} ${CIRCUMFERENCE}`}
            style={{
              transition: "stroke-dasharray 0.8s cubic-bezier(.4,0,.2,1)",
            }}
            filter="url(#glow)"
          />
          {/* Glow filter */}
          <defs>
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="coloredBlur" />
              <feMerge>
                <feMergeNode in="coloredBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>
          {/* Score */}
          <text
            x={cx}
            y={cy - 8}
            textAnchor="middle"
            style={{ fontSize: 30, fontWeight: 800, fill: cfg.color }}
          >
            {student.riskScore}%
          </text>
          {/* Min/Max */}
          <text
            x={cx - RADIUS - 2}
            y={cy + 20}
            textAnchor="end"
            style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          >
            0
          </text>
          <text
            x={cx + RADIUS + 2}
            y={cy + 20}
            textAnchor="start"
            style={{ fontSize: 10, fill: "hsl(var(--muted-foreground))" }}
          >
            100
          </text>
        </svg>

        {/* Label badge */}
        <span
          className={cn(
            "rounded-full px-4 py-1.5 text-sm font-bold",
            cfg.labelClass,
            riskConfig[student.riskLabel].trackClass,
          )}
        >
          {cfg.label}
        </span>

        <p className="max-w-[180px] text-center text-[11px] text-muted-foreground">
          Probabilitas keterlambatan kelulusan berdasarkan model ML ensemble
        </p>
      </CardContent>
    </Card>
  );
}
