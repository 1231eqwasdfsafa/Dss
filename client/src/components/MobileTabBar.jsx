import { MessageCircle, Hexagon, Compass } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";
import { useAuthStore } from "../store/authStore";

const TABS = [
  { key: "dm", label: "Sohbetler", icon: MessageCircle },
  { key: "servers", label: "Sunucular", icon: Hexagon },
  { key: "discover", label: "Kesfet", icon: Compass },
];

export default function MobileTabBar({ active, onChange }) {
  const user = useAuthStore((s) => s.user);

  return (
    <div className="md:hidden flex items-center justify-around h-16 bg-base-900 border-t border-base-700 shrink-0 pb-[env(safe-area-inset-bottom)]">
      {TABS.map((tab) => {
        const Icon = tab.icon;
        const isActive = active === tab.key;
        return (
          <button
            key={tab.key}
            onClick={() => onChange(tab.key)}
            className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${isActive ? "text-teal" : "text-gray-500"}`}
          >
            <Icon size={21} />
            <span className="text-[10px] font-medium">{tab.label}</span>
          </button>
        );
      })}
      <button
        onClick={() => onChange("account")}
        className={`flex flex-col items-center justify-center gap-1 flex-1 h-full ${active === "account" ? "text-teal" : "text-gray-500"}`}
      >
        {user && <Avatar username={user.username} color={user.avatarColor} size={21} showStatus={false} square />}
        <span className="text-[10px] font-medium">Hesabim</span>
      </button>
    </div>
  );
}
