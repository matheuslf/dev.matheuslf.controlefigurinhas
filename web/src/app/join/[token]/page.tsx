import { Suspense } from "react";
import { JoinClient } from "./join-client";

type PageProps = {
  params: Promise<{ token: string }>;
};

export default async function JoinPage({ params }: PageProps) {
  const { token } = await params;
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center text-muted">
          Carregando convite…
        </div>
      }
    >
      <JoinClient token={token} />
    </Suspense>
  );
}
