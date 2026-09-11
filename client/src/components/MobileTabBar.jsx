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
      <div className="relative flex items-center justify-around h-16 bg-base-800 border border-base-600 rounded-full shadow-panel px-2">
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
          icon={user && <Avatar username={user.username} color={user.avatarColor} size={20} showStatus={false} square />}
        />

        <button
          onClick={onCreate}
          title="Hub"
          className="absolute left-1/2 -translate-x-1/2 -top-5 w-12 h-12 rounded-full bg-amber text-base-900 shadow-panel flex items-center justify-center hover:bg-amber-hover transition-colors"
        >
          <Plus size={22} strokeWidth={2.5} />
        </button>
      </div>
    </div>
  );
}

function TabBtn({ tab, active, onClick, icon }) {
  const Icon = tab.icon;
  return (
    <button onClick={onClick} className={`flex flex-col items-center justify-center gap-1 w-12 h-full ${active ? "text-amber" : "text-gray-500"}`}>
      {icon || (Icon && <Icon size={20} />)}
      <span className="text-[9.5px] font-medium">{tab.label}</span>
    </button>
  );
}
