"use client";

import * as React from "react";
import { flushSync } from "react-dom";
import { Send, Paperclip, StopCircle, Check, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { useChatModels } from "@/features/chat/hooks/useChat";
import { useDocuments } from "@/features/documents/hooks/useDocuments";
import { ChevronDown } from "lucide-react";

interface ChatInputProps {
  value: string;
  onChange: (v: string) => void;
  onSend: (text: string, sourceDocumentIds?: string[]) => void;
  onStop?: () => void;
  streaming?: boolean;
  placeholder?: string;
  isLoading?: boolean;
}

export function ChatInput({
  value,
  onChange,
  onSend,
  onStop,
  streaming,
  placeholder = "Ask anything about your sources…",
}: ChatInputProps) {
  const models = useChatModels();
  const { data: docsData } = useDocuments({ pageSize: 100 } as Record<string, unknown>);
  const docs = (docsData?.items ?? []) as Array<{ id: string; title: string; fileName?: string }>;
  const [model, setModel] = React.useState<string | null>(null);
  const [sourceIds, setSourceIds] = React.useState<string[]>([]);
  const [sourceQuery, setSourceQuery] = React.useState("");

  React.useEffect(() => {
    if (!model && models.data && models.data.length > 0) flushSync(() => setModel(models.data[0]!.id));
  }, [models.data, model]);

  const toggleSource = (id: string) =>
    setSourceIds((prev) => (prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]));

  const filteredDocs = sourceQuery
    ? docs.filter((d) => d.title.toLowerCase().includes(sourceQuery.toLowerCase()))
    : docs;

  function submit() {
    if (streaming) return;
    if (!value.trim()) return;
    onSend(value, sourceIds.length ? sourceIds : undefined);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      submit();
    }
  }

  return (
    <div className="rounded-xl border border-border bg-card shadow-sm">
      <Textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={onKeyDown}
        rows={3}
        placeholder={placeholder}
        className="resize-none border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
      />
      <div className="flex items-center gap-2 border-t border-border px-2 py-2">
        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <Paperclip className="h-4 w-4" />
              <span>{sourceIds.length ? `${sourceIds.length} source${sourceIds.length > 1 ? "s" : ""}` : "Sources"}</span>
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-80" align="start">
            <p className="mb-2 text-xs font-medium uppercase tracking-wider text-muted-foreground">
              Choose what to ground on
            </p>
            <div className="relative mb-2">
              <Search className="absolute left-2.5 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
              <Input
                className="pl-8 h-8"
                placeholder="Filter documents…"
                value={sourceQuery}
                onChange={(e) => setSourceQuery(e.target.value)}
              />
            </div>
            {docs.length === 0 ? (
              <p className="text-xs text-muted-foreground">No documents found. Upload documents first.</p>
            ) : (
              <ScrollArea className="max-h-56">
                <div className="space-y-0.5">
                  {filteredDocs.map((d) => {
                    const active = sourceIds.includes(d.id);
                    return (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => toggleSource(d.id)}
                        className={
                          "flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm hover:bg-accent " +
                          (active ? "bg-accent text-accent-foreground" : "")
                        }
                      >
                        <span
                          className={
                            "flex h-4 w-4 shrink-0 items-center justify-center rounded border " +
                            (active ? "bg-primary border-primary text-primary-foreground" : "border-border")
                          }
                        >
                          {active && <Check className="h-3 w-3" />}
                        </span>
                        <span className="line-clamp-1 flex-1">{d.title}</span>
                      </button>
                    );
                  })}
                  {filteredDocs.length === 0 && (
                    <p className="px-2 py-1 text-xs text-muted-foreground">No matches.</p>
                  )}
                </div>
              </ScrollArea>
            )}
            {sourceIds.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                className="mt-2 h-7 text-xs"
                onClick={() => setSourceIds([])}
              >
                Clear selection
              </Button>
            )}
          </PopoverContent>
        </Popover>

        <Popover>
          <PopoverTrigger asChild>
            <Button variant="ghost" size="sm" className="gap-1.5 text-xs">
              <span className="h-2 w-2 rounded-sm bg-primary" />
              {models.data?.find((m: any) => m.id === model)?.name ?? "Model"}
              <ChevronDown className="h-3 w-3 opacity-60" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-64" align="start">
            {models.data?.map((m: any) => (
              <button
                key={m.id}
                onClick={() => setModel(m.id)}
                className={
                  "flex w-full items-start gap-2 rounded-md px-3 py-2 text-sm hover:bg-accent " +
                  (model === m.id ? "bg-accent" : "")
                }
              >
                <span className="mt-1 h-2 w-2 rounded-sm bg-primary" />
                <span>
                  <span className="block font-medium">{m.name}</span>
                  <span className="block text-xs text-muted-foreground">{m.description}</span>
                </span>
              </button>
            ))}
          </PopoverContent>
        </Popover>

        <div className="flex-1" />
        {streaming ? (
          <Button size="sm" variant="destructive" onClick={onStop}>
            <StopCircle className="h-4 w-4" />
            Stop
          </Button>
        ) : (
          <Button size="sm" onClick={submit} disabled={!value.trim()}>
            <Send className="h-4 w-4" />
            Send
          </Button>
        )}
      </div>
    </div>
  );
}
