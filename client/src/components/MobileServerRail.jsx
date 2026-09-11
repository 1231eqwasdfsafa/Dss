import { Plus, UserPlus } from "./Icons.jsx";
import { gradientFor, initials } from "../lib/colors";

// Persistent server-switcher rail for mobile, next to the channel list —
// tapping a server swaps the panel beside it in place instead of pushing a
// new full-screen page (matches the instant-switch feel of Discord's rail).
export default function MobileServerRail({ servers, activeServerId, onSelectServer, onCreate, onJoin }) {
  return (
    <div className="w-[68px] shrink-0 border-r border-base-800 flex flex-col items-center py-3 gap-2 overflow-y-auto scrollbar-none">
      {servers.map((s) => {
        const active = s.id === activeServerId;
        return (
          <button key={s.id} onClick={() => onSelectServer(s.id)} title={s.name} className="relative flex items-center justify-center w-full shrink-0">
            <span className={`absolute left-0 bg-teal rounded-r-full transition-all duration-200 ${active ? "h-8 w-1" : "h-2 w-1 opacity-0"}`} />
            <span
              className={`w-12 h-12 flex items-center justify-center font-bold text-sm text-ink shrink-0 transition-all duration-200 ${
                active ? "rounded-2xl" : "rounded-full"
              }`}
              style={{ background: gradientFor(s.name) }}
            >
              {initials(s.name)}
            </span>
          </button>
        );
      })}

      <button
        onClick={onCreate}
        title="Sunucu Olustur"
        className="w-12 h-12 rounded-full flex items-center justify-center text-teal bg-base-800 active:bg-base-700 active:rounded-2xl transition-all duration-200 shrink-0"
      >
        <Plus size={20} />
      </button>
      <button
        onClick={onJoin}
        title="Davet Koduyla Katil"
        className="w-12 h-12 rounded-full flex items-center justify-center text-gray-400 bg-base-800 active:bg-base-700 active:rounded-2xl transition-all duration-200 shrink-0"
      >
        <UserPlus size={18} />
      </button>
    </div>
  );
}
