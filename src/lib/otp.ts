import "server-only";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/db";

const OTP_TTL_MS = 10 * 60 * 1000; // 10 minutes

/** Create a 6-digit OTP for an email, store its hash, and "deliver" it. */
export async function createOtp(email: string): Promise<void> {
  const code = String(Math.floor(100000 + Math.random() * 900000));
  const codeHash = await bcrypt.hash(code, 10);

  await prisma.otpCode.create({
    data: {
      email: email.toLowerCase(),
      codeHash,
      expires: new Date(Date.now() + OTP_TTL_MS),
    },
  });

  await deliverOtp(email, code);
}

/** Verify a submitted code. Consumes the matching code on success. */
export async function verifyOtp(email: string, code: string): Promise<boolean> {
  const candidates = await prisma.otpCode.findMany({
    where: {
      email: email.toLowerCase(),
      consumed: false,
      expires: { gt: new Date() },
    },
    orderBy: { createdAt: "desc" },
    take: 5,
  });

  for (const candidate of candidates) {
    if (await bcrypt.compare(code, candidate.codeHash)) {
      await prisma.otpCode.update({
        where: { id: candidate.id },
        data: { consumed: true },
      });
      return true;
    }
  }
  return false;
}

/**
 * Deliver the OTP. In dev (no EMAIL_SERVER) we print to the server console.
 * Swap this for a real transactional email provider in production.
 */
async function deliverOtp(email: string, code: string) {
  if (!process.env.EMAIL_SERVER) {
    // eslint-disable-next-line no-console
    console.log(
      `\n📨  OTP for ${email}: ${code}  (expires in 10 min)\n`,
    );
    return;
  }
  // TODO: integrate nodemailer / Resend / SES here using EMAIL_SERVER + EMAIL_FROM.
}
