import { Router } from "express";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";
import { serializeMessage, MESSAGE_INCLUDE } from "./messages.js";
import { ensureBotUser } from "../lib/bot.js";

const router = Router();
router.use(requireAuth);

async function assertChannelAccess(channelId, userId) {
  const channel = await prisma.channel.findUnique({ where: { id: channelId } });
  if (!channel) return null;
  const membership = await prisma.serverMember.findUnique({
    where: { userId_serverId: { userId, serverId: channel.serverId } },
  });
  return membership ? channel : null;
}

// Create a poll (posted by the official Nexus bot) in a text channel
router.post("/channel/:channelId", async (req, res) => {
  const channel = await assertChannelAccess(req.params.channelId, req.userId);
  if (!channel) return res.status(403).json({ error: "Bu kanala erisimin yok" });
  if (channel.type !== "TEXT") return res.status(400).json({ error: "Anketler sadece metin kanallarinda olusturulabilir" });

  const { question, options } = req.body;
  const cleanQuestion = question?.trim();
  const cleanOptions = (options || []).map((o) => o?.trim()).filter(Boolean);

  if (!cleanQuestion) return res.status(400).json({ error: "Anket sorusu gerekli" });
  if (cleanOptions.length < 2 || cleanOptions.length > 6) {
    return res.status(400).json({ error: "Anket 2 ile 6 arasi secenek icermeli" });
  }

  const botId = await ensureBotUser();

  const message = await prisma.message.create({
    data: {
      type: "POLL",
      content: cleanQuestion,
      authorId: botId,
      channelId: channel.id,
      poll: {
        create: {
          question: cleanQuestion,
          options: { create: cleanOptions.map((text, position) => ({ text, position })) },
        },
      },
    },
    include: MESSAGE_INCLUDE,
  });

  const payload = serializeMessage(message);
  req.app.get("io")?.to(`channel:${channel.id}`).emit("message:new", payload);
  res.status(201).json({ message: payload });
});

// Vote (or change vote, or retract by clicking the same option again)
router.post("/:messageId/vote", async (req, res) => {
  const { optionId } = req.body;
  if (!optionId) return res.status(400).json({ error: "Secenek gerekli" });

  const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
  if (!message || message.type !== "POLL") return res.status(404).json({ error: "Anket bulunamadi" });

  const poll = await prisma.poll.findUnique({ where: { messageId: message.id } });
  if (!poll) return res.status(404).json({ error: "Anket bulunamadi" });

  const option = await prisma.pollOption.findUnique({ where: { id: optionId } });
  if (!option || option.pollId !== poll.id) return res.status(400).json({ error: "Gecersiz secenek" });

  if (message.channelId) {
    const channel = await prisma.channel.findUnique({ where: { id: message.channelId } });
    const membership = await prisma.serverMember.findUnique({
      where: { userId_serverId: { userId: req.userId, serverId: channel.serverId } },
    });
    if (!membership) return res.status(403).json({ error: "Bu ankete erisimin yok" });
  }

  const existingVote = await prisma.pollVote.findUnique({
    where: { pollId_userId: { pollId: poll.id, userId: req.userId } },
  });

  if (existingVote && existingVote.optionId === optionId) {
    await prisma.pollVote.delete({ where: { id: existingVote.id } });
  } else if (existingVote) {
    await prisma.pollVote.update({ where: { id: existingVote.id }, data: { optionId } });
  } else {
    await prisma.pollVote.create({ data: { pollId: poll.id, optionId, userId: req.userId } });
  }

  const updated = await prisma.message.findUnique({ where: { id: message.id }, include: MESSAGE_INCLUDE });
  const payload = serializeMessage(updated);

  const room = message.channelId ? `channel:${message.channelId}` : `dm:${message.dmChannelId}`;
  req.app.get("io")?.to(room).emit("message:update", payload);

  res.json({ message: payload });
});

export default router;
