"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  Brain,
  Settings2,
  ChevronsLeftRight,
  ShieldCheck,
  Home,
  Library,
  FolderKanban,
  MessagesSquare,
  Bot,
  Sparkles,
  Target,
  Layers,
  BookOpen,
  BarChart3,
  TrendingUp,
  Search as SearchIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useUIStore } from "@/stores/ui.store";
import { useAuthStore } from "@/stores/auth.store";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { ConversationList } from "./conversation-list";
import { ProjectList } from "./project-list";
import { CollectionList } from "./collection-list";
import { SidebarUserFooter } from "./sidebar-user-footer";

interface NavItem {
  href: string;
  label: string;
  icon: React.ElementType;
}

const learnNavItems: NavItem[] = [
  { href: "/dashboard", label: "Home", icon: Home },
  { href: "/documents", label: "Sources", icon: Library },
  { href: "/chat", label: "Ask Mentor", icon: MessagesSquare },
  { href: "/quizzes", label: "Quizzes", icon: Target },
  { href: "/flashcards", label: "Flashcards", icon: Brain },
  { href: "/study-guides", label: "Study Guides", icon: BookOpen },
  { href: "/progress", label: "Progress", icon: BarChart3 },
];

const systemNavItems: NavItem[] = [
  { href: "/training", label: "Training", icon: Bot },
  { href: "/models", label: "Models", icon: Sparkles },
  { href: "/admin/users", label: "Admin", icon: ShieldCheck },
  { href: "/admin/learning-analytics", label: "Learning Analytics", icon: TrendingUp },
];

function SearchItem(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
      <circle cx="11" cy="11" r="7" />
      <path d="m21 21-4.3-4.3" />
    </svg>
  );
}

export function Sidebar({ collapsed }: { collapsed: boolean }) {
  const pathname = usePathname();
  const toggle = useUIStore((s) => s.toggleSidebar);
  const user = useAuthStore((s) => s.user);

  function NavItemLink({ item }: { item: NavItem }) {
    const active = pathname === item.href || pathname.startsWith(item.href + "/");
    const content = (
      <Link
        href={item.href}
        className={cn(
          "flex h-9 items-center gap-3 rounded-md px-3 text-sm transition-colors hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
          active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground",
          collapsed && "justify-center px-0"
        )}
      >
        <item.icon className="h-4 w-4 shrink-0" />
        {!collapsed && <span className="truncate">{item.label}</span>}
      </Link>
    );

    if (collapsed) {
      return (
        <Tooltip>
          <TooltipTrigger asChild>{content}</TooltipTrigger>
          <TooltipContent side="right">{item.label}</TooltipContent>
        </Tooltip>
      );
    }
    return content;
  }

  return (
    <div className="flex h-full flex-col">
      <div className="flex h-16 items-center gap-2 border-b border-sidebar-border px-4">
        <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <Sparkles className="h-4 w-4" />
        </span>
        {!collapsed && (
          <div className="flex flex-col leading-tight">
            <span className="text-sm font-semibold">MentorAI</span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        )}
        <button
          onClick={toggle}
          className="ml-auto rounded-md p-1.5 text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          <ChevronsLeftRight className={cn("h-4 w-4 transition-transform", collapsed && "rotate-180")} />
        </button>
      </div>

      <ScrollArea className="flex-1">
        <nav className="px-2 py-3">
          {/* LEARN section */}
          <div className="mb-1">
            {!collapsed && (
              <p className="mx-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                Learn
              </p>
            )}
            <div className="flex flex-col gap-0.5">
              {learnNavItems.map((item) => (
                <div key={item.href}>
                  <NavItemLink item={item} />
                </div>
              ))}
            </div>
          </div>

          {/* SYSTEM section — admin only */}
          {user?.role === "admin" && (
            <>
              <Separator className="my-3" />
              <div className="mb-1">
                {!collapsed && (
                  <p className="mx-3 mb-2 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    System
                  </p>
                )}
                <div className="flex flex-col gap-0.5">
                  {systemNavItems.map((item) => (
                    <div key={item.href}>
                      <NavItemLink item={item} />
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {!collapsed && (
            <>
              <Separator className="my-3" />
              <NavLabel>Recent</NavLabel>
              <ConversationList />
              <Separator className="my-3" />
              <NavLabel>Projects</NavLabel>
              <ProjectList />
              <Separator className="my-3" />
              <NavLabel>Collections</NavLabel>
              <CollectionList />
            </>
          )}
        </nav>
      </ScrollArea>

      <div className="border-t border-sidebar-border p-3">
        <Link
          href="/settings"
          className="mb-2 flex items-center gap-2 rounded-md px-3 py-2 text-sm text-muted-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        >
          <Settings2 className="h-4 w-4" />
          {!collapsed && <span>Settings</span>}
        </Link>
        <SidebarUserFooter collapsed={collapsed} />
      </div>
    </div>
  );
}

function NavLabel({ children }: { children: React.ReactNode }) {
  return <p className="mx-3 mb-2 mt-2 text-[11px] font-medium uppercase tracking-wider text-muted-foreground">{children}</p>;
}