import { useState } from "react";
import Modal from "./Modal.jsx";
import { X, Plus, BarChart } from "../Icons.jsx";

export default function CreatePollModal({ onClose, onCreate }) {
  const [question, setQuestion] = useState("");
  const [options, setOptions] = useState(["", ""]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function updateOption(i, value) {
    setOptions((opts) => opts.map((o, idx) => (idx === i ? value : o)));
  }

  function addOption() {
    if (options.length >= 6) return;
    setOptions((opts) => [...opts, ""]);
  }

  function removeOption(i) {
    if (options.length <= 2) return;
    setOptions((opts) => opts.filter((_, idx) => idx !== i));
  }

  async function submit(e) {
    e.preventDefault();
    const cleanOptions = options.map((o) => o.trim()).filter(Boolean);
    if (!question.trim() || cleanOptions.length < 2) return;
    setLoading(true);
    setError("");
    try {
      await onCreate(question.trim(), cleanOptions);
      onClose();
    } catch (err) {
      setError(err.response?.data?.error || "Anket olusturulamadi");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Anket Olustur" onClose={onClose}>
      <p className="text-sm text-gray-400 mb-4 flex items-center gap-2">
        <BarChart size={16} className="text-amber shrink-0" />
        Nexus Anket Botu bu anketi kanala gonderecek; herkes canli olarak oy verebilecek.
      </p>
      {error && <div className="mb-3 text-sm bg-dnd/10 text-dnd border border-dnd/30 rounded-lg px-3 py-2">{error}</div>}
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Soru</span>
          <input
            autoFocus
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            className="input"
            placeholder="orn. Bu hafta hangi oyunu oynayalim?"
            maxLength={140}
          />
        </label>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Secenekler</span>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                value={opt}
                onChange={(e) => updateOption(i, e.target.value)}
                className="input flex-1"
                placeholder={`Secenek ${i + 1}`}
                maxLength={80}
              />
              {options.length > 2 && (
                <button type="button" onClick={() => removeOption(i)} className="text-gray-500 hover:text-dnd shrink-0">
                  <X size={16} />
                </button>
              )}
            </div>
          ))}
          {options.length < 6 && (
            <button
              type="button"
              onClick={addOption}
              className="flex items-center gap-1.5 text-sm text-teal hover:underline self-start"
            >
              <Plus size={14} /> Secenek ekle
            </button>
          )}
        </div>

        <button
          disabled={loading || !question.trim() || options.filter((o) => o.trim()).length < 2}
          className="btn-primary w-full"
        >
          {loading ? "Olusturuluyor..." : "Anketi Gonder"}
        </button>
      </form>
    </Modal>
  );
}
