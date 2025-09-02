import NextAuth, { DefaultSession } from "next-auth";
import { Role } from "@prisma/client";

declare module "next-auth" {
  interface User {
    id: number;
    role: Role;
    fullName: string;
    avatarUrl?: string | null;
    emailVerified: boolean;
  }

  interface Session {
    user: {
      id: number;
      role: Role;
      fullName: string;
      avatarUrl?: string | null;
      emailVerified: boolean;
    } & DefaultSession["user"];
  }

  interface JWT {
    id: number;
    role: Role;
    fullName: string;
    avatarUrl?: string | null;
    emailVerified: boolean;
  }
}
