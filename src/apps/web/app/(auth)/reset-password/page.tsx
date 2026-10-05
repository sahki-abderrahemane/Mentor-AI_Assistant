import { ResetPasswordForm } from "@/components/forms/reset-password-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export const metadata = { title: "Reset password" };

export default function ResetPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <ResetPasswordForm />
    </RedirectIfAuthenticated>
  );
}
