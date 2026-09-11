import Avatar from "./Avatar.jsx";
import { Crown, Shield, X } from "./Icons.jsx";

const GROUPS = [
  { role: "OWNER", label: "Sahip" },
  { role: "ADMIN", label: "Yoneticiler" },
  { role: "MEMBER", label: "Uyeler" },
];

export default function MemberList({ open, onClose, members, presence, onStartDm }) {
  const withPresence = members.map((m) => ({ ...m, status: presence[m.id] || m.status }));
  const online = withPresence.filter((m) => m.status !== "OFFLINE");
  const offline = withPresence.filter((m) => m.status === "OFFLINE");

  return (
    <>
      {/* Click-outside catcher; starts below the header so the toggle button stays reachable. */}
      <div
        className={`absolute top-12 inset-x-0 bottom-0 z-20 transition-opacity ${open ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`absolute top-12 right-0 bottom-0 w-[85vw] max-w-64 bg-base-800 border-l border-base-600 shadow-panel z-30 overflow-y-auto py-3 px-2 transition-transform duration-200 ease-out ${
          open ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-500">Uyeler</span>
          <button onClick={onClose} className="text-gray-500 hover:text-ink">
            <X size={16} />
          </button>
        </div>

        {GROUPS.map((g) => {
          const group = online.filter((m) => m.role === g.role);
          if (group.length === 0) return null;
          return (
            <div key={g.role} className="mb-4">
              <div className="px-2 mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
                {g.label} — <span className="mono">{group.length}</span>
              </div>
              {group.map((m) => (
                <MemberRow key={m.id} member={m} onClick={() => onStartDm(m)} />
              ))}
            </div>
          );
        })}

        {offline.length > 0 && (
          <div className="mb-4">
            <div className="px-2 mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">
              Cevrimdisi — <span className="mono">{offline.length}</span>
            </div>
            {offline.map((m) => (
              <MemberRow key={m.id} member={m} muted onClick={() => onStartDm(m)} />
            ))}
          </div>
        )}
      </div>
    </>
  );
}

function MemberRow({ member, muted, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-2 py-1.5 rounded-lg hover:bg-base-750 text-left ${muted ? "opacity-50" : ""}`}
    >
      <Avatar username={member.username} color={member.avatarColor} status={member.status} size={32} />
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1">
          <span className="text-sm font-medium text-gray-200 truncate">{member.nickname || member.username}</span>
          {member.role === "OWNER" && <Crown size={12} className="text-idle shrink-0" />}
          {member.role === "ADMIN" && <Shield size={12} className="text-teal shrink-0" />}
        </div>
        {member.customStatus && <div className="text-xs text-gray-500 truncate">{member.customStatus}</div>}
      </div>
    </button>
  );
}
