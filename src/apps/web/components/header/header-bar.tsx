"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import { ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import Link from "next/link";

const BREADCRUMB_LABELS: Record<string, string> = {
  dashboard: "Dashboard",
  projects: "Projects",
  collections: "Collections",
  documents: "Documents",
  upload: "Upload",
  chat: "Chat",
  history: "History",
  search: "Search",
  training: "Training",
  jobs: "Jobs",
  models: "Models",
  notifications: "Notifications",
  profile: "Profile",
  settings: "Settings",
  admin: "Admin",
  users: "Users",
  health: "Health",
  queues: "Queues",
  logs: "Logs",
  "ai-services": "AI services",
};

export function HeaderBar({
  children,
  onOpenPalette,
  rightSlotOpenHandler,
}: {
  children?: React.ReactNode;
  onOpenPalette: () => void;
  rightSlotOpenHandler?: () => void;
}) {
  const pathname = usePathname();
  const segments = pathname.split("/").filter(Boolean);

  return (
    <header className="sticky top-0 z-20 flex h-16 items-center gap-4 border-b border-border bg-background/85 px-3 backdrop-blur lg:px-6">
      <div className="flex min-w-0 flex-1 items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="hidden w-72 justify-between gap-2 text-muted-foreground lg:flex"
          onClick={onOpenPalette}
        >
          <span className="flex items-center gap-2">
            <span className="h-4 w-4 rounded-sm border border-muted-foreground/40 bg-muted" />
            Search or ask…
          </span>
          <kbd className="pointer-events-none inline-flex select-none items-center gap-1 rounded border border-border bg-muted px-1.5 text-[10px] font-medium text-muted-foreground">
            ⌘K
          </kbd>
        </Button>
        <Breadcrumbs segments={segments} />
      </div>
      <div className="flex items-center gap-2">
        {rightSlotOpenHandler && (
          <Button size="sm" variant="outline" className="lg:hidden" onClick={rightSlotOpenHandler}>
            Inspect
          </Button>
        )}
        {children}
      </div>
    </header>
  );
}

function Breadcrumbs({ segments }: { segments: string[] }) {
  return (
    <nav aria-label="Breadcrumb" className="hidden truncate text-sm text-muted-foreground md:flex">
      {segments.map((segment, idx) => (
        <span key={idx} className="flex items-center gap-1.5">
          {idx > 0 && <ChevronRight className="h-3.5 w-3.5 opacity-50" />}
          <Link
            href={"/" + segments.slice(0, idx + 1).join("/")}
            className={cn(
              "rounded px-1 capitalize hover:text-foreground",
              idx === segments.length - 1 && "font-medium text-foreground"
            )}
          >
            {BREADCRUMB_LABELS[segment] ?? decodeURIComponent(segment)}
          </Link>
        </span>
      ))}
    </nav>
  );
}
