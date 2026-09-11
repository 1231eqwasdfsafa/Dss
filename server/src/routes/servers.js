import { Router } from "express";
import crypto from "crypto";
import { prisma } from "../lib/prisma.js";
import { requireAuth } from "../middleware/auth.js";

const router = Router();
router.use(requireAuth);

function genInviteCode() {
  return crypto.randomBytes(5).toString("hex");
}

async function assertMember(serverId, userId) {
  const membership = await prisma.serverMember.findUnique({
    where: { userId_serverId: { userId, serverId } },
  });
  return membership;
}

// List servers the current user belongs to
router.get("/", async (req, res) => {
  const memberships = await prisma.serverMember.findMany({
    where: { userId: req.userId },
    include: {
      server: {
        include: { channels: { orderBy: { position: "asc" } } },
      },
    },
  });
  res.json({ servers: memberships.map((m) => ({ ...m.server, myRole: m.role })) });
});

// Create a server
router.post("/", async (req, res) => {
  const { name, description, category, tags } = req.body;
  if (!name?.trim()) return res.status(400).json({ error: "Sunucu adi gerekli" });

  const server = await prisma.server.create({
    data: {
      name: name.trim().slice(0, 60),
      description: description?.trim().slice(0, 140) || null,
      category: category?.trim().slice(0, 30) || null,
      tags: Array.isArray(tags) ? tags.filter(Boolean).join(",").slice(0, 200) : null,
      ownerId: req.userId,
      inviteCode: genInviteCode(),
      members: { create: { userId: req.userId, role: "OWNER" } },
      channels: {
        create: [
          { name: "genel", type: "TEXT", position: 0 },
          { name: "sohbet", type: "VOICE", position: 1 },
        ],
      },
    },
    include: { channels: true },
  });

  res.status(201).json({ server: { ...server, myRole: "OWNER" } });
});

// Public-ish discovery listing (still requires login, no public/anon browsing yet)
router.get("/discover", async (req, res) => {
  const q = req.query.q?.toString().trim();
  const category = req.query.category?.toString().trim();

  const servers = await prisma.server.findMany({
    where: {
      isDiscoverable: true,
      members: { none: { userId: req.userId } },
      ...(category ? { category } : {}),
      ...(q
        ? {
            OR: [
              { name: { contains: q } },
              { description: { contains: q } },
              { tags: { contains: q } },
            ],
          }
        : {}),
    },
    include: { _count: { select: { members: true } } },
  });

  const results = servers
    .map((s) => ({
      id: s.id,
      name: s.name,
      description: s.description,
      category: s.category,
      tags: s.tags ? s.tags.split(",").filter(Boolean) : [],
      inviteCode: s.inviteCode,
      memberCount: s._count.members,
      createdAt: s.createdAt,
    }))
    .sort((a, b) => b.memberCount - a.memberCount);

  res.json({ servers: results });
});

// Join via invite code
router.post("/join", async (req, res) => {
  const { inviteCode } = req.body;
  const server = await prisma.server.findUnique({ where: { inviteCode } });
  if (!server) return res.status(404).json({ error: "Gecersiz davet kodu" });

  const existing = await assertMember(server.id, req.userId);
  if (existing) return res.status(409).json({ error: "Zaten bu sunucudasin" });

  await prisma.serverMember.create({
    data: { userId: req.userId, serverId: server.id, role: "MEMBER" },
  });

  const newUser = await prisma.user.findUnique({ where: { id: req.userId } });
  req.app.get("io")?.to(`server:${server.id}`).emit("member:joined", {
    serverId: server.id,
    member: {
      id: newUser.id,
      username: newUser.username,
      discriminator: newUser.discriminator,
      avatarColor: newUser.avatarColor,
      avatarUrl: newUser.avatarUrl,
      status: newUser.status,
      customStatus: newUser.customStatus,
      role: "MEMBER",
      nickname: null,
    },
  });

  const full = await prisma.server.findUnique({
    where: { id: server.id },
    include: { channels: { orderBy: { position: "asc" } } },
  });
  res.status(201).json({ server: { ...full, myRole: "MEMBER" } });
});

