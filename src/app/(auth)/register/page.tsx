import { enabledOAuth } from "@/auth";
import { RegisterForm } from "@/components/auth/register-form";

export const metadata = {
  title: "Create account — Tapcard",
  robots: { index: false, follow: true },
};

export default function RegisterPage() {
  return <RegisterForm oauth={enabledOAuth} />;
}
