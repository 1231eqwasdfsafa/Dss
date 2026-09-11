import { useState } from "react";
import { format } from "date-fns";
import Avatar from "./Avatar.jsx";
import PollCard from "./PollCard.jsx";
import { Edit, Trash, Smile, Flag } from "./Icons.jsx";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "😢"];

export default function Message({ message, isOwn, canModerate, currentUserId, onEdit, onDelete, onReact, onReport, onVotePoll, grouped }) {
  const [hover, setHover] = useState(false);
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState(message.content);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const isPoll = message.type === "POLL";

  function submitEdit() {
    if (draft.trim() && draft !== message.content) onEdit(message.id, draft.trim());
    setEditing(false);
  }

  return (
    <div
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => {
        setHover(false);
        setShowEmojiPicker(false);
      }}
      className={`group relative flex gap-3 px-4 py-0.5 hover:bg-white/[0.02] ${grouped ? "mt-0" : "mt-3"}`}
    >
      <div className="w-10 shrink-0">
        {!grouped && <Avatar username={message.author.username} color={message.author.avatarColor} size={40} showStatus={false} />}
      </div>

      <div className="flex-1 min-w-0">
        {!grouped && (
          <div className="flex items-baseline gap-2">
            <span className="font-semibold text-ink text-sm">{message.author.username}</span>
            {message.author.isBot && (
              <span className="text-[10px] font-bold text-base-900 bg-amber rounded px-1.5 py-[1px] tracking-wide">BOT</span>
            )}
            <span className="text-[11px] text-gray-500 mono">{format(new Date(message.createdAt), "d MMM HH:mm")}</span>
          </div>
        )}

        {isPoll ? (
          <PollCard poll={message.poll} currentUserId={currentUserId} onVote={(optionId) => onVotePoll(message.id, optionId)} />
        ) : editing ? (
          <div className="flex flex-col gap-1.5 mt-0.5">
            <input
              autoFocus
              value={draft}
              onChange={(e) => setDraft(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") submitEdit();
                if (e.key === "Escape") setEditing(false);
              }}
              className="input"
            />
            <span className="text-xs text-gray-400">
              escape — <button className="link" onClick={() => setEditing(false)}>iptal</button> • enter — <button className="link" onClick={submitEdit}>kaydet</button>
            </span>
          </div>
        ) : (
          <p className="text-[15px] text-gray-100 leading-relaxed break-words whitespace-pre-wrap">
            {message.content}
            {message.edited && <span className="text-[10px] text-gray-500 ml-1">(duzenlendi)</span>}
          </p>
        )}

        {!isPoll && message.attachment && (
          <img src={message.attachment} alt="attachment" className="mt-2 max-w-xs max-h-72 rounded-lg border border-base-700" />
        )}

        {!isPoll && message.reactions?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-1.5">
            {message.reactions.map((r) => (
              <button
                key={r.emoji}
                onClick={() => onReact(message.id, r.emoji)}
                className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-base-750 border border-base-600 hover:border-teal text-xs text-gray-200"
              >
                <span>{r.emoji}</span>
                <span className="font-semibold">{r.count}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      {!grouped ? null : (
        <div className="absolute left-4 top-0.5 text-[10px] text-gray-500 mono opacity-0 group-hover:opacity-100 w-10 text-center">
          {format(new Date(message.createdAt), "HH:mm")}
        </div>
      )}

      {hover && !editing && (
        <div className="absolute -top-3 right-4 flex bg-base-750 border border-base-600 rounded-lg shadow-panel overflow-visible z-10">
          {!isPoll && (
            <div className="relative">
              <ActionBtn onClick={() => setShowEmojiPicker((v) => !v)}>
                <Smile size={16} />
              </ActionBtn>
              {showEmojiPicker && (
                <div className="absolute right-0 top-8 bg-base-750 border border-base-600 rounded-lg shadow-panel p-1.5 flex gap-1 z-20">
                  {QUICK_EMOJIS.map((e) => (
                    <button
                      key={e}
                      onClick={() => {
                        onReact(message.id, e);
                        setShowEmojiPicker(false);
                      }}
                      className="w-7 h-7 flex items-center justify-center hover:bg-base-700 rounded text-base"
                    >
                      {e}
                    </button>
                  ))}
                </div>
              )}
            </div>
          )}
          {isOwn && !isPoll && (
            <ActionBtn onClick={() => setEditing(true)}>
              <Edit size={16} />
            </ActionBtn>
          )}
          {!isOwn && (
            <ActionBtn onClick={() => onReport(message.id)}>
              <Flag size={16} />
            </ActionBtn>
          )}
          {(isOwn || canModerate) && (
            <ActionBtn danger onClick={() => onDelete(message.id)}>
              <Trash size={16} />
            </ActionBtn>
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ children, onClick, danger }) {
  return (
    <button
      onClick={onClick}
      className={`w-8 h-8 flex items-center justify-center hover:bg-base-700 ${danger ? "text-dnd" : "text-gray-300"}`}
    >
      {children}
    </button>
  );
}
