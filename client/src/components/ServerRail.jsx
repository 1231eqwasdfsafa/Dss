import { Plus, Compass, MessageCircle, UserPlus } from "./Icons.jsx";
import AccountMenu from "./AccountMenu.jsx";

export default function ServerRail({
  servers,
  activeServerId,
  view,
  onSelectServer,
  onSelectHome,
  onCreate,
  onJoin,
  onDiscover,
  onOpenSettings,
  onOpenProfile,
}) {
  return (
    <div className="w-[64px] bg-base-900 flex flex-col items-center py-3 gap-1.5 shrink-0 overflow-y-auto scrollbar-none">
      <RailItem active={view === "dm"} onClick={onSelectHome} label="Direkt Mesajlar">
        <MessageCircle size={19} />
      </RailItem>

      <div className="w-6 h-px bg-base-700 my-1.5" />

      <div className="flex-1 w-full flex flex-col items-center gap-1.5 overflow-y-auto scrollbar-none">
        {servers.map((server) => (
          <RailItem
            key={server.id}
            active={view === "server" && activeServerId === server.id}
            onClick={() => onSelectServer(server.id)}
            label={server.name}
          >
            <span className="text-[13px] font-bold">{initials(server.name)}</span>
          </RailItem>
        ))}

        <RailItem onClick={onCreate} label="Sunucu olustur" variant="ghost">
          <Plus size={18} />
        </RailItem>
        <RailItem onClick={onJoin} label="Davet koduyla katil" variant="ghost">
          <UserPlus size={18} />
        </RailItem>

        <div className="w-6 h-px bg-base-700 my-1.5" />

        <RailItem active={view === "discover"} onClick={onDiscover} label="Kesfet" variant="ghost">
          <Compass size={18} />
        </RailItem>
      </div>

      <div className="w-6 h-px bg-base-700 my-1.5" />
      <AccountMenu onOpenSettings={onOpenSettings} onOpenProfile={onOpenProfile} />
    </div>
  );
}

function initials(name) {
  return name
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

function RailItem({ children, active, onClick, label, variant }) {
  return (
    <div className="relative flex items-center justify-center w-full">
      <button
        onClick={onClick}
        title={label}
        className={`w-10 h-10 flex items-center justify-center rounded-lg transition-colors text-ink ${
          variant === "ghost"
            ? "text-gray-500 hover:bg-base-800 hover:text-teal"
            : active
            ? "bg-base-700 ring-1 ring-inset ring-teal/50"
            : "bg-base-800 hover:bg-base-700"
        }`}
      >
        {children}
      </button>
      {active && <span className="absolute -left-1.5 top-1/2 -translate-y-1/2 w-1 h-1 rounded-full bg-teal" />}
    </div>
  );
}
