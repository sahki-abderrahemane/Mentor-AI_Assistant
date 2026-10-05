"use client";

import { useNotifications } from "@/features/notifications/hooks/useNotifications";
import { useMarkAllRead } from "@/features/notifications/hooks/useNotifications";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";
import { Bell, CheckCheck, Info, AlertTriangle, AlertCircle, CheckCircle, XCircle, FileText, FileX2, Download, Share2, MessageSquare, ShieldAlert } from "lucide-react";
import { formatDistanceToNow } from "@/lib/utils";
import { toast } from "sonner";

type Severity = "info" | "success" | "warning" | "error";

const SEVERITY_ICON: Record<Severity, React.ComponentType<{ className?: string }>> = {
  info: Info,
  success: CheckCircle,
  warning: AlertTriangle,
  error: AlertCircle,
};

const SEVERITY_COLOR: Record<Severity, { bg: string; text: string }> = {
  info: { bg: "bg-primary/10", text: "text-primary" },
  success: { bg: "bg-green-500/10", text: "text-green-500" },
  warning: { bg: "bg-amber-500/10", text: "text-amber-500" },
  error: { bg: "bg-red-500/10", text: "text-red-500" },
};

const TYPE_ICON: Record<string, React.ComponentType<{ className?: string }>> = {
  training_completed: CheckCircle,
  "training.completed": CheckCircle,
  training_failed: XCircle,
  "training.failed": XCircle,
  document_indexed: FileText,
  "document.indexed": FileText,
  document_failed: FileX2,
  "document.failed": FileX2,
  model_downloaded: Download,
  "model.downloaded": Download,
  chat_shared: MessageSquare,
  collection_shared: Share2,
  system: Bell,
  admin: ShieldAlert,
};

function severityOf(notif: any): Severity {
  const s = notif?.severity;
  if (s === "info" || s === "success" || s === "warning" || s === "error") return s;
  const type = String(notif?.type ?? "");
  if (type === "warning" || type === "success" || type === "error") return type;
  if (type.includes("failed")) return "error";
  if (type.includes("completed") || type.includes("indexed") || type.includes("downloaded")) return "success";
  return "info";
}

export default function NotificationsPage() {
  const { list: { data, isLoading }, unreadCount } = useNotifications({ pageSize: 50 } as Record<string, unknown>);
  const markAll = useMarkAllRead();

  const unread = unreadCount.data ?? 0;

  async function handleMarkAll() {
    try { await markAll.mutateAsync(); toast.success("All marked as read"); } catch { toast.error("Failed"); }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Notifications</h1>
          <p className="text-sm text-muted-foreground">{unread > 0 ? `${unread} unread notification${unread > 1 ? "s" : ""}` : "All caught up!"}</p>
        </div>
        {unread > 0 && <Button size="sm" variant="outline" onClick={handleMarkAll}><CheckCheck className="h-4 w-4" /> Mark all read</Button>}
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {(data?.items ?? []).map((notif: any) => {
            const severity = severityOf(notif);
            const colors = SEVERITY_COLOR[severity];
            const Icon = TYPE_ICON[String(notif?.type ?? "")] ?? SEVERITY_ICON[severity];
            return (
              <Card key={notif.id} className={`transition ${!notif.read ? "border-primary/30 bg-primary/5" : "hover:border-muted-foreground/30"}`}>
                <CardContent className="flex items-start gap-4 p-4">
                  <div className={`mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full ${colors.bg}`}>
                    <Icon className={`h-4 w-4 ${colors.text}`} />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm font-medium">{notif.title}</p>
                    <p className="mt-0.5 text-sm text-muted-foreground">{notif.message}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{formatDistanceToNow(new Date(notif.createdAt), { addSuffix: true })}</p>
                  </div>
                  {!notif.read && <div className="h-2 w-2 shrink-0 rounded-full bg-primary mt-2" />}
                </CardContent>
              </Card>
            );
          })}
          {data?.items?.length === 0 && <p className="text-center py-12 text-muted-foreground">No notifications.</p>}
        </div>
      )}
    </div>
  );
}