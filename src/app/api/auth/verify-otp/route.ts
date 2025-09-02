import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import bcrypt from "bcryptjs";

export async function POST(req: Request) {
  try {
    const { email, otp } = await req.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Missing email or OTP" },
        { status: 400 }
      );
    }

    // 1. Find latest OTP record
    const otpRecord = await prisma.emailOtp.findFirst({
      where: { email },
      orderBy: { createdAt: "desc" },
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No OTP found. Please register again." },
        { status: 404 }
      );
    }

    // 2. Check expiry
    if (otpRecord.expiresAt < new Date()) {
      return NextResponse.json({ error: "OTP expired" }, { status: 410 });
    }

    // 3. Compare OTP
    const isValid = await bcrypt.compare(otp, otpRecord.tokenHash);
    if (!isValid) {
      return NextResponse.json({ error: "Invalid OTP" }, { status: 401 });
    }

    // 4. Mark user as verified
    await prisma.user.update({
      where: { email },
      data: { emailVerified: true },
    });

    // 5. Delete used OTPs
    await prisma.emailOtp.deleteMany({ where: { email } });

    return NextResponse.json({
      ok: true,
      message: "Email verified successfully",
    });
  } catch (err) {
    console.error("OTP verification failed:", err);
    return NextResponse.json(
      { error: "OTP verification failed" },
      { status: 500 }
    );
  }
}
