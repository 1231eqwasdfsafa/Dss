import { Plus, Compass, MessageCircle, UserPlus } from "./Icons.jsx";

export default function ServerRail({
  servers,
  activeServerId,
  view,
  onSelectServer,
  onSelectHome,
  onCreate,
  onJoin,
  onDiscover,
}) {
  return (
    <div className="w-[72px] bg-base-900 flex flex-col items-center py-3 gap-2 shrink-0 overflow-y-auto scrollbar-none">
      <RailItem active={view === "dm"} onClick={onSelectHome} label="Direkt Mesajlar" pill>
        <MessageCircle size={22} />
      </RailItem>

      <div className="w-8 h-[2px] bg-base-700 rounded-full my-1" />

      {servers.map((server) => (
        <RailItem
          key={server.id}
          active={view === "server" && activeServerId === server.id}
          onClick={() => onSelectServer(server.id)}
          label={server.name}
        >
          <span className="text-sm font-bold">{initials(server.name)}</span>
        </RailItem>
      ))}

      <RailItem onClick={onCreate} label="Sunucu olustur" variant="add">
        <Plus size={20} />
      </RailItem>
      <RailItem onClick={onJoin} label="Davet koduyla katil" variant="add">
        <UserPlus size={20} />
      </RailItem>

      <div className="w-8 h-[2px] bg-base-700 rounded-full my-1" />

      <RailItem active={view === "discover"} onClick={onDiscover} label="Kesfet" variant="discover">
        <Compass size={20} />
      </RailItem>
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

function RailItem({ children, active, onClick, label, variant, pill }) {
  return (
    <div className="relative group flex items-center justify-center w-full">
      <div
        className={`absolute left-0 bg-teal rounded-r-full transition-all ${
          active ? "h-10 w-1" : "h-2 w-1 opacity-0 group-hover:opacity-100 group-hover:h-5"
        }`}
      />
      <button
        onClick={onClick}
        title={label}
        className={`w-12 h-12 flex items-center justify-center transition-all duration-150 text-ink
          ${active ? "rounded-2xl" : "rounded-full hover:rounded-2xl"}
          ${
            variant === "add" || variant === "discover"
              ? "bg-base-800 text-gray-400 hover:bg-teal/15 hover:text-teal"
              : active
              ? "bg-base-700 ring-1 ring-teal/40"
              : "bg-base-800 hover:bg-base-700"
          }`}
      >
        {children}
      </button>
    </div>
  );
}
