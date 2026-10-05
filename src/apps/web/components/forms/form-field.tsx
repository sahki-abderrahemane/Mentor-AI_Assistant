"use client";

import * as React from "react";
import { Eye, EyeOff, type LucideIcon } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface FormFieldProps {
  label?: string;
  hint?: string;
  error?: string;
  className?: string;
  required?: boolean;
  icon?: LucideIcon;
  children?: React.ReactNode;
}

export function FormField({
  label,
  hint,
  error,
  className,
  required,
  icon: Icon,
  children,
}: FormFieldProps) {
  return (
    <div className={cn("space-y-1.5", className)}>
      {label && (
        <Label className="flex items-center gap-1">
          {label}
          {required && <span className="text-destructive">*</span>}
        </Label>
      )}
      <div className="relative">
        {Icon && (
          <Icon className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
        )}
        <div className={cn(Icon && "pl-9")}>{children}</div>
      </div>
      {hint && !error && <p className="text-xs text-muted-foreground">{hint}</p>}
      {error && <p className="text-xs text-destructive">{error}</p>}
    </div>
  );
}

interface PasswordInputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  hint?: string;
  error?: string;
  required?: boolean;
}

export const PasswordInput = React.forwardRef<HTMLInputElement, PasswordInputProps>(
  ({ label, hint, error, required, className, ...props }, ref) => {
    const [hidden, setHidden] = React.useState(true);
    return (
      <FormField label={label} hint={hint} error={error} required={required}>
        <Input
          ref={ref}
          type={hidden ? "password" : "text"}
          className={cn("pr-10", className)}
          aria-invalid={Boolean(error)}
          {...props}
        />
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="absolute right-1.5 top-1/2 h-7 w-7 -translate-y-1/2"
          onClick={() => setHidden((h) => !h)}
          aria-label={hidden ? "Show password" : "Hide password"}
        >
          {hidden ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
        </Button>
      </FormField>
    );
  }
);
PasswordInput.displayName = "PasswordInput";
