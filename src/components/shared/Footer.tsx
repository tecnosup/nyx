import Link from "next/link";
import { Instagram } from "lucide-react";
import { SITE_CONFIG, NAVIGATION } from "@/lib/constants";

export function Footer() {
  return (
    <footer className="border-t border-nyx-line mt-32">
      <div className="container-nyx py-16">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-12">
          <div className="md:col-span-5">
            <Link href="/" className="font-serif text-3xl tracking-tight">
              {SITE_CONFIG.name}
            </Link>
            <p className="mt-6 text-nyx-muted max-w-sm leading-relaxed">
              {SITE_CONFIG.description}
            </p>
          </div>

          <div className="md:col-span-3">
            <h3 className="label-mono text-nyx-muted mb-6">Navegação</h3>
            <ul className="space-y-3">
              {NAVIGATION.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-nyx-ink hover:text-nyx-muted transition-colors"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="md:col-span-4">
            <h3 className="label-mono text-nyx-muted mb-6">Contato</h3>
            <a
              href={SITE_CONFIG.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-nyx-ink hover:text-nyx-muted transition-colors"
            >
              <Instagram size={18} />
              <span>@nyx</span>
            </a>
            <p className="mt-4 text-sm text-nyx-muted">
              Siga para ficar por dentro dos próximos drops.
            </p>
          </div>
        </div>

        <div className="mt-16 pt-8 border-t border-nyx-line flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <p className="text-xs text-nyx-soft">
            © {new Date().getFullYear()} {SITE_CONFIG.name} Todos os direitos
            reservados.
          </p>
          <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
            <Link href="/privacidade" className="text-xs text-nyx-soft hover:text-nyx-muted transition-colors">
              Privacidade
            </Link>
            <Link href="/termos" className="text-xs text-nyx-soft hover:text-nyx-muted transition-colors">
              Termos de uso
            </Link>
            <Link href="/trocas" className="text-xs text-nyx-soft hover:text-nyx-muted transition-colors">
              Trocas e devoluções
            </Link>
            <span className="text-xs text-nyx-soft label-mono">Desenvolvido por Tecnosup</span>
          </div>
        </div>
      </div>
    </footer>
  );
}