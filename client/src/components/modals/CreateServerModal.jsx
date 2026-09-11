import { useState } from "react";
import Modal from "./Modal.jsx";

export default function CreateServerModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(name.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Sunucu olusturulamadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Sunucunu Olustur" onClose={onClose}>
      <p className="text-sm text-gray-400 mb-4">
        Sunucun; arkadaslarinla veya toplulugunla takilacagin bir yer. Kendininkini olustur ve konusmaya basla.
      </p>
      {error && <div className="mb-3 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Sunucu adi</span>
          <input
            autoFocus
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="input"
            placeholder="orn. Kod Kulubu"
          />
        </label>
        <button disabled={loading || !name.trim()} className="btn-primary w-full">
          {loading ? "Olusturuluyor..." : "Olustur"}
        </button>
      </form>
    </Modal>
  );
}
