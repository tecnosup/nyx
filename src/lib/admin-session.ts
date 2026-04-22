import "server-only";
import { cookies } from "next/headers";
import { adminAuth, isAdminConfigured } from "./firebase-admin";
import { SESSION_COOKIE } from "./admin-session-const";

export { SESSION_COOKIE, SESSION_MAX_AGE_SECONDS } from "./admin-session-const";

export interface AdminSession {
  uid: string;
  email: string | null;
}

export async function getAdminSession(): Promise<AdminSession | null> {
  if (!isAdminConfigured) return null;
  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;
  try {
    const decoded = await adminAuth().verifySessionCookie(token, true);
    if (decoded.admin !== true) return null;
    return { uid: decoded.uid, email: decoded.email ?? null };
  } catch {
    return null;
  }
}

export async function requireAdmin(): Promise<AdminSession> {
  const session = await getAdminSession();
  if (!session) {
    throw new Error("Sessão de administrador inválida ou expirada.");
  }
  return session;
}
