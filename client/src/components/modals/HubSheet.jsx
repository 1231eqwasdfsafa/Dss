import { Grid, Megaphone, Plus, UserPlus, ChevronRight } from "../Icons.jsx";

export default function HubSheet({ onClose, onOpenAppMarket, onOpenDiscover, onCreateServer, onJoinServer }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center animate-fade-in" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="absolute inset-0 bg-black/60" />
      <div className="relative w-full max-w-md bg-base-800 border border-base-600 rounded-t-3xl shadow-panel pb-[calc(env(safe-area-inset-bottom)+20px)] pt-2.5">
        <div className="w-9 h-1 rounded-full bg-base-600 mx-auto mb-4" />
        <h2 className="text-lg font-bold text-ink px-5 mb-4">Nexus Hub</h2>

        <div className="grid grid-cols-2 gap-3 px-5 mb-5">
          <HubCard
            icon={<Grid size={22} />}
            label="App Market"
            desc="Resmi botlar"
            accent="amber"
            onClick={onOpenAppMarket}
          />
          <HubCard
            icon={<Megaphone size={22} />}
            label="Sunucu Tanitimi"
            desc="Kesfette one cik"
            accent="teal"
            onClick={onOpenDiscover}
          />
        </div>

        <div className="px-5 flex flex-col gap-1 border-t border-base-700 pt-3">
          <QuickRow icon={<Plus size={17} />} label="Sunucu Olustur" onClick={onCreateServer} />
          <QuickRow icon={<UserPlus size={17} />} label="Davet Koduyla Katil" onClick={onJoinServer} />
        </div>
      </div>
    </div>
  );
}

function HubCard({ icon, label, desc, accent, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-start gap-2.5 p-4 rounded-2xl border text-left transition-colors ${
        accent === "amber" ? "border-amber/30 bg-amber/10 hover:bg-amber/15" : "border-teal/30 bg-teal/10 hover:bg-teal/15"
      }`}
    >
      <span className={`w-10 h-10 rounded-xl flex items-center justify-center ${accent === "amber" ? "bg-amber text-base-900" : "bg-teal text-base-900"}`}>
        {icon}
      </span>
      <div>
        <div className="font-semibold text-ink text-sm">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </button>
  );
}

function QuickRow({ icon, label, onClick }) {
  return (
    <button onClick={onClick} className="flex items-center gap-3 py-2.5 text-sm font-medium text-gray-200 hover:text-ink">
      <span className="text-gray-500">{icon}</span>
      <span className="flex-1 text-left">{label}</span>
      <ChevronRight size={16} className="text-gray-600" />
    </button>
  );
}
