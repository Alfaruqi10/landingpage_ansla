import bcrypt from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { db } from "@/lib/db";
import {
  CUSTOMER_AUTH_COOKIE_NAME,
  type SessionPayload,
  signAuthToken,
  verifyAuthToken
} from "@/lib/session";

export async function getCustomerSession() {
  const token = cookies().get(CUSTOMER_AUTH_COOKIE_NAME)?.value;

  if (!token) {
    return null;
  }

  return verifyAuthToken(token);
}

export async function requireCustomerSession() {
  const session = await getCustomerSession();

  if (!session) {
    redirect("/login");
  }

  return session;
}

export async function authenticateCustomer(email: string, password: string) {
  const customer = await db.customerUser.findUnique({
    where: { email: email.toLowerCase() }
  });

  if (!customer) {
    return null;
  }

  const passwordMatches = await bcrypt.compare(password, customer.passwordHash);

  if (!passwordMatches) {
    return null;
  }

  return customer;
}

export async function registerCustomer({
  name,
  email,
  phone,
  password
}: {
  name: string;
  email: string;
  phone?: string;
  password: string;
}) {
  const normalizedEmail = email.toLowerCase();
  const existingCustomer = await db.customerUser.findUnique({
    where: { email: normalizedEmail }
  });

  if (existingCustomer) {
    return {
      customer: null,
      error: "Email ini sudah terdaftar. Silakan login saja."
    };
  }

  const passwordHash = await bcrypt.hash(password, 10);

  const customer = await db.customerUser.create({
    data: {
      name,
      email: normalizedEmail,
      phone: phone || null,
      passwordHash
    }
  });

  return { customer, error: null };
}

export async function createCustomerSession(payload: SessionPayload) {
  const token = await signAuthToken(payload);

  cookies().set(CUSTOMER_AUTH_COOKIE_NAME, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  });
}

export function clearCustomerSession() {
  cookies().delete(CUSTOMER_AUTH_COOKIE_NAME);
}
