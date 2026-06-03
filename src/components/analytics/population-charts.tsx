"use client";

import { useEffect, useState } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Cell,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useI18n } from "@/context/i18n-context";
import { fetchAgeDistribution, fetchEmploymentDistribution } from "@/lib/api";
import { useAsync } from "@/hooks/use-async";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const CustomTooltip = ({ active, payload, label }: any) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-lg border bg-popover px-3 py-2 text-xs shadow-lg">
      <p className="mb-1.5 font-semibold text-popover-foreground">{label}</p>
      {payload.map((p: { name: string; value: number; color: string }) => (
        <p key={p.name} style={{ color: p.color }}>
          {p.name}: <span className="font-bold">{p.value}</span>
        </p>
      ))}
    </div>
  );
};

function GroupedBarChart({
  title,
  description,
  data,
  loading,
}: {
  title: string;
  description: string;
  data: { category: string; onTime: number; late: number }[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex h-[260px] items-center justify-center text-muted-foreground text-sm animate-pulse">
            Memuat data...
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={260}>
            <BarChart
              data={data}
              margin={{ top: 4, right: 8, left: -8, bottom: 0 }}
              barCategoryGap="30%"
            >
              <CartesianGrid
                strokeDasharray="3 3"
                stroke="hsl(var(--border))"
                opacity={0.5}
                vertical={false}
              />
              <XAxis
                dataKey="category"
                tick={{ fontSize: 11 }}
                tickLine={false}
                axisLine={false}
              />
              <YAxis tick={{ fontSize: 11 }} tickLine={false} axisLine={false} />
              <Tooltip content={<CustomTooltip />} cursor={{ opacity: 0.06 }} />
              <Legend
                wrapperStyle={{ fontSize: 12, paddingTop: 12 }}
                iconType="circle"
                iconSize={8}
              />
              <Bar
                dataKey="onTime"
                name="Tepat Waktu"
                fill="#ff8c00"
                radius={[4, 4, 0, 0]}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill="#ff8c00" fillOpacity={0.85} />
                ))}
              </Bar>
              <Bar
                dataKey="late"
                name="Terlambat"
                fill="#ff5f00"
                radius={[4, 4, 0, 0]}
              >
                {data.map((_, i) => (
                  <Cell key={i} fill="#ff5f00" fillOpacity={0.85} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}

export function PopulationCharts() {
  const { t } = useI18n();
  const { data: ageData, isLoading: loadingAge } = useAsync(fetchAgeDistribution);
  const { data: empData, isLoading: loadingEmp } = useAsync(fetchEmploymentDistribution);

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <GroupedBarChart
        title="Distribusi Usia Mahasiswa"
        description="Perbandingan kelulusan tepat waktu vs terlambat berdasarkan kelompok usia"
        data={ageData ?? []}
        loading={loadingAge}
      />
      <GroupedBarChart
        title="Distribusi Status Pekerjaan"
        description="Mahasiswa yang bekerja cenderung lebih berisiko terlambat lulus"
        data={empData ?? []}
        loading={loadingEmp}
      />
    </div>
  );
}
