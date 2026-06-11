"use server";

import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { formatOfficialCode, selectionForNumber } from "@/data/selections";
import { revalidatePath } from "next/cache";
import type { TradeStatus } from "@prisma/client";

async function requireUserId() {
  const session = await auth();
  if (!session?.user?.id) throw new Error("Unauthorized");
  return session.user.id;
}

export type TradeRequestSummary = {
  id: string;
  albumId: string;
  albumName: string;
  requesterId: string;
  requesterName: string;
  targetUserId: string;
  targetName: string;
  stickerNumber: number;
  stickerLabel: string;
  quantity: number;
  message: string | null;
  status: TradeStatus;
  createdAt: string;
  isIncoming: boolean;
};

function toSummary(
  row: {
    id: string;
    albumId: string;
    requesterId: string;
    targetUserId: string;
    stickerNumber: number;
    quantity: number;
    message: string | null;
    status: TradeStatus;
    createdAt: Date;
    album: { name: string };
    requester: { name: string | null; email: string };
    target: { name: string | null; email: string };
  },
  currentUserId: string,
): TradeRequestSummary {
  const sel = selectionForNumber(row.stickerNumber);
  const stickerLabel = sel
    ? formatOfficialCode(sel, row.stickerNumber)
    : `#${row.stickerNumber}`;

  return {
    id: row.id,
    albumId: row.albumId,
    albumName: row.album.name,
    requesterId: row.requesterId,
    requesterName: row.requester.name ?? row.requester.email.split("@")[0],
    targetUserId: row.targetUserId,
    targetName: row.target.name ?? row.target.email.split("@")[0],
    stickerNumber: row.stickerNumber,
    stickerLabel,
    quantity: row.quantity,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
    isIncoming: row.targetUserId === currentUserId,
  };
}

export async function createTradeRequest(input: {
  albumId: string;
  targetUserId: string;
  stickerNumber: number;
  message?: string;
}) {
  const requesterId = await requireUserId();
  const { albumId, targetUserId, stickerNumber, message } = input;

  if (requesterId === targetUserId) {
    throw new Error("Você não pode solicitar troca consigo mesmo.");
  }

  const album = await prisma.album.findUnique({
    where: { id: albumId },
    select: { isPublic: true },
  });
  if (!album?.isPublic) {
    throw new Error("Este álbum não está disponível na galeria.");
  }

  const targetMember = await prisma.albumMember.findUnique({
    where: { albumId_userId: { albumId, userId: targetUserId } },
  });
  if (!targetMember) {
    throw new Error("Membro não encontrado neste álbum.");
  }

  const targetSticker = await prisma.userSticker.findUnique({
    where: {
      userId_stickerNumber: { userId: targetUserId, stickerNumber },
    },
  });
  if (!targetSticker || targetSticker.duplicateCount < 1) {
    throw new Error("Este membro não possui repetidas publicadas desta figurinha.");
  }

  const existing = await prisma.tradeRequest.findFirst({
    where: {
      albumId,
      requesterId,
      targetUserId,
      stickerNumber,
      status: "PENDING",
    },
  });
  if (existing) {
    throw new Error("Você já tem um pedido pendente desta figurinha com este membro.");
  }

  await prisma.tradeRequest.create({
    data: {
      albumId,
      requesterId,
      targetUserId,
      stickerNumber,
      quantity: 1,
      message: message?.trim() || null,
    },
  });

  revalidatePath("/trades");
  revalidatePath(`/gallery/${albumId}`);
}

export async function listMyTradeRequests(
  status?: TradeStatus,
): Promise<TradeRequestSummary[]> {
  const userId = await requireUserId();

  const rows = await prisma.tradeRequest.findMany({
    where: {
      ...(status ? { status } : {}),
      OR: [{ requesterId: userId }, { targetUserId: userId }],
    },
    include: {
      album: { select: { name: true } },
      requester: { select: { name: true, email: true } },
      target: { select: { name: true, email: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return rows.map((row) => toSummary(row, userId));
}

export async function respondToTradeRequest(
  tradeId: string,
  accept: boolean,
) {
  const userId = await requireUserId();

  const trade = await prisma.tradeRequest.findUnique({
    where: { id: tradeId },
  });

  if (!trade) throw new Error("Pedido não encontrado.");
  if (trade.targetUserId !== userId) {
    throw new Error("Somente o destinatário pode responder.");
  }
  if (trade.status !== "PENDING") {
    throw new Error("Este pedido já foi respondido.");
  }

  await prisma.tradeRequest.update({
    where: { id: tradeId },
    data: { status: accept ? "ACCEPTED" : "REJECTED" },
  });

  revalidatePath("/trades");
  revalidatePath(`/gallery/${trade.albumId}`);
}

export async function cancelTradeRequest(tradeId: string) {
  const userId = await requireUserId();

  const trade = await prisma.tradeRequest.findUnique({
    where: { id: tradeId },
  });

  if (!trade) throw new Error("Pedido não encontrado.");
  if (trade.requesterId !== userId) {
    throw new Error("Somente quem solicitou pode cancelar.");
  }
  if (trade.status !== "PENDING") {
    throw new Error("Este pedido já foi respondido.");
  }

  await prisma.tradeRequest.update({
    where: { id: tradeId },
    data: { status: "CANCELLED" },
  });

  revalidatePath("/trades");
  revalidatePath(`/gallery/${trade.albumId}`);
}

export async function countPendingTradeRequests(): Promise<number> {
  const userId = await requireUserId();
  return prisma.tradeRequest.count({
    where: { targetUserId: userId, status: "PENDING" },
  });
}
