import { useState } from "react";
import { format } from "date-fns";
import Avatar from "./Avatar.jsx";
import PollCard from "./PollCard.jsx";
import { Edit, Trash, Smile, Flag } from "./Icons.jsx";

const QUICK_EMOJIS = ["👍", "❤️", "😂", "🎉", "😮", "😢"];

export default function Message({ message, isOwn, canModerate, currentUserId, onEdit, onDelete, onReact, onReport, onVotePoll, onOpenProfile, grouped }) {
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
      className={`group flex gap-2 px-3 sm:px-4 ${isOwn ? "justify-end" : "justify-start"} ${grouped ? "mt-0.5" : "mt-2.5"}`}
    >
      {!isOwn && (
        <div className="w-8 shrink-0">
          {!grouped && (
            <button onClick={() => onOpenProfile?.(message.author.id)} className="rounded-full">
              <Avatar username={message.author.username} color={message.author.avatarColor} url={message.author.avatarUrl} size={30} showStatus={false} />
            </button>
          )}
        </div>
      )}

      <div className={`relative flex flex-col min-w-0 max-w-[80%] sm:max-w-md ${isOwn ? "items-end" : "items-start"}`}>
        {!grouped && !isOwn && (
          <div className="flex items-baseline gap-1.5 mb-0.5 px-1">
            <button onClick={() => onOpenProfile?.(message.author.id)} className="font-semibold text-ink text-[13px] hover:underline">
              {message.author.username}
            </button>
            {message.author.isBot && (
              <span className="text-[10px] font-bold text-base-900 bg-amber rounded px-1.5 py-[1px] tracking-wide">BOT</span>
            )}
          </div>
        )}

        {isPoll ? (
          <PollCard poll={message.poll} currentUserId={currentUserId} onVote={(optionId) => onVotePoll(message.id, optionId)} />
        ) : editing ? (
          <div className="flex flex-col gap-1.5 w-64 max-w-full">
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
          <div
            className={`rounded-2xl px-3.5 py-2 ${
              isOwn ? "bg-amber-soft/90 text-ink" : "bg-base-800 border border-base-600"
            }`}
          >
            <p className="text-[15px] text-gray-100 leading-relaxed break-words whitespace-pre-wrap">{message.content}</p>
            {message.attachment && (
              <img src={message.attachment} alt="attachment" className="mt-2 max-w-[240px] rounded-lg border border-base-700" />
            )}
          </div>
        )}

        <div className={`flex items-center gap-1.5 mt-1 px-1 ${isOwn ? "flex-row-reverse" : "flex-row"}`}>
          <span className="text-[10px] text-gray-500 mono">{format(new Date(message.createdAt), "HH:mm")}</span>
          {message.edited && <span className="text-[10px] text-gray-500">duzenlendi</span>}
        </div>

        {!isPoll && message.reactions?.length > 0 && (
          <div className={`flex flex-wrap gap-1.5 mt-0.5 ${isOwn ? "justify-end" : "justify-start"}`}>
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

        {hover && !editing && (
          <div
            className={`absolute -top-3 flex bg-base-750 border border-base-600 rounded-lg shadow-panel overflow-visible z-10 ${
              isOwn ? "right-0" : "left-0"
            }`}
          >
            {!isPoll && (
              <div className="relative">
                <ActionBtn onClick={() => setShowEmojiPicker((v) => !v)}>
                  <Smile size={16} />
                </ActionBtn>
                {showEmojiPicker && (
                  <div className={`absolute top-8 bg-base-750 border border-base-600 rounded-lg shadow-panel p-1.5 flex gap-1 z-20 ${isOwn ? "right-0" : "left-0"}`}>
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
