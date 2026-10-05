"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

export function MiniSparkline({
  data,
  stroke = "var(--primary)",
  height = 56,
}: {
  data: number[];
  stroke?: string;
  height?: number;
}) {
  const points = data.map((value, idx) => ({ idx, value }));
  return (
    <ResponsiveContainer width="100%" height={height}>
      <AreaChart data={points}>
        <defs>
          <linearGradient id="spark" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={stroke} stopOpacity={0.5} />
            <stop offset="100%" stopColor={stroke} stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid stroke="var(--border)" strokeDasharray="2 4" vertical={false} />
        <XAxis dataKey="idx" hide />
        <YAxis hide domain={["auto", "auto"]} />
        <Tooltip
          cursor={{ stroke: "var(--border)" }}
          contentStyle={{
            background: "var(--popover)",
            color: "var(--popover-foreground)",
            border: "1px solid var(--border)",
            borderRadius: 8,
            fontSize: 12,
          }}
          labelStyle={{ color: "var(--muted-foreground)" }}
        />
        <Area
          dataKey="value"
          type="monotone"
          stroke={stroke}
          strokeWidth={2}
          fill="url(#spark)"
          activeDot={false}
          isAnimationActive={false}
        />
      </AreaChart>
    </ResponsiveContainer>
  );
}
