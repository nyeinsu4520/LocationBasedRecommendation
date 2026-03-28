import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import Chat from "../pages/Chat";
import { connectWebSocket, disconnectWebSocket } from "../api/chatService";
import { getMessages } from "../api/client";
import { eventsApi } from "../api/eventsApi";

export default function ChatPage() {
  // ✅ renamed from locationId to eventId
  const { eventId } = useParams();
  const [joined, setJoined] = useState(false);
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = Number(localStorage.getItem("userId"));
  const username = localStorage.getItem("name");

  // ✅ Load message history when joined
  useEffect(() => {
    if (!joined) return;

    const fetchMessages = async () => {
      try {
        setLoading(true);
        const msgs = await getMessages(eventId); // ✅ uses eventId
        setMessages(msgs);
      } catch (err) {
        console.error("Failed to load messages:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [eventId, joined]);

  // ✅ Connect WebSocket when joined
  useEffect(() => {
    if (!joined) return;

    connectWebSocket(eventId, (msg) => { // ✅ uses eventId
      setMessages((prev) => [...prev, msg]);
    });

    return () => disconnectWebSocket();
  }, [eventId, joined]);

  // ✅ Join via eventsApi instead of locationsApi
  const handleJoin = async () => {
    try {
      await eventsApi.join(eventId);
      setJoined(true);
    } catch (err) {
      console.error("Failed to join event:", err);
      alert(err.response?.data || "Failed to join event.");
    }
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <div className="max-w-6xl mx-auto p-6">

        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold text-slate-900">Event Chat</h1>
            <p className="text-slate-500 text-sm mt-1">
              Talk with other people who joined this event.
            </p>
          </div>
          <Link
            to="/locations"
            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium hover:bg-slate-100"
          >
            Back to Locations
          </Link>
        </div>

        <div className="mt-6 relative bg-white rounded-2xl shadow p-5 min-h-[650px]">
          <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">Chat Room</h2>
              {/* ✅ shows eventId instead of locationId */}
              <p className="text-sm text-slate-500">Event ID: {eventId}</p>
            </div>
            <div className={`text-xs font-medium px-3 py-1 rounded-full ${
              joined ? "bg-green-100 text-green-700" : "bg-slate-100 text-slate-600"
            }`}>
              {joined ? "Joined" : "Not joined"}
            </div>
          </div>

          <Chat
            eventId={eventId}  
            userId={userId}
            username={username}
            messages={messages}
            canSend={joined}
            loading={loading}
          />

          {!joined && (
            <div className="absolute inset-0 bg-white/80 backdrop-blur-[1px] flex flex-col items-center justify-center rounded-2xl">
              <div className="bg-white border border-slate-200 shadow rounded-2xl px-8 py-8 text-center max-w-md">
                <h3 className="text-xl font-semibold text-slate-900">
                  You are viewing this event chat
                </h3>
                <p className="text-sm text-slate-500 mt-2">
                  Join this event first before sending messages.
                </p>
                <button
                  onClick={handleJoin}
                  className="mt-5 rounded-xl bg-slate-900 text-white px-5 py-2.5 text-sm font-medium hover:bg-slate-800"
                >
                  Confirm Join Event
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}