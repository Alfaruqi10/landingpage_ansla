import { jwtVerify, SignJWT } from "jose";

export const ADMIN_AUTH_COOKIE_NAME = "ansla-admin-session";
export const CUSTOMER_AUTH_COOKIE_NAME = "ansla-customer-session";
export const AUTH_COOKIE_NAME = ADMIN_AUTH_COOKIE_NAME;

export type SessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function getSecretKey() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "development-secret-change-me"
  );
}

export async function signAuthToken(payload: SessionPayload) {
  return new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(getSecretKey());
}

export async function verifyAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as SessionPayload;
  } catch {
    return null;
  }
}
