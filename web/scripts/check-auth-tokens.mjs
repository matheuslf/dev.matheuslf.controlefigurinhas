import { config } from "dotenv";
import { PrismaClient } from "@prisma/client";

config();
const prisma = new PrismaClient();

const tokens = await prisma.verificationToken.findMany({
  take: 5,
  orderBy: { expires: "desc" },
});
console.log("tokens:", tokens);

const users = await prisma.user.findMany({
  take: 5,
  select: { email: true, emailVerified: true },
});
console.log("users:", users);

await prisma.$disconnect();
