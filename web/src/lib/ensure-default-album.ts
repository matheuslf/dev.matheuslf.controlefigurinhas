import { prisma } from "@/lib/prisma";

const DEFAULT_ALBUM_NAME = "Meu álbum";

export async function ensureDefaultAlbum(userId: string) {
  const existing = await prisma.albumMember.findFirst({
    where: { userId },
  });
  if (existing) return existing.albumId;

  const album = await prisma.album.create({
    data: {
      name: DEFAULT_ALBUM_NAME,
      members: {
        create: { userId, role: "OWNER" },
      },
    },
  });

  return album.id;
}
