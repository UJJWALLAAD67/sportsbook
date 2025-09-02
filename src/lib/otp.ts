import crypto from "crypto";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { sendMail } from "@/lib/mailer";

export async function createAndSendOtp(email: string) {
  // generate 6 digit OTP
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 min
  const tokenHash = await bcrypt.hash(otp, 10);

  // store in DB
  await prisma.emailOtp.create({
    data: {
      email,
      tokenHash,
      expiresAt,
    },
  });

  // send mail
  await sendMail(
    email,
    "Your OTP Code",
    `<p>Your OTP is: <b>${otp}</b></p><p>Valid for 5 minutes.</p>`
  );
}

// verify OTP against DB
export async function verifyOtp(email: string, otp: string) {
  const record = await prisma.emailOtp.findFirst({
    where: {
      email,
      expiresAt: { gt: new Date() },
      verified: false,
    },
    orderBy: { createdAt: "desc" },
  });

  if (!record) return false;

  const isMatch = await bcrypt.compare(otp, record.tokenHash);
  if (!isMatch) {
    await prisma.emailOtp.update({
      where: { id: record.id },
      data: { attempts: { increment: 1 } },
    });
    return false;
  }

  await prisma.emailOtp.update({
    where: { id: record.id },
    data: { verified: true },
  });
  return true;
}
