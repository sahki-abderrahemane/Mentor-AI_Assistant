"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { chatService } from "@/services";
import { useChatStore } from "@/stores/chat.store";
import type { MockCitation, MockConversation, MockMessage } from "@/mock/chat/data";
import type { SendMessageInput } from "@/types";

export const chatKeys = {
  conversations: ["chat", "conversations"] as const,
  conversation: (id: string) => ["chat", "conv", id] as const,
  folders: ["chat", "folders"] as const,
  models: ["chat", "models"] as const,
};

export function useConversations(params?: Parameters<typeof chatService.listConversations>[0]) {
  return useQuery({
    queryKey: [...chatKeys.conversations, params ?? {}],
    queryFn: () => chatService.listConversations(params ?? {}),
  });
}

export function useConversation(id: string) {
  return useQuery({
    queryKey: chatKeys.conversation(id),
    queryFn: () => chatService.getConversation(id),
    enabled: Boolean(id),
  });
}

export function useConversationFolders() {
  return useQuery({
    queryKey: chatKeys.folders,
    queryFn: () => chatService.listFolders(),
  });
}

export function useChatModels() {
  return useQuery({
    queryKey: chatKeys.models,
    queryFn: () => chatService.listModels(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input?: Parameters<typeof chatService.createConversation>[0]) =>
      chatService.createConversation(input ?? {}),
    onSuccess: (conv) => {
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
      useChatStore.getState().setActiveConversation(conv.id);
    },
  });
}

export function useDeleteConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => chatService.deleteConversation(id),
    onSuccess: () => qc.invalidateQueries({ queryKey: chatKeys.conversations }),
  });
}

export function useUpdateConversation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, patch }: { id: string; patch: Parameters<typeof chatService.updateConversation>[1] }) =>
      chatService.updateConversation(id, patch),
    onSuccess: (_data, { id }) => {
      qc.invalidateQueries({ queryKey: chatKeys.conversations });
      qc.invalidateQueries({ queryKey: chatKeys.conversation(id) });
    },
  });
}

export interface SendStreamOptions {
  onDelta?: (delta: string) => void;
  onComplete?: (citations: MockCitation[]) => void;
  signal?: { aborted: boolean };
  onAssistantSaved?: (message: unknown) => void;
  onReady?: (ctx: { cancel: () => void }) => void;
}

export function useStreamMessage() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({
      input,
      options,
    }: {
      input: SendMessageInput;
      options?: SendStreamOptions;
    }) => {
      const buffer: string[] = [];
      const citations: MockCitation[] = [];
      const localSignal = { aborted: false };
      const signal = options?.signal ?? localSignal;
      const { promise, cancel } = chatService.streamMessage(input, {
        signal,
        onDelta: (d) => {
          if (d.delta) {
            buffer.push(d.delta);
            options?.onDelta?.(d.delta);
          }
          if (d.citations) {
            citations.length = 0;
            citations.push(...d.citations);
          }
          if (d.done) {
            options?.onComplete?.(citations);
          }
        },
        onAssistantSaved: (message) => {
          options?.onAssistantSaved?.(message);
          qc.setQueryData(chatKeys.conversation(input.conversationId), (old: MockConversation | undefined) => {
            if (!old) return old;
            const saved = message as Partial<MockMessage>;
            const existing = (old.messages ?? []).some(
              (m) =>
                m.role === "assistant" &&
                saved.content !== undefined &&
                m.content === saved.content
            );
            if (existing) return old;
            return { ...old, messages: [...(old.messages ?? []), message as MockMessage] };
          });
        },
      });
      options?.onReady?.({ cancel });
      await promise;
      return { text: buffer.join(""), citations };
    },
    onSuccess: (_data, { input }) => {
      qc.invalidateQueries({ queryKey: chatKeys.conversation(input.conversationId) });
    },
  });
}

export function useStopStreaming() {
  return () => useChatStore.getState().requestStop();
}
