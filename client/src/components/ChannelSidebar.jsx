import { useState } from "react";
import { Hash, Volume2, ChevronDown, Plus, UserPlus, Trash, LogOut } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";
import UserPanel from "./UserPanel.jsx";

export default function ChannelSidebar({
  view,
  server,
  activeChannelId,
  onSelectChannel,
  onOpenSettings,
  onCreateChannel,
  onOpenInvite,
  onLeaveOrDelete,
  currentUserId,
  dms,
  activeDmId,
  onSelectDm,
  onNewDm,
  presence,
}) {
  const [menuOpen, setMenuOpen] = useState(false);

  if (view === "dm") {
    return (
      <div className="w-60 bg-base-800 flex flex-col shrink-0">
        <div className="h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
          <span className="font-bold text-white">Direkt Mesajlar</span>
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
              onClick={() => onSelectDm(dm.id)}
              className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 group ${
                activeDmId === dm.id ? "bg-base-700 text-white" : "text-gray-300 hover:bg-base-750 hover:text-gray-100"
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
        <UserPanel onOpenSettings={onOpenSettings} />
      </div>
    );
  }

  if (!server) {
    return <div className="w-60 bg-base-800 shrink-0" />;
  }

  const textChannels = server.channels.filter((c) => c.type === "TEXT");
  const voiceChannels = server.channels.filter((c) => c.type === "VOICE");
  const isOwner = server.myRole === "OWNER";
  const canManage = server.myRole === "OWNER" || server.myRole === "ADMIN";

  return (
    <div className="w-60 bg-base-800 flex flex-col shrink-0">
      <div className="relative h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
        <button onClick={() => setMenuOpen((v) => !v)} className="flex items-center justify-between w-full font-bold text-white">
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
                icon={<Hash size={18} />}
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
              <ChannelItem key={ch.id} icon={<Volume2 size={18} />} active={activeChannelId === ch.id} onClick={() => onSelectChannel(ch.id)}>
                {ch.name}
              </ChannelItem>
            ))}
          </ChannelGroup>
        )}
      </div>

      <UserPanel onOpenSettings={onOpenSettings} />
    </div>
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
        active ? "bg-base-700 text-white" : "text-gray-400 hover:bg-base-750 hover:text-gray-200"
      }`}
    >
      <span className="text-gray-500">{icon}</span>
      <span className="truncate">{children}</span>
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
