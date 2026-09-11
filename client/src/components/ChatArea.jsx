import { useEffect, useRef } from "react";
import { Volume2, Users, Menu } from "./Icons.jsx";
import Message from "./Message.jsx";
import MessageInput from "./MessageInput.jsx";

export default function ChatArea({
  title,
  type = "TEXT",
  messages,
  currentUserId,
  canModerate,
  onSend,
  onEdit,
  onDelete,
  onReact,
  onReport,
  onVotePoll,
  onTypingStart,
  onTypingStop,
  typingUsers,
  emptyHint,
  onOpenPoll,
  showMemberToggle,
  membersOpen,
  onToggleMembers,
  onToggleSidebar,
}) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages?.length]);

  const typingNames = Object.values(typingUsers || {});

  return (
    <div className="flex-1 flex flex-col min-w-0 bg-base-750">
      <div className="h-12 flex items-center gap-2 px-3 sm:px-4 border-b border-base-900/60 shadow-sm shrink-0">
        <button
          onClick={onToggleSidebar}
          title="Kanallar"
          aria-label="Kanallari goster"
          className="md:hidden w-8 h-8 flex items-center justify-center text-gray-400 hover:text-ink shrink-0"
        >
          <Menu size={20} />
        </button>
        {type === "VOICE" ? (
          <Volume2 size={18} className="text-gray-500 shrink-0" />
        ) : (
          <span className="mono text-gray-500 shrink-0">/</span>
        )}
        <span className="font-bold text-ink truncate flex-1">{title}</span>
        {showMemberToggle && (
          <button
            onClick={onToggleMembers}
            className={`w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
              membersOpen ? "bg-base-700 text-teal" : "text-gray-400 hover:bg-base-700 hover:text-ink"
            }`}
            title="Uyeler"
          >
            <Users size={18} />
          </button>
        )}
      </div>

      {type === "VOICE" ? (
        <VoiceChannelPlaceholder title={title} />
      ) : (
        <>
          <div className="flex-1 overflow-y-auto py-3 flex flex-col">
            {messages?.length === 0 && (
              <div className="px-4 py-8 text-gray-500 text-sm">{emptyHint || "Henuz mesaj yok. Ilk mesaji sen gonder!"}</div>
            )}
            {messages?.map((m, i) => {
              const prev = messages[i - 1];
              const grouped = Boolean(
                prev &&
                  prev.author.id === m.author.id &&
                  new Date(m.createdAt) - new Date(prev.createdAt) < 5 * 60 * 1000
              );
              return (
                <Message
                  key={m.id}
                  message={m}
                  grouped={m.type === "POLL" ? false : grouped}
                  isOwn={m.author.id === currentUserId}
                  currentUserId={currentUserId}
                  canModerate={canModerate}
                  onEdit={onEdit}
                  onDelete={onDelete}
                  onReact={onReact}
                  onReport={onReport}
                  onVotePoll={onVotePoll}
                />
              );
            })}
            <div ref={bottomRef} />
          </div>

          <div className="h-5 px-4 text-xs text-gray-400 italic">
            {typingNames.length > 0 && `${typingNames.join(", ")} yaziyor...`}
          </div>

          <MessageInput
            placeholder={`#${title} kanalina mesaj gonder`}
            onSend={onSend}
            onTypingStart={onTypingStart}
            onTypingStop={onTypingStop}
            onOpenPoll={onOpenPoll}
          />
        </>
      )}
    </div>
  );
}

function VoiceChannelPlaceholder({ title }) {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center px-6">
      <div className="w-20 h-20 rounded-full bg-base-700 flex items-center justify-center mb-4">
        <Volume2 size={36} className="text-teal" />
      </div>
      <h2 className="text-ink font-bold text-lg mb-1">{title}</h2>
      <p className="text-gray-400 text-sm max-w-sm">
        Ses kanallari bu demo surumunde arayuz olarak hazir; gercek WebRTC baglantisi bu iskelet uzerine eklenebilir.
      </p>
      <button className="btn-primary mt-4">Kanala Katil</button>
    </div>
  );
}
