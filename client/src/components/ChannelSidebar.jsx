import { useState } from "react";
import { Volume2, ChevronDown, Plus, UserPlus, Trash, LogOut, Flag } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";

export default function ChannelSidebar({
  view,
  server,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onOpenInvite,
  onOpenReports,
  onLeaveOrDelete,
  currentUserId,
  dms,
  activeDmId,
  onSelectDm,
  onNewDm,
  presence,
  open,
  onClose,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  let content = null;

  if (view === "dm") {
    content = (
      <>
        <div className="h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
          <span className="font-bold text-ink">Direkt Mesajlar</span>
        </div>
        <div className="flex-1 overflow-y-auto px-2 py-3">
          <button
            onClick={onNewDm}
            className="w-full flex items-center gap-2 px-2 py-1.5 mb-2 rounded text-gray-400 hover:bg-base-700 hover:text-gray-200 text-sm font-medium"
          >
            <Plus size={16} /> Yeni Mesaj
          </button>
          {dms.map((dm) => (
            <button
              key={dm.id}
              onClick={() => { onSelectDm(dm.id); onClose?.(); }}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 group ${
                activeDmId === dm.id ? "bg-base-700 text-ink" : "text-gray-300 hover:bg-base-750 hover:text-gray-100"
              }`}
            >
              <Avatar
                username={dm.user?.username}
                color={dm.user?.avatarColor}
                status={presence[dm.user?.id] || dm.user?.status}
                size={32}
              />
              <span className="text-sm font-medium truncate">{dm.user?.username || "Bilinmeyen"}</span>
            </button>
          ))}
        </div>
      </>
    );
  } else if (!server) {
    content = null;
  } else {
    const textChannels = server.channels.filter((c) => c.type === "TEXT");
    const voiceChannels = server.channels.filter((c) => c.type === "VOICE");
    const isOwner = server.myRole === "OWNER";
    const canManage = server.myRole === "OWNER" || server.myRole === "ADMIN";

    content = (
      <>
        <div className="relative h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
          <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center justify-between w-full font-bold text-ink">
            <span className="truncate">{server.name}</span>
            <ChevronDown size={18} />
          </button>
          {menuOpen && (
            <div className="absolute top-12 left-2 right-2 bg-base-750 rounded-lg shadow-panel py-1.5 z-20 animate-fade-in">
              <MenuItem icon={<UserPlus size={16} />} onClick={() => { onOpenInvite(); setMenuOpen(false); }}>
                Davet Et
              </MenuItem>
              {canManage && (
                <MenuItem icon={<Plus size={16} />} onClick={() => { onCreateChannel(); setMenuOpen(false); }}>
                  Kanal Olustur
                </MenuItem>
              )}
              {canManage && (
                <MenuItem icon={<Flag size={16} />} onClick={() => { onOpenReports(); setMenuOpen(false); }}>
                  Raporlar
                </MenuItem>
              )}
              <MenuItem
                danger
                icon={isOwner ? <Trash size={16} /> : <LogOut size={16} />}
                onClick={() => { onLeaveOrDelete(); setMenuOpen(false); }}
              >
                {isOwner ? "Sunucuyu Sil" : "Sunucudan Ayril"}
              </MenuItem>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-2 py-3">
          {textChannels.length > 0 && (
            <ChannelGroup label="Metin Kanallari">
              {textChannels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  icon={<span className="mono text-[13px]">/</span>}
                  active={activeChannelId === ch.id}
                  onClick={() => { onSelectChannel(ch.id); onClose?.(); }}
                >
                  {ch.name}
                </ChannelItem>
              ))}
            </ChannelGroup>
          )}

          {voiceChannels.length > 0 && (
            <ChannelGroup label="Ses Kanallari">
              {voiceChannels.map((ch) => (
                <ChannelItem
                  key={ch.id}
                  icon={<Volume2 size={18} />}
                  active={activeChannelId === ch.id}
                  onClick={() => { onSelectChannel(ch.id); onClose?.(); }}
                >
                  {ch.name}
                </ChannelItem>
              ))}
            </ChannelGroup>
          )}
        </div>

      </>
    );
  }

  if (!content) {
    return <div className="hidden md:block w-60 bg-base-800 shrink-0" />;
  }

  return (
    <>
      <div
        className={`fixed inset-0 z-30 md:hidden transition-opacity ${open ? "pointer-events-auto" : "pointer-events-none opacity-0"}`}
        onClick={onClose}
      />
      <div
        className={`fixed md:static inset-y-0 left-16 md:left-auto z-40 md:z-auto
          w-[calc(100vw-4rem)] sm:w-60 md:w-60 bg-base-800 flex flex-col shrink-0 border-r border-base-900/60
          transform transition-transform duration-200 ease-out md:translate-x-0
          ${open ? "translate-x-0" : "-translate-x-[calc(100%+4rem)] md:translate-x-0"}`}
      >
        {content}
      </div>
    </>
  );
}

function ChannelGroup({ label, children }) {
  return (
    <div className="mb-4">
      <div className="px-2 mb-1 text-xs font-bold uppercase tracking-wide text-gray-500">{label}</div>
      <div className="flex flex-col gap-0.5">{children}</div>
    </div>
  );
}

function ChannelItem({ children, icon, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg text-sm font-medium transition-colors ${
        active ? "bg-base-700 text-ink" : "text-gray-400 hover:bg-base-750 hover:text-gray-200"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      <span className="truncate mono">{children}</span>
    </button>
  );
}

function MenuItem({ children, icon, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium hover:bg-base-700 ${
        danger ? "text-dnd" : "text-gray-200"
      }`}
    >
      {icon}
      {children}
    </button>
  );
}
