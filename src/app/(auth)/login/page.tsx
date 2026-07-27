import { enabledOAuth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = { title: "Sign in — Tapcard" };

export default function LoginPage() {
  return <AuthForm mode="login" oauth={enabledOAuth} />;
}
