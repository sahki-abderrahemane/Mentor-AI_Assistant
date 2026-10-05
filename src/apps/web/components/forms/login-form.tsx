"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Mail, ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { FormField, PasswordInput } from "@/components/forms/form-field";
import { useLogin, useDemoCredentials } from "@/features/auth/hooks/useAuth";
import { loginSchema, type LoginValues } from "@/features/auth/schemas/auth.schema";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const login = useLogin();
  const { data: demo = [] } = useDemoCredentials();
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { email: "", password: "", remember: true },
  });

  function redirectAfterLogin() {
    const next = params.get("redirect");
    router.replace(next ?? "/dashboard");
    router.refresh();
  }

  async function onSubmit(values: LoginValues) {
    try {
      await login.mutateAsync({ email: values.email, password: values.password });
      toast.success("Signed in", { description: "Welcome back to MentorAI." });
      redirectAfterLogin();
    } catch (err) {
      toast.error("Couldn't sign in", {
        description: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return (
    <Card className="border-border/60 bg-card/80 backdrop-blur">
      <CardHeader className="space-y-1.5 text-center">
        <CardTitle className="text-2xl">Welcome back</CardTitle>
        <CardDescription>Sign in to access your research workspace.</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          <FormField label="Email" error={errors.email?.message} required>
            <Input
              type="email"
              placeholder="you@example.com"
              autoComplete="email"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
            />
          </FormField>
          <PasswordInput
            label="Password"
            placeholder="••••••••"
            autoComplete="current-password"
            error={errors.password?.message}
            required
            {...register("password")}
          />
          <Button type="submit" className="w-full" disabled={login.isPending}>
            {login.isPending ? "Signing in…" : "Sign in"}
            <ArrowRight className="h-4 w-4" />
          </Button>
        </form>
        <div className="my-5 flex items-center gap-3">
          <Separator className="flex-1" />
          <span className="text-xs uppercase tracking-wider text-muted-foreground">Demo</span>
          <Separator className="flex-1" />
        </div>
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground">
            Use one of the demo accounts. Any valid email and 6-char password works in mock mode.
          </p>
          <div className="grid grid-cols-1 gap-2">
            {demo.map((d) => (
              <Button
                key={d.email}
                type="button"
                variant="outline"
                size="sm"
                className="justify-between font-normal"
                onClick={() => {
                  setValue("email", d.email);
                  setValue("password", "demopassword");
                }}
              >
                <span className="flex items-center gap-2">
                  <Mail className="h-3.5 w-3.5 text-muted-foreground" />
                  {d.email}
                </span>
                <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {d.role}
                </span>
              </Button>
            ))}
          </div>
        </div>
      </CardContent>
      <CardFooter className="flex flex-col space-y-2 text-sm">
        <div className="flex w-full items-center justify-between text-muted-foreground">
          <Link className="hover:text-foreground" href="/register">
            Create an account
          </Link>
          <Link className="hover:text-foreground" href="/forgot-password">
            Forgot password?
          </Link>
        </div>
        <div className="flex w-full items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Sparkles className="h-3.5 w-3.5" />
          Mock mode — no real backend required.
        </div>
      </CardFooter>
    </Card>
  );
}
