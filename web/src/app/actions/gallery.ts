"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { TOTAL_STICKERS } from "@/data/selections";
import type { MemberDuplicate } from "@/app/actions/albums";

export type GalleryOwner = {
  userId: string;
  name: string;
  image: string | null;
};

export type GalleryAlbumSummary = {
  id: string;
  name: string;
  memberCount: number;
  visitorCount: number;
  viewCount: number;
  owners: GalleryOwner[];
  ownedCount: number;
  groupPercent: number;
  totalDuplicates: number;
};

export type VisitedAlbumSummary = {
  id: string;
  name: string;
  memberCount: number;
  viewCount: number;
  visitCount: number;
  lastVisitedAt: string;
  owners: GalleryOwner[];
  ownedCount: number;
  groupPercent: number;
  totalDuplicates: number;
};

export type GalleryAlbumDetail = GalleryAlbumSummary & {
  owned: number[];
  duplicateTotals: { stickerNumber: number; totalDuplicates: number }[];
  memberDuplicates: MemberDuplicate[];
  isMember: boolean;
  isVisitor: boolean;
};

export type AlbumVisitorEntry = {
  userId: string;
  name: string;
  image: string | null;
  visitCount: number;
  lastVisitedAt: string;
};

export type AlbumVisitorStats = {
  viewCount: number;
  uniqueVisitors: number;
  visitors: AlbumVisitorEntry[];
};

function mapOwners(
  members: {
    userId: string;
    user: { name: string | null; image: string | null; email: string };
  }[],
): GalleryOwner[] {
  return members.map((m) => ({
    userId: m.userId,
    name: m.user.name ?? m.user.email.split("@")[0],
    image: m.user.image,
  }));
}

async function buildAlbumGalleryData(albumId: string, userId?: string | null) {
  const album = await prisma.album.findUnique({
    where: { id: albumId, isPublic: true },
    include: {
      _count: { select: { members: true, visitors: true } },
      members: {
        where: { role: "OWNER" },
        include: {
          user: { select: { id: true, name: true, image: true, email: true } },
        },
        orderBy: { joinedAt: "asc" },
      },
    },
  });

  if (!album) return null;

  const allMembers = await prisma.albumMember.findMany({
    where: { albumId },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
  });

  const memberIds = allMembers.map((m) => m.userId);
  const stickers =
    memberIds.length > 0
      ? await prisma.userSticker.findMany({
          where: { userId: { in: memberIds } },
          select: {
            userId: true,
            stickerNumber: true,
            owned: true,
            duplicateCount: true,
          },
        })
      : [];

  const ownedSet = new Set<number>();
  const dupMap = new Map<number, number>();
  let totalDuplicates = 0;

  for (const row of stickers) {
    if (row.owned) ownedSet.add(row.stickerNumber);
    if (row.duplicateCount > 0) {
      dupMap.set(
        row.stickerNumber,
        (dupMap.get(row.stickerNumber) ?? 0) + row.duplicateCount,
      );
      totalDuplicates += row.duplicateCount;
    }
  }

  const userMap = new Map(
    allMembers.map((m) => [
      m.userId,
      { name: m.user.name ?? m.user.email.split("@")[0], image: m.user.image },
    ]),
  );

  const memberDuplicates: MemberDuplicate[] = [];
  for (const row of stickers) {
    if (row.duplicateCount <= 0) continue;
    const user = userMap.get(row.userId);
    if (!user) continue;
    memberDuplicates.push({
      userId: row.userId,
      name: user.name,
      image: user.image,
      stickerNumber: row.stickerNumber,
      duplicateCount: row.duplicateCount,
    });
  }

  memberDuplicates.sort((a, b) => a.stickerNumber - b.stickerNumber);

  const tradeDuplicates = userId
    ? memberDuplicates.filter((d) => d.userId !== userId)
    : memberDuplicates;

  const ownedCount = ownedSet.size;
  const owners = mapOwners(album.members);

  let isMember = false;
  let isVisitor = false;
  if (userId) {
    isMember = allMembers.some((m) => m.userId === userId);
    if (!isMember) {
      const visit = await prisma.albumVisitor.findUnique({
        where: { albumId_userId: { albumId, userId } },
      });
      isVisitor = visit != null;
    }
  }

  return {
    id: album.id,
    name: album.name,
    memberCount: album._count.members,
    visitorCount: album._count.visitors,
    viewCount: album.viewCount,
    owners,
    ownedCount,
    groupPercent: Math.round((ownedCount / TOTAL_STICKERS) * 1000) / 10,
    totalDuplicates,
    owned: [...ownedSet].sort((a, b) => a - b),
    duplicateTotals: [...dupMap.entries()]
      .map(([stickerNumber, totalDuplicates]) => ({
        stickerNumber,
        totalDuplicates,
      }))
      .sort((a, b) => a.stickerNumber - b.stickerNumber),
    memberDuplicates: tradeDuplicates,
    isMember,
    isVisitor,
  };
}

