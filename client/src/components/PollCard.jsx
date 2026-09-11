export default function PollCard({ poll, currentUserId, onVote }) {
  if (!poll) return null;
  const total = poll.totalVotes;

  return (
    <div className="mt-1 bg-base-900 border border-amber/25 rounded-xl p-3.5 max-w-sm">
      <p className="font-semibold text-ink text-[15px] mb-3">{poll.question}</p>
      <div className="flex flex-col gap-2">
        {poll.options.map((opt) => {
          const pct = total > 0 ? Math.round((opt.votes / total) * 100) : 0;
          const mine = opt.voterIds.includes(currentUserId);
          return (
            <button
              key={opt.id}
              onClick={() => onVote(opt.id)}
              className={`relative overflow-hidden rounded-lg border text-left px-3 py-2 transition-colors ${
                mine ? "border-amber" : "border-base-600 hover:border-base-500"
              }`}
            >
              <div
                className={`absolute inset-y-0 left-0 animate-bar-grow ${mine ? "bg-amber/20" : "bg-base-700"}`}
                style={{ width: `${pct}%` }}
              />
              <div className="relative flex items-center justify-between gap-2">
                <span className="text-sm text-gray-100">{opt.text}</span>
                <span className="text-xs text-gray-400 mono shrink-0">
                  {pct}% · {opt.votes}
                </span>
              </div>
            </button>
          );
        })}
      </div>
      <p className="text-[11px] text-gray-500 mono mt-2">{total} oy</p>
    </div>
  );
}
