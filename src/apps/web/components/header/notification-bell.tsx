"use client";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { initials } from "@/lib/utils";
import Link from "next/link";
import { formatDistanceToNow } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

export function NotificationBell() {
  const { list, unreadCount } = useNotifications({ pageSize: 6 } as { pageSize: number });
  const unread = unreadCount.data ?? 0;
  const items = list.data?.items ?? [];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="icon" className="relative" aria-label="Notifications">
          <Bell className="h-4 w-4" />
          {unread > 0 && (
            <Badge
              variant="destructive"
              className="absolute -right-0.5 -top-0.5 h-4 min-w-[16px] justify-center px-1 text-[10px]"
            >
              {unread > 99 ? "99+" : unread}
            </Badge>
          )}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-80">
        <DropdownMenuLabel className="flex flex-row items-center justify-between">
          <span>Notifications</span>
          <Link href="/notifications" className="text-xs text-primary hover:underline">
            View all
          </Link>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {items.length === 0 && (
          <p className="p-4 text-sm text-muted-foreground">You&apos;re all caught up.</p>
        )}
        {items.slice(0, 6).map((n: any) => (
          <DropdownMenuItem key={n.id} className="flex items-start gap-3">
            <Avatar className="h-8 w-8">
              <AvatarImage src={n.actorAvatarUrl ?? undefined} />
              <AvatarFallback>{initials(n.actorName ?? "MentorAI")}</AvatarFallback>
            </Avatar>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{n.title}</p>
              <p className="mt-0.5 line-clamp-2 text-xs text-muted-foreground">{n.message}</p>
              <p className="mt-1 text-[10px] text-muted-foreground">
                {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
              </p>
            </div>
            {!n.read && <span className="mt-2 h-2 w-2 shrink-0 rounded-full bg-primary" />}
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
