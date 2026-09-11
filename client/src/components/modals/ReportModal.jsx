import { useState } from "react";
import Modal from "./Modal.jsx";
import Select from "../Select.jsx";

const REASONS = ["Taciz veya zorbalik", "Spam", "Uygunsuz icerik", "Yasa disi icerik", "Diger"];

export default function ReportModal({ onClose, onSubmit }) {
  const [reason, setReason] = useState(REASONS[0]);
  const [detail, setDetail] = useState("");
  const [loading, setLoading] = useState(false);

  async function submit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      await onSubmit(detail.trim() ? `${reason}: ${detail.trim()}` : reason);
    } finally {
      setLoading(false);
    }
  }

  return (
    <Modal title="Mesaji Rapor Et" onClose={onClose}>
      <p className="text-sm text-gray-400 mb-4">Rapor sunucu yoneticilerine iletilir ve incelenir.</p>
      <form onSubmit={submit} className="flex flex-col gap-4">
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Neden</span>
          <Select value={reason} onChange={(e) => setReason(e.target.value)}>
            {REASONS.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </Select>
        </label>
        <label className="flex flex-col gap-1.5">
          <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Detay (opsiyonel)</span>
          <input value={detail} onChange={(e) => setDetail(e.target.value)} className="input" maxLength={200} />
        </label>
        <button disabled={loading} className="btn-primary w-full">
          {loading ? "Gonderiliyor..." : "Raporu Gonder"}
        </button>
      </form>
    </Modal>
  );
}
