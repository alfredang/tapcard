import { PrismaClient, DealStage } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

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

  const contacts = await Promise.all(
    [
      {
        name: "Priya Nair",
        company: "Nimbus Retail",
        position: "VP Marketing",
        email: "priya@nimbus.io",
        phone: "+1 212 555 0190",
      },
      {
        name: "Marcus Lee",
        company: "Helix Health",
        position: "COO",
        email: "marcus@helix.health",
        phone: "+1 646 555 0117",
      },
      {
        name: "Sofia Rossi",
        company: "Brightline Realty",
        position: "Broker",
        email: "sofia@brightline.co",
        phone: "+1 305 555 0153",
      },
    ].map((c) => prisma.contact.create({ data: { ...c, userId: user.id } })),
  );

  await prisma.lead.createMany({
    data: [
      {
        userId: user.id,
        cardId: card.id,
        name: "Aiden Park",
        email: "aiden@parkco.com",
        company: "Park & Co",
        message: "Interested in a strategy retainer for Q3.",
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
          title: `${["Retainer", "Advisory", "Workshop", "GTM Audit", "Expansion", "Renewal"][i]} — ${contacts[i % contacts.length].company}`,
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
