import { enabledOAuth } from "@/auth";
import { AuthForm } from "@/components/auth/auth-form";

export const metadata = {
  title: "Sign in — Tapcard",
  robots: { index: false, follow: true },
};

export default function LoginPage() {
  return <AuthForm oauth={enabledOAuth} />;
}
