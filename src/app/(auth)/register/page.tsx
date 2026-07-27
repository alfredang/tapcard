import { enabledOAuth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Create your card — Tapcard" };

// Same flow as /login — verifying a code for an unknown email creates the
// account. This route exists so the marketing CTAs keep a sign-up-flavored
// landing place.
export default function RegisterPage() {
  return <AuthForm mode="register" oauth={enabledOAuth} />;
}
