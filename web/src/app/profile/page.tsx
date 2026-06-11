import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { ProfileClient } from "./profile-client";

export const metadata: Metadata = {
  title: "Meu perfil — Copa 2026",
  description: "Edite seus dados de perfil e senha.",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user) {
    redirect("/?signIn=1&callbackUrl=/profile");
  }
  return <ProfileClient />;
}
