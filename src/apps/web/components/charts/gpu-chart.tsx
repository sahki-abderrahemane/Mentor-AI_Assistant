"use client";

import {
  BarChart,
  Bar,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

export function GPUChart({
  data,
  loading,
}: {
  data: { name: string; utilization: number; memory: number }[];
  loading?: boolean;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>GPU utilisation</CardTitle>
        <CardDescription>Per-device compute and memory pressure.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {loading || !data.length ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="name" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
              <YAxis stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
              <Tooltip
                contentStyle={{
                  background: "var(--popover)",
                  color: "var(--popover-foreground)",
                  border: "1px solid var(--border)",
                  borderRadius: 8,
                  fontSize: 12,
                }}
              />
              <Bar dataKey="utilization" fill="var(--primary)" radius={[6, 6, 0, 0]} name="Util %" />
              <Bar dataKey="memory" fill="var(--chart-3)" radius={[6, 6, 0, 0]} name="Mem %" />
            </BarChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
