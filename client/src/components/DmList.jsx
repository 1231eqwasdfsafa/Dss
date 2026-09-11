import { Plus } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";

export default function DmList({ dms, activeDmId, onSelectDm, onNewDm, presence, headerLeft }) {
  return (
    <>
      <div className="h-12 flex items-center gap-1 px-2 sm:px-4 shadow-sm border-b border-base-900/60 shrink-0">
        {headerLeft}
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
            onClick={() => onSelectDm(dm.id)}
            className={`w-full flex items-center gap-2.5 px-2 py-2 rounded-lg mb-0.5 group ${
              activeDmId === dm.id ? "bg-base-700 text-ink" : "text-gray-300 hover:bg-base-750 hover:text-gray-100"
            }`}
          >
            <Avatar
              username={dm.user?.username}
              color={dm.user?.avatarColor}
              url={dm.user?.avatarUrl}
              status={presence[dm.user?.id] || dm.user?.status}
              size={36}
            />
            <span className="text-sm font-medium truncate">{dm.user?.username || "Bilinmeyen"}</span>
          </button>
        ))}
        {dms.length === 0 && <p className="text-sm text-gray-500 px-2 py-4">Henuz direkt mesajin yok.</p>}
      </div>
    </>
  );
}
