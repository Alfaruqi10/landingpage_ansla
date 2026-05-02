import { jwtVerify } from "jose";

export const ADMIN_AUTH_COOKIE_NAME = "ansla-admin-session";

export type EdgeSessionPayload = {
  sub: string;
  email: string;
  name: string;
};

function getSecretKey() {
  return new TextEncoder().encode(
    process.env.AUTH_SECRET || "development-secret-change-me"
  );
}

export async function verifyEdgeAuthToken(token: string) {
  try {
    const { payload } = await jwtVerify(token, getSecretKey());
    return payload as EdgeSessionPayload;
  } catch {
    return null;
  }
}
