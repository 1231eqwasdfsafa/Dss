import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeMessage } from "./messages.js";

const router = Router();
router.use(requireAuth);

// List DM channels for current user
router.get("/", async (req, res) => {
  const memberships = await prisma.dMMember.findMany({
    where: { userId: req.userId },
    include: {
      dmChannel: {
        include: { members: { include: { user: true } } },
      },
    },
  });

  const dms = memberships.map((m) => {
    const other = m.dmChannel.members.find((mem) => mem.userId !== req.userId)?.user;
    return {
      id: m.dmChannel.id,
      user: other
        ? {
            id: other.id,
            username: other.username,
            discriminator: other.discriminator,
            avatarColor: other.avatarColor,
            status: other.status,
          }
        : null,
    };
  });

  res.json({ dms });
});

// Start or fetch a DM with a user by username#discriminator or userId
router.post("/", async (req, res) => {
  const { userId, username } = req.body;
  let targetId = userId;

  if (!targetId && username) {
    const [name, discriminator] = username.split("#");
    const target = await prisma.user.findFirst({ where: { username: name, ...(discriminator ? { discriminator } : {}) } });
    if (!target) return res.status(404).json({ error: "Kullanici bulunamadi" });
    targetId = target.id;
  }

  if (!targetId || targetId === req.userId) {
    return res.status(400).json({ error: "Gecerli bir kullanici belirt" });
  }

  const existing = await prisma.dMChannel.findFirst({
    where: {
      AND: [{ members: { some: { userId: req.userId } } }, { members: { some: { userId: targetId } } }],
    },
    include: { members: { include: { user: true } } },
  });

  if (existing) {
    const other = existing.members.find((m) => m.userId !== req.userId)?.user;
    return res.json({ dm: { id: existing.id, user: other } });
  }

  const dm = await prisma.dMChannel.create({
    data: { members: { create: [{ userId: req.userId }, { userId: targetId }] } },
    include: { members: { include: { user: true } } },
  });
  const other = dm.members.find((m) => m.userId !== req.userId)?.user;
  res.status(201).json({ dm: { id: dm.id, user: other } });
});

async function assertDmAccess(dmChannelId, userId) {
  return prisma.dMMember.findUnique({ where: { userId_dmChannelId: { userId, dmChannelId } } });
}

router.get("/:dmChannelId/messages", async (req, res) => {
  const membership = await assertDmAccess(req.params.dmChannelId, req.userId);
  if (!membership) return res.status(403).json({ error: "Bu DM'e erisimin yok" });

  const messages = await prisma.message.findMany({
    where: { dmChannelId: req.params.dmChannelId },
    include: { author: true, reactions: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });
  res.json({ messages: messages.reverse().map(serializeMessage) });
});

router.post("/:dmChannelId/messages", async (req, res) => {
  const membership = await assertDmAccess(req.params.dmChannelId, req.userId);
  if (!membership) return res.status(403).json({ error: "Bu DM'e erisimin yok" });
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Mesaj bos olamaz" });

  const message = await prisma.message.create({
    data: { content: content.trim(), authorId: req.userId, dmChannelId: req.params.dmChannelId },
    include: { author: true, reactions: true },
  });
  res.status(201).json({ message: serializeMessage(message) });
});

export default router;
