import { create } from "zustand";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";

export const useAppStore = create((set, get) => ({
  servers: [],
  activeServerId: null,
  activeChannelId: null,
  membersByServer: {},
  messagesByChannel: {},
  dms: [],
  activeDmId: null,
  messagesByDm: {},
  presence: {},
  typing: {}, // roomKey -> { userId: username }
  view: "server", // "server" | "dm"

  fetchServers: async () => {
    const { data } = await api.get("/servers");
    set({ servers: data.servers });
    return data.servers;
  },

  createServer: async (name) => {
    const { data } = await api.post("/servers", { name });
    set((s) => ({ servers: [...s.servers, data.server] }));
    getSocket()?.emit("server:join_room", data.server.id);
    return data.server;
  },

  joinServer: async (inviteCode) => {
    const { data } = await api.post("/servers/join", { inviteCode });
    set((s) => ({ servers: [...s.servers, data.server] }));
    getSocket()?.emit("server:join_room", data.server.id);
    return data.server;
  },

  leaveServer: async (serverId) => {
    await api.post(`/servers/${serverId}/leave`);
    set((s) => ({ servers: s.servers.filter((sv) => sv.id !== serverId) }));
  },

  deleteServer: async (serverId) => {
    await api.delete(`/servers/${serverId}`);
    set((s) => ({ servers: s.servers.filter((sv) => sv.id !== serverId) }));
  },

  createChannel: async (serverId, name, type) => {
    const { data } = await api.post(`/servers/${serverId}/channels`, { name, type });
    set((s) => ({
      servers: s.servers.map((sv) =>
        sv.id === serverId ? { ...sv, channels: [...sv.channels, data.channel] } : sv
      ),
    }));
    return data.channel;
  },

  fetchMembers: async (serverId) => {
    const { data } = await api.get(`/servers/${serverId}/members`);
    set((s) => ({ membersByServer: { ...s.membersByServer, [serverId]: data.members } }));
  },

  addMemberToStore: (serverId, member) =>
    set((s) => {
      const current = s.membersByServer[serverId] || [];
      if (current.some((m) => m.id === member.id)) return {};
      return { membersByServer: { ...s.membersByServer, [serverId]: [...current, member] } };
    }),

  selectServer: (serverId) => set({ activeServerId: serverId, view: "server", activeDmId: null }),
  selectChannel: (channelId) => set({ activeChannelId: channelId }),

  fetchMessages: async (channelId) => {
    const { data } = await api.get(`/messages/channel/${channelId}`);
    set((s) => ({ messagesByChannel: { ...s.messagesByChannel, [channelId]: data.messages } }));
  },

  receiveMessage: (message) => {
    if (message.channelId) {
      set((s) => ({
        messagesByChannel: {
          ...s.messagesByChannel,
          [message.channelId]: [...(s.messagesByChannel[message.channelId] || []), message],
        },
      }));
    } else if (message.dmChannelId) {
      set((s) => ({
        messagesByDm: {
          ...s.messagesByDm,
          [message.dmChannelId]: [...(s.messagesByDm[message.dmChannelId] || []), message],
        },
      }));
    }
  },

  updateMessageInStore: (message) => {
    const key = message.channelId ? "messagesByChannel" : "messagesByDm";
    const id = message.channelId || message.dmChannelId;
    set((s) => ({
      [key]: {
        ...s[key],
        [id]: (s[key][id] || []).map((m) => (m.id === message.id ? message : m)),
      },
    }));
  },

  removeMessageFromStore: (messageId, channelId, dmChannelId) => {
    const key = channelId ? "messagesByChannel" : "messagesByDm";
    const id = channelId || dmChannelId;
    set((s) => ({
      [key]: {
        ...s[key],
        [id]: (s[key][id] || []).filter((m) => m.id !== messageId),
      },
    }));
  },

  deleteMessage: async (messageId) => {
    await api.delete(`/messages/${messageId}`);
  },

  editMessage: async (messageId, content) => {
    const { data } = await api.patch(`/messages/${messageId}`, { content });
    get().updateMessageInStore(data.message);
  },

  toggleReaction: async (messageId, emoji) => {
    const { data } = await api.post(`/messages/${messageId}/reactions`, { emoji });
    get().updateMessageInStore(data.message);
  },

  fetchDms: async () => {
    const { data } = await api.get("/dms");
    set({ dms: data.dms });
  },

  startDm: async ({ userId, username }) => {
    const { data } = await api.post("/dms", { userId, username });
    set((s) => {
      const exists = s.dms.find((d) => d.id === data.dm.id);
      return { dms: exists ? s.dms : [...s.dms, data.dm] };
    });
    return data.dm;
  },

  selectDm: (dmId) => set({ activeDmId: dmId, view: "dm", activeServerId: null }),

  fetchDmMessages: async (dmId) => {
    const { data } = await api.get(`/dms/${dmId}/messages`);
    set((s) => ({ messagesByDm: { ...s.messagesByDm, [dmId]: data.messages } }));
  },

  setPresence: (userId, status) => set((s) => ({ presence: { ...s.presence, [userId]: status } })),

  setTyping: (roomKey, userId, username) =>
    set((s) => ({ typing: { ...s.typing, [roomKey]: { ...(s.typing[roomKey] || {}), [userId]: username } } })),

  clearTyping: (roomKey, userId) =>
    set((s) => {
      const room = { ...(s.typing[roomKey] || {}) };
      delete room[userId];
      return { typing: { ...s.typing, [roomKey]: room } };
    }),
}));
