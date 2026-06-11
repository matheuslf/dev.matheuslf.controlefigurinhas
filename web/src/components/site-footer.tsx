import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="border-t border-border bg-card-muted py-8">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-3 px-4 text-center text-sm text-muted sm:px-6">
        <nav className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
          <Link
            href="/privacidade"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Política de Privacidade
          </Link>
          <span aria-hidden="true">·</span>
          <Link
            href="/termos"
            className="underline-offset-4 hover:text-foreground hover:underline"
          >
            Termos de Serviço
          </Link>
        </nav>
        <p>
          Figurinhas Copa 2026 — uso familiar. Dados salvos localmente; com login,
          sincronizados na sua conta.
        </p>
      </div>
    </footer>
  );
}
