import { Skeleton } from "@/components/ui/skeleton";

export default function StudyGuideLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Skeleton className="h-6 w-64" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-48 w-full" />
    </div>
  );
}