import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  AUTH_COOKIE_NAME,
  type SessionPayload,
  signAuthToken,
  verifyAuthToken
} from "@/lib/session";

export async function getAdminSession() {
  const token = cookies().get(AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function requireAdminSession() {
  const session = await getAdminSession();

  if (!session) {
    redirect("/admin/login");
  }

  return session;
}

export async function authenticateAdmin(email: string, password: string) {
  const admin = await db.adminUser.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!admin) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, admin.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return admin;
}

export async function createAdminSession(payload: SessionPayload) {
  const token = await signAuthToken(payload);

  cookies().set(AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 7
  });
}

export function clearAdminSession() {
  cookies().delete(AUTH_COOKIE_NAME);
}
