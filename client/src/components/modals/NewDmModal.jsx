import { useRef, useState } from "react";
import Modal from "./Modal.jsx";
import { api } from "../../lib/api";
import Avatar from "../Avatar.jsx";

export default function NewDmModal({ onClose, onStart }) {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [error, setError] = useState("");
  const debounceRef = useRef(null);

  function handleChange(e) {
    const value = e.target.value;
    setQuery(value);
    clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(async () => {
      if (!value.trim()) return setResults([]);
      const { data } = await api.get(`/users/search?q=${encodeURIComponent(value.trim())}`);
      setResults(data.users);
    }, 250);
  }

  async function handleStart(user) {
    setError("");
    try {
      await onStart({ userId: user.id });
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Mesaj baslatilamadi");
    }
  }

  return (
    <Modal title="Direkt Mesaj Baslat" onClose={onClose}>
      <input autoFocus value={query} onChange={handleChange} className="input w-full" placeholder="Kullanici adi ile ara" />
      {error && <div className="mt-3 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}
      <div className="mt-3 flex flex-col gap-1 max-h-64 overflow-y-auto">
        {results.map((u) => (
          <button
            key={u.id}
            onClick={() => handleStart(u)}
            className="flex items-center gap-2.5 px-2 py-2 rounded-lg hover:bg-base-750 text-left"
          >
            <Avatar username={u.username} color={u.avatarColor} status={u.status} size={32} />
            <span className="text-sm font-medium text-gray-200">
              {u.username}
              <span className="text-gray-500">#{u.discriminator}</span>
            </span>
          </button>
        ))}
        {query.trim() && results.length === 0 && <div className="text-sm text-gray-500 px-2 py-2">Kullanici bulunamadi</div>}
      </div>
    </Modal>
  );
}
