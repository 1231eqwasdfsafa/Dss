// Temporary offline preview mode: bypasses login and seeds fake data so the
// UI can be reviewed without a running backend (e.g. a frontend-only Vercel
// deploy). Turn on with VITE_DEMO_MODE=true. Remove this file and its call
// sites once a real backend is wired up.
export const DEMO_MODE = import.meta.env.VITE_DEMO_MODE === "true";

export const demoUser = {
  id: "demo-user",
  username: "sen",
  discriminator: "0001",
  email: "demo@nexus.local",
  avatarColor: "#5865F2",
  status: "ONLINE",
  customStatus: "Demo modunda geziniyor",
};

const now = Date.now();
const minutesAgo = (m) => new Date(now - m * 60000).toISOString();

export const demoServers = [
  {
    id: "demo-server-1",
    name: "Nexus Demo",
    icon: null,
    inviteCode: "demo1234",
    myRole: "OWNER",
    channels: [
      { id: "demo-ch-genel", name: "genel", type: "TEXT", position: 0 },
      { id: "demo-ch-random", name: "random", type: "TEXT", position: 1 },
      { id: "demo-ch-sohbet", name: "sohbet", type: "VOICE", position: 2 },
    ],
  },
  {
    id: "demo-server-2",
    name: "Oyun Kulubu",
    icon: null,
    inviteCode: "demo5678",
    myRole: "MEMBER",
    channels: [
      { id: "demo-ch-oyun-genel", name: "genel", type: "TEXT", position: 0 },
      { id: "demo-ch-oyun-ses", name: "oyun-odasi", type: "VOICE", position: 1 },
    ],
  },
];

export const demoMembers = {
  "demo-server-1": [
    { id: "demo-user", username: "sen", discriminator: "0001", avatarColor: "#5865F2", status: "ONLINE", role: "OWNER", customStatus: "Demo modunda geziniyor" },
    { id: "demo-alice", username: "alice", discriminator: "4821", avatarColor: "#EB459E", status: "ONLINE", role: "ADMIN", customStatus: "Kod yaziyor" },
    { id: "demo-bora", username: "bora", discriminator: "1190", avatarColor: "#57F287", status: "IDLE", role: "MEMBER", customStatus: null },
    { id: "demo-ceren", username: "ceren", discriminator: "7734", avatarColor: "#FEE75C", status: "DND", role: "MEMBER", customStatus: "Toplantida" },
    { id: "demo-deniz", username: "deniz", discriminator: "3302", avatarColor: "#9B59B6", status: "OFFLINE", role: "MEMBER", customStatus: null },
  ],
};

export const demoMessages = {
  "demo-ch-genel": [
    {
      id: "m1",
      content: "Nexus'a hos geldiniz! Burasi genel sohbet kanalimiz.",
      edited: false,
      attachment: null,
      createdAt: minutesAgo(40),
      channelId: "demo-ch-genel",
      author: { id: "demo-alice", username: "alice", discriminator: "4821", avatarColor: "#EB459E" },
      reactions: [{ emoji: "👋", count: 2, userIds: ["demo-bora", "demo-ceren"] }],
    },
    {
      id: "m2",
      content: "Selam! Yeni tasarim gercekten cok iyi olmus.",
      edited: false,
      attachment: null,
      createdAt: minutesAgo(35),
      channelId: "demo-ch-genel",
      author: { id: "demo-bora", username: "bora", discriminator: "1190", avatarColor: "#57F287" },
      reactions: [],
    },
    {
      id: "m3",
      content: "Bu bir demo mesaji - backend baglanmadan arayuzu gostermek icin.",
      edited: false,
      attachment: null,
      createdAt: minutesAgo(2),
      channelId: "demo-ch-genel",
      author: { id: "demo-user", username: "sen", discriminator: "0001", avatarColor: "#5865F2" },
      reactions: [{ emoji: "🎉", count: 1, userIds: ["demo-alice"] }],
    },
  ],
  "demo-ch-random": [
    {
      id: "m4",
      content: "Random kanalina hos geldin :)",
      edited: false,
      attachment: null,
      createdAt: minutesAgo(120),
      channelId: "demo-ch-random",
      author: { id: "demo-ceren", username: "ceren", discriminator: "7734", avatarColor: "#FEE75C" },
      reactions: [],
    },
  ],
};

export const demoDms = [
  { id: "demo-dm-1", user: { id: "demo-alice", username: "alice", discriminator: "4821", avatarColor: "#EB459E", status: "ONLINE" } },
];

export const demoDmMessages = {
  "demo-dm-1": [
    {
      id: "dm1",
      content: "Selam, projeyi nasil buldun?",
      edited: false,
      attachment: null,
      createdAt: minutesAgo(15),
      dmChannelId: "demo-dm-1",
      author: { id: "demo-alice", username: "alice", discriminator: "4821", avatarColor: "#EB459E" },
      reactions: [],
    },
  ],
};
