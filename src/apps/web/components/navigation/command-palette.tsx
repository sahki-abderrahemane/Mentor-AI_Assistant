"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  Layers,
  FolderKanban,
  MessagesSquare,
  Sparkles,
  Library,
  Bot,
  ShieldCheck,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

interface CommandPaletteProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}

interface Item {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  keywords?: string[];
  group: string;
}

const items: Item[] = [
  { label: "Dashboard", href: "/dashboard", icon: Sparkles, group: "Pages" },
  { label: "Chat", href: "/chat", icon: MessagesSquare, group: "Pages" },
  { label: "Documents", href: "/documents", icon: Library, group: "Pages" },
  { label: "Projects", href: "/projects", icon: FolderKanban, group: "Pages" },
  { label: "Collections", href: "/collections", icon: Layers, group: "Pages" },
  { label: "Search", href: "/search", icon: Search, group: "Pages" },
  { label: "Training", href: "/training", icon: Bot, group: "Pages" },
  { label: "Models", href: "/models", icon: Bot, group: "Pages" },
  { label: "Admin", href: "/admin", icon: ShieldCheck, keywords: ["admin"], group: "Pages" },
  { label: "Notifications", href: "/notifications", icon: Layers, group: "Pages" },
  { label: "Settings", href: "/settings", icon: Sparkles, group: "Pages" },
];

export function CommandPalette({ open, onOpenChange }: CommandPaletteProps) {
  const router = useRouter();
  const [query, setQuery] = React.useState("");
  const [activeIdx, setActiveIdx] = React.useState(0);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return items;
    return items.filter(
      (i) =>
        i.label.toLowerCase().includes(q) ||
        i.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  }, [query]);

  React.useEffect(() => {
    flushSync(() => setActiveIdx(0));
  }, [query, open]);

  function go(href: string) {
    onOpenChange(false);
    setQuery("");
    router.push(href);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActiveIdx((i) => Math.min(filtered.length - 1, i + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActiveIdx((i) => Math.max(0, i - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const target = filtered[activeIdx];
      if (target) go(target.href);
    } else if (e.key === "Escape") {
      onOpenChange(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl gap-0 p-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Command palette</DialogTitle>
        </DialogHeader>
        <div className="flex items-center gap-2 border-b border-border px-4 py-3">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search pages, conversations, documents…"
            className="h-8 border-0 px-0 focus-visible:ring-0 focus-visible:ring-offset-0"
          />
          <kbd className="rounded border border-border bg-muted px-1.5 text-[10px] text-muted-foreground">ESC</kbd>
        </div>
        <ul className="max-h-80 overflow-y-auto p-2">
          {filtered.length === 0 && (
            <li className="p-4 text-sm text-muted-foreground">No results.</li>
          )}
          {filtered.map((item, idx) => (
            <li key={item.href}>
              <button
                type="button"
                onClick={() => go(item.href)}
                onMouseEnter={() => setActiveIdx(idx)}
                className={cn(
                  "flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm",
                  activeIdx === idx ? "bg-accent text-accent-foreground" : "hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <item.icon className="h-4 w-4" />
                <span className="flex-1 text-left">{item.label}</span>
                <span className="text-xs text-muted-foreground">{item.group}</span>
              </button>
            </li>
          ))}
        </ul>
      </DialogContent>
    </Dialog>
  );
}
