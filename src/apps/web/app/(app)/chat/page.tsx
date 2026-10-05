"use client";

import { useConversations } from "@/features/chat/hooks/useChat";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { MessageSquare, Plus, Star, Trash2 } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import Link from "next/link";
import { useDeleteConversation } from "@/features/chat/hooks/useChat";
import { toast } from "sonner";
import { useState } from "react";

export default function ChatListPage() {
  const { data, isLoading } = useConversations({ pageSize: 50 } as Record<string, unknown>);
  const remove = useDeleteConversation();

  async function handleDelete(id: string) {
    try {
      await remove.mutateAsync(id);
      toast.success("Conversation deleted");
    } catch { toast.error("Failed to delete"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Ask Mentor AI</h1>
          <p className="text-sm text-muted-foreground">Ask questions across your documents and knowledge base.</p>
        </div>
        <Button asChild><Link href="/chat/new"><Plus className="h-4 w-4" /> New chat</Link></Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items ?? []).map((conv: any) => (
            <div key={conv.id} className="group relative">
              <Link href={`/chat/${conv.id}`}>
                <Card className="transition hover:border-primary/40">
                  <CardContent className="flex items-center justify-between p-4">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10"><MessageSquare className="h-4 w-4 text-primary" /></div>
                      <div>
                        <p className="font-medium">{conv.title}</p>
                        <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })} · {conv.messageCount} messages</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1">
                      {conv.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                      <Button size="icon" variant="ghost" className="opacity-0 group-hover:opacity-100 transition" onClick={(e) => { e.preventDefault(); handleDelete(conv.id); }}><Trash2 className="h-4 w-4" /></Button>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            </div>
          ))}
          {data?.items?.length === 0 && <p className="text-center py-12 text-muted-foreground">No conversations yet. Start a new chat!</p>}
        </div>
      )}
    </div>
  );
}