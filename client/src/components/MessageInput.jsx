import { useRef, useState } from "react";
import { Plus, Send, Smile, BarChart } from "./Icons.jsx";

export default function MessageInput({ placeholder, onSend, onTypingStart, onTypingStop, onOpenPoll }) {
  const [value, setValue] = useState("");
  const [showMenu, setShowMenu] = useState(false);
  const typingRef = useRef(false);
  const timeoutRef = useRef(null);

  function handleChange(e) {
    setValue(e.target.value);
    if (!typingRef.current) {
      typingRef.current = true;
      onTypingStart?.();
    }
    clearTimeout(timeoutRef.current);
    timeoutRef.current = setTimeout(() => {
      typingRef.current = false;
      onTypingStop?.();
    }, 2000);
  }

  function handleSubmit(e) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed) return;
    onSend(trimmed);
    setValue("");
    typingRef.current = false;
    clearTimeout(timeoutRef.current);
    onTypingStop?.();
  }

  return (
    <form onSubmit={handleSubmit} className="px-4 pb-6 pt-1 shrink-0">
      <div className="flex items-center gap-2 bg-base-700 rounded-xl px-3 py-2.5 relative">
        {onOpenPoll && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              className="text-gray-400 hover:text-ink"
              title="Ekle"
            >
              <Plus size={22} className={`transition-transform ${showMenu ? "rotate-45" : ""}`} />
            </button>
            {showMenu && (
              <div className="absolute bottom-10 left-0 bg-base-750 border border-base-600 rounded-lg shadow-panel py-1.5 w-48 z-20 animate-fade-in">
                <button
                  type="button"
                  onClick={() => {
                    setShowMenu(false);
                    onOpenPoll();
                  }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-sm font-medium text-gray-200 hover:bg-base-700"
                >
                  <BarChart size={16} className="text-amber" />
                  Anket olustur
                </button>
              </div>
            )}
          </div>
        )}
        <input
          value={value}
          onChange={handleChange}
          placeholder={placeholder}
          className="flex-1 bg-transparent outline-none text-[15px] text-gray-100 placeholder:text-gray-500"
        />
        <button type="button" className="text-gray-400 hover:text-gray-200 shrink-0">
          <Smile size={22} />
        </button>
        <button type="submit" className="text-teal hover:text-ink shrink-0 disabled:opacity-40" disabled={!value.trim()}>
          <Send size={20} />
        </button>
      </div>
    </form>
  );
}