export async function recordAlbumVisit(albumId: string) {
  const album = await prisma.album.findFirst({
    where: { id: albumId, isPublic: true },
    select: { id: true },
  });
  if (!album) return;

  await prisma.album.update({
    where: { id: albumId },
    data: { viewCount: { increment: 1 } },
  });

  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return;

  const membership = await prisma.albumMember.findUnique({
    where: { albumId_userId: { albumId, userId } },
  });
  if (membership) return;

  await prisma.albumVisitor.upsert({
    where: { albumId_userId: { albumId, userId } },
    create: { albumId, userId },
    update: { visitCount: { increment: 1 } },
  });
}

export async function listPublicGalleryAlbums(): Promise<GalleryAlbumSummary[]> {
  const albums = await prisma.album.findMany({
    where: { isPublic: true },
    select: { id: true },
    orderBy: [{ viewCount: "desc" }, { updatedAt: "desc" }],
  });

  const results: GalleryAlbumSummary[] = [];
  for (const { id } of albums) {
    const data = await buildAlbumGalleryData(id);
    if (!data) continue;
    results.push({
      id: data.id,
      name: data.name,
      memberCount: data.memberCount,
      visitorCount: data.visitorCount,
      viewCount: data.viewCount,
      owners: data.owners,
      ownedCount: data.ownedCount,
      groupPercent: data.groupPercent,
      totalDuplicates: data.totalDuplicates,
    });
  }

  return results;
}

export async function listAlbumsVisitedAsVisitor(): Promise<VisitedAlbumSummary[]> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return [];

  const visits = await prisma.albumVisitor.findMany({
    where: { userId },
    include: {
      album: {
        include: {
          _count: { select: { members: true } },
          members: {
            where: { role: "OWNER" },
            include: {
              user: {
                select: { id: true, name: true, image: true, email: true },
              },
            },
            orderBy: { joinedAt: "asc" },
          },
        },
      },
    },
    orderBy: { lastVisitedAt: "desc" },
  });

  const results: VisitedAlbumSummary[] = [];

  for (const visit of visits) {
    if (!visit.album.isPublic) continue;

    const membership = await prisma.albumMember.findUnique({
      where: { albumId_userId: { albumId: visit.albumId, userId } },
    });
    if (membership) continue;

    const data = await buildAlbumGalleryData(visit.albumId, userId);
    if (!data) continue;

    results.push({
      id: data.id,
      name: data.name,
      memberCount: data.memberCount,
      viewCount: data.viewCount,
      visitCount: visit.visitCount,
      lastVisitedAt: visit.lastVisitedAt.toISOString(),
      owners: data.owners,
      ownedCount: data.ownedCount,
      groupPercent: data.groupPercent,
      totalDuplicates: data.totalDuplicates,
    });
  }

  return results;
}

export async function getPublicGalleryAlbum(
  albumId: string,
): Promise<GalleryAlbumDetail | null> {
  const session = await auth();
  await recordAlbumVisit(albumId);
  return buildAlbumGalleryData(albumId, session?.user?.id ?? null);
}

export async function getAlbumVisitorStats(
  albumId: string,
): Promise<AlbumVisitorStats | null> {
  const session = await auth();
  const userId = session?.user?.id;
  if (!userId) return null;

  const owner = await prisma.albumMember.findFirst({
    where: { albumId, userId, role: "OWNER" },
  });
  if (!owner) return null;

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    select: {
      viewCount: true,
      _count: { select: { visitors: true } },
    },
  });
  if (!album) return null;

  const visitors = await prisma.albumVisitor.findMany({
    where: { albumId },
    include: {
      user: { select: { id: true, name: true, image: true, email: true } },
    },
    orderBy: { lastVisitedAt: "desc" },
    take: 100,
  });

  return {
    viewCount: album.viewCount,
    uniqueVisitors: album._count.visitors,
    visitors: visitors.map((v) => ({
      userId: v.userId,
      name: v.user.name ?? v.user.email.split("@")[0],
      image: v.user.image,
      visitCount: v.visitCount,
      lastVisitedAt: v.lastVisitedAt.toISOString(),
    })),
  };
}
