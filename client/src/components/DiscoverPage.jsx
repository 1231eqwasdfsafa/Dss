import { useEffect, useState } from "react";
import { useAppStore } from "../store/appStore";
import { Search, Users } from "./Icons.jsx";
import { gradientFor } from "../lib/colors";

const CATEGORIES = ["Sohbet", "Oyun", "Sanat", "Muzik", "Teknoloji", "Egitim", "Diger"];

export default function DiscoverPage({ onJoined }) {
  const { discoverResults, fetchDiscover, joinServer } = useAppStore();
  const [q, setQ] = useState("");
  const [category, setCategory] = useState(null);
  const [joiningId, setJoiningId] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    fetchDiscover({ q, category });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [category]);

  function handleSearchSubmit(e) {
    e.preventDefault();
    fetchDiscover({ q, category });
  }

  async function handleJoin(server) {
    setError("");
    setJoiningId(server.id);
    try {
      const joined = await joinServer(server.inviteCode);
      onJoined?.(joined);
    } catch (err) {
      setError(err.response?.data?.error || "Katilma basarisiz");
    } finally {
      setJoiningId(null);
    }
  }

  const [featured, ...rest] = discoverResults;

  return (
    <div className="flex-1 overflow-y-auto bg-base-750">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8">
        <h1 className="text-2xl font-bold text-ink mb-1">Kesfet</h1>
        <p className="text-sm text-gray-400 mb-6">Katilabilecegin acik sunuculara goz at.</p>

        <form onSubmit={handleSearchSubmit} className="flex items-center gap-2 bg-base-800 rounded-lg px-3 py-2.5 mb-4">
          <Search size={18} className="text-gray-500 shrink-0" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Sunucu ara..."
            className="flex-1 bg-transparent outline-none text-sm text-ink placeholder:text-gray-500"
          />
        </form>

        <div className="flex flex-wrap gap-2 mb-8">
          <CategoryChip active={category === null} onClick={() => setCategory(null)}>
            Tumu
          </CategoryChip>
          {CATEGORIES.map((c) => (
            <CategoryChip key={c} active={category === c} onClick={() => setCategory(c)}>
              {c}
            </CategoryChip>
          ))}
        </div>

        {error && <div className="mb-4 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}

        {discoverResults.length === 0 && (
          <p className="text-sm text-gray-500 py-8 text-center">Bu kriterlere uyan sunucu bulunamadi.</p>
        )}

        {featured && (
          <button
            onClick={() => handleJoin(featured)}
            disabled={joiningId === featured.id}
            className="w-full text-left rounded-2xl overflow-hidden mb-6 border border-base-600 group relative"
            style={{ background: gradientFor(featured.name) }}
          >
            <div className="p-6 sm:p-8 flex flex-col gap-3 min-h-[160px] justify-end">
              {featured.category && (
                <span className="text-xs font-semibold text-gray-300 self-start bg-black/30 rounded-full px-2.5 py-1">
                  {featured.category}
                </span>
              )}
              <h2 className="text-xl sm:text-2xl font-bold text-ink">{featured.name}</h2>
              {featured.description && <p className="text-sm text-gray-300 max-w-lg">{featured.description}</p>}
              <div className="flex items-center gap-4 mt-1">
                <span className="flex items-center gap-1.5 text-xs text-gray-300 mono">
                  <Users size={14} /> {featured.memberCount} uye
                </span>
                <span className="btn-primary !py-1.5 !px-4 text-xs">
                  {joiningId === featured.id ? "Katiliniyor..." : "Katil"}
                </span>
              </div>
            </div>
          </button>
        )}

        <div className="flex flex-col gap-1">
          {rest.map((s) => (
            <div
              key={s.id}
              className="flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-base-800 transition-colors"
            >
              <div
                className="w-11 h-11 rounded-xl shrink-0 flex items-center justify-center font-bold text-ink text-sm"
                style={{ background: gradientFor(s.name) }}
              >
                {s.name.slice(0, 2).toUpperCase()}
              </div>
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-semibold text-ink text-sm truncate">{s.name}</span>
                  {s.category && <span className="text-[11px] text-gray-500 shrink-0">{s.category}</span>}
                </div>
                {s.description && <p className="text-xs text-gray-500 truncate">{s.description}</p>}
              </div>
              <span className="text-xs text-gray-500 mono shrink-0 hidden sm:flex items-center gap-1">
                <Users size={12} /> {s.memberCount}
              </span>
              <button
                onClick={() => handleJoin(s)}
                disabled={joiningId === s.id}
                className="btn-secondary !py-1.5 !px-3 text-xs shrink-0"
              >
                {joiningId === s.id ? "..." : "Katil"}
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function CategoryChip({ children, active, onClick }) {
  return (
    <button
      onClick={onClick}
      className={`text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors ${
        active ? "bg-teal/15 border-teal text-teal" : "border-base-600 text-gray-400 hover:border-base-500"
      }`}
    >
      {children}
    </button>
  );
}
