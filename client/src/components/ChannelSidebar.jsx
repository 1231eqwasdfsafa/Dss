import ServerChannelList from "./ServerChannelList.jsx";
import DmList from "./DmList.jsx";

// Desktop-only static column. Mobile uses the same ServerChannelList/DmList
// content full-screen via the drill-down navigation in MainLayout.
export default function ChannelSidebar({
  view,
  server,
  activeChannelId,
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
}) {
  if (view === "dm") {
    return (
      <div className="hidden md:flex w-60 bg-base-800 flex-col shrink-0 border-r border-base-900/60">
        <DmList dms={dms} activeDmId={activeDmId} onSelectDm={onSelectDm} onNewDm={onNewDm} presence={presence} />
      </div>
    );
  }

  if (!server) {
    return <div className="hidden md:block w-60 bg-base-800 shrink-0" />;
  }

  return (
    <div className="hidden md:flex w-60 bg-base-800 flex-col shrink-0 border-r border-base-900/60">
      <ServerChannelList
        server={server}
        activeChannelId={activeChannelId}
        onSelectChannel={onSelectChannel}
        onCreateChannel={onCreateChannel}
        onOpenInvite={onOpenInvite}
        onOpenReports={onOpenReports}
        onLeaveOrDelete={onLeaveOrDelete}
      />
    </div>
  );
}
