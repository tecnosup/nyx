"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/admin-session";
import {
  adminRestoreProduct,
  adminSetProductStatus,
  writeAudit,
} from "@/lib/admin-products";
import { adminRestoreDrop, adminDeleteDrop } from "@/lib/admin-drops";

type ActionResult = { ok: true } | { ok: false; error: string };

export async function revertAuditAction(
  action: string,
  entity: "product" | "drop",
  entityId: string
): Promise<ActionResult> {
  let session;
  try {
    session = await requireAdmin();
  } catch {
    return { ok: false, error: "Sessão inválida." };
  }

  try {
    if (action === "product.delete") {
      await adminRestoreProduct(entityId);
      await writeAudit({
        actorUid: session.uid,
        actorEmail: session.email,
        action: "product.restore",
        entity: "product",
        entityId,
      });
    } else if (action === "product.status.published") {
      await adminSetProductStatus(entityId, "draft");
      await writeAudit({
        actorUid: session.uid,
        actorEmail: session.email,
        action: "product.status.draft",
        entity: "product",
        entityId,
      });
    } else if (action === "product.status.draft") {
      await adminSetProductStatus(entityId, "published");
      await writeAudit({
        actorUid: session.uid,
        actorEmail: session.email,
        action: "product.status.published",
        entity: "product",
        entityId,
      });
    } else if (action === "drop.delete") {
      await adminRestoreDrop(entityId);
      await writeAudit({
        actorUid: session.uid,
        actorEmail: session.email,
        action: "drop.restore",
        entity: "drop",
        entityId,
      });
    } else if (action === "drop.restore") {
      await adminDeleteDrop(entityId);
      await writeAudit({
        actorUid: session.uid,
        actorEmail: session.email,
        action: "drop.delete",
        entity: "drop",
        entityId,
      });
    } else {
      return { ok: false, error: "Ação não reversível automaticamente." };
    }
  } catch {
    return { ok: false, error: "Erro ao reverter." };
  }

  revalidatePath("/admin/auditoria");
  revalidatePath("/admin/produtos");
  revalidatePath("/admin/drops");
  revalidatePath("/");
  revalidatePath("/produtos");
  return { ok: true };
}
