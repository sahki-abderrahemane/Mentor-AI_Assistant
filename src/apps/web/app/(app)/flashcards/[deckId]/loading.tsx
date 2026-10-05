import { Skeleton } from "@/components/ui/skeleton";

export default function FlashcardDeckLoading() {
  return (
    <div className="max-w-lg mx-auto p-6 space-y-4">
      <Skeleton className="h-6 w-48" />
      <Skeleton className="h-64 w-full" />
      <Skeleton className="h-10 w-full" />
    </div>
  );
}