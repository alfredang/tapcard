import { redirect } from "next/navigation";
import { auth } from "@/auth";

/** Require an authenticated user in a server component; redirect to /login if absent. */
export async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login");
  }
  return session.user;
}

/** Require an authenticated user in a route handler; returns null if absent. */
export async function getUserId(): Promise<string | null> {
  const session = await auth();
  return session?.user?.id ?? null;
}
