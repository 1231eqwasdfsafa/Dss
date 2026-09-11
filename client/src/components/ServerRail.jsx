import { Plus, Compass, MessageCircle } from "./Icons.jsx";

export default function ServerRail({ servers, activeServerId, view, onSelectServer, onSelectHome, onCreate, onJoin }) {
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
      <RailItem onClick={onJoin} label="Davetle katil" variant="add">
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
        className={`absolute left-0 bg-white rounded-r-full transition-all ${
          active ? "h-10 w-1" : "h-2 w-1 opacity-0 group-hover:opacity-100 group-hover:h-5"
        }`}
      />
      <button
        onClick={onClick}
        title={label}
        className={`w-12 h-12 flex items-center justify-center transition-all duration-150 text-white
          ${active ? "rounded-2xl" : "rounded-full hover:rounded-2xl"}
          ${
            variant === "add"
              ? "bg-base-800 text-accent hover:bg-accent hover:text-white"
              : active
              ? "bg-accent"
              : "bg-base-800 hover:bg-accent"
          }`}
      >
        {children}
      </button>
    </div>
  );
}
