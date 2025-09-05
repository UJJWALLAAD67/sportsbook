import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/hash";
import { sendMail } from "@/lib/mailer";
import { Prisma, Role } from "@/generated/prisma";
import crypto from "crypto";
import bcrypt from "bcryptjs";
import { z } from "zod";

// It's best practice to use a shared Zod schema
const signupSchema = z.object({
  fullName: z.string().min(2, "Full name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(6, "Password must be at least 6 characters"),
  role: z.enum([Role.USER, Role.OWNER]).optional().default(Role.USER),
});

// Helper to create + send OTP within a transaction
async function createAndSendOtp(email: string, tx: Prisma.TransactionClient) {
  const otp = crypto.randomInt(100000, 999999).toString();
  const expiresAt = new Date(Date.now() + 5 * 60 * 1000); // 5 minutes validity
  const tokenHash = await bcrypt.hash(otp, 10);

  // Note: Your schema should handle potential duplicate OTPs for the same email
  // by either cleaning up old ones or having a unique constraint.
  await tx.emailOtp.create({
    data: {
      email,
      tokenHash,
      expiresAt,
    },
  });

  await sendMail(
    email,
    "Your SportsBook Verification Code",
    `<p>Your verification code is: <b>${otp}</b></p><p>It is valid for 5 minutes.</p>`
  );
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = signupSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid input", details: validated.error.flatten() },
        { status: 400 }
      );
    }

    const { email, password, fullName, role } = validated.data;

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return NextResponse.json(
        { error: "Email already registered" },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Create user, owner profile (if applicable), and OTP in one transaction
    await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          email,
          passwordHash,
          fullName,
          role,
          emailVerified: false,
        },
      });

      // ✅ FIX: If the role is OWNER, create the linked FacilityOwner profile
      if (role === Role.OWNER) {
        await tx.facilityOwner.create({
          data: {
            userId: newUser.id,
          },
        });
      }

      await createAndSendOtp(newUser.email, tx);
    });

    return NextResponse.json(
      { ok: true, message: "OTP sent to email for verification." },
      { status: 201 }
    );
  } catch (err) {
    console.error("Registration failed:", err);
    return NextResponse.json(
      { error: "Could not complete registration." },
      { status: 500 }
    );
  }
}
