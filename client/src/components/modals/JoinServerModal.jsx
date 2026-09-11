import { useState } from "react";
import Modal from "./Modal.jsx";

export default function JoinServerModal({ onClose, onJoin }) {
  const [code, setCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!code.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onJoin(code.trim());
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Katilma basarisiz");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Bir Sunucuya Katil" onClose={onClose}>
      <p className="text-sm text-gray-400 mb-4">Davet kodunu asagiya girerek mevcut bir sunucuya katilabilirsin.</p>
      {error && <div className="mb-3 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Davet kodu</span>
          <input autoFocus value={code} onChange={(e) => setCode(e.target.value)} className="input" placeholder="orn. a1b2c3d4e5" />
        </label>
        <button disabled={loading || !code.trim()} className="btn-primary w-full">
          {loading ? "Katiliniyor..." : "Katil"}
        </button>
      </form>
    </Modal>
  );
}
