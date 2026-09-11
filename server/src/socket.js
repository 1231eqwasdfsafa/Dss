import { Server } from "socket.io";
import { verifyToken } from "./utils/jwt.js";
import { prisma } from "./lib/prisma.js";
import { serializeMessage, MESSAGE_INCLUDE } from "./routes/messages.js";
import { setActivity, clearActivity } from "./lib/activity.js";

const onlineUsers = new Map(); // userId -> Set(socketId)

export function initSocket(httpServer, clientOrigin) {
  const io = new Server(httpServer, {
    cors: { origin: clientOrigin, credentials: true },
  });

  io.use((socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      const payload = verifyToken(token);
      socket.userId = payload.userId;
      next();
    } catch {
      next(new Error("unauthorized"));
    }
  });

  io.on("connection", async (socket) => {
    const { userId } = socket;

    if (!onlineUsers.has(userId)) onlineUsers.set(userId, new Set());
    onlineUsers.get(userId).add(socket.id);

    await prisma.user.update({ where: { id: userId }, data: { status: "ONLINE" } });
    io.emit("presence:update", { userId, status: "ONLINE" });

    // Join a room per server the user belongs to, so presence/broadcasts scope naturally
    const memberships = await prisma.serverMember.findMany({ where: { userId } });
    memberships.forEach((m) => socket.join(`server:${m.serverId}`));

    const dmMemberships = await prisma.dMMember.findMany({ where: { userId } });
    dmMemberships.forEach((m) => socket.join(`dm:${m.dmChannelId}`));

    socket.on("channel:join", (channelId) => socket.join(`channel:${channelId}`));
    socket.on("channel:leave", (channelId) => socket.leave(`channel:${channelId}`));

    socket.on("message:send", async ({ channelId, dmChannelId, content }, ack) => {
      try {
        if (!content?.trim()) return ack?.({ error: "Mesaj bos olamaz" });

        if (channelId) {
          const channel = await prisma.channel.findUnique({ where: { id: channelId } });
          if (!channel) return ack?.({ error: "Kanal bulunamadi" });
          const membership = await prisma.serverMember.findUnique({
            where: { userId_serverId: { userId, serverId: channel.serverId } },
          });
          if (!membership) return ack?.({ error: "Erisim yok" });

          const message = await prisma.message.create({
            data: { content: content.trim(), authorId: userId, channelId },
            include: MESSAGE_INCLUDE,
          });
          const payload = serializeMessage(message);
          io.to(`channel:${channelId}`).emit("message:new", payload);
          ack?.({ message: payload });
        } else if (dmChannelId) {
          const membership = await prisma.dMMember.findUnique({
            where: { userId_dmChannelId: { userId, dmChannelId } },
          });
          if (!membership) return ack?.({ error: "Erisim yok" });

          const message = await prisma.message.create({
            data: { content: content.trim(), authorId: userId, dmChannelId },
            include: MESSAGE_INCLUDE,
          });
          const payload = serializeMessage(message);
          io.to(`dm:${dmChannelId}`).emit("message:new", payload);
          ack?.({ message: payload });
        }
      } catch (err) {
        console.error(err);
        ack?.({ error: "Mesaj gonderilemedi" });
      }
    });

    socket.on("typing:start", ({ channelId, dmChannelId, username }) => {
      const room = channelId ? `channel:${channelId}` : `dm:${dmChannelId}`;
      socket.to(room).emit("typing:start", { userId, username, channelId, dmChannelId });
    });

    socket.on("typing:stop", ({ channelId, dmChannelId }) => {
      const room = channelId ? `channel:${channelId}` : `dm:${dmChannelId}`;
      socket.to(room).emit("typing:stop", { userId, channelId, dmChannelId });
    });

    socket.on("message:delete", async ({ messageId, channelId, dmChannelId }) => {
      const room = channelId ? `channel:${channelId}` : `dm:${dmChannelId}`;
      io.to(room).emit("message:delete", { messageId });
    });

    socket.on("message:update", (payload) => {
      const room = payload.channelId ? `channel:${payload.channelId}` : `dm:${payload.dmChannelId}`;
      io.to(room).emit("message:update", payload);
    });

    socket.on("server:join_room", (serverId) => socket.join(`server:${serverId}`));

    socket.on("status:update", async (status) => {
      await prisma.user.update({ where: { id: userId }, data: { status } });
      io.emit("presence:update", { userId, status });
    });

    // "Currently listening" activity — manually entered (no real Spotify
    // OAuth is wired up), broadcast the same way presence is: globally, to
    // whoever has this user's profile card open.
    socket.on("activity:start", ({ track, artist, albumArt, trackUrl, duration } = {}) => {
      if (!track?.trim() || !artist?.trim()) return;
      const durationSec = Number(duration);
      const activity = {
        track: track.trim().slice(0, 120),
        artist: artist.trim().slice(0, 120),
        albumArt: albumArt?.trim().slice(0, 500) || null,
        trackUrl: trackUrl?.trim().slice(0, 500) || null,
        duration: Number.isFinite(durationSec) && durationSec > 0 ? Math.min(durationSec, 3600) : null,
        startedAt: Date.now(),
      };
      setActivity(userId, activity);
      io.emit("activity:update", { userId, activity });
    });

    socket.on("activity:stop", () => {
      clearActivity(userId);
      io.emit("activity:update", { userId, activity: null });
    });

    socket.on("disconnect", async () => {
      const sockets = onlineUsers.get(userId);
      sockets?.delete(socket.id);
      if (!sockets || sockets.size === 0) {
        onlineUsers.delete(userId);
        await prisma.user.update({ where: { id: userId }, data: { status: "OFFLINE" } });
        io.emit("presence:update", { userId, status: "OFFLINE" });
        clearActivity(userId);
        io.emit("activity:update", { userId, activity: null });
      }
    });
  });

  return io;
}
