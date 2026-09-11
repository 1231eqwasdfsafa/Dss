import Avatar from "./Avatar.jsx";
import { Settings, LogOut } from "./Icons.jsx";
import { useAuthStore } from "../store/authStore";
import { getSocket } from "../lib/socket";

const STATUS_OPTIONS = [
  { value: "ONLINE", label: "Cevrimici", color: "bg-online" },
  { value: "IDLE", label: "Bosta", color: "bg-idle" },
  { value: "DND", label: "Rahatsiz Etmeyin", color: "bg-dnd" },
  { value: "OFFLINE", label: "Gorunmez", color: "bg-gray-500" },
];

export default function MobileAccountScreen({ onOpenSettings, onOpenProfile }) {
  const { user, logout, updateProfile } = useAuthStore();
  if (!user) return null;

  async function setStatus(status) {
    await updateProfile({ status });
    getSocket()?.emit("status:update", status);
  }

  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
        <span className="font-bold text-ink">Hesabim</span>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <button onClick={onOpenProfile} className="flex items-center gap-3 mb-6 w-full text-left hover:opacity-90">
          <Avatar username={user.username} color={user.avatarColor} url={user.avatarUrl} status={user.status} size={56} square />
          <div>
            <div className="font-bold text-ink">{user.username}</div>
            <div className="text-sm text-gray-500 mono">#{user.discriminator}</div>
          </div>
        </button>

        <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Durum</div>
        <div className="flex flex-col gap-0.5 mb-6">
          {STATUS_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setStatus(opt.value)}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm ${
                user.status === opt.value ? "bg-base-800 text-ink" : "text-gray-300 hover:bg-base-800"
              }`}
            >
              <span className={`w-2.5 h-2.5 rounded-full ${opt.color}`} />
              {opt.label}
            </button>
          ))}
        </div>

        <div className="flex flex-col gap-0.5">
          <button onClick={onOpenSettings} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-gray-300 hover:bg-base-800">
            <Settings size={16} /> Ayarlar
          </button>
          <button onClick={logout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm text-warn hover:bg-base-800">
            <LogOut size={16} /> Cikis Yap
          </button>
        </div>
      </div>
    </div>
  );
}
