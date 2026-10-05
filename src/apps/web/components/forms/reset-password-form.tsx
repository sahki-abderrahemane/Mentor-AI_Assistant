"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams, useRouter } from "next/navigation";
import { toast } from "sonner";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { PasswordInput } from "@/components/forms/form-field";
import { useResetPassword } from "@/features/auth/hooks/useAuth";
import { resetPasswordSchema, type ResetPasswordValues } from "@/features/auth/schemas/auth.schema";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "mock-reset-token";
  const reset = useResetPassword();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: { token, password: "", confirmPassword: "" } as ResetPasswordValues,
  });

  // Ensure hidden token stays in sync
  if (typeof window !== "undefined") {
    setValue("token", token);
  }

  async function onSubmit(values: ResetPasswordValues) {
    try {
      await reset.mutateAsync({ token: values.token, password: values.password });
      toast.success("Password updated", { description: "Sign in to continue." });
      router.push("/login");
    } catch (err) {
      toast.error("Couldn't reset your password", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl">Choose a new password</CardTitle>
        <CardDescription>Use at least 8 characters.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <PasswordInput
            label="New password"
            autoComplete="new-password"
            required
            error={errors.password?.message}
            {...register("password")}
          />
          <PasswordInput
            label="Confirm new password"
            autoComplete="new-password"
            required
            error={errors.confirmPassword?.message}
            {...register("confirmPassword")}
          />
          <input type="hidden" {...register("token")} />
          <Button type="submit" className="w-full" disabled={reset.isPending}>
            {reset.isPending ? "Updating…" : "Update password"}
          </Button>
        </form>
      </CardContent>
      <CardFooter>
        <Link href="/login" className="flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-3.5 w-3.5" />
          Back to sign in
        </Link>
      </CardFooter>
    </Card>
  );
}
