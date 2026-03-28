import { useState, useRef, useEffect } from "react";
import { sendMessage } from "../api/chatService";

function Chat({ eventId, userId, username, messages, canSend, loading }) {
  const [input, setInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = () => {
    if (!canSend) return;
    if (!input.trim()) return;

    sendMessage(eventId, {
      userId,
      username,
      content: input,
    });

    setInput("");
  };

  return (
    <div className="flex flex-col h-[540px]">
      {/* Message area */}
      <div className="flex-1 rounded-2xl border border-slate-200 bg-slate-50 p-4 overflow-y-auto">
        {loading ? (
          <p className="text-sm text-slate-500">Loading messages...</p>
        ) : messages.length === 0 ? (
          <p className="text-sm text-slate-500">
            No messages yet. Start the conversation.
          </p>
        ) : (
          <div className="space-y-3">
            {messages.map((m, index) => {
              const isMine = Number(m.userId) === Number(userId);

              return (
                <div
                  key={`${m.userId}-${m.timestamp}-${index}`}
                  className={`flex ${isMine ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[75%] rounded-2xl px-4 py-3 shadow-sm ${
                      isMine
                        ? "bg-slate-900 text-white"
                        : "bg-white border border-slate-200 text-slate-900"
                    }`}
                  >
                    <div
                      className={`text-xs font-semibold mb-1 ${
                        isMine ? "text-slate-300" : "text-slate-500"
                      }`}
                    >
                      {m.username || "Unknown User"}
                    </div>
                    <div className="text-sm break-words">{m.content}</div>
                    {m.timestamp && (
                      <div
                        className={`text-[11px] mt-2 ${
                          isMine ? "text-slate-400" : "text-slate-400"
                        }`}
                      >
                        {new Date(m.timestamp).toLocaleString()}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      {/* Input area */}
      <div className="mt-4 flex gap-3">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") handleSend();
          }}
          placeholder={canSend ? "Type your message..." : "Join chat to send messages"}
          disabled={!canSend}
          className="flex-1 rounded-xl border border-slate-200 bg-white px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 disabled:bg-slate-100 disabled:text-slate-400"
        />
        <button
          onClick={handleSend}
          disabled={!canSend || !input.trim()}
          className="rounded-xl bg-slate-900 text-white px-5 py-3 text-sm font-medium hover:bg-slate-800 disabled:bg-slate-300 disabled:cursor-not-allowed"
        >
          Send
        </button>
      </div>
    </div>
  );
}

export default Chat;