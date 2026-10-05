import { RegisterForm } from "@/components/forms/register-form";
import { RedirectIfAuthenticated } from "@/components/auth/redirect-if-authenticated";

export const metadata = { title: "Create account" };

export default function RegisterPage() {
  return (
    <RedirectIfAuthenticated>
      <RegisterForm />
    </RedirectIfAuthenticated>
  );
}
