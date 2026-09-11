import Modal from "./Modal.jsx";
import { BarChart, Flag, Users, Volume2 } from "../Icons.jsx";

const COMING_SOON = [
  { icon: Flag, name: "Moderasyon Botu", desc: "Otomatik kural uygulama ve spam filtresi" },
  { icon: Users, name: "Karsilama Botu", desc: "Yeni uyelere ozel karsilama karti gonderir" },
  { icon: Volume2, name: "Muzik Botu", desc: "Ses kanallarinda birlikte muzik dinleme" },
];

export default function AppMarketModal({ onClose }) {
  return (
    <Modal title="App Market" onClose={onClose} width="max-w-lg">
      <p className="text-sm text-gray-400 mb-4">
        Nexus'un resmi botlari; duz metin degil, gercek buton ve canli kartlarla calisir.
      </p>

      <div className="bg-base-900 border border-amber/30 rounded-2xl p-4 mb-5">
        <div className="flex items-start gap-3">
          <span className="w-11 h-11 rounded-xl bg-amber text-base-900 flex items-center justify-center shrink-0">
            <BarChart size={22} />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-0.5">
              <span className="font-bold text-ink text-sm">Nexus Anket Botu</span>
              <span className="text-[10px] font-bold text-base-900 bg-amber rounded px-1.5 py-[1px]">RESMI</span>
            </div>
            <p className="text-xs text-gray-400 mb-2">
              Herhangi bir metin kanalinda canli oy sayimli anket olusturur. Mesaj kutusundaki "+" menusunden erisilir.
            </p>
            <span className="text-xs font-semibold text-amber">Her kanalda hazir - kurulum gerekmez</span>
          </div>
        </div>
      </div>

      <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-2">Yakinda</div>
      <div className="flex flex-col gap-2">
        {COMING_SOON.map((bot) => (
          <div key={bot.name} className="flex items-center gap-3 p-3 rounded-xl border border-base-600 opacity-50">
            <span className="w-10 h-10 rounded-lg bg-base-700 text-gray-400 flex items-center justify-center shrink-0">
              <bot.icon size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <div className="font-semibold text-ink text-sm">{bot.name}</div>
              <div className="text-xs text-gray-500 truncate">{bot.desc}</div>
            </div>
            <span className="text-[10px] font-bold text-gray-400 bg-base-700 rounded px-1.5 py-[2px] shrink-0">YAKINDA</span>
          </div>
        ))}
      </div>
    </Modal>
  );
}
