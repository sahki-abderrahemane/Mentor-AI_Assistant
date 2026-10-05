"use client";

import { useConversations } from "@/features/chat/hooks/useChat";
import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";
import { MessageSquare, Star } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import Link from "next/link";

export default function ChatHistoryPage() {
  const { data, isLoading } = useConversations({ pageSize: 100 } as Record<string, unknown>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Chat history</h1>
        <p className="text-sm text-muted-foreground">All your conversations, most recent first.</p>
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 10 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items ?? []).map((conv: any) => (
            <Link key={conv.id} href={`/chat/${conv.id}`}>
              <Card className="transition hover:border-primary/40">
                <CardContent className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-9 w-9 items-center justify-center rounded-md bg-primary/10">
                      <MessageSquare className="h-4 w-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-medium">{conv.title}</p>
                      <p className="text-xs text-muted-foreground">{formatDistanceToNow(new Date(conv.updatedAt), { addSuffix: true })}</p>
                    </div>
                  </div>
                  {conv.starred && <Star className="h-4 w-4 fill-amber-400 text-amber-400" />}
                </CardContent>
              </Card>
            </Link>
          ))}
          {data?.items?.length === 0 && <p className="text-center py-12 text-muted-foreground">No chat history yet.</p>}
        </div>
      )}
    </div>
  );
}