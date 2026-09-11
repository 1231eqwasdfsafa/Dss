import { useState } from "react";
import Modal from "./Modal.jsx";
import Select from "../Select.jsx";

const CATEGORIES = ["Sohbet", "Oyun", "Sanat", "Muzik", "Teknoloji", "Egitim", "Diger"];

export default function CreateServerModal({ onClose, onCreate }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState(CATEGORIES[0]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(name.trim(), { description: description.trim(), category });
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
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Kategori</span>
          <Select value={category} onChange={(e) => setCategory(e.target.value)}>
            {CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Kisa aciklama (opsiyonel)</span>
          <input
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="input"
            placeholder="Kesif sayfasinda gorunecek kisa tanitim"
            maxLength={140}
          />
        </label>
        <p className="text-xs text-gray-500 -mt-1">Sunucun varsayilan olarak Kesfet sayfasinda listelenir.</p>
        <button disabled={loading || !name.trim()} className="btn-primary w-full">
          {loading ? "Olusturuluyor..." : "Olustur"}
        </button>
      </form>
    </Modal>
  );
}
