import { faker, id, isoDate, pick } from "../seed";

export type MockNotificationType =
  | "training.completed"
  | "training.failed"
  | "document.indexed"
  | "document.failed"
  | "model.downloaded"
  | "chat.shared"
  | "collection.shared"
  | "system"
  | "admin";

export type MockNotificationSeverity = "info" | "success" | "warning" | "error";

export interface MockNotification {
  id: string;
  type: MockNotificationType;
  severity: MockNotificationSeverity;
  title: string;
  message: string;
  read: boolean;
  actionUrl?: string;
  actionLabel?: string;
  actorId?: string;
  actorName?: string;
  actorAvatarUrl?: string;
  createdAt: string;
  updatedAt: string;
  meta?: Record<string, unknown>;
}

const seeds: { type: MockNotificationType; severity: MockNotificationSeverity; title: string; message: string }[] = [
  { type: "training.completed", severity: "success", title: "Training job completed — Llama 3.1 8B QLoRA", message: "Eval suite ran 24/30 suites. Adapter is ready to download." },
  { type: "training.failed", severity: "error", title: "Training job failed — Mistral 7B run #12", message: "NaN loss detected at step 1240. Inspect the logs to recover." },
  { type: "document.indexed", severity: "success", title: "Document indexed — Attention Is All You Need", message: "84 knowledge units created, 3 citations resolved." },
  { type: "document.failed", severity: "error", title: "Document processing failed — conference_paper_5.pdf", message: "Encryption on the PDF prevented extraction. Replace the file or remove encryption." },
  { type: "model.downloaded", severity: "info", title: "Model downloaded — Mistral 7B", message: "12.4 GB. Ready to load from the models panel." },
  { type: "chat.shared", severity: "info", title: "Conversation shared with you", message: "Hana shared a research conversation about LoRA hyperparameters." },
  { type: "collection.shared", severity: "info", title: "Collection shared with you — RAG Survey 2026", message: "Maaz shared this collection and granted editor rights." },
  { type: "admin", severity: "warning", title: "Queue lag spike — embeddings", message: "Embeddings queue lag exceeded 90s for the last 15 minutes." },
  { type: "system", severity: "info", title: "System update — Knowledge Pipeline v2.1", message: "Tighter chunk boundaries and re-ranked recall improvements." },
];

export const mockNotifications: MockNotification[] = Array.from({ length: 32 }).map((_, i) => {
  const s = seeds[i % seeds.length]!;
  return {
    id: id("not"),
    type: s.type,
    severity: s.severity,
    title: s.title,
    message: s.message,
    read: Math.random() > 0.55,
    actionUrl: ["training.completed", "model.downloaded"].includes(s.type) ? "#" : undefined,
    actionLabel: ["training.completed"].includes(s.type) ? "Open" : undefined,
    actorName: s.type === "chat.shared" || s.type === "collection.shared" ? faker.person.fullName() : undefined,
    createdAt: isoDate(faker.number.int({ min: 0, max: 14 })),
    updatedAt: isoDate(0),
  } as MockNotification;
});
