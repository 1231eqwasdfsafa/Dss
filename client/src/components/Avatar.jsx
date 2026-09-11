import { useState } from "react";
import { resolveAsset } from "../lib/uploads";

const STATUS_COLOR = {
  ONLINE: "bg-online",
  IDLE: "bg-idle",
  DND: "bg-dnd",
  OFFLINE: "bg-gray-500",
};

// Tailwind's JIT scanner needs literal class names, not string interpolation,
// so the "rounded" override maps to one of these instead of building the
// class name dynamically.
const ROUNDED_CLASS = { full: "rounded-full", lg: "rounded-lg", "2xl": "rounded-2xl" };

export default function Avatar({ username, color, url, status, size = 40, showStatus = true, square = false, rounded }) {
  const [imgError, setImgError] = useState(false);
  const letter = username?.[0]?.toUpperCase() || "?";
  const shapeClass = rounded ? ROUNDED_CLASS[rounded] : square ? "rounded-lg" : "rounded-full";

  return (
    <div className="relative shrink-0" style={{ width: size, height: size }}>
      {url && !imgError ? (
        <img
          src={resolveAsset(url)}
          alt={username}
          onError={() => setImgError(true)}
          className={`object-cover ${shapeClass}`}
          style={{ width: size, height: size }}
        />
      ) : (
        <div
          className={`flex items-center justify-center font-bold text-ink select-none ${shapeClass}`}
          style={{ width: size, height: size, backgroundColor: color || "#5865F2", fontSize: size * 0.42 }}
        >
          {letter}
        </div>
      )}
      {showStatus && status && (
        <span
          className={`absolute -bottom-0.5 -right-0.5 rounded-full border-2 border-base-900 ${STATUS_COLOR[status] || "bg-gray-500"}`}
          style={{ width: size * 0.34, height: size * 0.34 }}
        />
      )}
    </div>
  );
}
