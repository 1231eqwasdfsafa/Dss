import { useEffect, useState } from "react";
import { X, Youtube, Music, Link2, Cake, Edit } from "./Icons.jsx";
import Avatar from "./Avatar.jsx";
import { resolveAsset } from "../lib/uploads";
import { api } from "../lib/api";
import { useAuthStore } from "../store/authStore";
import { useAppStore } from "../store/appStore";
import { DEMO_MODE } from "../lib/demo";

// Discord-style profile popout: banner + overlapping avatar, bio, connection
// links, and a live "currently listening" widget when the person has one set.
export default function ProfileCard({ userId, fallback, onClose, onStartDm, onEditSelf }) {
  const me = useAuthStore((s) => s.user);
  const activity = useAppStore((s) => s.activity[userId]);
  const isSelf = userId === me?.id;
  const [profile, setProfile] = useState(isSelf ? me : fallback || null);
  const [loading, setLoading] = useState(!isSelf && !fallback);

  useEffect(() => {
    if (isSelf) return;
    if (DEMO_MODE) {
      setLoading(false);
      return;
    }
    let alive = true;
    setLoading(true);
    api
      .get(`/users/${userId}`)
      .then(({ data }) => alive && setProfile(data.user))
      .catch(() => {})
      .finally(() => alive && setLoading(false));
    return () => {
      alive = false;
    };
  }, [userId, isSelf]);

  useEffect(() => {
    if (isSelf && me) setProfile(me);
  }, [me, isSelf]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 animate-fade-in"
      onMouseDown={(e) => e.target === e.currentTarget && onClose()}
    >
      <div className="w-full max-w-sm bg-base-800 border border-base-600 rounded-2xl shadow-panel mx-4 max-h-[85vh] overflow-y-auto">
        {!profile && loading ? (
          <div className="p-10 flex items-center justify-center">
            <span className="text-sm text-gray-500">Yukleniyor...</span>
          </div>
        ) : !profile ? (
          <div className="p-10 flex flex-col items-center gap-3 text-center">
            <span className="text-sm text-gray-500">Profil yuklenemedi.</span>
            <button onClick={onClose} className="btn-secondary">Kapat</button>
          </div>
        ) : (
          <>
            <div className="relative h-24 shrink-0" style={{ backgroundColor: profile.bannerColor || "#4C3B2C" }}>
              {profile.bannerUrl && (
                <img src={resolveAsset(profile.bannerUrl)} alt="" className="absolute inset-0 w-full h-full object-cover" />
              )}
              <button onClick={onClose} className="absolute top-2 right-2 icon-btn bg-black/30 hover:bg-black/50 text-white">
                <X size={18} />
              </button>
            </div>

            <div className="px-5 pb-5">
              <div className="-mt-10 mb-3">
                <div className="inline-block p-1 bg-base-800 rounded-2xl">
                  <Avatar username={profile.username} color={profile.avatarColor} url={profile.avatarUrl} status={profile.status} size={76} rounded="2xl" />
                </div>
              </div>

              <div className="flex items-center gap-1.5 flex-wrap">
                <span className="text-lg font-bold text-ink">{profile.username}</span>
                <span className="text-sm text-gray-500 mono">#{profile.discriminator}</span>
                {profile.isBot && (
                  <span className="text-[10px] font-bold text-base-900 bg-amber rounded px-1.5 py-[1px] tracking-wide">BOT</span>
                )}
              </div>
              {profile.pronouns && <div className="text-xs text-gray-500 mt-0.5">{profile.pronouns}</div>}
              {profile.customStatus && <div className="text-sm text-gray-300 mt-1.5">{profile.customStatus}</div>}

              {activity && (
                <div className="mt-3.5 flex items-center gap-2.5 bg-base-750 border border-base-600 rounded-xl p-2.5">
                  {activity.albumArt ? (
                    <img src={resolveAsset(activity.albumArt)} alt="" className="w-11 h-11 rounded-lg object-cover shrink-0" />
                  ) : (
                    <div className="w-11 h-11 rounded-lg bg-base-700 flex items-center justify-center shrink-0 text-teal">
                      <Music size={18} />
                    </div>
                  )}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1 text-[10.5px] font-bold uppercase tracking-wide text-teal">
                      <Music size={11} /> Spotify'da dinliyor
                    </div>
                    {activity.trackUrl ? (
                      <a href={activity.trackUrl} target="_blank" rel="noreferrer" className="text-sm font-semibold text-ink truncate block hover:underline">
                        {activity.track}
                      </a>
                    ) : (
                      <div className="text-sm font-semibold text-ink truncate">{activity.track}</div>
                    )}
                    <div className="text-xs text-gray-400 truncate">{activity.artist}</div>
                  </div>
                </div>
              )}

              {profile.bio && (
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1">Hakkinda</div>
                  <p className="text-sm text-gray-300 whitespace-pre-wrap break-words">{profile.bio}</p>
                </div>
              )}

              {(profile.youtubeUrl || profile.spotifyUrl) && (
                <div className="mt-4">
                  <div className="text-xs font-bold uppercase tracking-wide text-gray-500 mb-1.5">Baglantilar</div>
                  <div className="flex flex-col gap-1.5">
                    {profile.youtubeUrl && <ConnectionLink icon={<Youtube size={16} />} label="YouTube" url={profile.youtubeUrl} />}
                    {profile.spotifyUrl && <ConnectionLink icon={<Music size={16} />} label="Spotify" url={profile.spotifyUrl} />}
                  </div>
                </div>
              )}

              {profile.createdAt && (
                <div className="mt-4 pt-4 border-t border-base-700 flex items-center gap-2 text-xs text-gray-500">
                  <Cake size={14} className="shrink-0" />
                  Katilim: {new Date(profile.createdAt).toLocaleDateString("tr-TR", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              )}

              <div className="mt-5">
                {isSelf ? (
                  <button onClick={onEditSelf} className="btn-secondary w-full flex items-center justify-center gap-2">
                    <Edit size={15} /> Profili Duzenle
                  </button>
                ) : (
                  !profile.isBot && (
                    <button onClick={() => onStartDm(profile.id)} className="btn-primary w-full">
                      Mesaj Gonder
                    </button>
                  )
                )}
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

function ConnectionLink({ icon, label, url }) {
  return (
    <a
      href={url}
      target="_blank"
      rel="noreferrer"
      className="flex items-center gap-2.5 px-3 py-2 rounded-lg bg-base-750 border border-base-600 hover:border-teal text-sm font-medium text-gray-200"
    >
      <span className="text-teal shrink-0">{icon}</span>
      <span className="truncate">{label}</span>
      <Link2 size={13} className="ml-auto text-gray-500 shrink-0" />
    </a>
  );
}
