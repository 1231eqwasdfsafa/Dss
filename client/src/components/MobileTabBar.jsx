import { MessageCircle, Hexagon, Compass, Plus } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";
import { useAuthStore } from "../store/authStore";

// NOTE: this bar intentionally keeps its original look (hardcoded hex
// instead of the shared base/amber theme tokens) while the rest of the app
// was redesigned around a new palette — it was explicitly excluded from
// the redesign, so its colors are pinned here instead of following the
// tokens everything else now uses.

const LEFT_TABS = [
  { key: "dm", label: "Sohbetler", icon: MessageCircle },
  { key: "servers", label: "Sunucular", icon: Hexagon },
];
const RIGHT_TABS = [{ key: "discover", label: "Kesfet", icon: Compass }];

export default function MobileTabBar({ active, onChange, onCreate }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="md:hidden px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-1 shrink-0">
      <div className="relative flex items-center justify-around h-[62px] bg-[#231C15] border border-[#3F3125] rounded-full shadow-[0_8px_28px_rgba(0,0,0,0.45)] px-1.5">
        {LEFT_TABS.map((tab) => (
          <TabBtn key={tab.key} tab={tab} active={active === tab.key} onClick={() => onChange(tab.key)} />
        ))}

        <div className="w-14 shrink-0" />

        {RIGHT_TABS.map((tab) => (
          <TabBtn key={tab.key} tab={tab} active={active === tab.key} onClick={() => onChange(tab.key)} />
        ))}

        <TabBtn
          tab={{ key: "account", label: "Hesabim" }}
          active={active === "account"}
          onClick={() => onChange("account")}
          icon={user && <Avatar username={user.username} color={user.avatarColor} url={user.avatarUrl} size={19} showStatus={false} square />}
        />

        <button
          onClick={onCreate}
          title="Hub"
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-[#D98A4C] text-[#18130F] shadow-[0_8px_28px_rgba(0,0,0,0.45)] ring-4 ring-[#18130F] flex items-center justify-center active:bg-[#E6A268] active:scale-95 transition-all"
        >
          <Plus size={24} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function TabBtn({ tab, active, onClick, icon }) {
  const Icon = tab.icon;
  return (
    <button
      onClick={onClick}
      className={`relative flex flex-col items-center justify-center gap-0.5 w-14 h-11 rounded-2xl transition-colors ${
        active ? "text-[#D98A4C] bg-[#D98A4C]/10" : "text-gray-500"
      }`}
    >
      {icon || (Icon && <Icon size={19} />)}
      <span className="text-[9.5px] font-semibold">{tab.label}</span>
    </button>
  );
}
