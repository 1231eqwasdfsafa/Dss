import { Plus, UserPlus, ChevronRight, Crown, Shield } from "./Icons.jsx";
import { gradientFor, initials } from "../lib/colors";

export default function MobileServerList({ servers, onSelect, onCreate, onJoin }) {
  return (
    <div className="flex-1 flex flex-col">
      <div className="h-12 flex items-center px-4 shadow-sm border-b border-base-900/60 shrink-0">
        <span className="font-bold text-ink">Sunucularim</span>
      </div>
      <div className="flex-1 overflow-y-auto p-3 flex flex-col gap-2">
        {servers.map((s) => (
          <button
            key={s.id}
            onClick={() => onSelect(s.id)}
            className="flex items-center gap-3 p-2.5 rounded-2xl bg-base-800 border border-base-700 hover:border-base-600 active:scale-[0.98] transition-all text-left"
          >
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center font-bold text-ink text-sm shrink-0"
              style={{ background: gradientFor(s.name) }}
            >
              {initials(s.name)}
            </div>
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-1.5">
                <span className="font-semibold text-ink text-sm truncate">{s.name}</span>
                {s.myRole === "OWNER" && <Crown size={12} className="text-idle shrink-0" />}
                {s.myRole === "ADMIN" && <Shield size={12} className="text-teal shrink-0" />}
              </div>
              <div className="text-xs text-gray-500 truncate">{s.channels?.length || 0} kanal</div>
            </div>
            <ChevronRight size={18} className="text-gray-600 shrink-0" />
          </button>
        ))}

        {servers.length === 0 && (
          <div className="flex-1 flex flex-col items-center justify-center text-center px-8 py-16">
            <div className="w-16 h-16 rounded-2xl bg-base-800 border border-base-700 flex items-center justify-center mb-4">
              <UserPlus size={26} className="text-gray-500" />
            </div>
            <p className="text-sm text-gray-500 mb-1">Henuz bir sunucun yok.</p>
            <p className="text-xs text-gray-600">Yeni bir sunucu kur ya da davet koduyla katil.</p>
          </div>
        )}

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
