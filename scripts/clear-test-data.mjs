/**
 * Script para limpar dados de teste do Firestore.
 * Uso: node scripts/clear-test-data.mjs
 *
 * Requer as variáveis de ambiente do .env.local.
 */

import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";

// Carrega .env.local manualmente
const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = resolve(__dirname, "../.env.local");
try {
  const envFile = readFileSync(envPath, "utf-8");
  for (const line of envFile.split("\n")) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;
    const idx = trimmed.indexOf("=");
    if (idx === -1) continue;
    const key = trimmed.slice(0, idx).trim();
    const val = trimmed.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
    process.env[key] ??= val;
  }
} catch {
  console.error("❌  Não encontrei .env.local — certifique-se que existe na raiz do projeto.");
  process.exit(1);
}

// Inicializa Firebase Admin
const { initializeApp, cert, getApps } = await import("firebase-admin/app");
const { getFirestore } = await import("firebase-admin/firestore");

const projectId = process.env.FIREBASE_ADMIN_PROJECT_ID;
const clientEmail = process.env.FIREBASE_ADMIN_CLIENT_EMAIL;
const privateKey = process.env.FIREBASE_ADMIN_PRIVATE_KEY?.replace(/\\n/g, "\n");

if (!projectId || !clientEmail || !privateKey) {
  console.error("❌  Variáveis FIREBASE_ADMIN_* não encontradas no .env.local.");
  process.exit(1);
}

const app = getApps()[0] ?? initializeApp({ credential: cert({ projectId, clientEmail, privateKey }) });
const db = getFirestore(app);

// Coleções a limpar
const COLLECTIONS = [
  "products",
  "orders",
  "stockMovements",
  "caixas",
  "gastos",
  "gastosCategories",
  "auditLogs",
];

async function deleteCollection(name) {
  let deleted = 0;
  while (true) {
    const snap = await db.collection(name).limit(100).get();
    if (snap.empty) break;
    const batch = db.batch();
    snap.docs.forEach((doc) => batch.delete(doc.ref));
    await batch.commit();
    deleted += snap.docs.length;
    process.stdout.write(`\r  ${name}: ${deleted} documentos deletados...`);
  }
  console.log(`\r  ✓ ${name}: ${deleted} documentos deletados.    `);
}

console.log("\n🗑️  Limpando dados de teste do Firestore...\n");

for (const col of COLLECTIONS) {
  await deleteCollection(col);
}

// Limpa a configuração da home (produto em destaque)
try {
  await db.collection("settings").doc("home").delete();
  console.log("  ✓ settings/home: limpo.");
} catch {
  // não existia, tudo bem
}

console.log("\n✅  Feito! Firestore limpo e pronto para uso real.\n");
process.exit(0);
