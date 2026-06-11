import { enabledOAuth } from "@/auth";
import { LoginForm } from "@/components/auth/login-form";

export const metadata = { title: "Sign in — Tapcard" };

export default function LoginPage() {
  return <LoginForm oauth={enabledOAuth} />;
}
