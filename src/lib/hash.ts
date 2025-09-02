// src/lib/hash.ts
import bcrypt from "bcrypt";
import crypto from "crypto";

const SALT_ROUNDS = 10;

export async function hashPassword(plain: string) {
  return bcrypt.hash(plain, SALT_ROUNDS);
}

export async function verifyPassword(plain: string, hash: string) {
  return bcrypt.compare(plain, hash);
}

// OTP hashing (use sha256 for OTPs)
export function hashOTP(
  otp: string,
  salt = crypto.randomBytes(8).toString("hex")
) {
  const h = crypto.createHmac("sha256", salt).update(otp).digest("hex");
  return `${salt}:${h}`;
}

export function verifyOTPHash(otp: string, stored: string) {
  const [salt, digest] = stored.split(":");
  if (!salt || !digest) return false;
  const h = crypto.createHmac("sha256", salt).update(otp).digest("hex");
  return crypto.timingSafeEqual(Buffer.from(h), Buffer.from(digest));
}
