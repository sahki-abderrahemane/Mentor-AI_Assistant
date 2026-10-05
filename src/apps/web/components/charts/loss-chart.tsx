"use client";

import {
  LineChart,
  Line,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
  Legend,
} from "recharts";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";

interface LossChartProps {
  data: { step: number; loss: number; evalLoss?: number }[];
  loading?: boolean;
}

export function LossChart({ data, loading }: LossChartProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Loss curve</CardTitle>
        <CardDescription>Training and evaluation loss across steps.</CardDescription>
      </CardHeader>
      <CardContent className="h-72">
        {loading || !data.length ? (
          <Skeleton className="h-full w-full" />
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={data}>
              <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
              <XAxis dataKey="step" stroke="var(--muted-foreground)" tick={{ fontSize: 11 }} />
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
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line dataKey="loss" stroke="var(--primary)" strokeWidth={2} dot={false} name="Train loss" />
              <Line dataKey="evalLoss" stroke="var(--chart-2)" strokeWidth={2} dot={false} name="Eval loss" />
            </LineChart>
          </ResponsiveContainer>
        )}
      </CardContent>
    </Card>
  );
}
