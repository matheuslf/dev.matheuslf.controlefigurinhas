import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/components/providers/session-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import { authUrl } from "@/lib/env";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const siteTitle = "Figurinhas Copa 2026 — controle do álbum";
const siteDescription =
  "Marque figurinhas do álbum da Copa 2026 no celular. Simples, rápido e sem papel.";

export const metadata: Metadata = {
  metadataBase: new URL(authUrl),
  title: siteTitle,
  description: siteDescription,
  icons: {
    icon: [{ url: "/logo.png", type: "image/png" }],
    apple: [{ url: "/logo.png", type: "image/png" }],
  },
  openGraph: {
    title: siteTitle,
    description: siteDescription,
    type: "website",
    locale: "pt_BR",
    images: [
      {
        url: "/logo.gif",
        type: "image/gif",
        width: 512,
        height: 512,
        alt: "Copa do Mundo FIFA 2026",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: siteTitle,
    description: siteDescription,
    images: ["/logo.gif"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" className={`${inter.variable} h-full antialiased`} suppressHydrationWarning>
      <body className="min-h-full flex flex-col bg-background font-sans text-foreground">
        <ThemeProvider>
          <AuthProvider>{children}</AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
