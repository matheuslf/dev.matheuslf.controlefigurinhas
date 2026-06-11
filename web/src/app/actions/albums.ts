"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TOTAL_STICKERS } from "@/data/selections";
import {
  formatOwnerInviteCode,
  generateOwnerInviteCode,
  normalizeOwnerInviteCode,
} from "@/lib/owner-invite-code";
import { revalidatePath } from "next/cache";

async function createUniqueOwnerInviteCode(): Promise<string> {
  for (let attempt = 0; attempt < 8; attempt++) {
    const code = generateOwnerInviteCode();
    const exists = await prisma.album.findUnique({
      where: { ownerInviteCode: code },
      select: { id: true },
    });
    if (!exists) return code;
  }
  throw new Error("Could not generate owner invite code");
}

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

async function requireAlbumMember(albumId: string, userId: string) {
  const member = await prisma.albumMember.findUnique({
    where: { albumId_userId: { albumId, userId } },
  });
  if (!member) throw new Error("Forbidden");
  return member;
}

async function requireAlbumOwner(albumId: string, userId: string) {
  const member = await requireAlbumMember(albumId, userId);
  if (member.role !== "OWNER") throw new Error("Forbidden");
  return member;
}

export type AlbumSummary = {
  id: string;
  name: string;
  role: "OWNER" | "MEMBER";
  memberCount: number;
  inviteToken: string;
};

export async function listMyAlbums(): Promise<AlbumSummary[]> {
  const userId = await requireUserId();
  const memberships = await prisma.albumMember.findMany({
    where: { userId },
    include: {
      album: {
        include: { _count: { select: { members: true } } },
      },
    },
    orderBy: { joinedAt: "asc" },
  });

  return memberships.map((m) => ({
    id: m.album.id,
    name: m.album.name,
    role: m.role,
    memberCount: m.album._count.members,
    inviteToken: m.album.inviteToken,
  }));
}

export async function createAlbum(name: string) {
  const userId = await requireUserId();
  const album = await prisma.album.create({
    data: {
      name: name.trim() || "Álbum compartilhado",
      members: { create: { userId, role: "OWNER" } },
    },
  });
  revalidatePath("/albums");
  return album.id;
}

export async function getAlbumMembers(albumId: string) {
  const userId = await requireUserId();
  await requireAlbumMember(albumId, userId);

  const members = await prisma.albumMember.findMany({
    where: { albumId },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return members.map((m) => ({
    id: m.id,
    userId: m.userId,
    role: m.role,
    name: m.user.name ?? m.user.email.split("@")[0],
    image: m.user.image,
    joinedAt: m.joinedAt.toISOString(),
  }));
}

export async function getAlbumOwners(albumId: string) {
  const userId = await requireUserId();
  await requireAlbumMember(albumId, userId);

  const owners = await prisma.albumMember.findMany({
    where: { albumId, role: "OWNER" },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { joinedAt: "asc" },
  });

  return owners.map((m) => ({
    userId: m.userId,
    name: m.user.name ?? m.user.email.split("@")[0],
    image: m.user.image,
    joinedAt: m.joinedAt.toISOString(),
  }));
}

export type OwnerInviteInfo = {
  code: string;
  codeFormatted: string;
  revoked: boolean;
};

export async function getOwnerInviteInfo(
  albumId: string,
): Promise<OwnerInviteInfo | null> {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);

  const album = await prisma.album.findUniqueOrThrow({
    where: { id: albumId },
    select: {
      ownerInviteCode: true,
      ownerInviteRevoked: true,
    },
  });

  if (!album.ownerInviteCode || album.ownerInviteRevoked) {
    return null;
  }

  return {
    code: album.ownerInviteCode,
    codeFormatted: formatOwnerInviteCode(album.ownerInviteCode),
    revoked: album.ownerInviteRevoked,
  };
}

export async function ensureOwnerInviteCode(albumId: string): Promise<OwnerInviteInfo> {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);

  const album = await prisma.album.findUniqueOrThrow({
    where: { id: albumId },
    select: { ownerInviteCode: true, ownerInviteRevoked: true },
  });

  if (album.ownerInviteCode && !album.ownerInviteRevoked) {
    return {
      code: album.ownerInviteCode,
      codeFormatted: formatOwnerInviteCode(album.ownerInviteCode),
      revoked: false,
    };
  }

  const code = await createUniqueOwnerInviteCode();
  const updated = await prisma.album.update({
    where: { id: albumId },
    data: {
      ownerInviteCode: code,
      ownerInviteRevoked: false,
    },
    select: { ownerInviteCode: true, ownerInviteRevoked: true },
  });

  revalidatePath("/album");
  revalidatePath(`/albums/${albumId}/settings`);

  return {
    code: updated.ownerInviteCode!,
    codeFormatted: formatOwnerInviteCode(updated.ownerInviteCode!),
    revoked: updated.ownerInviteRevoked,
  };
}

