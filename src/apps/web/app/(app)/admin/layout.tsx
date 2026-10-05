"use client";

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="space-y-1">
      <div className="mb-4">
        <h2 className="text-lg font-semibold">Admin</h2>
        <p className="text-sm text-muted-foreground">System administration and monitoring.</p>
      </div>
      {children}
    </div>
  );
}