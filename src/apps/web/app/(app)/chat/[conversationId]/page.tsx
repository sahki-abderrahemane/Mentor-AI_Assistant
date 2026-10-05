"use client";

import * as React from "react";
import { useConversation, useStreamMessage } from "@/features/chat/hooks/useChat";
import { useRightPanel } from "@/providers/right-panel-provider";
import { ChatMessageComponent } from "@/components/chat/chat-message";
import { ChatInput } from "@/components/chat/chat-input";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { ArrowLeft, MessageSquare, Square } from "lucide-react";
import Link from "next/link";
import { useQueryClient } from "@tanstack/react-query";
import type { MockConversation, MockMessage } from "@/mock/chat/data";

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  return <ConversationAsync params={params} />;
}

function ConversationAsync({ params }: { params: Promise<{ conversationId: string }> }) {
  const { conversationId } = React.use(params);
  const { data: conv, isLoading } = useConversation(conversationId);
  const qc = useQueryClient();
  const [inputValue, setInputValue] = React.useState("");
  const [streamingContent, setStreamingContent] = React.useState("");
  const [streamingCitations, setStreamingCitations] = React.useState<MockConversation["messages"][0]["citations"]>([]);
  const [isStreaming, setIsStreaming] = React.useState(false);
  const streamingAbortRef = React.useRef<{ aborted: boolean }>({ aborted: false });
  const streamingCancelRef = React.useRef<(() => void) | null>(null);
  const { set: setRightPanel } = useRightPanel();

  const stream = useStreamMessage();

  function handleStop() {
    streamingAbortRef.current.aborted = true;
    streamingCancelRef.current?.();
    setIsStreaming(false);
  }

  async function handleSend(text: string, sourceDocumentIds?: string[]) {
    if (!text.trim() || isStreaming) return;

    streamingAbortRef.current.aborted = false;
    streamingCancelRef.current?.();

    let cancelForSend: (() => void) | null = null;

    const userMsg: MockMessage = {
      id: `msg_opt_${Date.now()}`,
      conversationId,
      role: "user",
      content: text,
      createdAt: new Date().toISOString(),
    };

    setStreamingContent("");
    setStreamingCitations([]);
    setIsStreaming(true);
    setInputValue("");

    qc.setQueryData(
      ["chat", "conv", conversationId],
      (old: MockConversation | undefined) => {
        if (!old) return old;
        return { ...old, messages: [...old.messages, userMsg] };
      }
    );

    try {
      await stream.mutateAsync({
        input: { conversationId, content: text, ...(sourceDocumentIds?.length ? { documentIds: sourceDocumentIds } : {}) },
        options: {
          signal: streamingAbortRef.current,
          onReady: ({ cancel }) => {
            streamingCancelRef.current = cancel;
            cancelForSend = cancel;
          },
          onDelta: (delta) => {
            setStreamingContent((prev) => prev + delta);
          },
          onComplete: (citations) => {
            setStreamingCitations(citations ?? []);
          },
        },
      });

      qc.invalidateQueries({ queryKey: ["chat", "conv", conversationId] });
    } finally {
      if (streamingCancelRef.current === cancelForSend) streamingCancelRef.current = null;
      setIsStreaming(false);
      setStreamingContent("");
      setStreamingCitations([]);
    }
  }

  if (isLoading) return (
    <div className="flex h-full flex-col gap-4 p-6">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-32 w-full" />
      <Skeleton className="h-32 w-full" />
    </div>
  );

  if (!conv) return (
    <div className="flex h-full items-center justify-center">
      <div className="text-center">
        <p className="text-lg font-semibold">Conversation not found</p>
        <Button asChild className="mt-4"><Link href="/chat">Back to chat list</Link></Button>
      </div>
    </div>
  );
  const allMessages = [
    ...conv?.messages,
    ...(isStreaming
      ? [{
          id: "streaming-msg",
          conversationId,
          role: "assistant" as const,
          content: streamingContent,
          citations: streamingCitations,
          createdAt: new Date().toISOString(),
          isStreaming: true,
        }]
      : []),
  ];

  return (
    <div className="flex h-full flex-col">
      <div className="flex items-center justify-between border-b px-6 py-3">
        <div className="flex items-center gap-3">
          <Button size="icon" variant="ghost" asChild>
            <Link href="/chat"><ArrowLeft className="h-4 w-4" /></Link>
          </Button>
          <div>
            <p className="font-semibold">{conv.title}</p>
            <p className="text-xs text-muted-foreground">{conv.messageCount} messages</p>
          </div>
        </div>
        <div className="flex items-center gap-1">
          {isStreaming && (
            <Button
              size="icon"
              variant="ghost"
              onClick={handleStop}
              title="Stop generating"
            >
              <Square className="h-4 w-4" />
            </Button>
          )}
          <Button size="icon" variant="ghost" onClick={() => setRightPanel({ key: "context", render: () => (
            <div className="space-y-3 p-4">
              <p className="font-semibold">Context</p>
              <p className="text-sm text-muted-foreground">Project: {conv.projectId ?? "None"}</p>
              <p className="text-sm text-muted-foreground">Messages: {conv.messageCount}</p>
            </div>
          ) })}>
            <MessageSquare className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-4">
        {allMessages.map((msg) => (
          <ChatMessageComponent
            key={msg.id}
            id={msg.id}
            role={msg.role}
            content={msg.content}
            citations={msg.citations}
            isStreaming={msg.isStreaming}
            onStop={msg.isStreaming ? handleStop : undefined}
          />
        ))}
        {conv.messages.length === 0 && !isStreaming && (
          <div className="flex h-full flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10">
              <MessageSquare className="h-7 w-7 text-primary" />
            </div>
            <p className="text-lg font-semibold">Start a conversation</p>
            <p className="mt-1 text-sm text-muted-foreground">Ask questions about your documents, projects, or anything else.</p>
          </div>
        )}
      </div>

      <div className="border-t p-4">
        <ChatInput
          value={inputValue}
          onChange={setInputValue}
          onSend={handleSend}
          onStop={handleStop}
          streaming={isStreaming}
          isLoading={isStreaming}
        />
      </div>
    </div>
  );
}