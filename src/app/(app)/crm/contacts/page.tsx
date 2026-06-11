import { prisma } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { ContactsClient } from "@/components/crm/contacts-client";

export const metadata = { title: "Contacts — Tapcard" };

export default async function ContactsPage() {
  const user = await requireUser();
  const [contacts, leads] = await Promise.all([
    prisma.contact.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.lead.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
  ]);

  return (
    <ContactsClient
      initialContacts={contacts.map((c) => ({
        ...c,
        createdAt: c.createdAt.toISOString(),
      }))}
      initialLeads={leads.map((l) => ({
        id: l.id,
        name: l.name,
        company: l.company,
        email: l.email,
        phone: l.phone,
        message: l.message,
        status: l.status,
        createdAt: l.createdAt.toISOString(),
      }))}
    />
  );
}
