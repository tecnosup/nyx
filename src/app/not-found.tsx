import Link from "next/link";

export default function NotFound() {
  return (
    <main className="min-h-screen flex items-center justify-center bg-nyx-bg px-6">
      <div className="text-center max-w-md">
        <p className="label-mono text-nyx-muted mb-6">404</p>
        <h1 className="heading-display text-5xl md:text-6xl text-nyx-ink mb-6">
          Página não encontrada.
        </h1>
        <p className="text-nyx-muted leading-relaxed mb-10">
          O endereço que você tentou acessar não existe, foi removido ou o drop já
          arquivou a peça.
        </p>
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/" className="btn-primary">
            Voltar à home
          </Link>
          <Link href="/produtos" className="btn-ghost">
            Ver catálogo
          </Link>
        </div>
      </div>
    </main>
  );
}
