import { useRef, useState } from "react";
import { Plus, Send, BarChart } from "./Icons.jsx";

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
      <div className="flex items-center gap-1.5 bg-base-700 rounded-xl pl-2 pr-2.5 py-2 relative">
        {onOpenPoll && (
          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setShowMenu((v) => !v)}
              title="Ekle"
              className="w-8 h-8 flex items-center justify-center rounded-lg text-gray-400 hover:bg-base-600 hover:text-ink transition-colors"
            >
              <Plus size={20} className={`transition-transform ${showMenu ? "rotate-45" : ""}`} />
            </button>
            {showMenu && (
              <div className="absolute bottom-11 left-0 bg-base-750 border border-base-600 rounded-lg shadow-panel py-1.5 w-48 z-20 animate-fade-in">
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
          className="flex-1 min-w-0 bg-transparent outline-none text-[15px] text-gray-100 placeholder:text-gray-500 px-1"
        />
        <button
          type="submit"
          disabled={!value.trim()}
          className="w-8 h-8 flex items-center justify-center rounded-lg shrink-0 text-teal enabled:hover:bg-base-600 hover:text-ink transition-colors disabled:opacity-40"
        >
          <Send size={18} />
        </button>
      </div>
    </form>
  );
}
