import Link from "next/link";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";

type LegalPageShellProps = {
  title: string;
  updatedAt: string;
  children: React.ReactNode;
};

export function LegalPageShell({ title, updatedAt, children }: LegalPageShellProps) {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />
      <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-8 px-4 py-10 sm:px-6 sm:py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold tracking-tight text-foreground">
              {title}
            </h1>
            <p className="mt-2 text-sm text-muted">
              Última atualização: {updatedAt}
            </p>
          </div>
          <Button asChild variant="outline" className="rounded-xl">
            <Link href="/">← Início</Link>
          </Button>
        </div>
        <article className="flex flex-col gap-8 text-base leading-relaxed text-foreground">
          {children}
        </article>
      </main>
      <SiteFooter />
    </div>
  );
}

function LegalSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-3">
      <h2 className="text-xl font-semibold text-foreground">{title}</h2>
      <div className="flex flex-col gap-3 text-muted [&_ul]:list-disc [&_ul]:pl-5 [&_ul]:flex [&_ul]:flex-col [&_ul]:gap-2">
        {children}
      </div>
    </section>
  );
}

export { LegalSection };
