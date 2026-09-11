import { Plus, UserPlus, Compass, MessageCircle } from "./Icons.jsx";
import AccountMenu from "./AccountMenu.jsx";
import ServerChannelList from "./ServerChannelList.jsx";
import DmList from "./DmList.jsx";
import { gradientFor, initials } from "../lib/colors";

// Desktop counterpart to MobileServerRail + its channel list: same 48px
// circle-to-squircle gradient icons with a teal edge indicator, sitting in
// the SAME background as the channel list beside them (just a hairline
// border, not a second differently-shaded column) — porting the mobile
// identity here instead of Discord's flat two-tone rail-and-sidebar split.
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
    <div className="hidden md:flex w-80 bg-base-800 shrink-0 border-r border-base-900/60">
      <div className="w-[68px] shrink-0 border-r border-base-900/60 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none">
        <RailIcon active={view === "dm"} onClick={onSelectHome} label="Direkt Mesajlar">
          <MessageCircle size={19} />
        </RailIcon>

        <div className="w-7 h-px bg-base-600 my-0.5 shrink-0" />

        {servers.map((s) => (
          <RailIcon
            key={s.id}
            active={view === "server" && activeServerId === s.id}
            onClick={() => onSelectServer(s.id)}
            label={s.name}
            gradient={gradientFor(s.name)}
          >
            {initials(s.name)}
          </RailIcon>
        ))}

        <RailIcon onClick={onCreate} label="Sunucu Olustur" variant="ghost">
          <Plus size={20} />
        </RailIcon>
        <RailIcon onClick={onJoin} label="Davet Koduyla Katil" variant="ghost">
          <UserPlus size={18} />
        </RailIcon>

        <div className="w-7 h-px bg-base-600 my-0.5 shrink-0" />

        <RailIcon active={view === "discover"} onClick={onDiscover} label="Kesfet" variant="ghost">
          <Compass size={18} />
        </RailIcon>
      </div>

      <div className="flex-1 min-w-0 flex flex-col">
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
              <p className="text-xs text-gray-600">Soldan yeni bir sunucu kur ya da davet koduyla katil.</p>
            </div>
          ) : null}
        </div>

        <div className="px-3 py-2.5 border-t border-base-700 shrink-0">
          <AccountMenu onOpenSettings={onOpenSettings} onOpenProfile={onOpenProfile} />
        </div>
      </div>
    </div>
  );
}

function RailIcon({ children, active, onClick, label, variant = "solid", gradient }) {
  if (variant === "ghost") {
    return (
      <button
        onClick={onClick}
        title={label}
        className={`w-12 h-12 shrink-0 rounded-full flex items-center justify-center transition-all duration-200 ${
          active ? "bg-teal/15 text-teal rounded-2xl" : "text-gray-400 bg-base-750 hover:bg-base-700 hover:rounded-2xl"
        }`}
      >
        {children}
      </button>
    );
  }

  return (
    <button onClick={onClick} title={label} className="relative flex items-center justify-center w-full shrink-0">
      <span className={`absolute left-0 bg-teal rounded-r-full transition-all duration-200 ${active ? "h-8 w-1" : "h-2 w-1 opacity-0"}`} />
      <span
        className={`w-12 h-12 flex items-center justify-center font-bold text-sm text-ink shrink-0 transition-all duration-200 ${
          active ? "rounded-2xl" : "rounded-full hover:rounded-2xl"
        }`}
        style={{ background: gradient }}
      >
        {children}
      </span>
    </button>
  );
}
