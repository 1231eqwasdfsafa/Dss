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
  onOpenHub,
  onOpenSettings,
  onOpenProfile,
}) {
  return (
    <div className="hidden md:flex w-80 bg-base-800 shrink-0 border-r border-base-900/60">
      <div className="w-[68px] shrink-0 border-r border-base-900/60 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none">
        <RailIcon active={view === "dm"} onClick={onSelectHome} label="Direkt Mesajlar">
          <MessageCircle size={19} />
        </RailIcon>

        <RailIcon onClick={onOpenHub} label="Hub" variant="hub">
          <Plus size={20} strokeWidth={2.5} />
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
              <div className="w-14 h-14 rounded-2xl bg-base-750 border border-base-700 flex items-center justify-center mb-3">
                <UserPlus size={22} className="text-gray-500" />
              </div>
              <p className="text-sm text-gray-500 mb-4">Henuz bir sunucun yok.</p>
              <div className="flex flex-col gap-1 w-full max-w-[200px]">
                <button onClick={onCreate} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-base-750 text-teal text-sm font-medium">
                  <Plus size={16} /> Sunucu Olustur
                </button>
                <button onClick={onJoin} className="flex items-center justify-center gap-2 px-3 py-2 rounded-xl hover:bg-base-750 text-teal text-sm font-medium">
                  <UserPlus size={16} /> Davet Koduyla Katil
                </button>
              </div>
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

  if (variant === "hub") {
    return (
      <button
        onClick={onClick}
        title={label}
        className="w-12 h-12 shrink-0 rounded-full bg-amber text-base-900 shadow-panel flex items-center justify-center hover:bg-amber-hover hover:rounded-2xl transition-all duration-200"
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
        style={{ background: gradient || "#3F3125" }}
      >
        {children}
      </span>
    </button>
  );
}
