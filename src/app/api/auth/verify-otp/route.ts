import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { compare } from "bcryptjs";

export async function POST(request: Request) {
  try {
    const { email, otp } = await request.json();

    if (!email || !otp) {
      return NextResponse.json(
        { error: "Email and OTP are required" },
        { status: 400 }
      );
    }

    const otpRecord = await prisma.emailOtp.findFirst({
      where: {
        email,
        verified: false
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    if (!otpRecord) {
      return NextResponse.json(
        { error: "No valid OTP found. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.expiresAt < new Date()) {
      await prisma.emailOtp.delete({
        where: { id: otpRecord.id }
      });
      return NextResponse.json(
        { error: "OTP has expired. Please request a new one." },
        { status: 400 }
      );
    }

    if (otpRecord.attempts >= 3) {
      await prisma.emailOtp.delete({
        where: { id: otpRecord.id }
      });
      return NextResponse.json(
        { error: "Too many failed attempts. Please request a new OTP." },
        { status: 400 }
      );
    }

    const isValid = await compare(otp, otpRecord.tokenHash);

    if (!isValid) {
      await prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: {
          attempts: otpRecord.attempts + 1
        }
      });

      const attemptsLeft = 3 - (otpRecord.attempts + 1);
      return NextResponse.json(
        { error: `Invalid OTP. ${attemptsLeft} attempts remaining.` },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.emailOtp.update({
        where: { id: otpRecord.id },
        data: { verified: true }
      }),
      prisma.user.update({
        where: { email },
        data: { emailVerified: true }
      })
    ]);

    await prisma.emailOtp.deleteMany({
      where: {
        email,
        id: { not: otpRecord.id }
      }
    });

    return NextResponse.json({
      success: true,
      message: "Email verified successfully!"
    });

  } catch (error) {
    console.error("Verify OTP error:", error);
    return NextResponse.json(
      { error: "Failed to verify OTP. Please try again." },
      { status: 500 }
    );
  }
}