import "server-only";
import bcrypt from "bcryptjs";
import nodemailer from "nodemailer";
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
  // Dev fallback: with no SMTP configured, print to the server console.
  if (!process.env.EMAIL_SERVER) {
    // eslint-disable-next-line no-console
    console.log(
      `\n📨  OTP for ${email}: ${code}  (expires in 10 min)\n`,
    );
    return;
  }

  // EMAIL_SERVER is an SMTP connection string, e.g.
  //   smtp://user:pass@smtp.gmail.com:587   (Gmail app password)
  //   smtp://resend:re_xxx@smtp.resend.com:587
  const transport = nodemailer.createTransport(process.env.EMAIL_SERVER);
  const from = process.env.EMAIL_FROM ?? "Tapcard <no-reply@tapcard.tertiaryinfotech.com>";

  await transport.sendMail({
    to: email,
    from,
    subject: `${code} is your Tapcard code`,
    text: `Your Tapcard verification code is ${code}. It expires in 10 minutes.\n\nIf you didn't request this, you can ignore this email.`,
    html: otpEmailHtml(code),
  });
}

/** Minimal, email-client-safe HTML for the OTP message. */
function otpEmailHtml(code: string): string {
  return `
  <div style="font-family:-apple-system,Segoe UI,Roboto,Helvetica,Arial,sans-serif;max-width:440px;margin:0 auto;padding:32px 24px;color:#111114">
    <h1 style="font-size:20px;margin:0 0 8px">Verify your email</h1>
    <p style="font-size:14px;line-height:20px;color:#6b7280;margin:0 0 24px">
      Enter this code in the Tapcard app to sign in. It expires in 10 minutes.
    </p>
    <div style="font-size:34px;font-weight:700;letter-spacing:8px;text-align:center;padding:18px;background:#f4f4f5;border-radius:12px;color:#111114">
      ${code}
    </div>
    <p style="font-size:12px;line-height:18px;color:#9ca3af;margin:24px 0 0">
      If you didn't request this, you can safely ignore this email.
    </p>
  </div>`;
}
