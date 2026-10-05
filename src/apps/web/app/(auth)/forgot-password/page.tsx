import { ForgotPasswordForm } from "@/components/forms/forgot-password-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export const metadata = { title: "Forgot password" };

export default function ForgotPasswordPage() {
  return (
    <RedirectIfAuthenticated>
      <ForgotPasswordForm />
    </RedirectIfAuthenticated>
  );
}
