"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { useCreateConversation } from "@/features/chat/hooks/useChat";

export default function NewChatPage() {
  const router = useRouter();
  const create = useCreateConversation();

  React.useEffect(() => {
    create.mutateAsync({ title: "New conversation" }).then((conv) => {
      router.push(`/chat/${conv.id}`);
    });
  }, []);

  return (
    <div className="flex h-full items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        <p className="text-sm text-muted-foreground">Creating conversation…</p>
      </div>
    </div>
  );
}