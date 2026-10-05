"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { MessageSquare, Plus, Star } from "lucide-react";
import { useConversationFolders, useConversations, useCreateConversation } from "@/features/chat/hooks/useChat";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import type { MockConversation, MockConversationFolder } from "@/mock/chat/data";
import { useRouter } from "next/navigation";

export function ConversationList() {
  const pathname = usePathname();
  const router = useRouter();
  const folders = useConversationFolders();
  const list = useConversations({ pageSize: 12 } as { pageSize: number });
  const create = useCreateConversation();

  async function newConversation() {
    const conv = await create.mutateAsync({ title: "New conversation" });
    router.push(`/chat/${conv.id}`);
  }

  return (
    <div className="space-y-3">
      <Button
        variant="outline"
        size="sm"
        className="w-full justify-start gap-2"
        onClick={newConversation}
      >
        <Plus className="h-4 w-4" /> New chat
      </Button>

      {list.isLoading || folders.isLoading ? (
        <div className="space-y-2 px-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="h-7 w-full" />
          ))}
        </div>
      ) : (
        (folders.data ?? []).map((folder: MockConversationFolder) => (
          <div key={folder.id} className="space-y-1">
            <p className="px-3 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              {folder.name}
            </p>
            {(list.data?.items ?? [])
              .filter((c: MockConversation) => c.folder === folder.name)
              .slice(0, 5)
              .map((conv: MockConversation) => {
                const active = pathname === `/chat/${conv.id}`;
                return (
                  <Link
                    key={conv.id}
                    href={`/chat/${conv.id}`}
                    className={cn(
                      "flex items-center gap-2 rounded-md px-3 py-1.5 text-sm hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
                      active && "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                    )}
                  >
                    <MessageSquare className="h-3.5 w-3.5 shrink-0 text-muted-foreground" />
                    <span className="flex-1 truncate">{conv.title}</span>
                    {conv.starred && <Star className="h-3 w-3 fill-amber-400 text-amber-400" />}
                  </Link>
                );
              })}
          </div>
        ))
      )}
    </div>
  );
}