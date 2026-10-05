import * as usersHandlers from "@/mock/users/handlers";
import * as projectsHandlers from "@/mock/projects/handlers";
import * as collectionsHandlers from "@/mock/collections/handlers";
import * as documentsHandlers from "@/mock/documents/handlers";
import * as chatHandlers from "@/mock/chat/handlers";
import * as searchHandlers from "@/mock/search/data";
import * as trainingHandlers from "@/mock/training/handlers";
import * as modelsHandlers from "@/mock/models/handlers";
import * as notificationsHandlers from "@/mock/notifications/handlers";
import * as settingsHandlers from "@/mock/settings/handlers";
import * as adminHandlers from "@/mock/admin/handlers";
import * as authHandlers from "@/mock/auth/handlers";

export interface MockClient {
  auth: typeof authHandlers;
  users: typeof usersHandlers;
  projects: typeof projectsHandlers;
  collections: typeof collectionsHandlers;
  documents: typeof documentsHandlers;
  chat: {
    listConversations: typeof chatHandlers.listConversations;
    getConversation: typeof chatHandlers.getConversation;
    createConversation: typeof chatHandlers.createConversation;
    updateConversation: typeof chatHandlers.updateConversation;
    deleteConversation: typeof chatHandlers.deleteConversation;
    listConversationFolders: typeof chatHandlers.listConversationFolders;
    listChatModels: typeof chatHandlers.listChatModels;
    sendMessage: (
      input: { conversationId: string; content: string; model?: string; collectionIds?: string[] },
      signal?: { aborted: boolean }
    ) => Promise<void>;
  };
  search: typeof searchHandlers;
  training: typeof trainingHandlers;
  models: typeof modelsHandlers;
  notifications: typeof notificationsHandlers;
  settings: typeof settingsHandlers;
  admin: typeof adminHandlers;
}

const client: MockClient = {
  auth: authHandlers,
  users: usersHandlers,
  projects: projectsHandlers,
  collections: collectionsHandlers,
  documents: documentsHandlers,
  chat: {
    listConversations: chatHandlers.listConversations,
    getConversation: chatHandlers.getConversation,
    createConversation: chatHandlers.createConversation,
    updateConversation: chatHandlers.updateConversation,
    deleteConversation: chatHandlers.deleteConversation,
    listConversationFolders: chatHandlers.listConversationFolders,
    listChatModels: chatHandlers.listChatModels,
    sendMessage: (input, signal) =>
      chatHandlers.streamAssistantReply(
        input,
        () => {
          /* consumer uses chat service handle */
        },
        signal
      ),
  },
  search: searchHandlers,
  training: trainingHandlers,
  models: modelsHandlers,
  notifications: notificationsHandlers,
  settings: settingsHandlers,
  admin: adminHandlers,
};

export function getMockClient(): MockClient {
  return client;
}
