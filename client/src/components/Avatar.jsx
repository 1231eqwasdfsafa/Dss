const STATUS_COLOR = {
  ONLINE: "bg-online",
  IDLE: "bg-idle",
  DND: "bg-dnd",
  OFFLINE: "bg-gray-500",
};

export default function Avatar({ username, color, status, size = 40, showStatus = true, square = false }) {
  const letter = username?.[0]?.toUpperCase() || "?";
  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      <div
        className={`flex items-center justify-center font-bold text-ink select-none ${square ? "rounded-lg" : "rounded-full"}`}
        style={{ width: size, height: size, backgroundColor: color || "#5865F2", fontSize: size * 0.42 }}
      >
        {letter}
      </div>
      {showStatus && status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-base-900 ${STATUS_COLOR[status] || "bg-gray-500"}`}
          style={{ width: size * 0.34, height: size * 0.34 }}
        />
      )}
    </div>
  );
}
