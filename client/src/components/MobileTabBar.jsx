import { MessageCircle, Hexagon, Compass, Plus } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";
import { useAuthStore } from "../store/authStore";

const LEFT_TABS = [
  { key: "dm", label: "Sohbetler", icon: MessageCircle },
  { key: "servers", label: "Sunucular", icon: Hexagon },
];
const RIGHT_TABS = [{ key: "discover", label: "Kesfet", icon: Compass }];

export default function MobileTabBar({ active, onChange, onCreate }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="md:hidden px-4 pb-[calc(env(safe-area-inset-bottom)+10px)] pt-1 shrink-0">
      <div className="relative flex items-center justify-around h-[62px] bg-base-800 border border-base-600 rounded-full shadow-panel px-1.5">
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
          className="absolute left-1/2 -translate-x-1/2 -top-6 w-14 h-14 rounded-full bg-amber text-base-900 shadow-panel ring-4 ring-base-900 flex items-center justify-center active:bg-amber-hover active:scale-95 transition-all"
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
        active ? "text-amber bg-amber/10" : "text-gray-500"
      }`}
    >
      {icon || (Icon && <Icon size={19} />)}
      <span className="text-[9.5px] font-semibold">{tab.label}</span>
    </button>
  );
}
