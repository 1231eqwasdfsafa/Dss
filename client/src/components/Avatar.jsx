const STATUS_COLOR = {
  ONLINE: "bg-online",
  IDLE: "bg-idle",
  DND: "bg-dnd",
  OFFLINE: "bg-gray-500",
};

export default function Avatar({ username, color, status, size = 40, showStatus = true }) {
  const letter = username?.[0]?.toUpperCase() || "?";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className="rounded-full flex items-center justify-center font-bold text-white select-none"
        style={{ width: size, height: size, backgroundColor: color || "#5865F2", fontSize: size * 0.42 }}
      >
        {letter}
      </div>
      {showStatus && status && (
        <span
          className={`absolute bottom-0 right-0 rounded-full border-2 border-base-800 ${STATUS_COLOR[status] || "bg-gray-500"}`}
          style={{ width: size * 0.32, height: size * 0.32 }}
        />
      )}
    </div>
  );
}
