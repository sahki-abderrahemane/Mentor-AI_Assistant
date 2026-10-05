"use client";

import * as React from "react";
import type { LucideIcon } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { cn, formatNumber } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value?: number | string;
  /** Optional helper text shown beneath the value */
  hint?: string;
  icon?: LucideIcon;
  /** Tailwind class for the gradient/sparkle accent */
  accent?: string;
  trend?: number;
  loading?: boolean;
  suffix?: string;
}

export function StatCard({
  label,
  value,
  hint,
  icon: Icon,
  accent = "from-primary/15 via-primary/5",
  trend,
  loading,
  suffix,
}: StatCardProps) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="relative p-5">
        <div
          className={cn(
            "pointer-events-none absolute -right-12 -top-12 h-32 w-32 rounded-full bg-gradient-to-br to-transparent opacity-60 blur-2xl",
            accent
          )}
        />
        <div className="flex items-start justify-between">
          <div className="space-y-1">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{label}</p>
            {loading || value === undefined ? (
              <Skeleton className="h-8 w-24" />
            ) : (
              <p className="text-3xl font-semibold tabular-nums">
                {typeof value === "number" ? formatNumber(value) : value}
                {suffix && <span className="ml-1 text-base font-normal text-muted-foreground">{suffix}</span>}
              </p>
            )}
            {hint && !loading && <p className="text-xs text-muted-foreground">{hint}</p>}
            {typeof trend === "number" && (
              <p
                className={cn(
                  "text-xs",
                  trend >= 0 ? "text-emerald-500" : "text-red-500"
                )}
              >
                {trend >= 0 ? "▲" : "▼"} {Math.abs(trend).toFixed(1)}%
              </p>
            )}
          </div>
          {Icon && (
            <div className="flex h-9 w-9 items-center justify-center rounded-md bg-muted text-muted-foreground">
              <Icon className="h-4 w-4" />
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
