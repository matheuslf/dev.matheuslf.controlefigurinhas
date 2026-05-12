import Link from "next/link";
import { BookOpenCheck, LayoutGrid, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { TOTAL_STICKERS } from "@/data/selections";

function MockSticker({
  n,
  owned,
}: {
  n: number;
  owned: boolean;
}) {
  return (
    <div
      className={
        owned
          ? "flex h-12 items-center justify-center rounded-2xl border-2 border-success bg-success text-sm font-bold text-white shadow-sm"
          : "flex h-12 items-center justify-center rounded-2xl border-2 border-border bg-white text-sm font-semibold text-foreground"
      }
    >
      {n}
    </div>
  );
}

export default function HomePage() {
  const previewOwned = new Set([1, 2, 5, 8, 13, 21, 34]);

  return (
    <div className="flex min-h-screen flex-col bg-white">
      <SiteHeader />

      <main className="flex-1">
        <section className="border-b border-border bg-gradient-to-b from-card to-white px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-6">
              <Badge className="w-fit">Copa do Mundo 2026</Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Seu álbum, sem papel.
              </h1>
              <p className="max-w-lg text-lg text-muted">
                Marque figurinhas em segundos. Feito para celular — e fácil para
                crianças acompanharem com os pais.
              </p>
              <div className="flex flex-wrap gap-3">
                <Button asChild className="min-h-14 rounded-2xl px-8 text-lg">
                  <Link href="/album">Começar meu álbum</Link>
                </Button>
                <Button asChild variant="outline" className="min-h-14 rounded-2xl px-6 text-lg">
                  <Link href="/#preview">Ver prévia</Link>
                </Button>
              </div>
              <p className="text-sm text-muted">
                {TOTAL_STICKERS} figurinhas no álbum Panini — controle completo no
                app.
              </p>
            </div>

            <Card
              id="preview"
              className="scroll-mt-24 overflow-hidden shadow-md lg:max-w-lg lg:justify-self-end"
            >
              <CardHeader className="border-b border-border bg-card pb-4">
                <div className="flex items-center justify-between gap-2">
                  <CardTitle className="text-lg">Prévia do álbum</CardTitle>
                  <Badge variant="secondary">Ao vivo</Badge>
                </div>
                <CardDescription>Toque para marcar — assim no app</CardDescription>
                <div className="pt-2">
                  <div className="mb-2 flex justify-between text-sm text-muted">
                    <span>Progresso</span>
                    <span className="font-medium text-foreground">7 / 24</span>
                  </div>
                  <Progress value={29} />
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="grid grid-cols-4 gap-2 sm:grid-cols-6">
                  {Array.from({ length: 24 }, (_, i) => i + 1).map((n) => (
                    <MockSticker key={n} n={n} owned={previewOwned.has(n)} />
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section className="px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
              Como funciona
            </h2>
            <div className="grid gap-6 md:grid-cols-3">
              {[
                {
                  icon: LayoutGrid,
                  title: "1. Escolha a seleção",
                  text: "Filtre por time ou veja o álbum inteiro.",
                },
                {
                  icon: BookOpenCheck,
                  title: "2. Marque figurinhas",
                  text: "Um toque: tenho ou ainda não tenho.",
                },
                {
                  icon: Sparkles,
                  title: "3. Veja o progresso",
                  text: "Barra geral e por seleção, sempre atualizada.",
                },
              ].map((step) => (
                <Card key={step.title} className="text-center shadow-sm">
                  <CardHeader className="items-center pb-2">
                    <div className="mb-2 flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
                      <step.icon className="h-7 w-7" strokeWidth={2} />
                    </div>
                    <CardTitle className="text-xl">{step.title}</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted">{step.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="border-y border-border bg-card px-4 py-16 sm:px-6 sm:py-20">
          <div className="mx-auto max-w-6xl">
            <h2 className="mb-10 text-center text-3xl font-bold text-foreground">
              Benefícios
            </h2>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
              {[
                { t: "Mais rápido que papel", d: "Atualize em segundos, sem rabiscos." },
                { t: "Nunca perde a lista", d: "Salvo no seu navegador neste aparelho." },
                { t: "Feito pro celular", d: "Botões grandes e toque na figurinha." },
                { t: "Fácil pra crianças", d: "Pouco texto, fluxo direto ao ponto." },
              ].map((b) => (
                <Card key={b.t}>
                  <CardHeader>
                    <CardTitle className="text-lg">{b.t}</CardTitle>
                    <CardDescription className="text-base">{b.d}</CardDescription>
                  </CardHeader>
                </Card>
              ))}
            </div>
          </div>
        </section>

        <section className="relative overflow-hidden px-4 py-20 sm:px-6 sm:py-28">
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card/80 to-transparent" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Pronto para trocar o caderno pelo app?
            </h2>
            <p className="text-lg text-muted">
              Comece agora — sem cadastro para o MVP.
            </p>
            <Button asChild className="min-h-14 rounded-2xl px-10 text-lg">
              <Link href="/album">Começar meu álbum</Link>
            </Button>
          </div>
        </section>
      </main>

      <footer className="border-t border-border py-8 text-center text-sm text-muted">
        Figurinhas Copa 2026 — uso familiar. Dados salvos localmente neste
        dispositivo.
      </footer>
    </div>
  );
}
