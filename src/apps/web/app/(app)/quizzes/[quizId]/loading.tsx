import { Skeleton } from "@/components/ui/skeleton";

export default function QuizTakeLoading() {
  return (
    <div className="max-w-3xl mx-auto p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-48 w-full" />
      <Skeleton className="h-32 w-full" />
      <div className="flex justify-between">
        <Skeleton className="h-9 w-32" />
        <Skeleton className="h-9 w-32" />
      </div>
    </div>
  );
}