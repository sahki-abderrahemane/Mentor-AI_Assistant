"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { flushSync } from "react-dom";
import { motion } from "framer-motion";
import { Menu, Sparkles, Command as CommandIcon, Search, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { useRightPanel } from "@/providers/right-panel-provider";
import { Sidebar } from "@/components/sidebar/sidebar";
import { HeaderBar } from "@/components/header/header-bar";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { CommandPalette } from "@/components/navigation/command-palette";
import { ThemeToggle } from "@/components/header/theme-toggle";
import { UserMenu } from "@/components/header/user-menu";
import { NotificationBell } from "@/components/header/notification-bell";

const rightPanelWidth: Record<string, string> = {
  sm: "w-72",
  md: "w-96",
  lg: "w-[32rem]",
  xl: "w-[40rem]",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const sidebarCollapsed = useUIStore((s) => s.sidebarCollapsed);
  const toggleSidebar = useUIStore((s) => s.toggleSidebar);
  const mobileOpen = useUIStore((s) => s.mobileSidebarOpen);
  const setMobile = useUIStore((s) => s.setMobileSidebarOpen);
  const [paletteOpen, setPaletteOpen] = React.useState(false);
  const [mobileRightOpen, setMobileRightOpen] = React.useState(false);
  const rp = useRightPanel();

  React.useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setPaletteOpen((v) => !v);
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "b") {
        e.preventDefault();
        toggleSidebar();
      }
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === ".") {
        e.preventDefault();
        if (rp.content) rp.toggle();
      }
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [toggleSidebar, rp]);

  React.useEffect(() => {
    setMobile(false);
  }, [pathname, setMobile]);

  const isMobile = useMediaQuery("(max-width: 1023px)");

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Desktop sidebar */}
      {!isMobile && (
        <aside
          className={cn(
            "sticky top-0 z-30 hidden h-screen shrink-0 border-r border-border bg-sidebar text-sidebar-foreground transition-[width] duration-200 lg:block",
            sidebarCollapsed ? "w-[72px]" : "w-72"
          )}
        >
          <Sidebar collapsed={sidebarCollapsed} />
        </aside>
      )}

      {/* Mobile sidebar */}
      {isMobile && (
        <Sheet open={mobileOpen} onOpenChange={setMobile}>
          <SheetTrigger asChild>
            <Button
              size="icon"
              variant="ghost"
              className="fixed left-3 top-3 z-40 lg:hidden"
              aria-label="Open menu"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </SheetTrigger>
          <SheetContent side="left" className="w-72 p-0">
            <Sidebar collapsed={false} />
          </SheetContent>
        </Sheet>
      )}

      {/* Main content area */}
      <div className="flex min-w-0 flex-1 flex-col">
        <HeaderBar
          onOpenPalette={() => setPaletteOpen(true)}
          rightSlotOpenHandler={
            isMobile ? () => setMobileRightOpen(true) : undefined
          }
        >
          <div className="flex items-center gap-2">
            <Button variant="ghost" size="icon" onClick={() => setPaletteOpen(true)} aria-label="Search">
              <Search className="h-4 w-4" />
            </Button>
            <NotificationBell />
            <ThemeToggle />
            <UserMenu />
          </div>
        </HeaderBar>
        <main className="flex-1 overflow-y-auto px-3 py-4 lg:px-6 lg:py-6">
          <motion.div
            key={pathname}
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            {children}
          </motion.div>
        </main>
      </div>

      {/* Desktop right panel */}
      {!isMobile && rp.open && rp.content && (
        <aside
          className={cn(
            "sticky top-0 z-20 hidden h-screen shrink-0 border-l border-border bg-background lg:block",
            rightPanelWidth[rp.content.width ?? "md"] ?? "w-96"
          )}
        >
          <RightPanelContent />
        </aside>
      )}

      {/* Mobile right panel sheet */}
      {isMobile && <RightPanelMobileSheet open={mobileRightOpen} onOpenChange={setMobileRightOpen} />}

      <CommandPalette open={paletteOpen} onOpenChange={setPaletteOpen} />
    </div>
  );
}

function RightPanelContent() {
  const rp = useRightPanel();
  const content = rp.content;

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-4 py-3">
        <div className="min-w-0 flex-1">
          {content?.title && (
            <p className="truncate text-sm font-semibold">{content.title}</p>
          )}
          {content?.description && (
            <p className="truncate text-xs text-muted-foreground">{content.description}</p>
          )}
        </div>
        <Button size="icon" variant="ghost" className="ml-2 shrink-0" onClick={() => rp.hide()}>
          <X className="h-4 w-4" />
        </Button>
      </div>
      <ScrollArea className="flex-1">
        <div className="p-4">{content?.render?.()}</div>
      </ScrollArea>
    </div>
  );
}

function RightPanelMobileSheet({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
}) {
  const rp = useRightPanel();

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full sm:max-w-md">
        {rp.content ? (
          <div className="flex h-full flex-col">
            <div className="flex items-center justify-between border-b px-4 py-3">
              <div className="min-w-0 flex-1">
                {rp.content.title && (
                  <p className="truncate text-sm font-semibold">{rp.content.title}</p>
                )}
              </div>
              <Button size="icon" variant="ghost" className="ml-2 shrink-0" onClick={() => rp.hide()}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            <ScrollArea className="flex-1">
              <div className="p-4">{rp.content.render?.()}</div>
            </ScrollArea>
          </div>
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            Open a document or chat to inspect sources.
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

function useMediaQuery(query: string) {
  const [matches, setMatches] = React.useState(() => {
    if (typeof window === "undefined") return false;
    return window.matchMedia(query).matches;
  });
  React.useEffect(() => {
    const m = window.matchMedia(query);
    flushSync(() => setMatches(m.matches));
    const handler = (e: MediaQueryListEvent) => flushSync(() => setMatches(e.matches));
    m.addEventListener("change", handler);
    return () => m.removeEventListener("change", handler);
  }, [query]);
  return matches;
}

// Mark as used
void Link;
void Sparkles;
void CommandIcon;