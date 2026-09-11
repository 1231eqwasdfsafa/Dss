import { useState } from "react";
import Avatar from "./Avatar.jsx";
import { Settings, LogOut, Mic, MicOff, Headphones } from "./Icons.jsx";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "../lib/socket";

const STATUS_OPTIONS = [
  { value: "ONLINE", label: "Cevrimici", color: "bg-online" },
  { value: "IDLE", label: "Bosta", color: "bg-idle" },
  { value: "DND", label: "Rahatsiz Etmeyin", color: "bg-dnd" },
  { value: "OFFLINE", label: "Gorunmez", color: "bg-gray-500" },
];

export default function UserPanel({ onOpenSettings }) {
  const { user, logout, updateProfile } = useAuthStore();
  const [muted, setMuted] = useState(false);
  const [deafened, setDeafened] = useState(false);
  const [statusMenu, setStatusMenu] = useState(false);

  if (!user) return null;

  async function setStatus(status) {
    await updateProfile({ status });
    getSocket()?.emit("status:update", status);
    setStatusMenu(false);
  }

  return (
    <div className="relative h-[56px] bg-base-850 px-2 flex items-center gap-2 shrink-0">
      {statusMenu && (
        <div className="absolute bottom-[60px] left-2 bg-base-750 rounded-lg shadow-panel py-1.5 w-52 z-20 animate-fade-in">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className="w-full flex items-center gap-2.5 px-3 py-2 text-sm text-gray-200 hover:bg-base-700"
            >
              <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>
      )}

      <button onClick={() => setStatusMenu((v) => !v)} className="flex items-center gap-2 flex-1 min-w-0 rounded hover:bg-base-750 px-1.5 py-1">
        <Avatar username={user.username} color={user.avatarColor} status={user.status} size={32} />
        <div className="min-w-0 text-left">
          <div className="text-sm font-semibold text-white truncate">{user.username}</div>
          <div className="text-xs text-gray-400 truncate">{user.customStatus || `#${user.discriminator}`}</div>
        </div>
      </button>

      <div className="flex items-center gap-0.5">
        <IconBtn active={muted} onClick={() => setMuted((v) => !v)}>
          {muted ? <MicOff size={18} /> : <Mic size={18} />}
        </IconBtn>
        <IconBtn active={deafened} onClick={() => setDeafened((v) => !v)}>
          <Headphones size={18} />
        </IconBtn>
        <IconBtn onClick={onOpenSettings}>
          <Settings size={18} />
        </IconBtn>
        <IconBtn onClick={logout}>
          <LogOut size={18} />
        </IconBtn>
      </div>
    </div>
  );
}

function IconBtn({ children, onClick, active }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center rounded hover:bg-base-700 transition-colors ${
        active ? "text-dnd" : "text-gray-400 hover:text-gray-200"
      }`}
    >
      {children}
    </button>
  );
}
