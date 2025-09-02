import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { sendMail } from "@/lib/mailer";
import { Prisma, Role } from "@/generated/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";

// 🔹 helper to create + send OTP
async function createAndSendOtp(email: string, tx: Prisma.TransactionClient) {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  const tokenHash = await bcrypt.hash(otp, 10);

  await tx.emailOtp.create({
    data: {
      email,
      tokenHash,
      expiresAt,
    },
  });

  await sendMail(
    email,
    "Your OTP Code",
    `<p>Your OTP is: <b>${otp}</b></p><p>Valid for 5 minutes.</p>`
  );
}

export async function POST(req: Request) {
  try {
    const { email, password, fullName, role } = await req.json();

    // 1. Basic validation
    if (!email || !password || !fullName) {
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }

    // 2. Role safety
    let userRole: Role = Role.USER;
    if (role === Role.OWNER) userRole = Role.OWNER;
    if (role === Role.ADMIN) {
      return NextResponse.json({ error: "Invalid role" }, { status: 403 });
    }

    // 3. Check if user already exists
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    // 4. Hash password
    const passwordHash = await hashPassword(password);

    // 5. Create user + OTP in one transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role: userRole,
          emailVerified: false,
        },
      });

      await createAndSendOtp(newUser.email, tx);
    });

    return NextResponse.json({ ok: true, message: "OTP sent to email" });
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json({ error: "Registration failed" }, { status: 500 });
  }
}
