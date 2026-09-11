import { useState } from "react";
import Modal from "./Modal.jsx";
import { Hash, Volume2 } from "../Icons.jsx";

export default function CreateChannelModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [type, setType] = useState("TEXT");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(name.trim(), type);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Kanal olusturulamadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Kanal Olustur" onClose={onClose}>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Kanal Turu</span>
          <TypeOption icon={<Hash size={20} />} label="Metin" desc="Mesaj, resim ve link gonder" active={type === "TEXT"} onClick={() => setType("TEXT")} />
          <TypeOption icon={<Volume2 size={20} />} label="Ses" desc="Sesli sohbet icin" active={type === "VOICE"} onClick={() => setType("VOICE")} />
        </div>
        {error && <div className="text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Kanal adi</span>
          <input autoFocus value={name} onChange={(e) => setName(e.target.value)} className="input" placeholder="yeni-kanal" />
        </label>
        <button disabled={loading || !name.trim()} className="btn-primary w-full">
          {loading ? "Olusturuluyor..." : "Kanal Olustur"}
        </button>
      </form>
    </Modal>
  );
}

function TypeOption({ icon, label, desc, active, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left ${
        active ? "border-accent bg-accent/10" : "border-base-600 hover:bg-base-750"
      }`}
    >
      <span className="text-gray-300">{icon}</span>
      <div>
        <div className="text-sm font-semibold text-white">{label}</div>
        <div className="text-xs text-gray-400">{desc}</div>
      </div>
    </button>
  );
}
