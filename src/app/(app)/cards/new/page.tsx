import { requireUser } from "@/lib/session";
import { CardBuilder } from "@/components/builder/card-builder";

export const metadata = { title: "New Card — Tapcard" };

export default async function NewCardPage() {
  await requireUser();
  return <CardBuilder />;
}
