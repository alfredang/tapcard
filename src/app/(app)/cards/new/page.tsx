import { requireUser } from "@/lib/session";
import { CardBuilder } from "@/components/builder/card-builder";
import { getUserPrefs } from "@/lib/user-prefs";

export const metadata = { title: "New Card — Tapcard" };

export default async function NewCardPage() {
  const user = await requireUser();
  return <CardBuilder prefs={await getUserPrefs(user.id)} />;
}
