"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { globalIPSTrend } from "@/lib/mock-data";
import type { Student } from "@/types";
import { useI18n } from "@/context/i18n-context";

const SEMESTERS = [
  "Sem 1",
  "Sem 2",
  "Sem 3",
  "Sem 4",
  "Sem 5",
  "Sem 6",
  "Sem 7",
  "Sem 8",
];

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1 font-semibold text-popover-foreground">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}:{" "}
          <span className="font-bold">
            {typeof p.value === "number" ? p.value.toFixed(2) : "—"}
          </span>
        </p>
      ))}
    </div>
  );
};

export function IPSComparisonChart({ student }: { student: Student }) {
  const { t } = useI18n();
  const data = SEMESTERS.map((semester, i) => ({
    semester,
    [student.name]: student.ips[i] ?? null,
    "Rata-Rata Kampus": globalIPSTrend[i]?.avgIPS ?? null,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("dashboard.trendY")} Individual vs Rata-Rata Kampus</CardTitle>
        <CardDescription>
          Perbandingan tren {t("dashboard.trendY")} {student.name} dengan rata-rata seluruh
          mahasiswa per semester
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart
            data={data}
            margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
          >
            <defs>
              <linearGradient id="gradStudent" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.2} />
                <stop offset="95%" stopColor="#ff8c00" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="gradGlobal" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.1} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid
              strokeDasharray="3 3"
              stroke="hsl(var(--border))"
              opacity={0.5}
            />
            <XAxis
              dataKey="semester"
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              domain={[1.5, 4]}
              tickCount={6}
              tick={{ fontSize: 11 }}
              tickLine={false}
              axisLine={false}
            />
            <Tooltip content={<CustomTooltip />} />
            <Legend wrapperStyle={{ fontSize: 12, paddingTop: 12 }} />
            {student.hasIPSDegradation && (
              <ReferenceLine
                x="Sem 7"
                stroke="#ff5f00"
                strokeDasharray="4 2"
                label={{
                  value: "⚠ Degradasi",
                  position: "top",
                  fontSize: 10,
                  fill: "#ff5f00",
                }}
              />
            )}
            <Area
              type="monotone"
              dataKey="Rata-Rata Kampus"
              stroke="#94a3b8"
              strokeWidth={1.5}
              strokeDasharray="5 3"
              fill="url(#gradGlobal)"
              dot={false}
              connectNulls
            />
            <Area
              type="monotone"
              dataKey={student.name}
              stroke="#ff8c00"
              strokeWidth={2.5}
              fill="url(#gradStudent)"
              dot={{ r: 4, fill: "#ff8c00", strokeWidth: 2, stroke: "#fff" }}
              activeDot={{ r: 6 }}
              connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
