import { NextResponse } from "next/server";
import { signIn } from "@/auth";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { credential?: string };
    if (!body.credential) {
      return NextResponse.json({ error: "Missing credential" }, { status: 400 });
    }

    const result = await signIn("google-one-tap", {
      credential: body.credential,
      redirect: false,
    });

    if (result?.error) {
      return NextResponse.json({ error: result.error }, { status: 401 });
    }

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Authentication failed" }, { status: 500 });
  }
}
