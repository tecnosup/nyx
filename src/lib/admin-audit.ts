import "server-only";
import { adminDb } from "./firebase-admin";

export interface AuditLogEntry {
  id: string;
  actorUid: string;
  actorEmail: string | null;
  action: string;
  entity: "product" | "drop";
  entityId: string;
  summary?: string;
  createdAt: number | null;
}

export async function adminListAudit(limit = 100): Promise<AuditLogEntry[]> {
  const snap = await adminDb()
    .collection("auditLogs")
    .orderBy("createdAt", "desc")
    .limit(limit)
    .get();

  return snap.docs.map((doc) => {
    const data = doc.data();
    const ts = data.createdAt;
    const millis =
      ts && typeof ts.toMillis === "function"
        ? ts.toMillis()
        : typeof ts === "number"
          ? ts
          : null;
    return {
      id: doc.id,
      actorUid: data.actorUid ?? "",
      actorEmail: data.actorEmail ?? null,
      action: data.action ?? "",
      entity: data.entity ?? "product",
      entityId: data.entityId ?? "",
      summary: data.summary,
      createdAt: millis,
    };
  });
}
