import { redirect } from "next/navigation";
import { normalizeCallbackUrl } from "@/lib/auth-callback-url";

type LoginPageProps = {
  searchParams: Promise<{ callbackUrl?: string }>;
};

/** Compatibilidade: redireciona links antigos /login para o modal na home. */
export default async function LoginPage({ searchParams }: LoginPageProps) {
  const { callbackUrl } = await searchParams;
  const params = new URLSearchParams({ signIn: "1" });
  if (callbackUrl) {
    params.set("callbackUrl", normalizeCallbackUrl(callbackUrl));
  }
  redirect(`/?${params.toString()}`);
}
