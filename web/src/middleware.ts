import NextAuth from "next-auth";
import { NextResponse } from "next/server";
import { authConfig } from "@/auth.config";

const { auth } = NextAuth(authConfig);

export default auth((req) => {
  if (!req.auth) {
    const callbackUrl = req.nextUrl.pathname + req.nextUrl.search;
    const home = new URL("/", req.nextUrl.origin);
    home.searchParams.set("signIn", "1");
    home.searchParams.set("callbackUrl", callbackUrl);
    return NextResponse.redirect(home);
  }
});

export const config = {
  matcher: ["/albums/:path*", "/profile"],
};
