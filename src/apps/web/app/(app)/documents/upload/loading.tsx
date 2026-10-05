import { Skeleton } from "@/components/ui/skeleton";

export default function DocumentUploadLoading() {
  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-4 w-96 mt-2" />
      </div>
      <Skeleton className="h-64 w-full rounded-lg border-2 border-dashed" />
      <Skeleton className="h-10 w-32" />
    </div>
  );
}