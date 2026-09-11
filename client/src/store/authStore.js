import { create } from "zustand";
import { api } from "../lib/api";
import { connectSocket, disconnectSocket } from "../lib/socket";

export const useAuthStore = create((set, get) => ({
  user: null,
  token: localStorage.getItem("nexus_token") || null,
  loading: true,

  init: async () => {
    const token = localStorage.getItem("nexus_token");
    if (!token) return set({ loading: false });
    try {
      const { data } = await api.get("/auth/me");
      set({ user: data.user, token, loading: false });
      connectSocket(token);
    } catch {
      localStorage.removeItem("nexus_token");
      set({ user: null, token: null, loading: false });
    }
  },

  login: async (email, password) => {
    const { data } = await api.post("/auth/login", { email, password });
    localStorage.setItem("nexus_token", data.token);
    set({ user: data.user, token: data.token });
    connectSocket(data.token);
    return data.user;
  },

  register: async (username, email, password) => {
    const { data } = await api.post("/auth/register", { username, email, password });
    localStorage.setItem("nexus_token", data.token);
    set({ user: data.user, token: data.token });
    connectSocket(data.token);
    return data.user;
  },

  updateProfile: async (patch) => {
    const { data } = await api.patch("/auth/me", patch);
    set({ user: data.user });
  },

  logout: () => {
    localStorage.removeItem("nexus_token");
    disconnectSocket();
    set({ user: null, token: null });
  },

  setPresence: (userId, status) => {
    const { user } = get();
    if (user && user.id === userId) set({ user: { ...user, status } });
  },
}));
