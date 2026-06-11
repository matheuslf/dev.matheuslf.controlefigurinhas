import Link from "next/link";
import Image from "next/image";
import { BookOpenCheck, LayoutGrid, Sparkles } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { GoogleOneTap } from "@/components/auth/google-one-tap";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteFooter } from "@/components/site-footer";
import { TOTAL_STICKERS } from "@/data/selections";

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <SiteHeader />

      <main className="flex-1">
        <section className="copa-hero-gradient border-b border-border px-4 py-16 sm:px-6 sm:py-24">
          <div className="mx-auto grid max-w-6xl gap-12 lg:grid-cols-2 lg:items-center">
            <div className="flex flex-col gap-6">
              <Badge variant="copa" className="w-fit">
                Copa do Mundo 2026
              </Badge>
              <h1 className="text-4xl font-bold leading-tight tracking-tight text-foreground sm:text-5xl">
                Seu álbum,{" "}
                <span className="text-primary">sem papel</span>.
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
                {TOTAL_STICKERS} figurinhas no álbum Panini — use sem conta ou entre
                com Google para sincronizar e trocar repetidas.
              </p>
            </div>

            <div
              id="preview"
              className="scroll-mt-24 flex items-center justify-center lg:max-w-lg lg:justify-self-end"
            >
              <Image
                src="/logo.gif"
                alt="Copa do Mundo FIFA 2026"
                width={400}
                height={400}
                className="h-auto w-full max-w-sm rounded-2xl shadow-[var(--shadow-3)]"
                unoptimized
                priority
              />
            </div>
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
                  accent: "text-copa-blue",
                  bg: "bg-copa-blue/10",
                },
                {
                  icon: BookOpenCheck,
                  title: "2. Marque figurinhas",
                  text: "Um toque: tenho ou ainda não tenho.",
                  accent: "text-copa-red",
                  bg: "bg-copa-red/10",
                },
                {
                  icon: Sparkles,
                  title: "3. Veja o progresso",
                  text: "Barra geral e por seleção, sempre atualizada.",
                  accent: "text-primary",
                  bg: "bg-primary/10",
                },
              ].map((step) => (
                <Card key={step.title} className="text-center shadow-[var(--shadow-2)]">
                  <CardHeader className="items-center pb-2">
                    <div
                      className={`mb-2 flex h-14 w-14 items-center justify-center rounded-2xl ${step.bg} ${step.accent}`}
                    >
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

        <section className="border-y border-border bg-card-muted px-4 py-16 sm:px-6 sm:py-20">
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
                <Card key={b.t} className="border-border-strong">
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
          <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-card-muted/80 to-transparent" />
          <div className="relative mx-auto flex max-w-2xl flex-col items-center gap-6 text-center">
            <Badge variant="default" className="text-sm">
              #WeAre26
            </Badge>
            <h2 className="text-3xl font-bold text-foreground sm:text-4xl">
              Pronto para trocar o caderno pelo app?
            </h2>
            <p className="text-lg text-muted">
              Use sem conta ou entre com Google para sincronizar na nuvem e
              compartilhar repetidas com amigos.
            </p>
            <Button asChild className="min-h-14 rounded-2xl px-10 text-lg shadow-[var(--shadow-glow-gold)]">
              <Link href="/album">Começar meu álbum</Link>
            </Button>
          </div>
        </section>
      </main>

      <SiteFooter />
      <GoogleOneTap />
    </div>
  );
}
