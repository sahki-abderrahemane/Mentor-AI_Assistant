"use client";

import { TooltipProvider as RadixTooltipProvider } from "@radix-ui/react-tooltip";
import type { ReactNode } from "react";

export function TooltipProvider({ children }: { children: ReactNode }) {
  return (
    <RadixTooltipProvider delayDuration={150} skipDelayDuration={300}>
      {children}
    </RadixTooltipProvider>
  );
}
