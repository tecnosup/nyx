import Link from "next/link";
import { DropForm } from "@/components/admin/DropForm";
import { createDropAction } from "../actions";

export const dynamic = "force-dynamic";

export default function NewDropPage() {
  return (
    <div className="container-nyx py-12 md:py-16 max-w-3xl">
      <div className="mb-10">
        <Link
          href="/admin/drops"
          className="label-mono text-nyx-muted hover:text-nyx-ink"
        >
          ← Drops
        </Link>
        <h1 className="heading-display text-3xl md:text-4xl mt-3">Novo drop</h1>
      </div>
      <DropForm mode="create" action={createDropAction} />
    </div>
  );
}
