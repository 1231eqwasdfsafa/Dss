import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function serializeMessage(m) {
  return {
    id: m.id,
    content: m.content,
    edited: m.edited,
    attachment: m.attachment,
    createdAt: m.createdAt,
    channelId: m.channelId,
    dmChannelId: m.dmChannelId,
    author: {
      id: m.author.id,
      username: m.author.username,
      discriminator: m.author.discriminator,
      avatarColor: m.author.avatarColor,
    },
    reactions: groupReactions(m.reactions),
  };
}

function groupReactions(reactions) {
  const map = {};
  for (const r of reactions) {
    if (!map[r.emoji]) map[r.emoji] = { emoji: r.emoji, count: 0, userIds: [] };
    map[r.emoji].count++;
    map[r.emoji].userIds.push(r.userId);
  }
  return Object.values(map);
}

async function assertChannelAccess(channelId, userId) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) return null;
  const membership = await prisma.serverMember.findUnique({
    where: { userId_serverId: { userId, serverId: channel.serverId } },
  });
  return membership ? channel : null;
}

// Get messages for a text channel
router.get("/channel/:channelId", async (req, res) => {
  const channel = await assertChannelAccess(req.params.channelId, req.userId);
  if (!channel) return res.status(403).json({ error: "Bu kanala erisimin yok" });

  const before = req.query.before;
  const messages = await prisma.message.findMany({
    where: {
      channelId: channel.id,
      ...(before ? { createdAt: { lt: new Date(before) } } : {}),
    },
    include: { author: true, reactions: true },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  res.json({ messages: messages.reverse().map(serializeMessage) });
});

// Post a message to a text channel (fallback REST; primary path is via socket)
router.post("/channel/:channelId", async (req, res) => {
  const channel = await assertChannelAccess(req.params.channelId, req.userId);
  if (!channel) return res.status(403).json({ error: "Bu kanala erisimin yok" });
  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Mesaj bos olamaz" });

  const message = await prisma.message.create({
    data: { content: content.trim(), authorId: req.userId, channelId: channel.id },
    include: { author: true, reactions: true },
  });
  res.status(201).json({ message: serializeMessage(message) });
});

// Edit a message
router.patch("/:messageId", async (req, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
  if (!message) return res.status(404).json({ error: "Mesaj bulunamadi" });
  if (message.authorId !== req.userId) return res.status(403).json({ error: "Bu mesaji duzenleyemezsin" });

  const { content } = req.body;
  if (!content?.trim()) return res.status(400).json({ error: "Mesaj bos olamaz" });

  const updated = await prisma.message.update({
    where: { id: message.id },
    data: { content: content.trim(), edited: true },
    include: { author: true, reactions: true },
  });
  res.json({ message: serializeMessage(updated) });
});

// Delete a message
router.delete("/:messageId", async (req, res) => {
  const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
  if (!message) return res.status(404).json({ error: "Mesaj bulunamadi" });

  if (message.authorId !== req.userId) {
    if (message.channelId) {
      const channel = await prisma.channel.findUnique({ where: { id: message.channelId } });
      const membership = await prisma.serverMember.findUnique({
        where: { userId_serverId: { userId: req.userId, serverId: channel.serverId } },
      });
      if (!membership || membership.role === "MEMBER") {
        return res.status(403).json({ error: "Bu mesaji silemezsin" });
      }
    } else {
      return res.status(403).json({ error: "Bu mesaji silemezsin" });
    }
  }

  await prisma.message.delete({ where: { id: message.id } });
  res.json({ ok: true });
});

// Toggle reaction
router.post("/:messageId/reactions", async (req, res) => {
  const { emoji } = req.body;
  if (!emoji) return res.status(400).json({ error: "Emoji gerekli" });

  const existing = await prisma.reaction.findUnique({
    where: { userId_messageId_emoji: { userId: req.userId, messageId: req.params.messageId, emoji } },
  });

  if (existing) {
    await prisma.reaction.delete({ where: { id: existing.id } });
  } else {
    await prisma.reaction.create({ data: { emoji, userId: req.userId, messageId: req.params.messageId } });
  }

  const message = await prisma.message.findUnique({
    where: { id: req.params.messageId },
    include: { author: true, reactions: true },
  });
  res.json({ message: serializeMessage(message) });
});

export { serializeMessage };
export default router;