// Server members list
router.get("/:serverId/members", async (req, res) => {
  const membership = await assertMember(req.params.serverId, req.userId);
  if (!membership) return res.status(403).json({ error: "Bu sunucuya erisimin yok" });

  const members = await prisma.serverMember.findMany({
    where: { serverId: req.params.serverId },
    include: { user: true },
    orderBy: { joinedAt: "asc" },
  });

  res.json({
    members: members.map((m) => ({
      id: m.user.id,
      username: m.user.username,
      discriminator: m.user.discriminator,
      avatarColor: m.user.avatarColor,
      avatarUrl: m.user.avatarUrl,
      isBot: m.user.isBot,
      status: m.user.status,
      customStatus: m.user.customStatus,
      role: m.role,
      nickname: m.nickname,
      joinedAt: m.joinedAt,
    })),
  });
});

// Create channel
router.post("/:serverId/channels", async (req, res) => {
  const { serverId } = req.params;
  const { name, type } = req.body;
  const membership = await assertMember(serverId, req.userId);
  if (!membership || membership.role === "MEMBER") {
    return res.status(403).json({ error: "Kanal olusturma yetkin yok" });
  }
  if (!name?.trim()) return res.status(400).json({ error: "Kanal adi gerekli" });

  const count = await prisma.channel.count({ where: { serverId } });
  const channel = await prisma.channel.create({
    data: {
      name: name.trim().toLowerCase().replace(/\s+/g, "-").slice(0, 40),
      type: type === "VOICE" ? "VOICE" : "TEXT",
      serverId,
      position: count,
    },
  });
  res.status(201).json({ channel });
});

// Delete server (owner only)
router.delete("/:serverId", async (req, res) => {
  const server = await prisma.server.findUnique({ where: { id: req.params.serverId } });
  if (!server) return res.status(404).json({ error: "Sunucu bulunamadi" });
  if (server.ownerId !== req.userId) {
    return res.status(403).json({ error: "Sadece sunucu sahibi silebilir" });
  }
  await prisma.server.delete({ where: { id: server.id } });
  res.json({ ok: true });
});

// Leave server
router.post("/:serverId/leave", async (req, res) => {
  const server = await prisma.server.findUnique({ where: { id: req.params.serverId } });
  if (!server) return res.status(404).json({ error: "Sunucu bulunamadi" });
  if (server.ownerId === req.userId) {
    return res.status(400).json({ error: "Sahip sunucudan ayrilamaz, onun yerine silebilir" });
  }
  await prisma.serverMember.deleteMany({ where: { serverId: server.id, userId: req.userId } });
  res.json({ ok: true });
});

// List open reports for this server (owner/admin only)
router.get("/:serverId/reports", async (req, res) => {
  const membership = await assertMember(req.params.serverId, req.userId);
  if (!membership || membership.role === "MEMBER") {
    return res.status(403).json({ error: "Raporlari gorme yetkin yok" });
  }

  const reports = await prisma.report.findMany({
    where: { status: "OPEN", message: { channel: { serverId: req.params.serverId } } },
    include: { message: { include: { author: true } }, reporter: true },
    orderBy: { createdAt: "desc" },
  });

  res.json({
    reports: reports.map((r) => ({
      id: r.id,
      reason: r.reason,
      createdAt: r.createdAt,
      message: {
        id: r.message.id,
        content: r.message.content,
        author: { id: r.message.author.id, username: r.message.author.username },
      },
      reporter: { id: r.reporter.id, username: r.reporter.username },
    })),
  });
});

// Dismiss/resolve a report (owner/admin only)
router.post("/:serverId/reports/:reportId/resolve", async (req, res) => {
  const membership = await assertMember(req.params.serverId, req.userId);
  if (!membership || membership.role === "MEMBER") {
    return res.status(403).json({ error: "Bu islemi yapma yetkin yok" });
  }

  const report = await prisma.report.findUnique({
    where: { id: req.params.reportId },
    include: { message: { include: { channel: true } } },
  });
  if (!report || report.message.channel?.serverId !== req.params.serverId) {
    return res.status(404).json({ error: "Rapor bulunamadi" });
  }

  await prisma.report.update({ where: { id: req.params.reportId }, data: { status: "RESOLVED" } });
  res.json({ ok: true });
});

export default router;