export async function regenerateOwnerInviteCode(albumId: string): Promise<OwnerInviteInfo> {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);

  const code = await createUniqueOwnerInviteCode();
  const updated = await prisma.album.update({
    where: { id: albumId },
    data: {
      ownerInviteCode: code,
      ownerInviteRevoked: false,
    },
    select: { ownerInviteCode: true, ownerInviteRevoked: true },
  });

  revalidatePath("/album");
  revalidatePath(`/albums/${albumId}/settings`);

  return {
    code: updated.ownerInviteCode!,
    codeFormatted: formatOwnerInviteCode(updated.ownerInviteCode!),
    revoked: updated.ownerInviteRevoked,
  };
}

export async function joinAlbumByOwnerCode(rawCode: string) {
  const userId = await requireUserId();
  const code = normalizeOwnerInviteCode(rawCode);

  if (code.length !== 8) throw new Error("Invalid owner invite code");

  const album = await prisma.album.findUnique({
    where: { ownerInviteCode: code },
  });

  if (!album || album.ownerInviteRevoked) {
    throw new Error("Invalid owner invite code");
  }

  await prisma.albumMember.upsert({
    where: { albumId_userId: { albumId: album.id, userId } },
    create: { albumId: album.id, userId, role: "OWNER" },
    update: { role: "OWNER" },
  });

  revalidatePath("/albums");
  return album.id;
}

export async function regenerateInviteToken(albumId: string) {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);

  const album = await prisma.album.update({
    where: { id: albumId },
    data: {
      inviteToken: crypto.randomUUID().replace(/-/g, ""),
      inviteRevoked: false,
    },
  });
  revalidatePath(`/albums/${albumId}/settings`);
  return album.inviteToken;
}

export async function promoteToOwner(albumId: string, targetUserId: string) {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);

  await prisma.albumMember.update({
    where: { albumId_userId: { albumId, userId: targetUserId } },
    data: { role: "OWNER" },
  });
  revalidatePath(`/albums/${albumId}/settings`);
}

export async function leaveAlbum(albumId: string) {
  const userId = await requireUserId();
  const member = await requireAlbumMember(albumId, userId);

  if (member.role === "OWNER") {
    const ownerCount = await prisma.albumMember.count({
      where: { albumId, role: "OWNER" },
    });
    if (ownerCount <= 1) {
      const memberCount = await prisma.albumMember.count({
        where: { albumId },
      });
      if (memberCount <= 1) {
        await prisma.album.delete({ where: { id: albumId } });
        revalidatePath("/albums");
        revalidatePath("/album");
        return;
      }
      throw new Error("Promova outro membro a dono antes de sair.");
    }
  }

  await prisma.albumMember.delete({
    where: { albumId_userId: { albumId, userId } },
  });
  revalidatePath("/albums");
  revalidatePath("/album");
}

export async function renameAlbum(albumId: string, name: string) {
  const userId = await requireUserId();
  await requireAlbumOwner(albumId, userId);
  await prisma.album.update({
    where: { id: albumId },
    data: { name: name.trim() || "Álbum compartilhado" },
  });
  revalidatePath("/albums");
}

export async function getAlbumPreview(token: string) {
  const album = await prisma.album.findUnique({
    where: { inviteToken: token },
    include: {
      _count: { select: { members: true } },
      members: { select: { userId: true } },
    },
  });

  if (!album || album.inviteRevoked) return null;

  const memberIds = album.members.map((m) => m.userId);
  const stickers = await prisma.userSticker.findMany({
    where: { userId: { in: memberIds }, owned: true },
    select: { stickerNumber: true },
  });

  const ownedSet = new Set(stickers.map((s) => s.stickerNumber));

  return {
    id: album.id,
    name: album.name,
    memberCount: album._count.members,
    groupOwnedCount: ownedSet.size,
    groupPercent: Math.round((ownedSet.size / TOTAL_STICKERS) * 1000) / 10,
  };
}

