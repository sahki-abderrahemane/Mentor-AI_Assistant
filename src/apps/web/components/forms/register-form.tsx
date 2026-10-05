"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { FormField, PasswordInput } from "@/components/forms/form-field";
import { useRegister } from "@/features/auth/hooks/useAuth";
import { registerSchema, type RegisterValues } from "@/features/auth/schemas/auth.schema";

export function RegisterForm() {
  const router = useRouter();
  const registerMutation = useRegister();
  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<RegisterValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      confirmPassword: "",
      acceptTerms: true,
    } as unknown as RegisterValues,
  });
  const accepted = watch("acceptTerms");

  async function onSubmit(values: RegisterValues) {
    try {
      await registerMutation.mutateAsync({
        name: values.name,
        email: values.email,
        password: values.password,
      });
      toast.success("Account created", { description: "Welcome aboard!" });
      router.replace("/dashboard");
      router.refresh();
    } catch (err) {
      toast.error("Couldn't create your account", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl">Create your workspace</CardTitle>
        <CardDescription>Get started with MentorAI — research, retrieval, fine-tuning.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Name" error={errors.name?.message} required>
            <Input placeholder="Your name" autoComplete="name" {...register("name")} aria-invalid={Boolean(errors.name)} />
          </FormField>
          <FormField label="Work email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="you@company.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
          </FormField>
          <PasswordInput
            label="Password"
            placeholder="At least 8 characters"
            autoComplete="new-password"
            error={errors.password?.message}
            required
            {...register("password")}
          />
          <PasswordInput
            label="Confirm password"
            placeholder="Repeat password"
            autoComplete="new-password"
            error={errors.confirmPassword?.message}
            required
            {...register("confirmPassword")}
          />
          <label className="flex items-start gap-2 text-sm">
            <Checkbox
              checked={Boolean(accepted)}
              onCheckedChange={(v) => setValue("acceptTerms", Boolean(v) as never)}
            />
            <span className="text-muted-foreground">
              I accept the <Link href="#" className="text-primary underline-offset-4 hover:underline">terms</Link> and acknowledge the <Link href="#" className="text-primary underline-offset-4 hover:underline">privacy policy</Link>.
            </span>
          </label>
          {errors.acceptTerms?.message && (
            <p className="-mt-3 text-xs text-destructive">{errors.acceptTerms.message}</p>
          )}
          <Button type="submit" className="w-full" disabled={registerMutation.isPending}>
            {registerMutation.isPending ? "Creating account…" : "Create account"}
            <UserPlus className="h-4 w-4" />
          </Button>
        </form>
      </CardContent>
      <CardFooter className="flex flex-col">
        <Link className="text-sm text-muted-foreground hover:text-foreground" href="/login">
          Already have an account? Sign in
          <ArrowRight className="ml-1 inline h-3.5 w-3.5" />
        </Link>
      </CardFooter>
    </Card>
  );
}
