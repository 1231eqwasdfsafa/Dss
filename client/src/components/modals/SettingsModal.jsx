import { useState } from "react";
import Modal from "./Modal.jsx";
import Avatar from "../Avatar.jsx";
import { useAuthStore } from "../../store/authStore";

const COLORS = ["#5865F2", "#EB459E", "#57F287", "#FEE75C", "#ED4245", "#00C2FF", "#9B59B6", "#f97316"];

export default function SettingsModal({ onClose }) {
  const { user, updateProfile } = useAuthStore();
  const [customStatus, setCustomStatus] = useState(user?.customStatus || "");
  const [saving, setSaving] = useState(false);

  async function save() {
    setSaving(true);
    try {
      await updateProfile({ customStatus });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal title="Kullanici Ayarlari" onClose={onClose}>
      <div className="flex items-center gap-3 mb-5">
        <Avatar username={user.username} color={user.avatarColor} status={user.status} size={56} />
        <div>
          <div className="text-ink font-bold">{user.username}</div>
          <div className="text-gray-400 text-sm">#{user.discriminator}</div>
        </div>
      </div>

      <label className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Ozel durum</span>
        <input
          value={customStatus}
          onChange={(e) => setCustomStatus(e.target.value)}
          className="input"
          placeholder="Ne yapiyorsun?"
          maxLength={80}
        />
      </label>

      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 block mb-2">Avatar rengi</span>
        <div className="flex flex-wrap gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              onClick={() => updateProfile({ avatarColor: c })}
              className={`w-8 h-8 rounded-full border-2 ${user.avatarColor === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </Modal>
  );
}
