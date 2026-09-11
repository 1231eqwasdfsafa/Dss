import { Plus, UserPlus, Compass, MessageCircle } from "./Icons.jsx";
import AccountMenu from "./AccountMenu.jsx";
import ServerChannelList from "./ServerChannelList.jsx";
import DmList from "./DmList.jsx";
import { gradientFor, initials } from "../lib/colors";

// One unified panel instead of Discord's two side-by-side rails (a bare icon
// strip + a separate channel column): servers switch via a horizontal row of
// icons at the top of the SAME panel that holds the channel/DM list below
// it, so there's a single bordered column, not two differently-shaded ones.
export default function DesktopSidebar({
  servers,
  activeServerId,
  view,
  server,
  activeChannelId,
  onSelectServer,
  onSelectHome,
  onSelectChannel,
  onCreateChannel,
  onOpenInvite,
  onOpenReports,
  onLeaveOrDelete,
  dms,
  activeDmId,
  onSelectDm,
  onNewDm,
  presence,
  onCreate,
  onJoin,
  onDiscover,
  onOpenSettings,
  onOpenProfile,
}) {
  return (
    <div className="hidden md:flex w-72 bg-base-800 flex-col shrink-0 border-r border-base-900/60">
      <div className="flex flex-wrap items-center gap-1.5 px-3 py-3 border-b border-base-700 shrink-0">
        <RailIcon active={view === "dm"} onClick={onSelectHome} label="Direkt Mesajlar">
          <MessageCircle size={16} />
        </RailIcon>

        {servers.map((s) => (
          <RailIcon
            key={s.id}
            active={view === "server" && activeServerId === s.id}
            onClick={() => onSelectServer(s.id)}
            label={s.name}
            gradient={gradientFor(s.name)}
          >
            <span className="text-[11px] font-bold">{initials(s.name)}</span>
          </RailIcon>
        ))}

        <RailIcon onClick={onCreate} label="Sunucu Olustur" variant="ghost">
          <Plus size={16} />
        </RailIcon>
        <RailIcon onClick={onJoin} label="Davet Koduyla Katil" variant="ghost">
          <UserPlus size={16} />
        </RailIcon>
        <RailIcon active={view === "discover"} onClick={onDiscover} label="Kesfet" variant="ghost">
          <Compass size={16} />
        </RailIcon>
      </div>

      <div className="flex-1 min-h-0 flex flex-col">
        {view === "dm" ? (
          <DmList dms={dms} activeDmId={activeDmId} onSelectDm={onSelectDm} onNewDm={onNewDm} presence={presence} />
        ) : server ? (
          <ServerChannelList
            server={server}
            activeChannelId={activeChannelId}
            onSelectChannel={onSelectChannel}
            onCreateChannel={onCreateChannel}
            onOpenInvite={onOpenInvite}
            onOpenReports={onOpenReports}
            onLeaveOrDelete={onLeaveOrDelete}
          />
        ) : view === "server" ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
            <p className="text-sm text-gray-500 mb-1">Henuz bir sunucun yok.</p>
            <p className="text-xs text-gray-600">Yukaridan yeni bir sunucu kur ya da davet koduyla katil.</p>
          </div>
        ) : null}
      </div>

      <div className="px-3 py-2.5 border-t border-base-700 shrink-0">
        <AccountMenu onOpenSettings={onOpenSettings} onOpenProfile={onOpenProfile} />
      </div>
    </div>
  );
}

function RailIcon({ children, active, onClick, label, variant = "solid", gradient }) {
  const base = "relative w-9 h-9 shrink-0 flex items-center justify-center rounded-xl transition-all";

  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        title={label}
        className={`${base} ${active ? "bg-teal/15 text-teal" : "text-gray-500 hover:bg-base-700 hover:text-gray-300"}`}
      >
        {children}
      </button>
    );
  }

  return (
    <button
      onClick={onClick}
      title={label}
      className={`${base} text-ink ${active ? "ring-2 ring-teal" : "hover:brightness-110"}`}
      style={{ background: gradient || "#3F3125" }}
    >
      {children}
    </button>
  );
}
