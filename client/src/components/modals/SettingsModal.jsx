import { useRef, useState } from "react";
import Modal from "./Modal.jsx";
import Avatar from "../Avatar.jsx";
import { Camera, Music } from "../Icons.jsx";
import { useAuthStore } from "../../store/authStore";
import { useAppStore } from "../../store/appStore";
import { api } from "../../lib/api";
import { resolveAsset, uploadFile } from "../../lib/uploads";
import { getSocket } from "../../lib/socket";
import { DEMO_MODE } from "../../lib/demo";

const AVATAR_COLORS = ["#5865F2", "#EB459E", "#57F287", "#FEE75C", "#ED4245", "#00C2FF", "#9B59B6", "#f97316"];
const BANNER_COLORS = ["#4C3B2C", "#33281D", "#3F3125", "#2A2118", "#548F65", "#B36F3A", "#5865F2", "#9B59B6"];

function formatMmSs(totalSec) {
  const s = Math.max(0, Math.floor(totalSec));
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, "0")}`;
}

// Accepts "3:32" or a plain seconds count; returns seconds, or null if unparseable.
function parseMmSs(value) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  if (trimmed.includes(":")) {
    const [m, s] = trimmed.split(":").map(Number);
    if (Number.isFinite(m) && Number.isFinite(s)) return m * 60 + s;
    return null;
  }
  const n = Number(trimmed);
  return Number.isFinite(n) ? n : null;
}

function readAsDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

export default function SettingsModal({ onClose }) {
  const { user, updateProfile } = useAuthStore();
  const activity = useAppStore((s) => s.activity[user.id]);

  const [customStatus, setCustomStatus] = useState(user?.customStatus || "");
  const [avatarColor, setAvatarColor] = useState(user?.avatarColor);
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [bannerColor, setBannerColor] = useState(user?.bannerColor || BANNER_COLORS[0]);
  const [bannerUrl, setBannerUrl] = useState(user?.bannerUrl || "");
  const [bio, setBio] = useState(user?.bio || "");
  const [pronouns, setPronouns] = useState(user?.pronouns || "");
  const [youtubeUrl, setYoutubeUrl] = useState(user?.youtubeUrl || "");
  const [spotifyUrl, setSpotifyUrl] = useState(user?.spotifyUrl || "");

  const [track, setTrack] = useState(activity?.track || "");
  const [artist, setArtist] = useState(activity?.artist || "");
  const [albumArt, setAlbumArt] = useState(activity?.albumArt || "");
  const [trackUrl, setTrackUrl] = useState(activity?.trackUrl || "");
  const [duration, setDuration] = useState(activity?.duration ? formatMmSs(activity.duration) : "");

  const [uploading, setUploading] = useState(null); // 'avatar' | 'banner' | null
  const [saving, setSaving] = useState(false);
  const avatarInputRef = useRef(null);
  const bannerInputRef = useRef(null);

  async function handleFile(file, kind) {
    setUploading(kind);
    try {
      const url = DEMO_MODE ? await readAsDataUrl(file) : await uploadFile(api, file);
      if (kind === "avatar") setAvatarUrl(url);
      else setBannerUrl(url);
    } catch {
      // upload failed silently — user can retry
    } finally {
      setUploading(null);
    }
  }

  async function save() {
    setSaving(true);
    try {
      await updateProfile({
        customStatus,
        avatarColor,
        avatarUrl,
        bannerColor,
        bannerUrl,
        bio,
        pronouns,
        youtubeUrl,
        spotifyUrl,
      });
      onClose();
    } finally {
      setSaving(false);
    }
  }

  function publishActivity() {
    if (!track.trim() || !artist.trim()) return;
    getSocket()?.emit("activity:start", { track, artist, albumArt, trackUrl, duration: parseMmSs(duration) });
  }

  function stopActivity() {
    setTrack("");
    setArtist("");
    setDuration("");
    setAlbumArt("");
    setTrackUrl("");
    getSocket()?.emit("activity:stop");
  }

  return (
    <Modal title="Kullanici Ayarlari" onClose={onClose} width="max-w-lg">
      <div className="relative mb-12">
        <div className="h-20 rounded-xl overflow-hidden" style={{ backgroundColor: bannerColor }}>
          {bannerUrl && <img src={resolveAsset(bannerUrl)} alt="" className="w-full h-full object-cover" />}
        </div>
        <button
          onClick={() => bannerInputRef.current?.click()}
          className="absolute top-2 right-2 icon-btn bg-black/40 hover:bg-black/60 text-white"
          title="Banner yukle"
        >
          <Camera size={16} />
        </button>
        <input ref={bannerInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], "banner")} />

        <div className="absolute -bottom-8 left-4">
          <div className="relative inline-block p-1 bg-base-800 rounded-2xl">
            <Avatar username={user.username} color={avatarColor} url={avatarUrl} size={64} rounded="2xl" />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="absolute inset-1 flex items-center justify-center bg-black/40 hover:bg-black/60 rounded-2xl text-white opacity-0 hover:opacity-100 transition-opacity"
              title="Avatar yukle"
            >
              <Camera size={18} />
            </button>
          </div>
          <input ref={avatarInputRef} type="file" accept="image/*" hidden onChange={(e) => e.target.files[0] && handleFile(e.target.files[0], "avatar")} />
        </div>
        {uploading && <div className="absolute -bottom-8 left-20 text-xs text-gray-400">Yukleniyor...</div>}
      </div>

      <div className="mb-5">
        <div className="text-ink font-bold">{user.username}</div>
        <div className="text-gray-400 text-sm mono">#{user.discriminator}</div>
      </div>

      <label className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Ozel durum</span>
        <input value={customStatus} onChange={(e) => setCustomStatus(e.target.value)} className="input" placeholder="Ne yapiyorsun?" maxLength={80} />
      </label>

      <label className="flex flex-col gap-1.5 mb-4">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Zamirler</span>
        <input value={pronouns} onChange={(e) => setPronouns(e.target.value)} className="input" placeholder="orn. o/onun" maxLength={40} />
      </label>

      <label className="flex flex-col gap-1.5 mb-5">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400">Hakkimda</span>
        <textarea
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          className="input resize-none h-20"
          placeholder="Kendinden bahset..."
          maxLength={190}
        />
      </label>

      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 block mb-2">Avatar rengi</span>
        <div className="flex flex-wrap gap-2">
          {AVATAR_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setAvatarColor(c)}
              className={`w-8 h-8 rounded-full border-2 ${avatarColor === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 block mb-2">Banner rengi</span>
        <div className="flex flex-wrap gap-2">
          {BANNER_COLORS.map((c) => (
            <button
              key={c}
              onClick={() => setBannerColor(c)}
              className={`w-8 h-8 rounded-lg border-2 ${bannerColor === c ? "border-white" : "border-transparent"}`}
              style={{ backgroundColor: c }}
            />
          ))}
        </div>
      </div>

      <div className="mb-5">
        <span className="text-xs font-bold uppercase tracking-wide text-gray-400 block mb-2">Baglantilar</span>
        <div className="flex flex-col gap-2.5">
          <input value={youtubeUrl} onChange={(e) => setYoutubeUrl(e.target.value)} className="input" placeholder="YouTube kanal linki" />
          <input value={spotifyUrl} onChange={(e) => setSpotifyUrl(e.target.value)} className="input" placeholder="Spotify profil linki" />
        </div>
      </div>

      <div className="mb-5 border border-base-600 rounded-xl p-3.5">
        <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wide text-teal mb-1">
          <Music size={13} /> Su an dinliyorum
        </div>
        <p className="text-xs text-gray-500 mb-3">
          Gercek Spotify hesabina bagli degil — buraya girdigin sarki, profilinde herkese anlik olarak gorunur.
        </p>
        <div className="flex flex-col gap-2.5">
          <input value={track} onChange={(e) => setTrack(e.target.value)} className="input" placeholder="Sarki adi" maxLength={120} />
          <input value={artist} onChange={(e) => setArtist(e.target.value)} className="input" placeholder="Sanatci" maxLength={120} />
          <input value={albumArt} onChange={(e) => setAlbumArt(e.target.value)} className="input" placeholder="Albüm kapagi URL (opsiyonel)" />
          <input value={trackUrl} onChange={(e) => setTrackUrl(e.target.value)} className="input" placeholder="Sarki linki (opsiyonel)" />
          <input value={duration} onChange={(e) => setDuration(e.target.value)} className="input" placeholder="Sarki suresi, orn. 3:32 (opsiyonel)" />
        </div>
        <div className="flex gap-2 mt-3">
          <button onClick={publishActivity} disabled={!track.trim() || !artist.trim()} className="btn-secondary flex-1">
            Yayinla
          </button>
          {activity && (
            <button onClick={stopActivity} className="btn-ghost px-3">
              Durdur
            </button>
          )}
        </div>
      </div>

      <button onClick={save} disabled={saving} className="btn-primary w-full">
        {saving ? "Kaydediliyor..." : "Kaydet"}
      </button>
    </Modal>
  );
}
