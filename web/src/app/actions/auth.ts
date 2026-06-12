"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import {
  hashPassword,
  normalizeEmail,
  validatePassword,
  verifyPassword,
} from "@/lib/password";
import { revalidatePath } from "next/cache";
import {
  createAndSendVerificationEmail,
  isEmailPendingVerification,
} from "@/lib/email-verification";
import {
  requestPasswordResetForEmail,
  resetPasswordByToken,
} from "@/lib/password-reset";

export type AuthActionResult =
  | { ok: true; needsEmailVerification?: boolean }
  | { ok: false; error: string };

export type UserProfile = {
  id: string;
  name: string | null;
  email: string;
  image: string | null;
  hasPassword: boolean;
  emailVerified: boolean;
};

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export async function registerUser(
  name: string,
  email: string,
  password: string,
): Promise<AuthActionResult> {
  const trimmedName = name.trim();
  const normalizedEmail = normalizeEmail(email);

  if (trimmedName.length < 2) {
    return { ok: false, error: "Informe seu nome completo." };
  }
  if (!normalizedEmail.includes("@")) {
    return { ok: false, error: "E-mail inválido." };
  }
  const passwordError = validatePassword(password);
  if (passwordError) return { ok: false, error: passwordError };

  const existing = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (existing) {
    return {
      ok: false,
      error: "Este e-mail já está cadastrado. Entre ou recupere o acesso.",
    };
  }

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: {
      name: trimmedName,
      email: normalizedEmail,
      passwordHash,
    },
  });

  const emailResult = await createAndSendVerificationEmail(
    normalizedEmail,
    trimmedName,
  );
  if (!emailResult.ok) {
    await prisma.user.delete({ where: { id: user.id } });
    return { ok: false, error: emailResult.error };
  }

  return { ok: true, needsEmailVerification: true };
}

export async function resendVerificationEmail(
  email: string,
): Promise<AuthActionResult> {
  const normalizedEmail = normalizeEmail(email);
  if (!normalizedEmail.includes("@")) {
    return { ok: false, error: "E-mail inválido." };
  }

  const user = await prisma.user.findUnique({
    where: { email: normalizedEmail },
  });
  if (!user?.passwordHash) {
    return {
      ok: false,
      error: "Conta não encontrada. Cadastre-se com e-mail e senha.",
    };
  }
  if (user.emailVerified) {
    return { ok: false, error: "Este e-mail já foi confirmado." };
  }

  const emailResult = await createAndSendVerificationEmail(
    normalizedEmail,
    user.name,
  );
  if (!emailResult.ok) {
    return { ok: false, error: emailResult.error };
  }

  return { ok: true };
}

export async function checkEmailPendingVerification(
  email: string,
): Promise<boolean> {
  return isEmailPendingVerification(email);
}

export async function requestPasswordReset(
  email: string,
): Promise<AuthActionResult> {
  const result = await requestPasswordResetForEmail(email);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export async function resetPasswordByTokenAction(
  token: string,
  newPassword: string,
): Promise<AuthActionResult> {
  const result = await resetPasswordByToken(token, newPassword);
  if (!result.ok) {
    return { ok: false, error: result.error };
  }

  return { ok: true };
}

export async function getUserProfile(): Promise<UserProfile> {
  const userId = await requireUserId();
  const user = await prisma.user.findUniqueOrThrow({
    where: { id: userId },
  });

  return {
    id: user.id,
    name: user.name,
    email: user.email,
    image: user.image,
    hasPassword: Boolean(user.passwordHash),
    emailVerified: Boolean(user.emailVerified),
  };
}

export async function updateUserProfile(data: {
  name: string;
  email?: string;
  currentPassword?: string;
}): Promise<AuthActionResult> {
  const userId = await requireUserId();
  const trimmedName = data.name.trim();
  if (trimmedName.length < 2) {
    return { ok: false, error: "Informe um nome válido." };
  }

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  const updateData: { name: string; email?: string } = { name: trimmedName };

  if (data.email && normalizeEmail(data.email) !== user.email) {
    const nextEmail = normalizeEmail(data.email);
    if (!nextEmail.includes("@")) {
      return { ok: false, error: "E-mail inválido." };
    }
    if (!user.passwordHash) {
      return {
        ok: false,
        error: "Defina uma senha no perfil antes de alterar o e-mail.",
      };
    }
    if (!data.currentPassword) {
      return { ok: false, error: "Informe a senha atual para alterar o e-mail." };
    }
    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Senha atual incorreta." };

    const taken = await prisma.user.findUnique({ where: { email: nextEmail } });
    if (taken && taken.id !== userId) {
      return { ok: false, error: "Este e-mail já está em uso." };
    }
    updateData.email = nextEmail;
  }

  const emailChanged = Boolean(updateData.email);

  await prisma.user.update({
    where: { id: userId },
    data: {
      ...updateData,
      ...(emailChanged ? { emailVerified: null } : {}),
    },
  });

  if (emailChanged && updateData.email) {
    const emailResult = await createAndSendVerificationEmail(
      updateData.email,
      trimmedName,
    );
    if (!emailResult.ok) {
      return { ok: false, error: emailResult.error };
    }
  }

  revalidatePath("/profile");
  return emailChanged
    ? { ok: true, needsEmailVerification: true }
    : { ok: true };
}

export async function changeUserPassword(data: {
  currentPassword?: string;
  newPassword: string;
}): Promise<AuthActionResult> {
  const userId = await requireUserId();
  const passwordError = validatePassword(data.newPassword);
  if (passwordError) return { ok: false, error: passwordError };

  const user = await prisma.user.findUniqueOrThrow({ where: { id: userId } });

  if (user.passwordHash) {
    if (!data.currentPassword) {
      return { ok: false, error: "Informe a senha atual." };
    }
    const valid = await verifyPassword(data.currentPassword, user.passwordHash);
    if (!valid) return { ok: false, error: "Senha atual incorreta." };
  }

  await prisma.user.update({
    where: { id: userId },
    data: { passwordHash: await hashPassword(data.newPassword) },
  });

  revalidatePath("/profile");
  return { ok: true };
}
