import { prisma } from "@/lib/db";
import { getUserId } from "@/lib/session";

function csvCell(value: unknown) {
  const s = value == null ? "" : String(value);
  return `"${s.replace(/"/g, '""')}"`;
}

export async function GET() {
  const userId = await getUserId();
  if (!userId) return new Response("Unauthorized", { status: 401 });

  const contacts = await prisma.contact.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });

  const headers = [
    "Name",
    "Company",
    "Position",
    "Email",
    "Phone",
    "WhatsApp",
    "Address",
    "Tags",
    "Notes",
    "Created",
  ];
  const rows = contacts.map((c) =>
    [
      c.name,
      c.company,
      c.position,
      c.email,
      c.phone,
      c.whatsapp,
      c.address,
      c.tags,
      c.notes,
      c.createdAt.toISOString(),
    ]
      .map(csvCell)
      .join(","),
  );
  const csv = [headers.map(csvCell).join(","), ...rows].join("\r\n");

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="contacts.csv"',
    },
  });
}