export async function joinAlbum(token: string, options?: { asOwner?: boolean }) {
  const userId = await requireUserId();

  const album = await prisma.album.findUnique({
    where: { inviteToken: token },
  });

  if (!album || album.inviteRevoked) throw new Error("Invalid invite");

  const role = options?.asOwner ? "OWNER" : "MEMBER";

  await prisma.albumMember.upsert({
    where: { albumId_userId: { albumId: album.id, userId } },
    create: { albumId: album.id, userId, role },
    update: options?.asOwner ? { role: "OWNER" } : {},
  });

  revalidatePath("/albums");
  return album.id;
}

export async function getAlbumGroupProgress(albumId: string) {
  const userId = await requireUserId();
  await requireAlbumMember(albumId, userId);

  const members = await prisma.albumMember.findMany({
    where: { albumId },
    select: { userId: true },
  });

  const stickers = await prisma.userSticker.findMany({
    where: {
      userId: { in: members.map((m) => m.userId) },
      owned: true,
    },
    select: { stickerNumber: true },
  });

  return [...new Set(stickers.map((s) => s.stickerNumber))].sort((a, b) => a - b);
}

export type AlbumSharedSnapshot = {
  owned: number[];
  duplicateTotals: { stickerNumber: number; totalDuplicates: number }[];
};

export async function getAlbumSharedSnapshot(
  albumId: string,
): Promise<AlbumSharedSnapshot> {
  const userId = await requireUserId();
  await requireAlbumMember(albumId, userId);

  const members = await prisma.albumMember.findMany({
    where: { albumId },
    select: { userId: true },
  });
  const memberIds = members.map((m) => m.userId);

  const stickers = await prisma.userSticker.findMany({
    where: { userId: { in: memberIds } },
    select: { stickerNumber: true, owned: true, duplicateCount: true },
  });

  const ownedSet = new Set<number>();
  const dupMap = new Map<number, number>();

  for (const row of stickers) {
    if (row.owned) ownedSet.add(row.stickerNumber);
    if (row.duplicateCount > 0) {
      dupMap.set(
        row.stickerNumber,
        (dupMap.get(row.stickerNumber) ?? 0) + row.duplicateCount,
      );
    }
  }

  return {
    owned: [...ownedSet].sort((a, b) => a - b),
    duplicateTotals: [...dupMap.entries()]
      .map(([stickerNumber, totalDuplicates]) => ({
        stickerNumber,
        totalDuplicates,
      }))
      .sort((a, b) => a.stickerNumber - b.stickerNumber),
  };
}

export type MemberDuplicate = {
  userId: string;
  name: string;
  image: string | null;
  stickerNumber: number;
  duplicateCount: number;
};

export async function getMemberDuplicates(
  albumId: string,
  filterNeededOnly = false,
  options?: { includeSelf?: boolean },
): Promise<MemberDuplicate[]> {
  const userId = await requireUserId();
  await requireAlbumMember(albumId, userId);
  const includeSelf = options?.includeSelf ?? false;

  const members = await prisma.albumMember.findMany({
    where: { albumId },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
  });

  const myOwned = new Set(
    (
      await prisma.userSticker.findMany({
        where: { userId, owned: true },
        select: { stickerNumber: true },
      })
    ).map((s) => s.stickerNumber),
  );

  const memberIds = members.map((m) => m.userId);
  const duplicates = await prisma.userSticker.findMany({
    where: {
      userId: { in: memberIds },
      duplicateCount: { gt: 0 },
    },
  });

  const userMap = new Map(
    members.map((m) => [
      m.userId,
      { name: m.user.name ?? m.user.email.split("@")[0], image: m.user.image },
    ]),
  );

  const results: MemberDuplicate[] = [];
  for (const row of duplicates) {
    if (!includeSelf && row.userId === userId) continue;
    if (filterNeededOnly && myOwned.has(row.stickerNumber)) continue;
    const user = userMap.get(row.userId);
    if (!user) continue;
    results.push({
      userId: row.userId,
      name: user.name,
      image: user.image,
      stickerNumber: row.stickerNumber,
      duplicateCount: row.duplicateCount,
    });
  }

  return results.sort((a, b) => a.stickerNumber - b.stickerNumber);
}

export async function getAlbumById(albumId: string) {
  const userId = await requireUserId();
  const member = await requireAlbumMember(albumId, userId);
  const album = await prisma.album.findUniqueOrThrow({
    where: { id: albumId },
    include: { _count: { select: { members: true } } },
  });
  return {
    id: album.id,
    name: album.name,
    role: member.role,
    memberCount: album._count.members,
    inviteToken: album.inviteToken,
    inviteRevoked: album.inviteRevoked,
  };
}
