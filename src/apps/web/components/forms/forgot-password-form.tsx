"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { toast } from "sonner";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { FormField } from "@/components/forms/form-field";
import { useForgotPassword } from "@/features/auth/hooks/useAuth";
import { forgotPasswordSchema, type ForgotPasswordValues } from "@/features/auth/schemas/auth.schema";

export function ForgotPasswordForm() {
  const forgot = useForgotPassword();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: { email: "" },
  });

  async function onSubmit(values: ForgotPasswordValues) {
    try {
      await forgot.mutateAsync(values.email);
      toast.success("Check your inbox", { description: "If the account exists, we'll email a reset link." });
    } catch (err) {
      toast.error("Something went wrong", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl">Reset your password</CardTitle>
        <CardDescription>Enter the email associated with your account.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input type="email" placeholder="you@example.com" autoComplete="email" {...register("email")} />
          </FormField>
          <Button type="submit" className="w-full" disabled={forgot.isPending}>
            {forgot.isPending ? "Sending…" : "Send reset link"}
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
