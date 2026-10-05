import { Skeleton } from "@/components/ui/skeleton";

export default function AdminLogsLoading() {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Skeleton className="h-10 w-64" />
        <Skeleton className="h-10 w-32" />
      </div>
      <Skeleton className="h-96 w-full rounded-lg" />
    </div>
  );
}