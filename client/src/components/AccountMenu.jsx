import { useState } from "react";
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

// Account identity lives pinned to the bottom of the icon rail (VSCode/Slack
// desktop convention) instead of Discord's always-visible bottom bar with
// voice controls we don't have a feature for.
export default function AccountMenu({ onOpenSettings }) {
  const { user, logout, updateProfile } = useAuthStore();
  const [open, setOpen] = useState(false);

  if (!user) return null;

  async function setStatus(status) {
    await updateProfile({ status });
    getSocket()?.emit("status:update", status);
  }

  return (
    <div className="relative flex items-center justify-center w-full">
      {open && (
        <>
          <div className="fixed inset-0 z-30" onClick={() => setOpen(false)} />
          {/* Fixed (not absolute) so the rail's overflow-y-auto never clips it. */}
          <div className="fixed bottom-3 left-16 ml-2 bg-base-750 border border-base-600 rounded-lg shadow-panel py-1.5 w-56 z-40 animate-fade-in">
            <div className="flex items-center gap-2.5 px-3 py-2 border-b border-base-600 mb-1">
              <Avatar username={user.username} color={user.avatarColor} status={user.status} size={32} />
              <div className="min-w-0 text-left">
                <div className="text-sm font-semibold text-ink truncate">{user.username}</div>
                <div className="text-xs text-gray-500 mono truncate">#{user.discriminator}</div>
              </div>
            </div>
            {STATUS_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setStatus(opt.value)}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-200 hover:bg-base-700"
              >
                <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                {opt.label}
              </button>
            ))}
            <div className="border-t border-base-600 mt-1 pt-1">
              <button
                onClick={() => {
                  onOpenSettings();
                  setOpen(false);
                }}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-gray-200 hover:bg-base-700"
              >
                <Settings size={15} /> Ayarlar
              </button>
              <button
                onClick={logout}
                className="w-full flex items-center gap-2.5 px-3 py-1.5 text-sm text-warn hover:bg-base-700"
              >
                <LogOut size={15} /> Cikis Yap
              </button>
            </div>
          </div>
        </>
      )}
      <button onClick={() => setOpen((v) => !v)} title={user.username}>
        <Avatar username={user.username} color={user.avatarColor} status={user.status} size={40} square />
      </button>
    </div>
  );
}
