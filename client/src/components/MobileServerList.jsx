import { Plus, UserPlus } from "./Icons.jsx";

export default function MobileServerList({ servers, onSelect, onCreate, onJoin }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
        <span className="font-bold text-ink">Sunucularim</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-1">
        {servers.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-3 px-2 py-2.5 rounded-xl hover:bg-base-800 text-left"
          >
            <div className="w-11 h-11 rounded-lg bg-base-700 flex items-center justify-center font-bold text-ink text-sm shrink-0">
              {initials(s.name)}
            </div>
            <div className="min-w-0">
              <div className="font-semibold text-ink text-sm truncate">{s.name}</div>
              <div className="text-xs text-gray-500 truncate">{s.channels?.length || 0} kanal</div>
            </div>
          </button>
        ))}
        {servers.length === 0 && <p className="text-sm text-gray-500 px-2 py-4">Henuz bir sunucun yok.</p>}

        <div className="border-t border-base-700 mt-2 pt-3 flex flex-col gap-1">
          <button onClick={onCreate} className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-base-800 text-teal text-sm font-medium">
            <Plus size={18} /> Sunucu Olustur
          </button>
          <button onClick={onJoin} className="flex items-center gap-2.5 px-2 py-2.5 rounded-xl hover:bg-base-800 text-teal text-sm font-medium">
            <UserPlus size={18} /> Davet Koduyla Katil
          </button>
        </div>
      </div>
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
