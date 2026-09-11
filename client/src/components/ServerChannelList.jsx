import { useState } from "react";
import { Volume2, ChevronDown, Plus, UserPlus, Trash, LogOut, Flag } from "./Icons.jsx";

// Channel listing + server management menu, shared between the desktop
// sidebar column and the mobile drill-down screen.
export default function ServerChannelList({
  server,
  activeChannelId,
  onSelectChannel,
  onCreateChannel,
  onOpenInvite,
  onOpenReports,
  onLeaveOrDelete,
  headerLeft,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (!server) return null;

  const textChannels = server.channels.filter((c) => c.type === "TEXT");
  const voiceChannels = server.channels.filter((c) => c.type === "VOICE");
  const isOwner = server.myRole === "OWNER";
  const canManage = server.myRole === "OWNER" || server.myRole === "ADMIN";

  return (
    <>
      <div className="relative h-12 flex items-center gap-1 px-2 sm:px-4 shadow-sm border-b border-base-900/60 shrink-0">
        {headerLeft}
        <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center justify-between flex-1 min-w-0 font-bold text-ink">
          <span className="truncate">{server.name}</span>
          <ChevronDown size={18} className="shrink-0" />
        </button>
        {menuOpen && (
          <div className="absolute top-12 left-2 right-2 bg-base-750 border border-base-600 rounded-lg shadow-panel py-1.5 z-20 animate-fade-in">
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
                onClick={() => onSelectChannel(ch.id)}
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
                onClick={() => onSelectChannel(ch.id)}
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
      className={`flex items-center gap-1.5 px-2 py-2 sm:py-1.5 rounded-lg text-sm font-medium transition-colors ${
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
