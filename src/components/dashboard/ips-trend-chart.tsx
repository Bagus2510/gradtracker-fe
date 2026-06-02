"use client";

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { useAsync } from "@/hooks/use-async";
import { fetchIPSTrend } from "@/lib/api";
import { useI18n } from "@/context/i18n-context";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="font-semibold text-popover-foreground">{label}</p>
      <p className="mt-0.5 text-primary dark:text-primary">
        Avg IPS:{" "}
        <span className="font-bold">
          {typeof payload[0]?.value === "number"
            ? payload[0].value.toFixed(2)
            : "—"}
        </span>
      </p>
    </div>
  );
};

function ChartSkeleton() {
  return (
    <div className="space-y-3 p-2">
      <div className="flex items-end gap-1.5" style={{ height: 260 }}>
        {[60, 75, 85, 70, 90, 55, 40, 30].map((h, i) => (
          <Skeleton
            key={i}
            className="flex-1 rounded-sm"
            style={{ height: `${h}%` }}
          />
        ))}
      </div>
      <div className="flex justify-between gap-2">
        {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
          <Skeleton key={i} className="h-3 flex-1" />
        ))}
      </div>
    </div>
  );
}

export function IPSTrendChart() {
  const { t } = useI18n();
  const { data: trend, isLoading } = useAsync(fetchIPSTrend);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tren Rata-Rata {t("dashboard.trendY")} Kampus</CardTitle>
        <CardDescription>
          Rata-rata {t("dashboard.trendY")} per semester seluruh mahasiswa — perhatikan penurunan
          tajam di {t("dashboard.trendX")} 7–8
        </CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading || !trend ? (
          <ChartSkeleton />
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart
              data={trend}
              margin={{ top: 8, right: 16, left: -8, bottom: 0 }}
            >
              <defs>
                <linearGradient id="ipsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ff8c00" stopOpacity={0.25} />
                  <stop offset="95%" stopColor="#ff8c00" stopOpacity={0} />
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
              <ReferenceLine
                x="Sem 7"
                stroke="#ff5f00"
                strokeDasharray="4 2"
                label={{
                  value: `⚠ Degradasi ${t("dashboard.trendY")}`,
                  position: "insideTopRight",
                  fontSize: 10,
                  fill: "#ff5f00",
                }}
              />
              <Area
                type="monotone"
                dataKey="avgIPS"
                name={`Avg ${t("dashboard.trendY")}`}
                stroke="#ff8c00"
                strokeWidth={2.5}
                fill="url(#ipsGrad)"
                dot={{ r: 4, fill: "#ff8c00", strokeWidth: 2, stroke: "#fff" }}
                activeDot={{ r: 6 }}
              />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
