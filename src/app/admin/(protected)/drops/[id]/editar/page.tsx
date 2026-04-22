import Link from "next/link";
import { notFound } from "next/navigation";
import { adminGetDrop } from "@/lib/admin-drops";
import { DropForm } from "@/components/admin/DropForm";
import { updateDropAction } from "../../actions";

export const dynamic = "force-dynamic";

export default async function EditDropPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const drop = await adminGetDrop(id);
  if (!drop) notFound();

  const action = updateDropAction.bind(null, id);

  return (
    <div className="container-nyx py-12 md:py-16 max-w-3xl">
      <div className="mb-10">
        <Link
          href="/admin/drops"
          className="label-mono text-nyx-muted hover:text-nyx-ink"
        >
          ← Drops
        </Link>
        <h1 className="heading-display text-3xl md:text-4xl mt-3">Editar drop</h1>
        <p className="label-mono text-nyx-muted text-xs mt-2">{drop.slug}</p>
      </div>
      <DropForm mode="edit" drop={drop} action={action} />
    </div>
  );
}
