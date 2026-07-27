import { PrismaClient, DealStage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

/**
 * DiceBear `lorelei` avatars (CC0 1.0, no attribution required for commercial
 * use). Seeds are the person's name, so each demo persona keeps the same face
 * across re-seeds. See src/lib/avatar.ts for the shared helper.
 */
function avatar(seed: string): string {
  const params = new URLSearchParams({ seed, size: "160", radius: "50" });
  // backgroundColor must be repeated params, not one comma-joined value.
  for (const c of ["ede9fe", "fce7f3", "ccfbf1", "fef3c7"]) {
    params.append("backgroundColor", c);
  }
  return `https://api.dicebear.com/10.x/lorelei/svg?${params.toString()}`;
}

async function main() {
  const email = "demo@tapcard.app";
  const password = await bcrypt.hash("password123", 10);

  const user = await prisma.user.upsert({
    where: { email },
    update: {},
    create: {
      email,
      name: "Jordan Avery",
      password,
      emailVerified: new Date(),
    },
  });

  // Reset demo data for idempotent re-seeds.
  await prisma.deal.deleteMany({ where: { userId: user.id } });
  await prisma.lead.deleteMany({ where: { userId: user.id } });
  await prisma.contact.deleteMany({ where: { userId: user.id } });
  await prisma.card.deleteMany({ where: { userId: user.id } });

  const card = await prisma.card.create({
    data: {
      userId: user.id,
      slug: "jordan-avery",
      published: true,
      fullName: "Jordan Avery",
      jobTitle: "Founder & Principal Consultant",
      company: "Avery Growth Partners",
      department: "Strategy",
      tagline: "Turning ambitious goals into measurable results.",
      bio: "I help founders scale revenue with sharp positioning and disciplined go-to-market execution.",
      about:
        "With 12+ years across SaaS and professional services, I partner with leadership teams to sharpen their strategy, build repeatable sales motions, and grow durable revenue. I believe the best results come from clarity, momentum, and trust.",
      mobile: "+1 415 555 0142",
      officePhone: "+1 415 555 0100",
      whatsapp: "+14155550142",
      email: "jordan@averygrowth.com",
      website: "https://averygrowth.com",
      address: "535 Mission St, San Francisco, CA",
      linkedin: "https://linkedin.com/in/jordanavery",
      instagram: "https://instagram.com/jordan.avery",
      twitter: "https://x.com/jordanavery",
      youtube: "https://youtube.com/@averygrowth",
      profilePhoto: avatar("Jordan Avery"),
      theme: "MODERN",
      accentColor: "#7c5cff",
    },
  });

  await prisma.analyticsEvent.createMany({
    data: [
      { cardId: card.id, type: "VIEW" },
      { cardId: card.id, type: "VIEW" },
      { cardId: card.id, type: "QR_SCAN" },
      { cardId: card.id, type: "WHATSAPP_CLICK" },
      { cardId: card.id, type: "VCF_DOWNLOAD" },
    ],
  });

  // A deliberately mixed cast: male and female, with Asian, European and other
  // backgrounds, so the demo data looks like a real Singapore-based book of
  // business rather than a single demographic.
  const contacts = await Promise.all(
    [
      {
        name: "Priya Nair",
        company: "Nimbus Retail",
        position: "VP Marketing",
        email: "priya@nimbus.io",
        phone: "+65 6100 0190",
      },
      {
        name: "Wei Ling Tan",
        company: "Marina Capital",
        position: "Managing Director",
        email: "weiling@marinacap.sg",
        phone: "+65 6100 0231",
      },
      {
        name: "Hiroshi Tanaka",
        company: "Sakura Logistics",
        position: "Head of Operations",
        email: "h.tanaka@sakuralog.jp",
        phone: "+81 3 5555 0184",
      },
      {
        name: "Marcus Lee",
        company: "Helix Health",
        position: "COO",
        email: "marcus@helix.health",
        phone: "+65 6100 0117",
      },
      {
        name: "Sofia Rossi",
        company: "Brightline Realty",
        position: "Broker",
        email: "sofia@brightline.co",
        phone: "+39 06 5555 0153",
      },
      {
        name: "Daniel Okafor",
        company: "Northwind Insurance",
        position: "Regional Manager",
        email: "daniel@northwind.co",
        phone: "+44 20 5555 0166",
      },
    ].map((c) =>
      prisma.contact.create({
        data: { ...c, avatarUrl: avatar(c.name), userId: user.id },
      }),
    ),
  );

  await prisma.lead.createMany({
    data: [
      {
        userId: user.id,
        cardId: card.id,
        name: "Aiden Park",
        email: "aiden@parkco.kr",
        company: "Park & Co",
        message: "Interested in a strategy retainer for Q3.",
        status: "NEW",
      },
      {
        userId: user.id,
        cardId: card.id,
        name: "Mei Chen",
        email: "mei.chen@lumenworks.sg",
        company: "Lumen Works",
        message: "We need digital cards for a 40-person sales team.",
        status: "NEW",
      },
      {
        userId: user.id,
        cardId: card.id,
        name: "Lena Fischer",
        email: "lena@fischer.de",
        company: "Fischer GmbH",
        message: "Can we book a discovery call?",
        status: "CONTACTED",
      },
      {
        userId: user.id,
        cardId: card.id,
        name: "Arjun Mehta",
        email: "arjun@vantagepoint.in",
        company: "Vantage Point",
        message: "Do you support custom domains on the Business plan?",
        status: "CONTACTED",
      },
    ],
  });

  const stages: DealStage[] = [
    "NEW_LEAD",
    "CONTACTED",
    "QUALIFIED",
    "PROPOSAL",
    "NEGOTIATION",
    "WON",
  ];
  await Promise.all(
    stages.map((stage, i) =>
      prisma.deal.create({
        data: {
          userId: user.id,
          contactId: contacts[i % contacts.length].id,
          title: `${["Retainer", "Advisory", "Workshop", "GTM Audit", "Expansion", "Renewal"][i]} - ${contacts[i % contacts.length].company}`,
          value: [12000, 8000, 24000, 15000, 32000, 18000][i],
          stage,
          position: 0,
        },
      }),
    ),
  );

  console.log(`\n✅ Seeded demo account:\n   email: ${email}\n   password: password123\n   public card: /c/${card.slug}\n`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
