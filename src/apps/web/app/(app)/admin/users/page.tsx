"use client";

import { useAdminUsers } from "@/features/admin/hooks/useAdmin";
import { adminService } from "@/services";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useAuthStore } from "@/stores/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { MoreHorizontal, Search, ShieldCheck, ShieldOff, Trash2 } from "lucide-react";
import { toast } from "sonner";

export default function AdminUsersPage() {
  const { data, isLoading } = useAdminUsers({ pageSize: 50 } as Record<string, unknown>);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore((s) => s.user);
  const [q, setQ] = useState("");
  const [pendingDelete, setPendingDelete] = useState<{ id: string; name: string } | null>(null);

  const users = data?.items ?? [];
  const filtered = q ? users.filter((u: any) => u.name.toLowerCase().includes(q.toLowerCase()) || u.email.toLowerCase().includes(q.toLowerCase())) : users;

  const invalidateUsers = () =>
    queryClient.invalidateQueries({ queryKey: ["admin", "users"] });

  const suspendMutation = useMutation({
    mutationFn: async ({ id, suspend }: { id: string; suspend: boolean }) =>
      suspend ? adminService.suspendUser(id) : adminService.unsuspendUser(id),
    onSuccess: (_data, variables) => {
      toast.success(variables.suspend ? "User suspended" : "User unsuspended");
      invalidateUsers();
    },
    onError: () => toast.error("Failed to update user"),
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      toast.success("User deleted");
      setPendingDelete(null);
      invalidateUsers();
    },
    onError: () => toast.error("Failed to delete user"),
  });

  const isSelf = (id: string) => currentUser?.id === id;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Users</h1>
          <p className="text-sm text-muted-foreground">{users.length} registered users.</p>
        </div>
      </div>

      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        <Input className="pl-9" placeholder="Search users…" value={q} onChange={(e) => setQ(e.target.value)} />
      </div>

      {isLoading ? (
        <div className="space-y-3">{Array.from({ length: 8 }).map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((u: any) => (
            <Card key={u.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div className="flex items-center gap-3">
                  <Avatar><AvatarFallback>{u.name[0]}</AvatarFallback></Avatar>
                  <div>
                    <p className="font-medium">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.email}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Badge variant={u.role === "admin" ? "destructive" : "secondary"}>{u.role}</Badge>
                  <Badge variant={u.suspended ? "destructive" : "success"}>
                    {u.suspended ? "Suspended" : "Active"}
                  </Badge>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button size="icon" variant="ghost" disabled={suspendMutation.isPending || deleteMutation.isPending}>
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      {u.suspended ? (
                        <DropdownMenuItem
                          disabled={isSelf(u.id)}
                          onClick={() => suspendMutation.mutate({ id: u.id, suspend: false })}
                        >
                          <ShieldCheck className="h-4 w-4" /> Unsuspend
                        </DropdownMenuItem>
                      ) : (
                        <DropdownMenuItem
                          disabled={isSelf(u.id)}
                          onClick={() => suspendMutation.mutate({ id: u.id, suspend: true })}
                        >
                          <ShieldOff className="h-4 w-4" /> Suspend
                        </DropdownMenuItem>
                      )}
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        className="text-destructive focus:text-destructive"
                        disabled={isSelf(u.id)}
                        onClick={() => setPendingDelete({ id: u.id, name: u.name })}
                      >
                        <Trash2 className="h-4 w-4" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      <Dialog open={pendingDelete !== null} onOpenChange={(open) => !open && setPendingDelete(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete user</DialogTitle>
            <DialogDescription>
              Permanently delete {pendingDelete?.name} and all associated data. This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setPendingDelete(null)}>Cancel</Button>
            <Button
              variant="destructive"
              disabled={deleteMutation.isPending}
              onClick={() => pendingDelete && deleteMutation.mutate(pendingDelete.id)}
            >
              {deleteMutation.isPending ? "Deleting…" : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
