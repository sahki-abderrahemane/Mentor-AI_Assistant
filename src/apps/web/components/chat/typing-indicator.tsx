"use client";

import { Loader2 } from "lucide-react";

export function TypingIndicator() {
  return (
    <div className="flex items-center gap-2 text-xs text-muted-foreground">
      <span className="flex items-center gap-1">
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "0ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "120ms" }} />
        <span className="h-2 w-2 animate-bounce rounded-full bg-muted-foreground/60" style={{ animationDelay: "240ms" }} />
      </span>
      <span className="inline-flex items-center gap-1">
        <Loader2 className="h-3 w-3 animate-spin" />
        Streaming answer…
      </span>
    </div>
  );
}
