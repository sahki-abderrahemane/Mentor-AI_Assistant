"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Bot, User2 } from "lucide-react";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { ChatCitation } from "@/services";
import { MarkdownRenderer } from "./markdown-renderer";
import { CitationCard } from "./citation-card";
import { Button } from "@/components/ui/button";
import { Copy, RefreshCw, Play, Square } from "lucide-react";
import { toast } from "sonner";
import { TypingIndicator } from "./typing-indicator";
import { copyToClipboard } from "@/lib/utils";

interface ChatMessageProps {
  id: string;
  role: "user" | "assistant" | "system";
  content: string;
  citations?: ChatCitation[];
  isStreaming?: boolean;
  onRegenerate?: () => void;
  onStop?: () => void;
  onContinue?: () => void;
  onCitationClick?: (citation: ChatCitation) => void;
}

export function ChatMessageComponent(props: ChatMessageProps) {
  const user = useCurrentUser();
  const isUser = props.role === "user";
  return (
    <div className="flex items-start gap-3">
      <Avatar className="h-8 w-8 shrink-0">
        {isUser ? (
          <>
            <AvatarImage src={user.data?.avatarUrl} alt={user.data?.name} />
            <AvatarFallback>
              <User2 className="h-4 w-4" />
            </AvatarFallback>
          </>
        ) : (
          <AvatarFallback className="bg-primary/15 text-primary">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        )}
      </Avatar>
      <div className="min-w-0 flex-1 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            {isUser ? user.data?.name ?? "You" : "MentorAI"}
          </p>
          <div className="flex items-center gap-1">
            {!isUser && !props.isStreaming && (
              <>
                <Button
                  size="icon"
                  variant="ghost"
                  className="h-7 w-7"
                  onClick={async () => {
                    await copyToClipboard(props.content);
                    toast.success("Copied to clipboard");
                  }}
                  aria-label="Copy message"
                >
                  <Copy className="h-3.5 w-3.5" />
                </Button>
                {props.onRegenerate && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={props.onRegenerate} aria-label="Regenerate">
                    <RefreshCw className="h-3.5 w-3.5" />
                  </Button>
                )}
                {props.onContinue && (
                  <Button size="icon" variant="ghost" className="h-7 w-7" onClick={props.onContinue} aria-label="Continue">
                    <Play className="h-3.5 w-3.5" />
                  </Button>
                )}
              </>
            )}
            {props.isStreaming && props.onStop && (
              <Button size="icon" variant="ghost" className="h-7 w-7" onClick={props.onStop} aria-label="Stop generation">
                <Square className="h-3.5 w-3.5" />
              </Button>
            )}
          </div>
        </div>

        <div
          className={
            isUser
              ? "rounded-2xl rounded-tl-md bg-primary px-4 py-3 text-sm text-primary-foreground"
              : "rounded-2xl rounded-tl-md border border-border bg-card px-4 py-3 text-card-foreground"
          }
        >
          {props.isStreaming && props.content.length === 0 ? (
            <TypingIndicator />
          ) : (
            <MarkdownRenderer content={props.content} />
          )}
        </div>

        {!isUser && props.citations && props.citations.length > 0 && (
          <div className="grid grid-cols-1 gap-2 sm:grid-cols-2">
            {props.citations.map((c, i) => (
              <CitationCard
                key={c.id}
                number={i + 1}
                citation={c}
                onOpen={() => props.onCitationClick?.(c)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
