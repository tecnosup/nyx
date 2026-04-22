import "server-only";
import { cert, getApps, initializeApp, type App } from "firebase-admin/app";
import { getAuth, type Auth } from "firebase-admin/auth";
import { getFirestore, type Firestore } from "firebase-admin/firestore";

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

export const isAdminConfigured = Boolean(projectId && clientEmail && privateKey);

let app: App | null = null;

function getAdminApp(): App {
  if (!isAdminConfigured) {
    throw new Error(
      "Firebase Admin SDK não configurado. Preencha FIREBASE_ADMIN_* em .env.local."
    );
  }
  if (app) return app;
  const existing = getApps()[0];
  if (existing) {
    app = existing;
    return app;
  }
  app = initializeApp({
    credential: cert({
      projectId: projectId!,
      clientEmail: clientEmail!,
      privateKey: privateKey!,
    }),
  });
  return app;
}

export function adminDb(): Firestore {
  return getFirestore(getAdminApp());
}

export function adminAuth(): Auth {
  return getAuth(getAdminApp());
}
