"use client";

import { useAuthStore } from "@/stores/auth.store";
import { useUpdateUser } from "@/features/auth/hooks/useAuth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/forms/form-field";
import { Badge } from "@/components/ui/badge";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useState } from "react";
import { toast } from "sonner";

const schema = z.object({ name: z.string().min(1), email: z.string().email() });

export default function ProfilePage() {
  const { user, setUser } = useAuthStore();
  const updateUser = useUpdateUser();
  const [editing, setEditing] = useState(false);
  const { register, handleSubmit, formState: { errors } } = useForm({ resolver: zodResolver(schema), defaultValues: { name: user?.name ?? "", email: user?.email ?? "" } });

  async function onSubmit(values: z.infer<typeof schema>) {
    if (!user) return;
    try {
      const updated = await updateUser.mutateAsync({ id: user.id, patch: { name: values.name, email: values.email } });
      setUser({ ...user, ...updated });
      toast.success("Profile updated");
      setEditing(false);
    } catch {
      toast.error("Failed to update profile");
    }
  }

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold">Profile</h1>
        <p className="text-sm text-muted-foreground">Manage your account information.</p>
      </div>

      <Card>
        <CardHeader><CardTitle>Account</CardTitle></CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16 text-lg">
              <AvatarFallback>{user?.name?.[0] ?? "U"}</AvatarFallback>
            </Avatar>
            <div>
              <p className="font-semibold">{user?.name}</p>
              <p className="text-sm text-muted-foreground">{user?.email}</p>
              <Badge variant="secondary" className="mt-1 text-xs">{user?.role}</Badge>
            </div>
          </div>

          <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
            <FormField label="Name" error={errors.name?.message}>
              <Input {...register("name")} disabled={!editing} />
            </FormField>
            <FormField label="Email" error={errors.email?.message}>
              <Input {...register("email")} disabled={!editing} />
            </FormField>
            {editing ? (
              <div className="flex gap-2">
                <Button type="submit" disabled={updateUser.isPending}>
                  {updateUser.isPending ? "Saving…" : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setEditing(false)}>Cancel</Button>
              </div>
            ) : (
              <Button type="button" variant="outline" onClick={() => setEditing(true)}>Edit profile</Button>
            )}
          </form>
        </CardContent>
      </Card>
    </div>
  );
}