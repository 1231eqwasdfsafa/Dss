import { create } from "zustand";
import { api } from "../lib/api";
import { getSocket } from "../lib/socket";
import { DEMO_MODE, demoServers, demoMembers, demoMessages, demoDms, demoDmMessages, demoUser } from "../lib/demo";

let demoMsgCounter = 1000;

// Leaving/deleting the currently active server must also clear activeServerId
// (and its channel), otherwise it keeps pointing at a server no longer in the
// list — the UI then renders as "no servers" even when others remain, since
// the mobile/desktop views key off activeServer, not servers.length, and the
// auto-select effect only fires when activeServerId is falsy.
function removeServerFromState(s, serverId) {
  return {
    servers: s.servers.filter((sv) => sv.id !== serverId),
    ...(s.activeServerId === serverId ? { activeServerId: null, activeChannelId: null } : {}),
  };
}

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
  activity: {}, // userId -> { track, artist, albumArt, trackUrl, startedAt } | undefined
  typing: {}, // roomKey -> { userId: username }
  view: "server", // "server" | "dm" | "discover"
  discoverResults: [],
  reportsByServer: {},

  selectDiscover: () => set({ view: "discover", activeServerId: null, activeDmId: null }),

  fetchDiscover: async ({ q, category } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (category) params.set("category", category);
    const { data } = await api.get(`/servers/discover?${params.toString()}`);
    set({ discoverResults: data.servers });
    return data.servers;
  },

  createPoll: async (channelId, question, options) => {
    // The server broadcasts "message:new" to the channel room (including us),
    // so the socket listener adds it — adding it here too would duplicate it.
    const { data } = await api.post(`/polls/channel/${channelId}`, { question, options });
    return data.message;
  },

  votePoll: async (messageId, optionId) => {
    const { data } = await api.post(`/polls/${messageId}/vote`, { optionId });
    get().updateMessageInStore(data.message);
  },

  reportMessage: async (messageId, reason) => {
    await api.post(`/messages/${messageId}/report`, { reason });
  },

  fetchReports: async (serverId) => {
    const { data } = await api.get(`/servers/${serverId}/reports`);
    set((s) => ({ reportsByServer: { ...s.reportsByServer, [serverId]: data.reports } }));
  },

  resolveReport: async (serverId, reportId) => {
    await api.post(`/servers/${serverId}/reports/${reportId}/resolve`);
    set((s) => ({
      reportsByServer: { ...s.reportsByServer, [serverId]: (s.reportsByServer[serverId] || []).filter((r) => r.id !== reportId) },
    }));
  },

  fetchServers: async () => {
    if (DEMO_MODE) {
      set({ servers: demoServers });
      return demoServers;
    }
    const { data } = await api.get("/servers");
    set({ servers: data.servers });
    return data.servers;
  },

  createServer: async (name, extra = {}) => {
    if (DEMO_MODE) {
      const server = {
        id: `demo-server-${Date.now()}`,
        name,
        icon: null,
        inviteCode: Math.random().toString(36).slice(2, 12),
        myRole: "OWNER",
        channels: [{ id: `demo-ch-${Date.now()}`, name: "genel", type: "TEXT", position: 0 }],
      };
      set((s) => ({ servers: [...s.servers, server] }));
      return server;
    }
    const { data } = await api.post("/servers", { name, ...extra });
    set((s) => ({ servers: [...s.servers, data.server] }));
    getSocket()?.emit("server:join_room", data.server.id);
    return data.server;
  },

  joinServer: async (inviteCode) => {
    if (DEMO_MODE) throw { response: { data: { error: "Demo modda sunucuya katilma devre disi." } } };
    const { data } = await api.post("/servers/join", { inviteCode });
    set((s) => ({ servers: [...s.servers, data.server] }));
    getSocket()?.emit("server:join_room", data.server.id);
    return data.server;
  },

  leaveServer: async (serverId) => {
    if (DEMO_MODE) return set((s) => removeServerFromState(s, serverId));
    await api.post(`/servers/${serverId}/leave`);
    set((s) => removeServerFromState(s, serverId));
  },

  deleteServer: async (serverId) => {
    if (DEMO_MODE) return set((s) => removeServerFromState(s, serverId));
    await api.delete(`/servers/${serverId}`);
    set((s) => removeServerFromState(s, serverId));
  },

  createChannel: async (serverId, name, type) => {
    if (DEMO_MODE) {
      const channel = { id: `demo-ch-${Date.now()}`, name, type, position: 99 };
      set((s) => ({
        servers: s.servers.map((sv) => (sv.id === serverId ? { ...sv, channels: [...sv.channels, channel] } : sv)),
      }));
      return channel;
    }
    const { data } = await api.post(`/servers/${serverId}/channels`, { name, type });
    set((s) => ({
      servers: s.servers.map((sv) =>
        sv.id === serverId ? { ...sv, channels: [...sv.channels, data.channel] } : sv
      ),
    }));
    return data.channel;
  },

  fetchMembers: async (serverId) => {
    if (DEMO_MODE) {
      set((s) => ({ membersByServer: { ...s.membersByServer, [serverId]: demoMembers[serverId] || [] } }));
      return;
    }
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
    if (DEMO_MODE) {
      set((s) => ({ messagesByChannel: { ...s.messagesByChannel, [channelId]: demoMessages[channelId] || [] } }));
      return;
    }
    const { data } = await api.get(`/messages/channel/${channelId}`);
    set((s) => ({ messagesByChannel: { ...s.messagesByChannel, [channelId]: data.messages } }));
  },

  sendDemoMessage: (content, { channelId, dmChannelId }) => {
    const message = {
      id: `demo-msg-${demoMsgCounter++}`,
      content,
      edited: false,
      attachment: null,
      createdAt: new Date().toISOString(),
      channelId: channelId || null,
      dmChannelId: dmChannelId || null,
      author: { id: demoUser.id, username: demoUser.username, discriminator: demoUser.discriminator, avatarColor: demoUser.avatarColor },
      reactions: [],
    };
    get().receiveMessage(message);
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
    if (DEMO_MODE) return;
    await api.delete(`/messages/${messageId}`);
  },

  editMessage: async (messageId, content) => {
    if (DEMO_MODE) {
      const key = "messagesByChannel";
      set((s) => {
        for (const listKey of ["messagesByChannel", "messagesByDm"]) {
          const found = Object.entries(s[listKey]).find(([, msgs]) => msgs.some((m) => m.id === messageId));
          if (found) {
            const [id, msgs] = found;
            return {
              [listKey]: { ...s[listKey], [id]: msgs.map((m) => (m.id === messageId ? { ...m, content, edited: true } : m)) },
            };
          }
        }
        return {};
      });
      return;
    }
    const { data } = await api.patch(`/messages/${messageId}`, { content });
    get().updateMessageInStore(data.message);
  },

  toggleReaction: async (messageId, emoji) => {
    if (DEMO_MODE) {
      for (const listKey of ["messagesByChannel", "messagesByDm"]) {
        const entry = Object.entries(get()[listKey]).find(([, msgs]) => msgs.some((m) => m.id === messageId));
        if (entry) {
          const [id, msgs] = entry;
          const updated = msgs.map((m) => {
            if (m.id !== messageId) return m;
            const existing = m.reactions.find((r) => r.emoji === emoji);
            const reactions = existing
              ? m.reactions.map((r) => (r.emoji === emoji ? { ...r, count: r.count + 1 } : r))
              : [...m.reactions, { emoji, count: 1, userIds: [demoUser.id] }];
            return { ...m, reactions };
          });
          set((s) => ({ [listKey]: { ...s[listKey], [id]: updated } }));
          return;
        }
      }
      return;
    }
    const { data } = await api.post(`/messages/${messageId}/reactions`, { emoji });
    get().updateMessageInStore(data.message);
  },

  fetchDms: async () => {
    if (DEMO_MODE) return set({ dms: demoDms });
    const { data } = await api.get("/dms");
    set({ dms: data.dms });
  },

  startDm: async ({ userId, username }) => {
    if (DEMO_MODE) return demoDms[0];
    const { data } = await api.post("/dms", { userId, username });
    set((s) => {
      const exists = s.dms.find((d) => d.id === data.dm.id);
      return { dms: exists ? s.dms : [...s.dms, data.dm] };
    });
    return data.dm;
  },

  selectDm: (dmId) => set({ activeDmId: dmId, view: "dm", activeServerId: null }),

  fetchDmMessages: async (dmId) => {
    if (DEMO_MODE) {
      set((s) => ({ messagesByDm: { ...s.messagesByDm, [dmId]: demoDmMessages[dmId] || [] } }));
      return;
    }
    const { data } = await api.get(`/dms/${dmId}/messages`);
    set((s) => ({ messagesByDm: { ...s.messagesByDm, [dmId]: data.messages } }));
  },

  setPresence: (userId, status) => set((s) => ({ presence: { ...s.presence, [userId]: status } })),

  fetchActivitySnapshot: async () => {
    if (DEMO_MODE) return;
    const { data } = await api.get("/users/activity");
    set({ activity: data.activity });
  },

  setActivity: (userId, activity) =>
    set((s) => {
      const next = { ...s.activity };
      if (activity) next[userId] = activity;
      else delete next[userId];
      return { activity: next };
    }),

  setTyping: (roomKey, userId, username) =>
    set((s) => ({ typing: { ...s.typing, [roomKey]: { ...(s.typing[roomKey] || {}), [userId]: username } } })),

  clearTyping: (roomKey, userId) =>
    set((s) => {
      const room = { ...(s.typing[roomKey] || {}) };
      delete room[userId];
      return { typing: { ...s.typing, [roomKey]: room } };
    }),
}));
